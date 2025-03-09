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
            const expectedPath = join(
                config().outputDir,
                video.outputSeasonDirectory(),
                `${video.outputFilename()}.mkv`
            );
            console.log(expectedPath);
            downloadVideos([video]);
            expect(existsSync(expectedPath)).toBeTrue();
        });

        it('should throw when missing sonarr', async () => {
            const video = actionableVideoFactory();
            video.sonarrEpisode = undefined;
            await expect(async () => downloadVideos([video])).rejects
                .toThrow('sonarrEpisode episode not found This shouldn\'t happen!');
        });

        it('should throw when missing youtube', async () => {
            const video = actionableVideoFactory();
            video.youtubeVideo = undefined;
            await expect(async () => downloadVideos([video])).rejects
                .toThrow('youtubeVideo episode not found This shouldn\'t happen!');
        });

        it('shouldn\'t download if already downloaded', async () => {
            const video = actionableVideoFactory();
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