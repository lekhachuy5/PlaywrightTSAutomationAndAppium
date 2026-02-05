import 'dotenv/config';
import { remote } from 'webdriverio';
import environmentSetupInstance from './environment-setup';
import "@wdio/globals"
export class AppiumSetup {
    public static instance: AppiumSetup | undefined;
    driver: WebdriverIO.Browser;
    async connectToAppium(): Promise<WebdriverIO.Browser> {
        const capabilities = {
            "platformName": process.env.PLATFORM_NAME,
            "appium:deviceName": process.env.DEVICE_NAME,
            "appium:orientation": "PORTRAIT",
            "appium:automationName": process.env.AUTOMATION_NAME,
            "appium:newCommandTimeout": 60000,
            "appium:appWaitDuration": 60000,
            "appium:appWaitActivity": process.env.APP_ACTIVITY,
            "appium:appWaitPackage": process.env.APP_PACKAGE,
            "appium:ignoreHiddenApiPolicyError": false,
            "appium:nativeWebScreenshot": true,
            "appium:autoGrantPermissions": false,
            "appium:autoAcceptAlerts": false,
            "appium:adbShell":true,
            // "mobile:changePermissions": ["android.permission.POST_NOTIFICATIONS", "android.permission.ACCESS_NOTIFICATION_POLICY"],
            // "appium:autoDismissAlerts":true
        }
        const connection = await remote({
            hostname: '127.0.0.1',
            port: 4723,
            capabilities: capabilities,
            logLevel : 'error',
            
            
        });
        await connection.execute('mobile: shell', {
            command: `pm grant ${process.env.APP_PACKAGE} android.permission.POST_NOTIFICATIONS`
        });
        if (process.env.USE_APK === 'true') {
            await connection.installApp(process.env.APP_LINK);
        } else {
            await connection.startActivity(
                 process.env.APP_PACKAGE,
                 process.env.APP_ACTIVITY,
            );
        }
        await environmentSetupInstance.setDriver(connection);
        return connection;
    }

    async disconnectFromAppium(driver: WebdriverIO.Browser) {
        // await driver.deleteSession();
 
        await driver.execute('mobile: shell', {
            command: `pm clear ${process.env.APP_PACKAGE}`
        });
    }
}