import { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Page } from "@playwright/test";
import { BaseSetup } from "../base/base-setup";
import environmentSetupInstance, { EnvironmentSetup } from "../base/environment-setup";
import { CommonAction } from "./common-action";



class Documents {
    page: Page = environmentSetupInstance.getPage();
    globalSetup: BaseSetup = BaseSetup.instance as BaseSetup;
    env: EnvironmentSetup = environmentSetupInstance;
    testInfo: ITestCaseHookParameter = environmentSetupInstance.getScenarioInfo();
    commonAction: CommonAction;
    createdTitle: string | undefined;
    xpath = {
        documentsModule: "//a[@href='/documents']",
        documentsList: "//div[contains(@class,'document-item')]",
        documentTitle: "//div[contains(@class,'document-title')]",
        newDocumentButton: "//button[text()='New Document']",
        inputTitle: "//input[@name='title']",
        inputContent: "//textarea[@name='content']",
        saveButton: "//button[text()='Save']",
        editButton: (name: string) =>
            `//div[contains(@class,'document-title') and text()='${name}']/../following-sibling::div/button/div[text()='Edit']`,
        deleteButton: (name: string) =>
            `//div[contains(@class,'document-title') and text()='${name}']/../following-sibling::div/button/div[text()='Delete']`,
    }

    constructor() {
        this.commonAction = new CommonAction();
        this.env = environmentSetupInstance;
    }

    async openDocumentsPage() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.click(this.xpath.documentsModule);
    }

    async verifyDocumentList() {
        const dataBeforeTest = await this.env.getDataBeforeSteps();
        const count = await dataBeforeTest.countRows(0);
        if (count !== 0) {
            await this.commonAction.waitForLoadingSpinner();
            await this.commonAction.verifyUi(this.xpath.documentTitle, "Title");
        }
    }

    async createNewDocument() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.click(this.xpath.newDocumentButton);
        const createTitle = await this.commonAction.generatedRandomName(4);
        this.createdTitle = "New document " + createTitle;
        await this.commonAction.fill(this.xpath.inputTitle, this.createdTitle);
        await this.commonAction.fill(this.xpath.inputContent, "This is auto test, please ignore it");
        await this.commonAction.click(this.xpath.saveButton);
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.isElementExists(this.xpath.editButton(this.createdTitle));
    }

    async editDocument() {
        await this.commonAction.waitForLoadingSpinner();
        const dataBeforeTest = await this.env.getDataBeforeSteps();
        const count = await dataBeforeTest.countRows(0);
        if (count !== 0) {
            const name = await dataBeforeTest.getRowData("Title")
            const createTitle = await this.commonAction.generatedRandomName(4);
            this.createdTitle = "Edit document " + createTitle;
            await this.commonAction.click(this.xpath.editButton(name));

            await this.commonAction.fill(this.xpath.inputTitle, this.createdTitle);
            await this.commonAction.fill(this.xpath.inputContent, "This is auto test, please ignore it");
            await this.commonAction.click(this.xpath.saveButton);

            await this.commonAction.waitForLoadingSpinner();
            await this.commonAction.isElementExists(this.xpath.editButton(this.createdTitle));
        }
    }

    async deleteDocument() {
        await this.commonAction.waitForLoadingSpinner();
        const dataBeforeTest = await this.env.getDataBeforeSteps();
        const count = await dataBeforeTest.countRows(0);
        if (count !== 0) {
            const name = await dataBeforeTest.getRowData("Title")
            await this.commonAction.click(this.xpath.deleteButton(name));
            await this.commonAction.waitForLoadingSpinner();
            await this.commonAction.isElementNotExists(this.xpath.deleteButton(name));
        }
    }

}

export default Documents;
