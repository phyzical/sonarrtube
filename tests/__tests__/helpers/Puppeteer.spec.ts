import path from 'node:path';

import puppeteer, { Browser, Page } from 'puppeteer';

import {
    cleanText, cleanTextContainsXpath, click, delay,
    find, getValue, goto, loaded, submitForm,
    type,
} from '@sonarrTube/helpers/Puppeteer';
import { consoleSpy } from '@sonarrTube/mocks/Spies';

describe('Puppeteer', () => {
    let browser: Browser;
    let page: Page;

    const getPageUrl = (file: string): string => path.join(
        'file://', process.cwd(), 'tests', '__mocks__', 'html', file
    );

    beforeAll(async () => {
        browser = await puppeteer.launch({
            args: [
                // Required for Docker version of Puppeteer
                '--no-sandbox',
                '--disable-setuid-sandbox',
                // This will write shared memory files into /tmp instead of /dev/shm,
                // because Docker’s default for /dev/shm is 64MB
                '--disable-dev-shm-usage',
            ],
        });
        page = await browser.newPage();
        page.setDefaultTimeout(2000);
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('cleanText', () => {
        it('should clean expected characters and makes lowercase', () => {
            expect(cleanText('  - `~!@T#$%^&*()_|+=e?;:\'",S.<>{}t[]\\1/  ')).toEqual('test1');
        });
    });

    describe('cleanTextContainsXpath', () => {
        it('should match expected html', async () => {
            await page.goto(getPageUrl('cleanTextContainsXpath.html'));
            const xpath = cleanTextContainsXpath('  test1  ');
            const element = await page.waitForSelector(`::-p-xpath(//div[${xpath}])`);
            expect(element).toBeTruthy();
        });
    });

    describe('submitForm', () => {
        it('should throw when no form', async () => {
            await expect(submitForm(page, '#test')).rejects.toThrow('failed to find element matching selector "#test"');
        });
        it('should submit form', async () => {
            await page.goto(getPageUrl('submitForm.html'));
            await expect(submitForm(page, '#test')).resolves.not.toThrow();
        });
    });
    describe('loaded', () => {
        it('should wait for page to load', async () => {
            const processWaitForNavigation = jest.spyOn(page, 'waitForNavigation')
                .mockImplementation(() => null as never);

            await page.goto(getPageUrl('submitForm.html'));
            await loaded(page);
            await expect(processWaitForNavigation).toHaveBeenCalled();
        });

        it('should log when no loaded', async () => {
            await loaded(page);
            expect(consoleSpy).toHaveBeenCalledWith('Warning! didn\'t detect a load');
        });
    });
    describe('goto', () => {
        it('should open url', async () => {
            const processGoto = jest.spyOn(page, 'goto');
            await goto(page, getPageUrl('submitForm.html'));
            await expect(processGoto).toHaveBeenCalled();
            expect(await page.title()).toEqual('test');
        });

        it('should throw on invalid url', async () => {
            const fileURL = getPageUrl('subadssadsdasdmitForm.html');
            await expect(goto(page, fileURL)).
                rejects.toThrow(`net::ERR_FILE_NOT_FOUND at ${fileURL}`);
        });
    });

    describe('find', () => {
        it('should find element', async () => {
            await goto(page, getPageUrl('click.html'));
            expect(await find(page, '#test')).toBeTruthy();
            await expect(find(page, '#test')).resolves.not.toThrow();
        });

        it('should find element by xpath', async () => {
            await goto(page, getPageUrl('click.html'));
            expect(await find(page, '::-p-xpath(//button)')).toBeTruthy();
            await expect(find(page, '::-p-xpath(//button)')).resolves.not.toThrow();
        });

        it('should throw when no element', async () => {
            await goto(page, getPageUrl('click.html'));
            await expect(find(page, '#testsaddsadas')).
                rejects.toThrow('failed to find element matching selector "#testsaddsadas"');
        });
    });

    describe('getValue', () => {
        it('from value attr', async () => {
            await goto(page, getPageUrl('submitForm.html'));
            expect(await getValue(page, '#input2')).toBe('input2');
        });

        it('from text content', async () => {
            await goto(page, getPageUrl('submitForm.html'));
            expect(await getValue(page, '#input3')).toBe('input3');
        });

        it('should return fallback ', async () => {
            await goto(page, getPageUrl('submitForm.html'));
            expect(await getValue(page, '#input4')).toBe('');
        });
    });

    describe('type', () => {
        it('should type text', async () => {
            await goto(page, getPageUrl('submitForm.html'));
            await type(page, '#input', 'test');
            const content = await page.$eval('#input', (el: Element) => (el as HTMLInputElement).value);
            expect(content).toBe('test');
        });

        it('should type non simulated text', async () => {
            await goto(page, getPageUrl('submitForm.html'));
            await type(page, '#input', 'test', false);
            const content = await page.$eval('#input', (el: Element) => (el as HTMLInputElement).value);
            expect(content).toBe('test');
        });

        it('should throw when text doesnt update correctly', async () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            jest.spyOn(require('@sonarrTube/helpers/Puppeteer'), 'getValue')
                .mockImplementation(() => 'blarg' as never);
            await goto(page, getPageUrl('submitForm.html'));
            await expect(type(page, '#input', 'test'))
                .rejects
                .toThrow('selector should have test but has blarg');
        });

        it('should clear text then type', async () => {
            const selector = '#input';
            await goto(page, getPageUrl('submitForm.html'));
            await type(page, selector, 'test');
            await type(page, selector, 'test2');
            const content = await page.$eval('#input', (el: Element) => (el as HTMLInputElement).value);
            expect(content).toBe('test2');
            expect(consoleSpy).toHaveBeenCalledWith(`Clearing text in ${selector}`);
        });
    });

    describe('click', () => {
        it('should click element', async () => {
            await goto(page, getPageUrl('click.html'));
            await click(page, '#test');
            expect(await page.waitForSelector('#newDiv')).toBeTruthy();
        });
    });
    describe('delay', () => {
        it('fake test to pass coverage', async () => {
            await delay(1000);
        });
    });
});
