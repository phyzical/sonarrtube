import { actionableSeriesFactory } from '@sonarrTube/factories/models/api/ActionableSeries';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries';

describe('ActionableSeries', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableSeries', () => {
            expect(actionableSeriesFactory()).toBeInstanceOf(ActionableSeries);
        });
    });
    describe('unDownloadedVideos', () => {
        it('should return unDownloadedVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.unDownloadedVideos()).toEqual(actionableSeries.videos.filter((video) => !video.downloaded));
        });
    });
    describe('missingFromTvdbVideos', () => {
        it('should return missingFromTvdbVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.missingFromTvdbVideos()).toEqual(actionableSeries.videos.filter((video) => video.missingFromTvdb));
        });
    });
    describe('missingProductionCodeTvdbVideos', () => {
        it('should return missingProductionCodeTvdbVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.missingProductionCodeTvdbVideos()).toEqual(actionableSeries.videos.filter((video) => video.missingProductionCodeTvdb));
        });
    });
    describe('unmatchedYoutubeVideos', () => {
        it('should return unmatchedYoutubeVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.unmatchedYoutubeVideos()).toEqual(actionableSeries.videos.filter((video) => video.unmatchedYoutube));
        });
    });
    describe('backfillableProductionCodeVideos', () => {
        it('should return backfillableProductionCodeVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.backfillableProductionCodeVideos()).toEqual(actionableSeries.videos.filter((video) => video.backfillableProductionCode));
        });
    });
    describe('backfillableImageVideos', () => {
        it('should return backfillableImageVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.backfillableImageVideos()).toEqual(actionableSeries.videos.filter((video) => video.backfillableImage));
        });
    });
    describe('futureTotal', () => {
        it('should return futureTotal', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.futureTotal()).toEqual(actionableSeries.videos.filter((video) => video.future).length);
        });
    });
    describe('hasMissing', () => {
        it('should return hasMissing', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.hasMissing()).toEqual(actionableSeries.videos.some((video) => video.missing));
        });
    });

});