
import { Page } from '@playwright/test';
import assert from 'assert';
import environmentSetupInstance from '../base/environment-setup';
import { info } from 'console';
import moment from 'moment-timezone';

type Template = {
  insert: string;
  attributes?: {
    bold?: boolean;
    align?: 'center';
    header?: number;
  };
};
export class CommonAction {
  page: Page = environmentSetupInstance.getPage();
  driver: WebdriverIO.Browser = environmentSetupInstance.getDriver();
  xpath: {
    scrollableElement: "//div[@class='infinite-scroll-component ']/div[1]"
  }


  //#region Web 
  async login(username: string, password: string) {
    let attempts = 0;
    try {
      await this.page.goto(process.env.WEB_URL + "auth/login", { waitUntil: 'networkidle' });
    } catch (error) {
      if (error.message.includes('net::ERR_CONNECTION_RESET')) {
        while (attempts < 3) {
          try {
            console.log('Attempting to navigate to login page again...', attempts + 1);
            await this.page.reload();
            await this.page.goto(process.env.WEB_URL + "auth/login", { waitUntil: 'networkidle' });
            break;
          } catch (error) {
            attempts++;
            if (attempts >= 3) {
              console.error('All attempts failed. Could not navigate to login page:', error);
              throw new Error('All attempts failed. Could not navigate to login page:' + error);
            }
          }
        }
      }
    }
    await this.waitForElementVisible("//input[@name='email']");
    await this.fill("//input[@name='email']", username);
    await this.fill("//input[@name='password']", password);
    await this.click("//button[text()= 'Sign In']");
    await this.waitForLoadingSpinner();
  }


  async scrollToBottom(text: string) {
    try {
      while (true) {
        // console.log('Scrolling page to find:', "//div[@class='infinite-scroll-component ']/div[1]");
        // const scrollableElement = await this.findElement("//div[@class='infinite-scroll-component ']");
        const found = await this.findElement(`//b[contains(text(),'${text}')]`);
        if (found) return true;
        // const size = await scrollableElement.boundingBox();
        // Scroll down by the height of the viewport
        await this.page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
        await this.waitForTimeout(1000);
      }
    } catch (error) {
      console.error('Error scrolling page:', error);
      return false;
    }
  }


  async selectOptionWithInput(selector: string, option: string) {
    //check selector is textarea or input
    await this.click(selector);
    // if (tagName.toLowerCase() === 'textarea' || tagName.toLowerCase() === 'input') {
    //   await this.fill(selector, option);
    // }
    await this.waitForSelector(selector);
    await this.page.getByRole('option', { name: option }).first().scrollIntoViewIfNeeded();
    await this.page.getByRole('option', { name: option }).first().click();
    await this.pressKey('Escape');
  }


  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async selectOptionWithPartialInput(selector: string, option: string) {
    const element = await this.findElement(selector);
    const tagName = await element?.evaluate((node) => node.tagName);
    await this.click(selector);
    await this.waitForTimeout(5000);
    if (tagName.toLowerCase() === 'textarea' || tagName.toLowerCase() === 'input') {
      await this.fill(selector, option);
    }
    await this.click(`//li[@role='option' and contains(text(),'${option}')]`);
    //press escape key
    await this.page.keyboard.press('Escape');
  }

  //select first option without input
  async selectFirstOption(selector: string) {
    await this.click(selector);
    await this.page.getByRole('option').first().click();
    await this.pressKey('Escape');
  }

  //select last option without input
  async selectLastOption(selector: string) {
    await this.click(selector);
    await this.page.getByRole('option').last().click();
    await this.pressKey('Escape');
  }

  async selectSecondOption(selector: string) {
    const options = await this.findElements(selector);
    let skip = true;
    for (const option of options) {
      if ((await option.getAttribute('aria-disabled')) === null) {
        if (skip) {
          skip = false;
          continue;
        }
        else {
          const checkbox = await option.$('input');
          if (checkbox !== null) {
            await checkbox.check();
          }
          break;
        }
      }
    }
  }


