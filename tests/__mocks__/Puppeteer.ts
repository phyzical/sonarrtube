import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { TvdbSubmitter } from '@sonarrTube/models/submitter/TvdbSubmitter';
import { BaseSubmitter } from '@sonarrTube/models/submitter/BaseSubmitter';

export const mockPage = async (tvdbSubmitter: TvdbSubmitter | BaseSubmitter): Promise<void> => {
    const page = tvdbSubmitter.page();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
        const url = request.url();
        let fileName = '';
        const exclusions = [
            'delete-reasons',
            'auth/checkfavorite',
            '/addseason'
        ];

        if (url.includes('/token/get')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    jwt: '123',
                })
            });

            return;
        }

        if (url.includes('/tvtapi') || url.includes('/savebulkadd')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: [],
                    success: 'success',
                })
            });

            return;
        }

        if (url.includes('/users/authenticated')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    avatar: null,
                    name: 'test',
                    level: 'user',
                })
            });

            return;
        }

        if (url.includes('/auth/getuser')) {
            request.respond({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    name: 'test',
                    role: 'user',
                    favorites: { artwork: [] }
                })
            });

            return;
        }

        if (url.includes('/auth/checkpermissions')) {
            request.respond({
                status: 200,
                contentType: 'text/html',
                body: '1'
            });

            return;
        }

        if (exclusions.some((exclusion) => url.includes(exclusion))) {
            request.abort();

            return;
        }
        if ((/\.js|\.css|\.png|\.jp(e)*g|\.webp|\.svg|\/pub-|\.ico/g.test(url))) {
            fileName = join(
                __dirname,
                '..',
                '__mocks__',
                'html',
                'thetvdb.com_files',
                `${(url.split('/').pop() || '').split('?')[0]}`
            );

            if (!existsSync(fileName)) {
                // console.log(`skipped ${fileName}`);
                request.abort();

                return;
            }

        } else {
            if (!/tvdb\.com/g.test(url)) {
                request.abort();

                return;
            }
            let splits = url.split('www.');
            splits.shift();
            splits = splits[0].split('/').filter(x => x);
            fileName = join(__dirname, '..', '__mocks__', 'html', `${splits.join('_')}.html`);

            if (url.includes('9760537/update')) {
                splits = fileName.split('_official');
                //  need to save last season to make the 2023 mroe magic
                // inspect wht save doesnt try to move
                fileName = `${splits[0]}s_official_2023_with_episode.html`;
            }
            if (!existsSync(fileName)) {
                request.abort();

                throw new Error(`Payload not found for ${url}, please save as ${fileName}`);
            }
        }

        const body = readFileSync(fileName, 'utf-8');
        let contentType = '';
        if (/\.js/g.test(fileName)) {
            contentType = 'application/javascript';
        } else if (/\.css/g.test(fileName)) {
            contentType = 'text/css';
        } else if (/\.png/g.test(fileName)) {
            contentType = 'image/png';
        } else if (/\.jp(e)*g/g.test(fileName)) {
            contentType = 'image/jpeg';
        } else if (/\.webp/g.test(fileName)) {
            contentType = 'image/webp';
        } else if (/\.svg/g.test(fileName)) {
            contentType = 'image/svg+xml';
        } else if (/\.ico/g.test(fileName)) {
            contentType = 'image/x-icon';
        } else {
            contentType = 'text/html';
        }
        const headers = request.headers();
        delete headers['origin'];
        headers['Access-Control-Allow-Origin'] = '*';
        request.respond({
            status: 200,
            contentType,
            body,
            headers
        });

        return;
    });

    tvdbSubmitter.pageObj = page;
};
