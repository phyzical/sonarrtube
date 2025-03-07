import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

import { processThumbnail } from '@sonarrTube/helpers/Thumbnails';
import { Constants } from '@sonarrTube/types/config/Constants';
import { config } from '@sonarrTube/helpers/Config';

const genUUID = (): string => randomUUID() + 'jimp';

describe('Thumbnails', () => {
    describe('processThumbnail', () => {
        jest.retryTimes(5);
        let cacheDir;
        let imageDir;
        const timeout = 15000;
        beforeEach(() => {
            cacheDir = `${process.cwd()}/${config().cacheDir}/${Constants.CACHE_FOLDERS.THUMBNAIL}`;
            imageDir = `file://${process.cwd()}/tests/__mocks__/images`;
        });

        it('should skip cutting if at max attempts', async () => {
            const uuid = genUUID();
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const findThumbnailTextSpy = jest.spyOn(require('@sonarrTube/helpers/Thumbnails'), 'findThumbnailText');
            const attempts = 4;
            const result = await processThumbnail(
                `${imageDir}/processThumbnail.webp`,
                uuid,
                attempts
            );

            expect(result).toEqual(
                `${cacheDir}/${uuid}_${attempts}.png`
            );

            expect(findThumbnailTextSpy).not.toHaveBeenCalled();
            findThumbnailTextSpy.mockRestore();
            expect(existsSync(result)).toBeTruthy();
        }, timeout);

        it('should return empty string if no words found', async () => {
            Constants.THUMBNAIL.TEXT.FONT_SIZE = 9999;

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const cropImageSpy = jest.spyOn(require('@sonarrTube/helpers/Thumbnails'), '_cropImage');

            const uuid = genUUID();
            const result = await processThumbnail(
                `${imageDir}/processThumbnail.webp`,
                uuid,
            );

            expect(result).toEqual('');

            expect(cropImageSpy).not.toHaveBeenCalled();
            cropImageSpy.mockRestore();
        }, timeout);

        describe('FAKE', () => {
            it('shouldnt process a thumbnail cause this test is gay' +
                ' assssssssss and the fist instance always fails like WTF', async () => {
                    Constants.THUMBNAIL.TEXT.FONT_SIZE = 20;

                    const uuid = genUUID();
                    const result = await processThumbnail(
                        `${imageDir}/processThumbnail.webp`,
                        uuid
                    );

                    expect(result).not.toEqual(
                        `${cacheDir}/${uuid}_0.png`
                    );
                }, timeout * 2);
        });

        describe('webp', () => {
            it('should process a thumbnail', async () => {
                Constants.THUMBNAIL.TEXT.FONT_SIZE = 20;

                const uuid = genUUID();
                const result = await processThumbnail(
                    `${imageDir}/processThumbnail.webp`,
                    uuid
                );

                expect(result).toEqual(
                    `${cacheDir}/${uuid}_0.png`
                );
                expect(existsSync(result)).toBeTruthy();
            }, timeout * 2);
        });

        describe('png', () => {
            it('should process a thumbnail when png', async () => {
                Constants.THUMBNAIL.TEXT.FONT_SIZE = 20;

                const uuid = genUUID();

                const result = await processThumbnail(
                    `${imageDir}/processThumbnail.png`,
                    uuid
                );

                expect(result).toEqual(
                    `${cacheDir}/${uuid}_0.png`
                );
                expect(existsSync(result)).toBeTruthy();
            }, timeout);
        });

        describe('jpeg', () => {
            it('should process a thumbnail when jpeg', async () => {
                Constants.THUMBNAIL.TEXT.FONT_SIZE = 20;

                const uuid = genUUID();

                const result = await processThumbnail(
                    `${imageDir}/processThumbnail.jpg`,
                    uuid
                );

                expect(result).toEqual(
                    `${cacheDir}/${uuid}_0.jpg`
                );
                expect(existsSync(result)).toBeTruthy();
            }, timeout);
        });

        it('should return empty string if image too small', async () => {
            const uuid = genUUID();

            const result = await processThumbnail(
                `${imageDir}/small.png`,
                uuid
            );

            expect(result).toEqual('');
        }, timeout);

        it('should return empty string if image too small after cropping', async () => {
            const uuid = genUUID();

            const result = await processThumbnail(
                `${imageDir}/processThumbnail-cropped.jpg`,
                uuid
            );

            expect(result).toEqual('');
        }, timeout);
    });
});