  // wait for loading spinner to disappear
  async waitForLoadingSpinner() {
    const commonSelector = "//*[contains(@class,'MuiCircularProgress-svg')]";

    const elements = await this.page.$$(commonSelector);

    if (elements.length > 0) {
      const waitForElementsToHide = elements.map(element =>
        element.waitForElementState('hidden')
      );
      await Promise.all(waitForElementsToHide);
    }

    await this.waitForTimeout(2000);
    await this.waitForProcessingSpinner()

  }

  //wait for processing spinner to disappear
  async waitForProcessingSpinner() {
    const commonSelector = "//*[@role='progressbar']";

    const elements = await this.page.$$(commonSelector);

    if (elements.length > 0) {
      const waitForElementsToHide = elements.map(element =>
        element.waitForElementState('hidden')
      );
      await Promise.all(waitForElementsToHide);
    }
  }

  async selectOption(selector: string, option: string, page: string = 'in', pressEscape: boolean = true) {
    const element = await this.page.$(selector);
    const tagName = await element?.evaluate((node) => node.tagName);
    await this.page.click(selector);
    await this.page.waitForTimeout(2000);
    if (tagName.toLowerCase() === 'textarea' || tagName.toLowerCase() === 'input') {
      await this.page.fill(selector, option);
    }
    if (page === 'in') {
      await this.page.click(`(//li[@role='option' ]//div[contains(text(),'${option}')])[1]`);
    } else if (page === 'span') {
      await this.page.click(`(//li[@role='option' ]//span[contains(text(),'${option}')])[1]`);
    }
    else {
      await this.page.click(`//li[@role='option' and contains(text(),'${option}')]`);
    }
    pressEscape ? await this.pressKey('Escape') : null;

  }

