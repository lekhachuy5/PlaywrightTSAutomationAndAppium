import xlsx, { WorkBook, WorkSheet } from 'xlsx';

export class XLSXHelper {
  filePath: string | undefined;
  sheetIndex: number | undefined;
  sheetName: string | undefined;
  workbook: WorkBook | undefined;
  worksheet: WorkSheet | undefined;
  columnIndex: number | undefined;
  rows: { name: string; index: number }[] | undefined;
  cols: { name: string; index: number }[] | undefined;

  private static instance: XLSXHelper | undefined;
  private environmentInitialized: boolean = false;

  constructor(filePath: string, sheetIndex: number = 0) {
    if (!XLSXHelper.instance) {
      this.internalInitialize(filePath, sheetIndex)
        .then(() => {
          this.environmentInitialized = true;
        })
        .catch((error) => {
          throw new error('Error during environment initialization:', error);
        });
      XLSXHelper.instance = this;
    }
    return XLSXHelper.instance;
  }

  private async internalInitialize(
    filePath: string,
    sheetIndex: number = 0
  ): Promise<void> {
    this.filePath = filePath;
    this.sheetIndex = sheetIndex;
    this.workbook = xlsx.readFile(this.filePath);
    this.sheetName = this.workbook.SheetNames[this.sheetIndex];
    this.worksheet = this.workbook.Sheets[this.sheetName];
    this.setRowCol();
  }

  public async waitForEnvironmentInitialization(): Promise<void> {
    if (!this.environmentInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100 milliseconds
      await this.waitForEnvironmentInitialization(); // Recursively check until environment is initialized
    }
  }

  async setRowCol() {
    this.rows = await this.getRowNames();
    this.cols = await this.getColumnNames();
  }

  //get all row names and index for fisrt column
  async getRowNames(): Promise<{ name: string; index: number }[]> {
    const range = xlsx.utils.decode_range(this.worksheet?.['!ref'] ?? '');
    const rowNames: { name: string; index: number }[] = [];
    for (let i = range.s.r + 1; i <= range.e.r; i++) {
      const cell = this.worksheet?.[xlsx.utils.encode_cell({ r: i, c: 0 })];
      if (cell && cell.v) {
        rowNames.push({ name: cell.v, index: i });
      }
    }
    return rowNames;
  }

  //get all column names and index for fisrt row
  async getColumnNames(): Promise<{ name: string; index: number }[]> {
    const range = xlsx.utils.decode_range(this.worksheet?.['!ref'] ?? '');
    const columnNames: { name: string; index: number }[] = [];
    for (let i = range.s.c; i <= range.e.c; i++) {
      const cell = this.worksheet?.[xlsx.utils.encode_cell({ r: 0, c: i })];
      if (cell && cell.v) {
        columnNames.push({ name: cell.v, index: i });
      }
    }
    return columnNames;
  }

  //read data from excel by row name with current column index
  async setColumnIndex(columnName: string) {
    const columnNames: { name: string; index: number }[] | undefined =
      this.cols;
    const column = columnNames?.find((col) => col.name === columnName);
    if (!column) {
      throw new Error(`Column ${columnName} not found`);
    }
    this.columnIndex = column.index;
  }

  //get cell data by row and column index
  async getCellData(row: number, col: number) {
    const cell = this.worksheet?.[xlsx.utils.encode_cell({ r: row, c: col })];
    if (cell && cell.v) {
      return cell.v;
    } else {
      return null;
    }
  }

  async cleanUpXlsx() {
    XLSXHelper.instance = undefined;
    this.environmentInitialized = false;
  }
}
