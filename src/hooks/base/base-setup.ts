import { pool, writeToFile, loadSqlStatement } from './db-setup';

import path from 'path';
import { XLSXHelper } from './xlxs-helper';
import fs from 'fs';
import { Page } from '@playwright/test';
import environmentSetupInstance from './environment-setup';
import { DataHelper } from './data-helpers';
import { info } from 'console';
import { QueryResult } from 'pg';
import { ITestCaseHookParameter } from '@cucumber/cucumber';

export class BaseSetup {
  page: Page | undefined;
  testInfo: ITestCaseHookParameter;
  scenarioName: string | undefined;
  testCaseName: string | undefined;
  dataAfterSteps: DataHelper | undefined;
  dataBeforeSteps: DataHelper | undefined;
  specDir: string | undefined;
  fileName: string | undefined;
  filePath: string | undefined;
  sqlFilePath: string | undefined;
  sqlQueryString: string | undefined;
  sqlStatement: Map<string, string> | undefined;
  xlsxFilePath: string | undefined;
  xlsxHelper: XLSXHelper | undefined;
  beforeStepsFile: string | undefined;
  afterStepsFile: string | undefined;
  tcId: string | undefined;
  public static instance: BaseSetup | undefined;
  private environmentInitialized: boolean = false;
  constructor({ page }: { page: Page }, pickle: ITestCaseHookParameter) {
    info('Test Info:', pickle.pickle.name);
    if (!BaseSetup.instance) {
      this.initializeEnvironment({ page }, pickle)
        .then(() => {
          this.environmentInitialized = true;
        })
        .catch((error) => {
          info('Error during environment initialization:', error);
        });
      BaseSetup.instance = this;
    }
    return BaseSetup.instance;
  }

  private async initializeEnvironment(
    { page }: { page: Page },
    pickle: ITestCaseHookParameter
  ): Promise<void> {
    // Run setup methods
    this.page = page;
    this.testInfo = pickle;
    this.scenarioName = pickle.pickle.name.slice(0, pickle.pickle.name.indexOf('-'));
    this.testCaseName = pickle.pickle.name.slice(pickle.pickle.name.indexOf('-'));
    this.dataAfterSteps = new DataHelper();
    this.dataBeforeSteps = new DataHelper();
    this.fileSetup({ pickle });
    environmentSetupInstance.setPage(page);
    await this.excelSetup();
    // await this.client.query('BEGIN;');
  }


  public async setColumnIndex(columnIndex: string): Promise<void> {
    if (BaseSetup.instance) {
      await BaseSetup.instance.xlsxHelper?.setColumnIndex(columnIndex);
      await BaseSetup.instance.environmentSetup();
    }
  }

  public async waitForEnvironmentInitialization(): Promise<void> {
    if (!this.environmentInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100 milliseconds
      await this.waitForEnvironmentInitialization(); // Recursively check until environment is initialized
    }
  }

  async fileSetup({ pickle }: { pickle: ITestCaseHookParameter }
  ) {
    this.specDir = path.dirname(pickle.gherkinDocument.uri);
    this.fileName = this.scenarioName?.toLowerCase().replace(/\s+/g, '_');
    if (!this.fileName) {
      throw new Error('File name is undefined.');
    }
    this.filePath = path.join(this.specDir, this.fileName, this.fileName);
    this.sqlFilePath = path.join(
      this.specDir,
      this.fileName,
      `${this.fileName}.sql`
    );
    if (!fs.existsSync(this.sqlFilePath)) {
      throw new Error(`SQL file does not exist: ${this.sqlFilePath}`);
    }
    this.sqlQueryString = fs.readFileSync(this.sqlFilePath, 'utf-8');
    this.sqlStatement = loadSqlStatement(this.sqlQueryString);
  }

  async excelSetup() {
    this.xlsxFilePath = path.join(
      this.specDir ?? '',
      this.fileName ?? '',
      `${this.fileName}.xlsx`
    );
    if (!fs.existsSync(this.xlsxFilePath)) {
      throw new Error(`Excel file does not exist: ${this.xlsxFilePath}`);
    }
    this.xlsxHelper = new XLSXHelper(this.xlsxFilePath);
  }

