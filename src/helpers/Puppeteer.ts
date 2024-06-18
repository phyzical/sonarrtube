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

  try {
    return await page.waitForSelector(selector, options);
  } catch (e) {
    log(`Failed to find ${selector}`);
    throw e;
  }
};

export const click = async (page: Page, selector: string, options = {}): Promise<void> => {
  await find(page, selector, options);
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

export const loaded = async (page: Page): Promise<HTTPResponse> => {
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
  await page.$eval(selector, (el: HTMLInputElement) => el.value);

export const mouseDrag = async (page: Page, selector: string, toX: number, toY: number): Promise<void> => {
  log('finding points');
  const point = await find(page, selector);
  const pointBox = await point.boundingBox();
  const xFrom = pointBox.x + pointBox.width / 2;
  const yFrom = pointBox.y + pointBox.height / 2;
  log(`dragging mouse from (${xFrom},${yFrom}) to (${toX},${toY})`);
  await page.mouse.move(xFrom, yFrom);
  await page.mouse.down();
  await page.mouse.move(toX, toY);
  await page.mouse.up();
};

export const type = async (page: Page, selector: string, value: string, simulate: boolean): Promise<void> => {
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
  }

  await delay(1000);

  inputValue = await getValue(page, selector);
  if (inputValue != value) {
    throw new Error(`selector should have ${value} but has ${inputValue}`);
  }
};

export const submitForm = async (page: Page, selector: string): Promise<void> => {
  page.$eval(selector, (form: Element) => (<HTMLFormElement>form).submit());
  await loaded(page);
};


const capitalChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖŠÚÛÜÙÝŸŽ';

export const cleanTextContainsXpath = (text: string): string =>
  // Remove following chars from filename and document contexts ?'/|-*: \ And lowercase all chars to increase matching
  'contains(translate(translate(translate(text(),\'\\`~!@#$%^&*()-_=+[]{}|;:<>",./?, \',\'\'), "\'", \'\'),' +
  `'${capitalChars}', '${capitalChars.toLowerCase()}') , '${cleanText(text)}')`;


export const cleanText = (text: string): string =>
  // eslint-disable-next-line no-useless-escape
  text.toLowerCase().replace(/[- '`~!@#$%^&*()_|+=?;:'",\.<>\{\}\[\]\\\/]/gi, '');
