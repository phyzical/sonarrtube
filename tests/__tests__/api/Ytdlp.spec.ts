import { existsSync } from 'fs';
import { join } from 'path';

import { downloadVideos } from '@sonarrTube/api/Ytdlp';
import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { config } from '@sonarrTube/helpers/Config';
import { mockConfig } from '@sonarrTube/mocks/Config';
import { execSyncSpy } from '@sonarrTube/mocks/execSync';

describe('Ytdlp', () => {
    describe('downloadVideos', () => {
        it('should return a list of video urls', () => {
            const video = actionableVideoFactory();
            video.sonarrSeries.path = join(config().cacheDir, video.sonarrSeries.title);
            const expectedPath = join(
                video.outputSeasonDirectory(),
                `${video.outputFilename()}.mkv`
            );
            downloadVideos([video]);
            expect(execSyncSpy).toHaveBeenCalled();
            expect(existsSync(expectedPath)).toBeTrue();
        });

        it('when verbose disabled and sponsorBlockEnabled disabled should call execSync with expected input', () => {
            mockConfig({
                verbose: false, youtube: {
                    sponsorBlockEnabled: false, cookieFile: '', downloadDelayMonths: 1
                }
            });
            const video = actionableVideoFactory();
            video.sonarrSeries.path = join(config().cacheDir, video.sonarrSeries.title);
            const expectedPath = join(
                video.outputSeasonDirectory(),
                `${video.outputFilename()}.mkv`
            );
            downloadVideos([video]);
            expect(execSyncSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('--sponsorblock-remove "default"'),
                { stdio: 'inherit' }
            );

            expect(existsSync(expectedPath)).toBeTrue();
        });

        it('should throw when missing sonarr', () => {
            const video = actionableVideoFactory();
            video.sonarrEpisode = undefined;
            expect(() => downloadVideos([video]))
                .toThrow('sonarrEpisode episode not found This shouldn\'t happen!');
            expect(execSyncSpy).not.toHaveBeenCalled();
        });

        it('should throw when missing youtube', () => {
            const video = actionableVideoFactory();
            video.youtubeVideo = undefined;
            expect(() => downloadVideos([video]))
                .toThrow('youtubeVideo episode not found This shouldn\'t happen!');
            expect(execSyncSpy).not.toHaveBeenCalled();

        });

        it('shouldn\'t download if already downloaded', () => {
            const video = actionableVideoFactory();
            video.sonarrSeries.path = join(config().cacheDir, video.sonarrSeries.title);
            downloadVideos([video]);
            execSyncSpy.mockReset();
            downloadVideos([video]);
            expect(execSyncSpy).not.toHaveBeenCalled();
        });


        describe('when preview mode ', () => {
            beforeEach(() => {
                mockConfig({ preview: true });
            });

            it('shouldn\'t download', () => {
                const result = downloadVideos([actionableVideoFactory()]);
                expect(result.filter((r) => r.includes('Preview mode on'))).toBeArrayOfSize(1);
                expect(execSyncSpy).not.toHaveBeenCalled();
            });
        });
    });
});