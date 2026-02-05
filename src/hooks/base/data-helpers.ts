import { error } from 'console';
import environmentSetupInstance from './environment-setup';
import fs from 'fs';
import { QueryResult } from 'pg';
export class DataHelper {
  filePath: string;
  constructor() {
    this.filePath = '';
  }

  async setFilePath(filePath: string) {
    this.filePath = filePath;
    this.checkAndCreateFile(filePath);
  }

  async readJSON(
    resultSet: number,
    key: string,
    rowIndex: number,
    callback: {
      (err: unknown, rowData: unknown): void;
      (arg0: Error | null, arg1: null): void;
    }
  ) {
    await fs.readFile(this.filePath, 'utf8', (err: unknown, data: string) => {
      if (err) {
        callback(err, null);
        return;
      }
      try {
        const dataArr = JSON.parse(data);
        if (!Array.isArray(dataArr)) {
          const jsonData = dataArr.rows[rowIndex];

          if (rowIndex >= 0 && rowIndex < dataArr.rowCount) {
            if (!Object.prototype.hasOwnProperty.call(jsonData, key)) {
              callback(new Error(`Can't find "${key}" in Data`), null);
              return;
            }
            const rowData = jsonData[key];
            callback(null, rowData);
          } else {
            throw new Error(`Invalid or out of bound index`), null;
          }
        } else {
          const jsonData = dataArr[resultSet].rows;
          const jsonDatas = jsonData[rowIndex];
          if (rowIndex >= 0 && rowIndex < dataArr[resultSet].rowCount) {
            if (!Object.prototype.hasOwnProperty.call(jsonDatas, key)) {
              throw new Error(`Can't find "${key}" in Data`);
            }
            const rowData = jsonDatas[key];
            callback(null, rowData);
          } else {
            throw new Error(`Invalid or out of bound index`), null;
          }
        }
      } catch (error) {
        callback(error, null);
      }
    });
  }

  async readRowCount(
    resultSet: number,
    callback: {
      (err: unknown, rowCount: unknown): void;
      (arg0: Error | null, arg1: null): void;
    }
  ) {
    await fs.readFile(this.filePath, 'utf8', (err: unknown, data: string) => {
      if (err) {
        callback(err, null);
        return;
      }
      try {
        const dataArr = JSON.parse(data);
        if (!Array.isArray(dataArr)) {
          callback(null, dataArr.rowCount);
        } else {
          callback(null, dataArr[resultSet].rowCount);
        }
      } catch (error) {
        callback(error, null);
      }
    });
  }

  async countRows(resultSet: number) {
    try {
      const dataCount = await new Promise((resolve, reject) => {
        this.readRowCount(resultSet, (err: unknown, rowCount: unknown) => {
          if (err) {
            error(err);
            reject(err);
            return;
          }
          resolve(rowCount);
        });
      });
      return await dataCount;
    } catch (err) {
      error(err);
      return null;
    }
  }

  async getData(
    resultSet: number,
    key: string,
    rowIndex: number
  ): Promise<string | null> {
    try {
      const rowData = await new Promise((resolve, reject) => {
        this.readJSON(
          resultSet,
          key,
          rowIndex,
          (err: unknown, rowData: unknown) => {
            if (err) {
              error(err);
              reject(err);
              return;
            }
            resolve(rowData);
          }
        );
      });
      return rowData as string | null;
    } catch (err) {
      error(err);
      return null;
    }
  }

  async queryData(queryData: QueryResult<never>) {
    // Ensure queryData is an array and filter commands
    const data = Array.isArray(queryData)
      ? queryData.filter((res) => res.command === 'SELECT')
      : [];

    // Define the structure for the result and type annotation for the callback
    const dataExtract = await this.extractDataFromQueryResult({
      length: data.length,
      map: (
        callback: (res: {
          rowCount: string | number | null;
          rows: unknown | null;
        }) => { rowCount: string | number | null; rows: unknown | null }
      ) =>
        data.map((res) => callback({ rowCount: res.rowCount, rows: res.rows })),
      rowCount: null,
      rows: null,
    });

    return dataExtract;
  }

