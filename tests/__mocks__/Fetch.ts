
import { existsSync, readFileSync } from 'fs';
import { btoa } from 'buffer';
import { join } from 'path';

global.fetch = jest.fn((url, _options) => {
    url = url.toString();
    const isImage = /png|jp(e)*g|webp/g.test(url);
    const uuid = btoa(url);
    let fileName = join(__dirname, '..', '__mocks__', 'requests', `${uuid}.json`);

    if (isImage) {
        fileName = join(__dirname, '..', '__mocks__', 'images', url.split('/').pop());
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