
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const originalFetch = global.fetch;

global.fetch = jest.fn((url, options) => {
    url = url.toString().replace('http://', '');
    const isImage = /png|jp(e)*g|webp/g.test(url);
    const urlSplits = url.split('/');
    const lastSplit = urlSplits.pop();
    let fileName = join(__dirname, '..', '__mocks__', 'requests', ...urlSplits, `${lastSplit}.json`);

    if (isImage) {
        if (url.includes('jimp')) {
            return originalFetch(url, options);
        }
        fileName = join(__dirname, '..', '__mocks__', 'images', lastSplit);
    }

    if (!existsSync(fileName)) {
        throw new Error(`Payload not found for ${url}, please save as ${fileName}`);
    }

    const bodyBuffer = readFileSync(fileName);
    const body = bodyBuffer.toString();

    const result = {
        body,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    if (/png|jp(e)*g|webp/g.test(url)) {
        result.arrayBuffer = (): Promise<Buffer> => Promise.resolve(bodyBuffer);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.json = (): Promise<any> => JSON.parse(body);
    }

    return Promise.resolve(result);
}) as jest.Mock;