  async extractDataFromQueryResult(result: {
    length: number;
    map: (
      arg0: (res: {
        rowCount: string | number | null;
        rows: unknown | null;
      }) => { rowCount: string | number | null; rows: unknown | null }
    ) => { rowCount: string | number | null; rows: unknown | null }[];
    rowCount: string | number | null;
    rows: unknown | null;
  }) {
    if (result && result.length > 0) {
      const extractedData = result.map(
        (res: { rowCount: string | number | null; rows: unknown | null }) => {
          return {
            rowCount: res.rowCount,
            rows: res.rows,
          };
        }
      );
      return extractedData;
    } else {
      return {
        rowCount: result.rowCount,
        rows: result.rows,
      };
    }
  }

  async checkAndCreateFile(fileName: string) {
    if (!fs.existsSync(fileName)) {
      fs.writeFileSync(fileName, '', 'utf-8');
    }
  }

  async parseTestData(testData: string | null) {
    // Check the csv data match with syntax
    if (testData?.startsWith('${__')) {
      testData = (await this.getReplacementValue(testData)) as string;
      testData = testData || '';
    }

    return testData;
  }

  async getRawRowData(rowName: string) {
    const xlsxHelper = await environmentSetupInstance.getXlsxHelper();
    const foundRow = xlsxHelper.rows?.find(
      (row: { name: string }) => row.name === rowName
    );
    if (foundRow) {
      const row = foundRow.index;
      const cell = await xlsxHelper.getCellData(
        row,
        xlsxHelper.columnIndex ? xlsxHelper.columnIndex : -1
      );
      if (cell) {
        return cell;
      } else {
        return null;
      }
    }
  }

  async splitSyntax(value: string | null) {
    let paramsString = value;
    if (value != null && value?.toString().startsWith('${__')) {
      const testCaseValueStr = value;
      paramsString = testCaseValueStr.substring(
        4,
        testCaseValueStr.lastIndexOf('}')
      );
    }
    return paramsString || '';
  }

  async getReplacementValue(
    testCaseValue: string | null
  ): Promise<string | null> {
    const newValue = testCaseValue;
    // check if the syntax is found
    if (testCaseValue != null && testCaseValue?.toString().startsWith('${__')) {
      const testCaseValueStr = testCaseValue;
      const paramsStr = testCaseValueStr.substring(
        4,
        testCaseValueStr.lastIndexOf('}')
      );

      return await this.parseFinalTestData(paramsStr);
    }
    return newValue || null;
  }

  async parseFinalTestData(testData: string): Promise<string | null> {
    const env = await environmentSetupInstance;
    let data: DataHelper | null = null;
    const dto = testData.split('.');
    if (dto[0] === 'beforeSteps') {
      this.filePath = await env.getBeforeStepsFile();
      data = await env.getDataBeforeSteps();
    } else if(dto[0] === 'afterSteps') {
      this.filePath = await env.getAfterStepsFile();
      data = await env.getDataAfterSteps();
    }else if(dto[0] === 'env') {
      return process.env[dto[1]] || null;
    }

    if (data !== null) {
      return await this.getData(
        Number(dto[1].replace(/\[|\]/g, '')), // Convert string to number
        dto[3],
        Number(dto[2].replace(/\[|\]/g, '')) // Convert string to number
      );
    } else {
      return null;
    }
  }

  async getRowData(rowName: string): Promise<string | null> {
    const xlsxHelper = await environmentSetupInstance?.getXlsxHelper();
    const foundRow = xlsxHelper.rows?.find(
      (row: { name: string }) => row.name === rowName
    );

    if (foundRow) {
      const row = foundRow.index;
      const cell = await xlsxHelper.getCellData(
        row,
        xlsxHelper.columnIndex ? xlsxHelper.columnIndex : -1
      );
      if (cell) {
        const data = this.getReplacementValue(cell as string | null);
        return data;
      } else {
        return null;
      }
    } else {
      // Handle case where row is not found
      error('Row not found for name:', rowName);
      return null;
    }
  }

  async replaceContextVariables(sqlQuery: string) {
    const substring: string[] = [];
    const regex = /\${__Context\((.*?)\)}/g;
    let m;
    while ((m = regex.exec(sqlQuery)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      substring.push(m[1]);
    }
    for (let i = 0; i < substring.length; i++) {
      const keys = substring[i].split('.');
      const value = await this.getRowData(keys[1]);
      sqlQuery = sqlQuery.replace(
        '${__Context(' + substring[i] + ')}',
        value !== null && value !== undefined ? value.toString() : ''
      );
    }
    return sqlQuery;
  }

  async replaceSyntax(data: string): Promise<string> {
    const replacedData = await this.replaceContextVariables(data).then(
      (data: string) => {
        return data;
      }
    );
    return replacedData;
  }
}
