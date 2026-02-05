import { after, before, binding } from "cucumber-tsflow";
import { BaseSetup } from "./base-setup";
import { ITestCaseHookParameter, ITestStepHookParameter, Status, setDefaultTimeout, world } from "@cucumber/cucumber";
import { Browser, Page, chromium, firefox, webkit } from "@playwright/test";
import { AppiumSetup } from './appium-setup'
import 'dotenv'
import fs from 'fs';
import path from 'path';
setDefaultTimeout(process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) * 1000 : 60000);

@binding()
export class ExecSetup {
    private baseSetup: BaseSetup;
    private browser: Browser;
    private appiumSetup: AppiumSetup;
    private driver: WebdriverIO.Browser;

    @before()
    public async startUp(scenario: ITestCaseHookParameter) {
        if (!fs.existsSync(path.join(process.env.DOWNLOAD_PATH))) {
            fs.mkdirSync(path.join(process.env.DOWNLOAD_PATH));
        }
        const headless = process.env.HEADLESS === 'true' ? true : false;
        if (process.env.BROWSER_TYPE === 'chromium') {
            this.browser = await chromium.launch({
                headless: headless,
                args: ['--start-maximized'],
                downloadsPath: path.join(process.env.DOWNLOAD_PATH)
            });
        }
        else if (process.env.BROWSER_TYPE === 'firefox') {
            this.browser = await firefox.launch({
                headless: headless,
                args: ['--start-maximized'],
                downloadsPath: path.join(process.env.DOWNLOAD_PATH)
            });
        }
        else if (process.env.BROWSER_TYPE === 'webkit') {
            this.browser = await webkit.launch({
                headless: headless,
                args: ['--start-maximized'],
                downloadsPath: path.join(process.env.DOWNLOAD_PATH)
            });
        }
        else {
            this.browser = await chromium.launch({
                headless: headless,
                args: ['--start-maximized'],
                downloadsPath: path.join(process.env.DOWNLOAD_PATH)
            });
        }
        const browsers = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        });
        const page: Page = await browsers.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });
        page.setDefaultTimeout(process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) * 1000 : 60000);
        this.baseSetup = new BaseSetup({ page }, scenario);
    }

    @before({ tag: '@Mobile' })
    public async startUpMobile() {
        this.appiumSetup = new AppiumSetup();
        this.driver = await this.appiumSetup.connectToAppium();
        
    }
    @after({ tag: '@Mobile' })
    public async tearDownMobile(scenario: ITestStepHookParameter) {
        try {
            if (scenario.result.status === Status.FAILED) {

                await this.driver.takeScreenshot();
                const mImg = await this.driver.saveScreenshot(`screenshots/mobile/${scenario.pickle.name}.png`);
                world.attach(mImg, 'image/png');
            }
            await this.appiumSetup.disconnectFromAppium(this.driver);
        } catch (error) {
            console.error('Error during mobile teardown:', error);
        }
    }
    @after()
    public async tearDown(scenario: ITestStepHookParameter) {
        try {
            if (scenario.result.status === Status.FAILED) {
                const img = await this.baseSetup.page.screenshot({ path: `screenshots/${scenario.pickle.name}.png` });
                world.attach(img, 'image/png');
            }
        } catch (error) {
            console.error('Error during screenshot:', error);
        } finally {
            await this.baseSetup.cleanupGlobalSetupInstance();
            await this.baseSetup.page?.close();
            //clear cookies
            await this.baseSetup.page?.context().clearCookies();
            await this.browser.close();

        }

    }
}