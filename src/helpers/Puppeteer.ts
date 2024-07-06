import { ElementHandle, HTTPResponse, Page } from 'puppeteer';
import { log } from './Log.js';
import { Constants } from '../types/config/Constants.js';

// eslint-disable-next-line no-return-assign
export const setHtmlInput = (el: Element, v: string): string => ((<HTMLInputElement>el).value = v);

export const submitHtmlForm = (form: Element): void => (<HTMLFormElement>form).submit();
export const clickHtmlElement = (button: Element): void => (<HTMLFormElement>button).click();
export const delay = (time: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, time);
});

export const find = async (page: Page, selector: string, options = {}): Promise<ElementHandle<Element> | null> => {
  log(`Finding ${selector}`, true);

  try {
    return await page.waitForSelector(selector, options);
  } catch (e) {
    log(`Failed to find ${selector}`, true);
    throw e;
  }
};

export const click = async (page: Page, selector: string, options = {}): Promise<void> => {
  await find(page, selector, options);
  log(`Clicking ${selector}`, true);

  (await page.$$(selector))[0].click();
  // (await page.$$(selector))[0].evaluate((b: HTMLElement) => b.click());
};

export const goto = async (page: Page, url: string): Promise<HTTPResponse | null> => {
  log(`Opening ${url}`, true);

  return await page.goto(url).catch((e) => {
    log(`Failed to open ${url}`, true);
    throw e;
  });
};

export const loaded = async (page: Page): Promise<HTTPResponse | null | undefined> => {
  log('Waiting for page to load', true);
  try {
    return await page.waitForNavigation({
      waitUntil: ['load', 'domcontentloaded', 'networkidle0']
    });
  } catch (e) {
    log('Warning! didn\'t detect a load', true);
  }
};

export const getValue = async (page: Page, selector: string): Promise<string> =>
  await page.$eval(selector, (el: Element) => (el as HTMLInputElement).value);


export const type = async (page: Page, selector: string, value: string, simulate: boolean = true): Promise<void> => {
  let inputValue = await getValue(page, selector);
  if (inputValue) {
    log(`Clearing text in ${selector}`, true);
    await page.evaluate((selector) => (<HTMLFormElement>document.querySelector(selector)).value = '', selector);
  }

  log(`Typing ${value} into ${selector}`, true);

  if (simulate) {
    await page.type(selector, value);
  } else {
    await page.evaluate((selector, value) =>
      (<HTMLFormElement>document.querySelector(selector)).value = value, selector, value);
    await delay(1000);
  }

  inputValue = await getValue(page, selector);
  if (inputValue != value) {
    throw new Error(`selector should have ${value} but has ${inputValue}`);
  }
};

export const submitForm = async (page: Page, selector: string): Promise<void> => {
  page.$eval(selector, (form: Element) => (<HTMLFormElement>form).submit());
  await loaded(page);
};


export const cleanTextContainsXpath = (text: string): string =>
  // Remove following chars from filename and document contexts ?'/|-*: \ And lowercase all chars to increase matching
  'contains(translate(translate(translate(text(),\'\\`~!@#$%^&*()-_=+[]{}|;:<>",./?, \',\'\'), "\'", \'\'),' +
  `'${Constants.CHAR_CLEANER_LIST}', '${Constants.CHAR_CLEANER_LIST.toLowerCase()}') , '${cleanText(text)}')`;


export const cleanText = (text: string): string =>
  // eslint-disable-next-line no-useless-escape
  text.toLowerCase().replace(/[- '`~!@#$%^&*()_|+=?;:'",\.<>\{\}\[\]\\\/]/gi, '');
