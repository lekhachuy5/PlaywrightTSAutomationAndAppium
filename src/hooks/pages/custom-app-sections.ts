import { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Page } from "@playwright/test";
import { BaseSetup } from "../base/base-setup";
import environmentSetupInstance, { EnvironmentSetup } from "../base/environment-setup";
import { CommonAction } from "./common-action";



class CustomAppSections {
    page: Page = environmentSetupInstance.getPage();
    globalSetup: BaseSetup = BaseSetup.instance as BaseSetup;
    env: EnvironmentSetup = environmentSetupInstance;
    testInfo: ITestCaseHookParameter = environmentSetupInstance.getScenarioInfo();
    commonAction: CommonAction;
    fileName: string | undefined;
    createdTitle: string | undefined;
    xpath = {
        settingModule: "//a[@href='/account/settings']",
        customSection: "//a[@href='/account/settings/custom_section']",
        viewTab: (tab: string) => `//button[text()='${tab}']`,
        inputTitle: "//input[@name='title']",
        inputAbout: "//input[@name='about']",
        saveButton: "//button[text()='Save']",
        subSectionsButton: "//button[text()='Sub sections']",
        searchCommunity: "//input[@placeholder='Search communities']",
        itemSection: "//div[contains(@class,'MuiTypography-h4')]",
        editSubSection: (name: string) =>
            `//div[contains(@class,'MuiTypography-h4') and text()='${name}']/../following-sibling::div/button/div[text()='Edit']`,
        deleteSubSection: (name: string) =>
            `//div[contains(@class,'MuiTypography-h4') and text()='${name}']/../following-sibling::div/button/div[text()='Delete']`,
        newSubSection: "//button[text()='New Sub Section']",
        qlEditor: "//div[contains(@class,'ql-editor')]",
        inputUrl: "//input[@name='url']",
        selectCommunity: "//input[@placeholder='Select communities']",

    }

    constructor() {
        this.commonAction = new CommonAction();
        this.env = environmentSetupInstance;
    }

    async openSettingPages() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.click(this.xpath.settingModule);;
    }


    async openCustomAppPage() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.click(this.xpath.customSection);
    }

    async verifyGlobalPage() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.verifyUi(this.xpath.inputTitle, "Title");
        await this.commonAction.verifyUi(this.xpath.inputAbout, "About");
    }

    async editGlobalPage() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.fill(this.xpath.inputTitle, "Welcome to your community");
        const about = await this.commonAction.generatedRandomName(4)
        await this.commonAction.fill(this.xpath.inputAbout, "New about " + about);
        await this.commonAction.click(this.xpath.saveButton);
    }

    async openSubSections() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.click(this.xpath.subSectionsButton);
    }

    async verifySubSectionList() {
        const dataBeforeTest = await this.env.getDataBeforeSteps();
        const count = await dataBeforeTest.countRows(0);
        if (count !== 0) {
            await this.commonAction.waitForLoadingSpinner();
            await this.commonAction.verifyUi(this.xpath.itemSection, "Title");
        }
    }

    async editSubSection() {
        await this.commonAction.waitForLoadingSpinner();
        const dataBeforeTest = await this.env.getDataBeforeSteps();
        const count = await dataBeforeTest.countRows(0);
        if (count !== 0) {
            const name = await dataBeforeTest.getRowData("Title")
            const createTitle = await this.commonAction.generatedRandomName(4);
            this.createdTitle = "Edit title" + createTitle;
            await this.commonAction.click(this.xpath.editSubSection(name));

            await this.commonAction.fill(this.xpath.inputTitle, "Edit title" + createTitle);
            await this.commonAction.fill(this.xpath.qlEditor, "This is auto test,  please ignore it");
            await this.commonAction.click(this.xpath.saveButton);

            await this.commonAction.waitForLoadingSpinner();
            await this.commonAction.isElementExists(this.xpath.editSubSection(this.createdTitle));
        }
    }

    async deleteSubSection() {
        await this.commonAction.waitForLoadingSpinner();
        const dataBeforeTest = await this.env.getDataBeforeSteps();
        const count = await dataBeforeTest.countRows(0);
        if (count !== 0) {
            const name = await dataBeforeTest.getRowData("Title")
            await this.commonAction.click(this.xpath.deleteSubSection(name));
            await this.commonAction.waitForLoadingSpinner();
            await this.commonAction.isElementNotExists(this.xpath.deleteSubSection(name));
        }
    }

        async selectOption(selector: string) {
        const element = await this.page.$(selector);
        const tagName = await element?.evaluate((node) => node.tagName);
        await this.page.click(selector);
        await this.page.waitForTimeout(5000);
       
        await this.page.click(`(//li[@role='option'])[1]`);
        //press escape key
        // await this.commonAction.pressKey('Escape');
    }

    async createNewSubSection() {
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.click(this.xpath.newSubSection);
        const createTitle = await this.commonAction.generatedRandomName(4);
        this.createdTitle = "New title" + createTitle;
        await this.commonAction.fill(this.xpath.inputTitle, this.createdTitle);
        await this.commonAction.fill(this.xpath.qlEditor, "This is auto test,  please ignore it");
        await this.selectOption(this.xpath.selectCommunity);
        await this.commonAction.click(this.xpath.saveButton);
        await this.commonAction.waitForLoadingSpinner();
        await this.commonAction.isElementExists(this.xpath.editSubSection(this.createdTitle));
    }

}

export default CustomAppSections;