  //wait for element to be visible
  async waitForElementVisible(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  //wait for element to be hidden
  async waitForElementHidden(selector: string) {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }

  //wait for element to be attached
  async waitForElementAttached(selector: string) {
    await this.page.waitForSelector(selector, { state: 'attached' });
  }

  //wait for element to be detached
  async waitForElementDetached(selector: string) {
    await this.page.waitForSelector(selector, { state: 'detached' });
  }

  //wait for timeout
  async waitForTimeout(time: number) {
    await this.page.waitForTimeout(time);
  }

  //verify QL editor content
  async verifyQLEditorContent(selector: string, expectedContent: string) {
    const element = await this.findElement(selector);
    const content = await element.textContent();
    info('Comparing QL editor content:', content, 'with expected content:', expectedContent)
    assert.strictEqual(content, expectedContent);
  }

  //parse ql editor content from json
  async getTemplateContentFromJSON(jsonStr: any): Promise<string | null> {
    const json = jsonStr.ops.filter((op: any) => typeof op.insert !== 'object');
    const data = json as Template[];
    if (data) {
      let stringBuilder = "";
      data.forEach(op => {
        stringBuilder += op.insert;
      });
      stringBuilder = stringBuilder.replace(/[\n\r\t]/g, '');
      return stringBuilder;
    } else {
      console.log("No data to process.");
      return null;
    }
  }

  //input character by character
  async inputCharacterByCharacter(selector: string, char: string) {
    await this.click(selector);

    for (let i = 0; i < char.length; i++) {
      await this.waitForTimeout(50)
      await this.page.type(selector, char[i]);
    }
  }

  //check is element is checked
  async isChecked(selector: string) {
    const element = await this.findElement(selector);
    return await element.isChecked();
  }

  //return data value
  async getIndexDataValue(value: string, index: number) {
    const dataB = await environmentSetupInstance.getDataBeforeSteps();
    const cellVal = await dataB.getRawRowData(value);
    const dataReplace = await dataB.splitSyntax(cellVal);
    const splitData = await dataReplace.split('.');
    const resultSet = await parseInt(splitData[1].replace(/\[|\]/g, ''));
    const dbVal: string | null = await dataB?.getData(
      resultSet,
      splitData[3],
      index
    );
    return dbVal;
  }

  //wait for api request done
  async waitForAPIRequestThenAction() {
    return new Promise<void>((resolve, reject) => {
      try {
        this.page.waitForLoadState('networkidle');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // delay time
  async delayTimeMs(time: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  //waifor Selector

  async waitForSelector(selector: string) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        return await this.page.waitForSelector(selector, { timeout: 10000 });
      } catch (error) {
        attempts++;
        if (attempts >= 2) {
          // info('All attempts failed. Could not find element:', selector);
          throw new Error('All attempts failed. Could not find element:' + selector);
        }
      }
    }
  }

  async verifyUi(
    selector: string,
    value: string,
    isDate: boolean = false
  ) {
    const dataB = await environmentSetupInstance.getDataBeforeSteps();
    const cellVal = await dataB.getRawRowData(value);
    const elements = await this.page.$$(selector);
    if (cellVal.startsWith('${__')) {
      const dataReplace = await dataB.splitSyntax(cellVal);
      const splitData = await dataReplace.split('.');
      const resultSet = await parseInt(splitData[1].replace(/\[|\]/g, ''));
      let data;
      if (splitData[0] === 'beforeSteps') {
        data = await environmentSetupInstance.getDataBeforeSteps();
      } else {
        data = await environmentSetupInstance.getDataAfterSteps();
      }
      const rowCount = await data.countRows(resultSet);
      const numberOfRows = Math.min(
        parseInt(rowCount as string),
        elements.length
      );
      if (splitData[2].replace(/\[|\]/g, '') === 'i') {
        for (let index = 0; index < numberOfRows; index++) {
          let foundMatch = false;
          let uiVal = null;
          if (data !== null) {
            const dbVal = await data.getData(resultSet, splitData[3], index); // Fetch DB value once
            const dbValueString = isDate ? await this.toDateString(dbVal) : dbVal;

            for (let c = 0; c < numberOfRows; c++) {
              const element = elements[c];
              const tagName = await element.evaluate((node) => node.tagName);

              if (tagName.toLowerCase() === 'input' || tagName.toLowerCase() === 'textarea') {
                uiVal = await element.inputValue();
              } else {
                uiVal = await element.textContent();
              }

              if (uiVal === dbValueString) {
                info(
                  'Match found for key:',
                  value,
                  '\n UI value:',
                  uiVal,
                  ' DB value:',
                  dbValueString
                );
                foundMatch = true;  // Mark match as found
                break;  // Exit the inner loop since match is found
              }
            }

            // If no match was found in the inner loop, throw error
            if (!foundMatch) {
              info(
                'No match for key:',
                value,
                '\n Last UI value checked:',
                uiVal,
                ' DB value:',
                dbValueString
              );
              throw new Error(`UI value does not match DB value: ${uiVal}, ${dbVal}`);
            }
          } else {
            throw new Error('Undefined dataSet');
          }
        }
      } else {
        const element = await elements[0];
        let uiVal = await element.textContent();
        if (uiVal === null || uiVal === '') {
          uiVal = await element.inputValue();
        }
        const dbVal = await data?.getRowData(value);
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          isDate ? await this.toDateString(dbVal) : dbVal
        );
        isDate ? assert.strictEqual(uiVal, await this.toDateString(dbVal)) : assert.strictEqual(uiVal, dbVal);
      }
    } else {
      for (let index = 0; index < elements.length; index++) {
        const element = await elements[index];
        let uiVal = await element.textContent();
        if (uiVal === null || uiVal === '') {
          uiVal = await element.inputValue();
        }
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          isDate ? await this.toDateString(cellVal) : cellVal
        );
        isDate ? assert.strictEqual(uiVal, await this.toDateString(cellVal)) : assert.strictEqual(uiVal, cellVal);
      }
    }
  }

  async compareCommaSeparatedStrings(
    str1: string | null,
    str2: string | null,
    separator: string = ','
  ) {
    let arr1: string[] | null = null;
    let arr2: string[] | null = null;
    if (str1 !== null) {
      arr1 = str1
        .split(separator)
        .map((s) => s.trim())
        .sort();
    }
    if (str2 !== null) {
      arr2 = str2
        .split(separator)
        .map((s) => s.trim())
        .sort();
    }
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  }

  //verify UI for list with seperator
  async verifyUiWithSperator(
    selector: string,
    value: string,
    property?: 'atrtibute',
    attributeName?: string
  ) {
    const dataB = await environmentSetupInstance.getDataBeforeSteps();
    const cellVal = await dataB.getRawRowData(value);
    await this.waitForSelector(selector);
    const elements = await this.findElements(selector);
    if (cellVal.startsWith('${__')) {
      const dataReplace = await dataB.splitSyntax(cellVal);
      const splitData = await dataReplace.split('.');
      const resultSet = await parseInt(splitData[1].replace(/\[|\]/g, ''));
      let data;
      if (splitData[0] === 'beforeSteps') {
        data = await environmentSetupInstance.getDataBeforeSteps();
      } else {
        data = await environmentSetupInstance.getDataAfterSteps();
      }
      const rowCount = await data.countRows(resultSet);
      const numberOfRows = Math.min(
        parseInt(rowCount as string),
        elements.length
      );
      if (splitData[2].replace(/\[|\]/g, '') === 'i') {
        for (let index = 0; index < numberOfRows; index++) {
          const element = await elements[index];
          let uiVal = '';
          if (property === 'atrtibute') {
            uiVal = await element.getAttribute(attributeName)
          } else {
            uiVal = await element.textContent();
          }
          if (data !== null) {
            const dbVal = (await data?.getData(
              resultSet,
              splitData[3],
              index
            )) as string;
            info(
              'Compare for key: ',
              value,
              '\n UI value: ',
              uiVal,
              ' DB value: ',
              dbVal
            );
            assert.strictEqual(
              await this.compareCommaSeparatedStrings(uiVal, dbVal, ','),
              true
            );
          } else {
            throw new Error('Undefined dataSet');
          }
        }
      } else {
        const element = await elements[0];
        let uiVal = '';
        if (property === 'atrtibute') {
          uiVal = await element.getAttribute(attributeName)
        } else {
          uiVal = await element.textContent();
        }
        const dbVal = await data?.getRowData(value);
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          dbVal
        );
        assert.strictEqual(
          await this.compareCommaSeparatedStrings(uiVal, dbVal, ','),
          true
        );
      }
    } else {
      for (let index = 0; index < elements.length; index++) {
        const element = await elements[index];
        const uiVal = await element.textContent();
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          cellVal
        );
        assert.strictEqual(
          await this.compareCommaSeparatedStrings(uiVal, cellVal, ','),
          true
        );
      }
    }
  }

  async verifyUiWithoutOrder(
    selector: string,
    value: string,
    property?: 'atrtibute',
    attributeName?: string
  ) {

    await this.page.waitForSelector(selector);
    const elements = await this.page.$$(selector);
    let arrUIVal = [];

    //get DB list of values
    const dataB = await environmentSetupInstance.getDataBeforeSteps();
    const cellVal = await dataB.getRawRowData(value);
    let arrDBVal = [];

    if (cellVal.startsWith('${__')) {
      const dataReplace = await dataB.splitSyntax(cellVal);
      const splitData = await dataReplace.split('.');
      const resultSet = await parseInt(splitData[1].replace(/\[|\]/g, ''));
      let data;
      if (splitData[0] === 'beforeSteps') {
        data = await environmentSetupInstance.getDataBeforeSteps();
      } else {
        data = await environmentSetupInstance.getDataAfterSteps();
      }
      const rowCount = await data.countRows(resultSet);


      if (splitData[2].replace(/\[|\]/g, '') === 'i') {
        for (let index = 0; index < rowCount; index++) {
          if (data !== null) {
            const dbVal = (await data?.getData(
              resultSet,
              splitData[3],
              index
            )) as string;

            arrDBVal.push(dbVal?.trim() ?? '');

          } else {
            info('Undefined dataSet');
            return null;
          }
        }

        const numberOfElements = elements.length;

        for (let index = 0; index < numberOfElements; index++) {
          const element = await elements[index];
          let uiVal = '';
          if (property === 'atrtibute') {
            uiVal = await element.getAttribute(attributeName)
          } else {
            uiVal = await element.textContent();
          }
          arrUIVal.push(uiVal?.trim() ?? '');

        }

        const sortedArrDBVal = arrDBVal.sort();
        const sortedArrUIVal = arrUIVal.sort();

        assert.deepStrictEqual(sortedArrDBVal, sortedArrUIVal, 'UI values are not matching with DB values');

      } else {
        const element = await elements[0];
        let uiVal = '';
        if (property === 'atrtibute') {
          uiVal = await element.getAttribute(attributeName)
        } else {
          uiVal = await element.textContent();
        }
        const dbVal = await data?.getRowData(value);
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          dbVal
        );
        assert.strictEqual(uiVal ?? '', dbVal ?? '');
      }

    } else {
      for (let index = 0; index < elements.length; index++) {
        const element = await elements[index];
        let uiVal = '';
        if (property === 'atrtibute') {
          uiVal = await element.getAttribute(attributeName)
        } else {
          uiVal = await element.textContent();
        }
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          cellVal
        );
        assert.strictEqual(uiVal ?? '', cellVal ?? '');
      }
    }
  }
  // click element by selector or xpath
  async click(selector: string) {
    let i = 0;
    while (i < 1) {
      try {
        // await this.waitForSelector(selector);
        return await this.page.click(selector);
      } catch (error) {
        i++;
        if (i >= 1) {
          // info('All attempts failed. Could not click element:', selector);
          throw new Error('All attempts failed. Could not click element:' + selector);
        }
      }
    }

  }

  //find element
  async findElement(selector: string) {
    let attempts = 0;
    while (attempts < 1) {
      try {
        return await this.page.$(selector);
      } catch (error) {
        attempts++;
        if (attempts >= 1) {
          // info('All attempts failed. Could not find element:', selector);
          throw new Error('All attempts failed. Could not find element:' + selector);
        }
      }
    }
  }

  //find elements
  async findElements(selector: string) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        return await this.page.$$(selector);
      } catch (error) {
        attempts++;
        if (attempts >= 2) {
          // info('All attempts failed. Could not find elements:', selector);
          throw new Error('All attempts failed. Could not find elements:' + selector);
        }
      }
    }
  }

  //scroll to element
  async scrollToElement(selector: string, scrollBarSelector: string = null) {
    let elementVisible = false;
    let lastScrollTop = 0;
    if (scrollBarSelector !== null) {
      const scrollBar = await this.findElement(scrollBarSelector);
      while (!elementVisible) {
        await scrollBar.evaluate(scroll => {
          scroll.scrollTop += 30;
        });

        elementVisible = await this.page.isVisible(selector);

        if (elementVisible) {
          break;
        }
        const currentScrollTop = await scrollBar.evaluate(scroll => scroll.scrollTop);

        if (currentScrollTop === lastScrollTop) {
          break;
        }
        lastScrollTop = currentScrollTop;

        await this.waitForTimeout(1000);
      }
    }
    else {
      const element = await this.findElement(selector);
      await element?.scrollIntoViewIfNeeded();
    }

  }


  //get element text
  async getElementText(selector: string) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        await this.waitForSelector(selector);
        return await this.page.textContent(selector);
      } catch (error) {
        attempts++;
        if (attempts >= 2) {
          // info('All attempts failed. Could not get text from element:', selector);
          throw new Error('All attempts failed. Could not get text from element:' + selector);
        }
      }
    }
  }

  //get value from textarea or input
  async getInputValue(selector: string) {
    let attempts = 0;
    try {
      await this.waitForSelector(selector);
      return await this.page.inputValue(selector);
    } catch (error) {
      attempts++;
      if (attempts >= 2) {
        // info('All attempts failed. Could not get value from element:', selector);
        throw new Error('All attempts failed. Could not get value from element:' + selector);
      }
    }

  }

  async fill(selector: string, value: string) {
    let attempts = 0;
    while (attempts < 1) {
      try {
        await this.waitForSelector(selector);
        return await this.page.fill(selector, value);
      } catch (error) {
        attempts++;
        if (attempts >= 1) {
          // info('All attempts failed. Could not fill element:', selector);
          throw new Error('All attempts failed. Could not fill element:' + selector);
        }
      }
    }
  }

  //verify element is exists
  async isElementExists(selector: string) {
    const element = await this.findElement(selector) !== null;
    info(`Element ${selector} exists`)
    await assert.strictEqual(element, true);
  }
  //verify not exists
  async isElementNotExists(selector: string) {
    const element = await this.page.$$(selector);
    const check = element.length === 0;
    info(`Element ${selector} not exists`)
    await assert.strictEqual(check, true);
  }
  //verify is checkbox checked
  async isCheckboxChecked(selector: string) {
    const element = await this.findElement(selector);
    assert.strictEqual(await element.isChecked(), true);
  }

  //verify is checkbox unchecked
  async isCheckboxUnchecked(selector: string) {
    const element = await this.findElement(selector);
    assert.strictEqual(await element.isChecked(), false);
  }

  //is element visible
  async isElementVisible(selector: string) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        await this.waitForSelector(selector);
        const element = await this.findElement(selector);
        return await element.isVisible();
      } catch (error) {
        attempts++;
        if (attempts >= 2) {
          // info('All attempts failed. Could not check element visibility:', selector);
          throw new Error('All attempts failed. Could not check element visibility:' + selector);
        }
      }
    }
  }

  //is element disabled
  async isElementDisabled(selector: string) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        await this.waitForSelector(selector);

        const element = await this.findElement(selector);
        return await element.isDisabled();
      } catch (error) {
        attempts++;
        if (attempts >= 2) {
          // info('All attempts failed. Could not check element disabled:', selector);
          throw new Error('All attempts failed. Could not check element disabled:' + selector);
        }
      }
    }
  }

  //verify element text
  async verifyElementText(
    selector: string,
    expectedText: string,
    toLowerCase: boolean = false
  ) {
    //if dont have text from selector then get value atrribute from selector
    let elementText = await this.getElementText(selector);
    if (elementText === null || elementText === '') {
      elementText = await this.getInputValue(selector) ?? '';
    }
    info('Comparing element text:', elementText, 'with expected text:', expectedText)
    if (toLowerCase) {
      if (elementText?.toLowerCase() !== expectedText.toLowerCase()) {
        throw new Error(
          `Expected text: ${expectedText}, but found: ${elementText}`
        );
      }
    } else {
      if (elementText !== expectedText) {
        throw new Error(
          `Expected text: ${expectedText}, but found: ${elementText}`
        );
      }
    }
  }

  //compare Email content
  async compareEmailContent(
    emailContent: string,
    expectedContent: string
  ) {
    const normalizedFetchEmails = expectedContent.replace(/\s+/g, ' ').trim();
    const normalizedReplaceContent = emailContent.replace(/\s+/g, ' ').trim();
    info('Comparing email content:', emailContent, 'with expected content:', expectedContent)
    assert.strictEqual(true, normalizedFetchEmails.includes(normalizedReplaceContent));
    if (!normalizedFetchEmails.includes(normalizedReplaceContent)) {
      throw new Error(
        `Expected email content: ${normalizedReplaceContent}, but found: ${normalizedFetchEmails}`
      );
    }
  }

  async inputDate(selector: string, dateValue: string) {
    const formattedDate = await this.toDateString(dateValue);
    await this.inputCharacterByCharacter(selector, formattedDate.replace(/[\/\-]/g, ''));
  }

  async toDateString(date: string): Promise<string> {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(`en-${environmentSetupInstance.getRegion()}`, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  async toDateStringWithTZ(date: string, tz: string): Promise<string> {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(`en-${tz}`, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  //convert timestamp to UTC 
  async convertToUTC(timestamp: string): Promise<string> {
    const date = new Date(timestamp);
    // Get the timezone offset in minutes
    const timezoneOffset = date.getTimezoneOffset();
    const utcTimestamp = new Date(date.getTime() - (timezoneOffset * 60000));
    // Format the UTC timestamp in ISO format with UTC indicator (+0000)
    const isoDateUTC = utcTimestamp.toISOString().replace('Z', '');

    return isoDateUTC;
  }

  //convert to region date time

  async convertToRegionDateTime(timestamp: string, timezone: string = "Australia/Sydney"): Promise<string> {
    const date = new Date(timestamp);
    return moment(date).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  }

  //getCurrentDate
  async getCurrentDate(): Promise<string> {
    const date = new Date();
    return this.toDateString(date.toISOString());
  }

  //getDateWithAddedDays
  async getDateWithAddedDays(days: number): Promise<string> {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return this.toDateString(date.toISOString());
  }

  //check file is downloaded
  async isFileDownloaded(fileName: string) {
    const downloadPath = process.env.DOWNLOAD_PATH;
    const fs = require('fs');
    const files = fs.readdirSync(downloadPath);
    return files.includes(fileName);
  }

  //#endregion

  //#region 
  xpathMobile = {
    mobileEmail: "//android.view.View[@content-desc='Email']/following-sibling::android.widget.EditText[1]",
    mobilePassword: "//android.view.View[@content-desc='Password']/following-sibling::android.widget.EditText[1]",
    mobileLogin: "//android.view.View[@content-desc='Sign in']",
    grantPermission: "//android.widget.Button[@text='Allow all the time']",
  }
  async mobileGetText(selector: string) {
    return await this.driver.$(selector).getText();
  }
  async loginMobileApp() {
    try {

      await this.mobileSendKeys(this.xpathMobile.mobileEmail, process.env.RESIDENT_EMAIL);
      await this.mobileSendKeys(this.xpathMobile.mobilePassword, process.env.RESIDENT_PASSWORD);
      await this.mobileClick(this.xpathMobile.mobileLogin);
    } catch (error) {
      info("Already logged in");
    }
  }

  async waitForMobileElementVisible(selector: string) {
    await this.driver.$(selector).waitForDisplayed({ timeout: 20000 });
  }

  async mobileSendKeys(selector: string, value: string) {
    // let attempts = 0;
    // while (attempts < 2) {
    //   try {
    const element = await this.driver.$(selector);
    await element.click();
    await element.addValue(value);
    //   } catch (error) {
    //     attempts++;
    //     if (attempts >= 2) {
    //       // info('All attempts failed. Could not send keys to element:', selector);
    //       throw new Error('All attempts failed. Could not send keys to element:' + selector);
    //     }
    //   }
    // }
  }

  async mobileClick(selector: string) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        await this.waitForMobileElementVisible(selector);
        return this.driver.$(selector).click();
      } catch (error) {
        attempts++;
        if (attempts >= 2) {
          // info('All attempts failed. Could not click element:', selector);
          throw new Error('All attempts failed. Could not click element:' + selector); // Throw error if all attempts fail
        }
      }
    }
  }

  async mobileBottomClick(selector: string) {
    await this.waitForMobileElementVisible(selector);
    const element = await this.driver.$(selector);
    // await element.scrollIntoView();
    const location = await element.getLocation();
    const size = await element.getSize();
    const x = location.x + size.width / 2;
    const y = location.y + size.height - (size.height * 0.14);
    // Perform touch action
    console.log("X: ", x, "Y: ", y);

    await this.driver.action('pointer', { parameters: { pointerType: "touch" } }).move({ x, y }).down().up().perform();

  }

  async mobileBottomClickElement(selector: WebdriverIO.Element) {
    // await element.scrollIntoView();
    const location = await selector.getLocation();
    const size = await selector.getSize();
    const x = location.x + size.width / 2;
    const y = location.y + size.height - (size.height * 0.14);
    // Perform touch action

    await this.driver.action('pointer', { parameters: { pointerType: "touch" } }).move({ x, y }).down().up().perform();

  }

  async mobileFindElement(selector: string) {
    return await this.driver.$(selector);
  }

  async mobileFindElements(selector: string) {
    return await this.driver.$$(selector);
  }

  async verifyMobileUi(
    selector: string,
    value: string,
    isDate: boolean = false
  ) {
    const dataB = await environmentSetupInstance.getDataBeforeSteps();
    const cellVal = await dataB.getRawRowData(value);
    const elements = await this.driver.$$(selector);
    if (cellVal.startsWith('${__')) {
      const dataReplace = await dataB.splitSyntax(cellVal);
      const splitData = await dataReplace.split('.');
      const resultSet = await parseInt(splitData[1].replace(/\[|\]/g, ''));
      let data;
      if (splitData[0] === 'beforeSteps') {
        data = await environmentSetupInstance.getDataBeforeSteps();
      } else {
        data = await environmentSetupInstance.getDataAfterSteps();
      }
      const rowCount = await data.countRows(resultSet);
      const numberOfRows = Math.min(
        parseInt(rowCount as string),
        elements.length
      );
      if (splitData[2].replace(/\[|\]/g, '') === 'i') {
        for (let index = 0; index < numberOfRows; index++) {
          let foundMatch = false;
          let uiVal = null;
          if (data !== null) {
            const dbVal = await data.getData(resultSet, splitData[3], index); // Fetch DB value once
            const dbValueString = isDate ? await this.toDateString(dbVal) : dbVal;

            for (let c = 0; c < numberOfRows; c++) {
              const element = elements[c];
              const tagName = await element.getTagName();

              if (tagName.toLowerCase() === 'android.widget.EditText') {
                uiVal = await element.getValue();
              } else {
                uiVal = await element.getAttribute('content-desc');
              }

              if (uiVal.includes(dbValueString)) {
                info(
                  'Match found for key:',
                  value,
                  '\n UI value:',
                  uiVal,
                  ' DB value:',
                  dbValueString
                );
                foundMatch = true;  // Mark match as found
                break;  // Exit the inner loop since match is found
              }
            }

            // If no match was found in the inner loop, throw error
            if (!foundMatch) {
              info(
                'No match for key:',
                value,
                '\n Last UI value checked:',
                uiVal,
                ' DB value:',
                dbValueString
              );
              throw new Error(`UI value does not match DB value: ${uiVal}, ${dbVal}`);
            }
          } else {
            throw new Error('Undefined dataSet');
          }
        }
      } else {
        const element = await elements[0];
        let uiVal = await element.getText();
        if (uiVal === null || uiVal === '') {
          uiVal = await element.getValue();
        }
        const dbVal = await data?.getRowData(value);
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          isDate ? await this.toDateString(dbVal) : dbVal
        );
        isDate ? assert.strictEqual(uiVal, await this.toDateString(dbVal)) : assert.strictEqual(uiVal, dbVal);
      }
    } else {
      for (let index = 0; index < elements.length; index++) {
        const element = await elements[index];
        let uiVal = await element.getText();
        if (uiVal === null || uiVal === '') {
          uiVal = await element.getValue();
        }
        info(
          'Compare for key: ',
          value,
          '\n UI value: ',
          uiVal,
          ' DB value: ',
          isDate ? await this.toDateString(cellVal) : cellVal
        );
        isDate ? assert.strictEqual(uiVal, await this.toDateString(cellVal)) : assert.strictEqual(uiVal, cellVal);
      }
    }
  }

  async verifyMobileExists(selector: string) {
    const element = await this.mobileFindElement(selector);
    const check = await element.isExisting();
    info(`Element ${selector} exists`)
    await assert.strictEqual(check, true);
  }

  async isMobileElementExists(selector: string) {
    const element = await this.mobileFindElement(selector);
    const check = await element.isExisting();
    return check;
  }

  //#endregion


  //#region Common
  async assertTrue(condition: boolean) {
    assert.strictEqual(condition, true);
  }

  async assertTextEqual(actual: string, expected: string) {
    assert.strictEqual(actual, expected);
  }

  async generatedRandomName(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async generatedRandomNumber(length: number) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  async generatedRandomCity() {
    const cities = [
      // Cities from Australia
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaide",
      "Gold Coast",
      "Canberra",
      "Hobart",
      "Darwin",
      "Newcastle",

      // Cities from Vietnam
      "Hanoi",
      "Ho Chi Minh City",
      "Da Nang",
      "Hai Phong",
      "Nha Trang",
      "Can Tho",
      "Hue",
      "Bien Hoa",
      "Vung Tau",
      "Da Lat"
    ];

    const randomIndex = Math.floor(Math.random() * cities.length);
    return cities[randomIndex];

  }

  async generatedRandomPostalCode() {
    return this.generatedRandomNumber(4);
  }

  //check is Contains
  async isContains(actual: string, expected: string) {
    return actual.includes(expected);
  }

  //#endregion
}

