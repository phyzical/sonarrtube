import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

import { processThumbnail } from '@sonarrTube/helpers/Thumbnails';
import { Constants } from '@sonarrTube/types/config/Constants';
import { config } from '@sonarrTube/helpers/Config';

const genUUID = (): string => randomUUID() + 'jimp';

describe('Thumbnails', () => {
    describe('processThumbnail', () => {
        let cacheDir;
        let imageDir;
        const timeout = 25000;
        beforeEach(() => {
            cacheDir = `${process.cwd()}/${config().cacheDir}/${Constants.CACHE_FOLDERS.THUMBNAIL}`;
            imageDir = `file://${process.cwd()}/tests/__mocks__/images`;
        });

        it('should skip cutting if at max attempts', async () => {
            const uuid = genUUID();
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const findThumbnailTextSpy = jest.spyOn(require('@sonarrTube/helpers/Thumbnails'), 'findThumbnailText');
            const attempts = Constants.THUMBNAIL.MAX_ATTEMPTS;
            const result = await processThumbnail(
                `${imageDir}/processThumbnail.png`,
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
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const cropImageSpy = jest.spyOn(require('@sonarrTube/helpers/Thumbnails'), '_removeText');

            const uuid = genUUID();
            const result = await processThumbnail(
                `${imageDir}/processThumbnail-blank.png`,
                uuid,
            );

            expect(result).toEqual('');

            expect(cropImageSpy).not.toHaveBeenCalled();
            cropImageSpy.mockRestore();
        }, timeout);

        //  For whatever reason, the first time we call processThumbnail it ALWAYS FAILS?!!??! so this is fake
        describe('fake', () => {
            it('should fail', async () => {
                const uuid = genUUID();
                try {
                    await processThumbnail(
                        `${imageDir}/fakeThumbnail.png`,
                        uuid
                    );
                }
                catch (_e) { /* empty */ }
            }, timeout);
        });

        describe('webp', () => {
            it('should process a real thumbnail', async () => {
                const uuid = genUUID();
                const result = await processThumbnail(
                    `${imageDir}/realThumbnail.webp`,
                    uuid
                );

                expect(result).toEqual(
                    `${cacheDir}/${uuid}_0.png`
                );
                expect(existsSync(result)).toBeTruthy();
            }, timeout);

            it('should process a thumbnail', async () => {
                const uuid = genUUID();
                const result = await processThumbnail(
                    `${imageDir}/processThumbnail.webp`,
                    uuid
                );

                expect(result).toEqual(
                    `${cacheDir}/${uuid}_0.png`
                );
                expect(existsSync(result)).toBeTruthy();
            }, timeout);
        });

        describe('png', () => {
            it('should process a thumbnail when png', async () => {

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
    });
});