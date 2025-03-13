import { join } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';

import { mockRequestsDir } from '@sonarrTube/mocks/Fetch';

export let execSyncSpy: jest.SpyInstance;

beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    execSyncSpy = jest.spyOn(require('child_process'), 'execSync');
    execSyncSpy.mockImplementation((commands: string, _options) => {
        //getAllVideoInfo
        if (commands.includes('--write-info-json')) {
            const url = (commands.split(' ').pop() ?? '')
                .replace(new RegExp('http(s)*://'), '');
            const cacheDir = commands.split('-o ')[1].split(' --')[0].replace(/"/g, '').replace('/%(id)s.%(ext)s', '');
            const urlSplits = url.split('/');
            const lastSplit = urlSplits.pop();
            const requestPathDir = join(mockRequestsDir, ...urlSplits, `${lastSplit}`);
            if (!existsSync(requestPathDir)) { throw new Error(`Please mock requests in ${requestPathDir}`); }
            mkdirSync(cacheDir, { recursive: true });

            for (const entry of readdirSync(requestPathDir, { withFileTypes: true })) {
                const sourcePath = join(requestPathDir, entry.name);
                const destinationPath = join(cacheDir, entry.name);
                copyFileSync(sourcePath, destinationPath);
            }
            //downloadVideos
        } else if (commands.includes('--no-write-playlist-metafiles')) {
            const outputFilePath = commands.split('-o ')[1].split('.%(ext)s')[0].replace(/"/g, '') + '.mkv';
            writeFileSync(outputFilePath, 'mocked');
        }
    });
});
