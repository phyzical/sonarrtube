
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const mockDir = join(__dirname, '..', '__mocks__',);
export const mockRequestsDir = join(mockDir, 'requests');
export const mockImagesDir = join(mockDir, 'images');

global.fetch = jest.fn((url: string, _options) => {
    url = url.toString().replace(new RegExp('http(s)*://'), '');
    const isImage = /png|jp(e)*g|webp/g.test(url);
    const urlSplits = url.split('/');
    const lastSplit = urlSplits.pop() || '';
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

    const result = { body, json: {} as object, arrayBuffer: undefined as unknown as () => Promise<Buffer> };

    if (/png|jp(e)*g|webp/g.test(url)) {
        result.arrayBuffer = (): Promise<Buffer> => Promise.resolve(bodyBuffer);
    } else {
        result.json = (): object => JSON.parse(body) as object;
    }

    return Promise.resolve(result);
}) as jest.Mock;