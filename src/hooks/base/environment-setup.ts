import { Page } from '@playwright/test';
import { DataHelper } from './data-helpers';
import { XLSXHelper } from './xlxs-helper';
import { ITestCaseHookParameter } from '@cucumber/cucumber';
import "@wdio/globals"

export class EnvironmentSetup {
  private static instance: EnvironmentSetup | undefined;

  private xlsxHelper!: XLSXHelper;
  private xlsxFilePath: string | null = null;
  private dataHelper!: DataHelper;
  private beforeStepsFile!: string;
  private afterStepsFile!: string;
  private dataAfterSteps!: DataHelper;
  private dataBeforeSteps!: DataHelper;
  private page: Page;
  private scenarioInfo: ITestCaseHookParameter;
  private driver: WebdriverIO.Browser;
  private region: string;
  private dateFormat: string;

  constructor() {
    if (EnvironmentSetup.instance) {
      throw new Error(
        'Use getInstance() method to get the singleton instance.'
      );
    }
  }

  public static getInstance(): EnvironmentSetup {
    return EnvironmentSetup.instance || new EnvironmentSetup();
  }

  public async setXlsxHelper(xlsxHelper: XLSXHelper) {
    this.xlsxHelper = xlsxHelper;
  }

  public async setXlsxFilePath(xlsxFilePath: string) {
    this.xlsxFilePath = xlsxFilePath;
  }

  public async setDataHelper(dataHelper: DataHelper) {
    this.dataHelper = dataHelper;
  }

  public async setBeforeStepsFile(beforeStepsFile: string) {
    this.beforeStepsFile = beforeStepsFile;
  }

  public async setAfterStepsFile(afterStepsFile: string) {
    this.afterStepsFile = afterStepsFile;
  }

  public async setDataAfterSteps(dataAfterSteps: DataHelper) {
    this.dataAfterSteps = dataAfterSteps;
  }

  public async setDataBeforeSteps(dataBeforeSteps: DataHelper) {
    this.dataBeforeSteps = dataBeforeSteps;
  }

  public async setPage(page: Page) {
    this.page = page;
  }

  public async setScenarioInfo(scenarioInfo: ITestCaseHookParameter) {
    this.scenarioInfo = scenarioInfo;
  }

  public async setDriver(driver: WebdriverIO.Browser) {
    this.driver = driver;
  }

  public async setRegion(region: string) {
    this.region = region;
  }

  public async setDateFormat(dateFormat: string) {
    this.dateFormat = dateFormat;
  }

  //get method here
  public async getXlsxHelper() {
    return this.xlsxHelper;
  }

  public async getXlsxFilePath() {
    return this.xlsxFilePath;
  }

  public async getDataHelper() {
    return this.dataHelper;
  }

  public async getBeforeStepsFile() {
    return this.beforeStepsFile;
  }

  public async getAfterStepsFile() {
    return this.afterStepsFile;
  }

  public async getDataAfterSteps() {
    return this.dataAfterSteps;
  }

  public async getDataBeforeSteps() {
    return this.dataBeforeSteps;
  }

  public getPage() {
    return this.page;
  }

  public getScenarioInfo() {
    return this.scenarioInfo;
  }

  public getDriver() {
    return this.driver;
  }

  public getRegion() {
    return this.region;
  }

  public getDateFormat() {
    return this.dateFormat;
  }

  public async cleanUpEnv() {
    this.xlsxHelper = undefined;
    this.xlsxFilePath = null;
    this.dataHelper = undefined;
    this.beforeStepsFile = '';
    this.afterStepsFile = '';
    this.dataAfterSteps = undefined;
    this.dataBeforeSteps = undefined;
    this.page = undefined;
    this.scenarioInfo = undefined;
    this.driver = undefined;
    EnvironmentSetup.instance = undefined;
  }

}
const environmentSetupInstance = EnvironmentSetup.getInstance();
export default environmentSetupInstance;
