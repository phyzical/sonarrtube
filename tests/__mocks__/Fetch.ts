
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const mockDir = join(__dirname, '..', '__mocks__',);
export const mockRequestsDir = join(mockDir, 'requests');
export const mockImagesDir = join(mockDir, 'images');

global.fetch = jest.fn((url, _options) => {
    url = url.toString().replace(new RegExp('http(s)*://'), '');
    const isImage = /png|jp(e)*g|webp/g.test(url);
    const urlSplits = url.split('/');
    const lastSplit = urlSplits.pop();
    let fileName = join(mockRequestsDir, ...urlSplits, `${lastSplit}.json`);

    if (isImage) {
        if (existsSync(url)) {
            fileName = url;
        } else {
            fileName = join(mockImagesDir, lastSplit);
        }

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