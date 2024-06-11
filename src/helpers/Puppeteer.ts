import { ElementHandle, HTTPResponse, Page } from 'puppeteer';
import { log } from './Log.js';

// eslint-disable-next-line no-return-assign
export const setHtmlInput = (el: Element, v: string): string => ((<HTMLInputElement>el).value = v);

export const submitHtmlForm = (form: Element): void => (<HTMLFormElement>form).submit();
export const clickHtmlElement = (button: Element): void => (<HTMLFormElement>button).click();
export const delay = (time: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, time);
});

export const find = async (page: Page, selector: string, options = {}): Promise<ElementHandle<Element>> => {
  log(`Finding ${selector}`, true);

  return await page.waitForSelector(selector, options).catch((e) => {
    log(`Failed to find ${selector}`);
    throw e;
  });
};

export const click = async (page: Page, selector: string): Promise<void> => {
  await find(page, selector);
  log(`Clicking ${selector}`, true);

  return (await page.$$(selector))[0].evaluate((b: HTMLElement) => b.click());
};

export const goto = async (page: Page, url: string): Promise<HTTPResponse> => {
  log(`Opening ${url}`, true);

  return await page.goto(url).catch((e) => {
    log(`Failed to open ${url}`);
    throw e;
  });
};

export const loaded = async (page: Page): Promise<HTTPResponse> => await page.waitForNavigation({
  waitUntil: ['load', 'domcontentloaded', 'networkidle0']
});

export const type = async (page: Page, selector: string, value: string): Promise<void> => {
  log(`Typing ${value} into ${selector}`, true);

  return await page.type(selector, value);
};

export const submitForm = async (page: Page, selector: string): Promise<void> =>
  page.$eval(selector, (form: Element) => (<HTMLFormElement>form).submit());

