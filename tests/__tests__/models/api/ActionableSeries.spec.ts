import { actionableSeriesFactory } from '@sonarrTube/factories/models/api/ActionableSeries';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

describe('ActionableSeries', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableSeries', () => {
            expect(actionableSeriesFactory()).toBeInstanceOf(ActionableSeries);
        });
    });
    describe('unDownloadedVideos', () => {
        it('should return unDownloadedVideos without 3 if one has file, no sonarr and no tvdb', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos = actionableSeries.videos.map((video: ActionableVideo) => {
                if (video?.sonarrEpisode?.hasFile) {
                    video.sonarrEpisode.hasFile = false;
                }

                return video;
            });
            actionableSeries.videos[0].sonarrEpisode = undefined;
            actionableSeries.videos[1].tvdbEpisode = undefined;
            if (actionableSeries.videos[2].sonarrEpisode) {
                actionableSeries.videos[2].sonarrEpisode.hasFile = true;
            }
            console.dir(actionableSeries.videos);
            const result = actionableSeries.unDownloadedVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();
            expect(result).toBeArrayOfSize(expectedVideos.length - 3);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });
    });
    describe('missingFromTvdbVideos', () => {
        it('should return missingFromTvdbVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].tvdbEpisode = undefined;
            const result = actionableSeries.missingFromTvdbVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();

            expect(result).toBeArrayOfSize(expectedVideos.length - 1);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });
        // add test for validate caching
    });
    describe('missingProductionCodeTvdbVideos', () => {
        it('should return without video missing tvdbEpisode', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].tvdbEpisode = undefined;
            const result = actionableSeries.missingProductionCodeTvdbVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();

            expect(result).toBeArrayOfSize(expectedVideos.length - 1);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });

        it('should return without video missing production code', () => {
            const actionableSeries = actionableSeriesFactory();
            const video = actionableSeries.videos[0];
            if (video && video.tvdbEpisode) {
                video.tvdbEpisode.productionCode = '';
            }
            const result = actionableSeries.missingProductionCodeTvdbVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();

            expect(result).toBeArrayOfSize(expectedVideos.length - 1);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });

    });
    describe('unmatchedYoutubeVideos', () => {
        it('should return unmatchedYoutubeVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].youtubeVideo = undefined;
            const result = actionableSeries.unmatchedYoutubeVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();

            expect(result).toBeArrayOfSize(expectedVideos.length - 1);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });
    });
    describe('backfillableProductionCodeVideos', () => {
        it('should return backfillableProductionCodeVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            const video = actionableSeries.videos[0];
            if (video && video.tvdbEpisode) {
                video.tvdbEpisode.productionCode = '';
            }
            const result = actionableSeries.backfillableProductionCodeVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();

            expect(result).toBeArrayOfSize(expectedVideos.length - 1);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });
    });
    describe('backfillableImageVideos', () => {
        it('should return backfillableImageVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            const video = actionableSeries.videos[0];
            if (video && video.tvdbEpisode) {
                video.tvdbEpisode.image = '';
            }
            const result = actionableSeries.backfillableImageVideos();
            const expectedVideos = actionableSeries.videos;
            expectedVideos.shift();

            expect(result).toBeArrayOfSize(expectedVideos.length - 1);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });
    });
    describe('futureTotal', () => {
        it('should return futureTotal', () => {
            const actionableSeries = actionableSeriesFactory();
            const result = actionableSeries.futureTotal();
            expect(result).toBe(actionableSeries.videos.length);
        });
    });
    describe('hasMissing', () => {
        it('should return hasMissing', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].tvdbEpisode = undefined;
            const result = actionableSeries.hasMissing();
            expect(result).toBe(true);
        });
    });

});