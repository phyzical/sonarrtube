import { ElementHandle, HTTPResponse, Page } from 'puppeteer';

import { log } from '@sonarrTube/helpers/Log.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';


export const xpathSelector = (selector: string): string => `::-p-xpath(//${selector})`;

export const textContainsSelector = (text: string, elementSelector = '*'): string => {
  const selectorCleaned = 'contains(translate(normalize-space(), ' +
    `'${Constants.CHAR_CLEANER_LIST}', '${Constants.CHAR_CLEANER_LIST.toLowerCase()}'),` +
    `"${text.toLowerCase()}")`;

  return xpathSelector(`${elementSelector}[${selectorCleaned}]`);
};

export const delay = (time: number): Promise<void> => new Promise((resolve) => {
  log(`Waiting for ${time} ms`, true);

  setTimeout(resolve, time);
});

export const find = async (page: Page, selector: string): Promise<ElementHandle<Element> | null> => {
  log(`Finding ${selector}`, true);

  const element = await page.$(selector);
  if (!element) {
    throw new Error(`failed to find element matching selector "${selector}"`);
  }

  return element;
};

export const click = async (page: Page, selector: string): Promise<void> => {
  await find(page, selector);
  log(`Clicking ${selector}`, true);

  await page.click(selector);
};

export const goto = async (page: Page, url: string): Promise<HTTPResponse | null> => {
  if (page.url() === url) {
    log(`Already at ${url}`, true);

    return null;
  }

  log(`Opening ${url}`, true);

  const result = await page.goto(url).catch((e) => {
    log(`Failed to open ${url}`, true);
    throw e;
  });

  await delay(300);

  return result;
};

export const loaded = async (page: Page): Promise<HTTPResponse | null | undefined> => {
  log('Waiting for page to load', true);
  try {
    return await page.waitForNavigation({
      waitUntil: ['load', 'domcontentloaded', 'networkidle0']
    });
  } catch (_e) {
    log('Warning! didn\'t detect a load', true);
  }
};

export const getValue = async (page: Page, selector: string): Promise<string> => {
  log(`Finding value for ${selector}`, true);

  await find(page, selector);

  return await page.$eval(selector, /* istanbul ignore next */(el: Element) =>
    (el as HTMLInputElement).value || (el as HTMLInputElement).textContent) || '';
};

export const type = async (page: Page, selector: string, value: string, simulate: boolean = true): Promise<void> => {
  let inputValue = await getValue(page, selector);
  if (inputValue) {
    log(`Clearing text in ${selector}`, true);
    await page.evaluate(
      /* istanbul ignore next */(selector) => (<HTMLFormElement>document.querySelector(selector)).value = '',
      selector
    );
  }

  log(`Typing ${value} into ${selector}`, true);

  if (simulate) {
    await page.type(selector, value);
  } else {
    await page.evaluate(
      /* istanbul ignore next */(selector, value) => (<HTMLFormElement>document.querySelector(selector)).value = value,
      selector, value);
    await delay(1000);
  }

  inputValue = await getValue(page, selector);
  if (inputValue != value) {
    throw new Error(`selector should have ${value} but has ${inputValue}`);
  }
};

export const submitForm = async (page: Page, selector: string): Promise<void> => {
  const form = await page.$(selector);
  if (!form) {
    throw new Error(`failed to find element matching selector "${selector}"`);
  }
  await form.evaluate(
    /* istanbul ignore next */(formElement: Element) => (<HTMLFormElement>formElement).submit()
  );
  await loaded(page);
};


export const cleanTextContainsXpath = (text: string): string =>
  // Remove following chars from filename and document contexts ?'/|-*: \ And lowercase all chars to increase matching
  // eslint-disable-next-line max-len
  'contains(translate(translate(translate(normalize-space(),\'\\`~!@#$%^&*()-_=+[]{}|;:<>",./?, \\\\\',\'\'), "\'", \'\'),' +
  `'${Constants.CHAR_CLEANER_LIST}', '${Constants.CHAR_CLEANER_LIST.toLowerCase()}') , '${cleanText(text)}')`;


export const cleanText = (text: string): string =>
  // eslint-disable-next-line no-useless-escape
  text.toLowerCase().replace(/[- '`~!@#$%^&*()_|+=?;:'",\.<>\{\}\[\]\\\/]/gi, '');

export const removeInvalidCharacters = (text: string): string =>
  // eslint-disable-next-line no-useless-escape
  text.replace(/[-'`~!@#$%^&*()_\|+=?;:'",\.<>\{\}\[\]\\\/]/gi, '');
