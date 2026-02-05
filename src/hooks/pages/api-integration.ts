import { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Page } from "@playwright/test";
import { BaseSetup } from "../base/base-setup";
import environmentSetupInstance, { EnvironmentSetup } from "../base/environment-setup";
import { CommonAction } from "./common-action";
import { ApiService } from "../base/api-helper";
import assert from "assert";

class ApiIntegration {
    page: Page = environmentSetupInstance.getPage();
    globalSetup: BaseSetup = BaseSetup.instance as BaseSetup;
    env: EnvironmentSetup = environmentSetupInstance;
    testInfo: ITestCaseHookParameter = environmentSetupInstance.getScenarioInfo();
    commonAction: CommonAction;
    apiService: ApiService;
    fileName: string | undefined;
    createdName: string | undefined;
    createdScheme: string | undefined;
    createdAddress: string | undefined;
    createdGroup: string | undefined;
    xpath = {
        settingModule: "//a[@href='/account/settings']",
        integrationSMX: "//a[@href='/account/settings/integration/smx']",
        integrationPage: "//a[@href='/account/settings/integration']",
        dataScheme: (schemeName: string) => `//div[text()="${schemeName}"]`,
        dataGroup: (groupName: string) => `//div[text()="${groupName}"]`,
        dataAddress: (address: string) => `//div[text()="${address}"]`,
        dataName: (name: string) => `//div[text()='${name}']`,
        features: (featureName: string) => `(//div[text()='${featureName}']/../..//input)[2]`,
    }

    constructor() {
        this.commonAction = new CommonAction();
        this.env = environmentSetupInstance;
    }

    async runApiIntegrationTest(lot: string) {
        const dataBeforeSteps = await this.env.getDataBeforeSteps();
        const accountId = await dataBeforeSteps.getRowData("Id");
        const sec = process.env.SEED_GEN;
        let headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'custom-origin': process.env.WEB_URL
        };
        this.apiService = new ApiService(process.env.API_URL, headers);
        const token = await this.apiService.getToken(accountId, sec);
        console.log('Access Token: ', token);
        headers["Authorization"] = `Bearer ${token}`;
        this.apiService = new ApiService(process.env.API_URL, headers);
        const genDate = new Date().getTime();
        console.log('Generated Date: ', genDate);
        const payload = {
            "accountId": accountId,
            "groupData": [
                {
                    "externalId": `huy-test-${genDate}`,
                    "name": `huy's Group ${genDate}`
                }
            ]
        }
        await this.apiService.postData('/integration/groups', payload);


    }
}

export default ApiIntegration;