  async dataJobBeforeSteps(tcId: string) {
    try {
      this.tcId = tcId;
      //check if folder not exist then create
      if (!fs.existsSync(path.join("queryResults"))) {
        fs.mkdirSync(path.join("queryResults"));
      }
      if (!fs.existsSync(path.join("queryResults", this.fileName))) {
        fs.mkdirSync(path.join("queryResults", this.fileName));
      }
      this.beforeStepsFile = path.join("queryResults", this.fileName, this.fileName + '_before_' + tcId + '.data.json');
      await this.dataBeforeSteps?.setFilePath(this.beforeStepsFile);
      await environmentSetupInstance.setBeforeStepsFile(
        this.beforeStepsFile ? this.beforeStepsFile : ''
      );
      const sqlStatement = await this.sqlStatement?.get('beforeTestSteps');
      const queryStatement = await this.dataBeforeSteps?.replaceSyntax(
        sqlStatement ?? ''
      );
      if (queryStatement === undefined) {
        throw new Error('Query statement cannot be undefined');
      }
      // console.log('Query Statement: /n ', queryStatement);
      const queryData: QueryResult<never> = await pool.query(queryStatement);
      const res = await this.dataBeforeSteps?.queryData(queryData);
      await writeToFile(this.beforeStepsFile, res);
    } catch (error) {
      throw new Error(`Error in dataJobBeforeSteps: ${error}`);
    }
  }

  async dataJobAfterSteps() {
    try {
      //check if folder not exist then create
      if (!fs.existsSync(path.join("queryResults"))) {
        fs.mkdirSync(path.join("queryResults"));
      }
      if (!fs.existsSync(path.join("queryResults", this.fileName))) {
        fs.mkdirSync(path.join("queryResults", this.fileName));
      }
      this.afterStepsFile =
        path.join("queryResults", this.fileName, this.fileName + '_after_' + this.tcId + '.data.json');
      await this.dataAfterSteps?.setFilePath(this.afterStepsFile);
      await environmentSetupInstance.setAfterStepsFile(
        this.afterStepsFile ? this.afterStepsFile : ''
      );
      const sqlStatement = await this.sqlStatement?.get('afterTestSteps');
      const queryStatement = await this.dataAfterSteps?.replaceSyntax(
        sqlStatement ?? ''
      );
      if (queryStatement === undefined) {
        throw new Error('Query statement cannot be undefined');
      }
      const queryData: QueryResult<never> = await pool.query(queryStatement);
      const res = await this.dataAfterSteps?.queryData(queryData);
      await writeToFile(this.afterStepsFile, res);
    } catch (error) {
      throw new Error(`Error in dataJobAfterSteps: ${error}`);
    }
  }

  async environmentSetup() {
    if (this.xlsxHelper)
      await environmentSetupInstance.setXlsxHelper(this.xlsxHelper);
    if (this.xlsxFilePath)
      await environmentSetupInstance.setXlsxFilePath(this.xlsxFilePath);
    await environmentSetupInstance.setBeforeStepsFile(
      this.beforeStepsFile ? this.beforeStepsFile : ''
    );
    await environmentSetupInstance.setAfterStepsFile(
      this.afterStepsFile ? this.afterStepsFile : ''
    );
    if (this.dataAfterSteps) {
      await environmentSetupInstance.setDataAfterSteps(this.dataAfterSteps);
    }
    if (this.dataBeforeSteps) {
      await environmentSetupInstance.setDataBeforeSteps(this.dataBeforeSteps);
    }
    await environmentSetupInstance.setPage(this.page);
    await environmentSetupInstance.setScenarioInfo(this.testInfo);
    const queryString = await fs.readFileSync('src/hooks/base/region-setup.sql', 'utf-8')
    const queryData: QueryResult<never> = await pool.query(queryString.replace("{email}", process.env.GLOBAL_ADMIN_EMAIL));
    await environmentSetupInstance.setRegion(queryData.rows[0]['region']);
    await environmentSetupInstance.setDateFormat(queryData.rows[0]['date_format']);
    // await this.setEnvFileValue('ACCOUNT_CONSOLE_URL', queryData.rows[0]['admin_url']);
    // await this.setEnvFileValue('RESIDENT_URL', queryData.rows[0]['resident_url']);
  }

  async setEnvFileValue(key: string, value: string) {
    let envContent = '';
    envContent = fs.readFileSync('.env', 'utf8');

    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync('.env', envContent.trim() + '\n', 'utf8');
  }

  async cleanupGlobalSetupInstance() {
    // await this.client.query('ROLLBACK;');
    this.page = undefined;
    this.testInfo = undefined;
    this.scenarioName = undefined;
    this.testCaseName = undefined;
    this.dataAfterSteps = undefined;
    this.dataBeforeSteps = undefined;
    this.specDir = undefined;
    this.fileName = undefined;
    this.filePath = undefined;
    this.sqlFilePath = undefined;
    this.sqlQueryString = undefined;
    this.sqlStatement = undefined;
    if (this.xlsxHelper) {
      await this.xlsxHelper?.cleanUpXlsx();
      this.xlsxFilePath = undefined;
      this.xlsxHelper = undefined;
    }
    this.beforeStepsFile = undefined;
    this.afterStepsFile = undefined;
    this.tcId = undefined;
    BaseSetup.instance = undefined;
    await environmentSetupInstance.cleanUpEnv();
  }
}
