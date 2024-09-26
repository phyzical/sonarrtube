import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

describe('ActionableVideo', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableVideo', () => {
            expect(actionableVideoFactory()).toBeInstanceOf(ActionableVideo);
        });
    });
    describe('unDownloaded', () => {
        it('should return false if sonarrEpisode or youtubeVideo is missing', () => {
            const actionableVideo = actionableVideoFactory({ sonarrEpisode: undefined });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });
        it('should return false if sonarrEpisode has a file', () => {
            const actionableVideo = actionableVideoFactory({ sonarrEpisode: { hasFile: true }, youtubeVideo: {} });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });
        it('should return true if sonarrEpisode does not have a file', () => {
            const actionableVideo = actionableVideoFactory({ sonarrEpisode: { hasFile: false }, youtubeVideo: {} });
            expect(actionableVideo.unDownloaded()).toBe(true);
        });
    });
    describe('missingFromTvdb', () => {
        it('should return false if tvdbEpisode is present', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: {} });
            expect(actionableVideo.missingFromTvdb()).toBe(false);
        });
        it('should return true if tvdbEpisode is missing', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: undefined });
            expect(actionableVideo.missingFromTvdb()).toBe(true);
        });
    });
    describe('missingYoutube', () => {
        it('should return false if youtubeVideo is present', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: {} });
            expect(actionableVideo.missingYoutube()).toBe(false);
        });
        it('should return true if youtubeVideo is missing', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: undefined });
            expect(actionableVideo.missingYoutube()).toBe(true);
        });
    });
    describe('missingProductionCode', () => {
        it('should return false if tvdbEpisode is missing', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: undefined });
            expect(actionableVideo.missingProductionCode()).toBe(false);
        });
        it('should return false if tvdbEpisode has a production code', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: { productionCode: '123' } });
            expect(actionableVideo.missingProductionCode()).toBe(false);
        });
        it('should return true if tvdbEpisode does not have a production code', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: { productionCode: undefined } });
            expect(actionableVideo.missingProductionCode()).toBe(true);
        });
    });
    describe('tvdbEditUrl', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.tvdbEditUrl()).toBe('https://www.thetvdb.com/series/undefined/episodes/undefined/edit');
        });
    });
    describe('tvdbInfoCache', () => {
        it('should return a cache key', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: { seriesId: 1, id: 2 } });
            expect(actionableVideo.tvdbInfoCache()).toBe('/tvdb/1/2.json');
        });
    });
    describe('thumbnailCacheFile', () => {
        it('should return a cache key', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { id: '123' } });
            expect(actionableVideo.thumbnailCacheFile()).toBe('/thumbnails/123.jpg');
        });
    });
    describe('thumbnailUploadAttemptCount', () => {
        it('should return a number', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(0);
        });
    });
    describe('addThumbnailUploadAttempt', () => {
        it('should increment the count', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.addThumbnailUploadAttempt();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(1);
        });
    });
    describe('season', () => {
        it('should return a season', () => {
            const actionableVideo = actionableVideoFactory({ sonarrEpisode: { seasonNumber: 1 } });
            expect(actionableVideo.season()).toBe(1);
        });
    });
    describe('aired', () => {
        it('should return an aired date', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { upload_date: '20200101' } });
            expect(actionableVideo.aired()).toBe('2020-01-01');
        });
    });
    describe('youtubeURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory({ tvdbEpisode: { productionCode: '123' } });
            expect(actionableVideo.youtubeURL()).toBe('');
        });
    });
    describe('summary', () => {
        it('should return a summary', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { description: 'description' } });
            expect(actionableVideo.summary()).toBe('description');
        });
    });
    describe('youtubeSearchURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { title: 'title' } });
            expect(actionableVideo.youtubeSearchURL()).toBe('https://www.youtube.com/results?search_query=title');
        });
    });
    describe('youtubeChannelSearchURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { channel: 'channel' } });
            expect(actionableVideo.youtubeChannelSearchURL()).toBe('https://www.youtube.com/results?search_query=channel');
        });
    });
    describe('seriesName', () => {
        it('should return a name', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { channel: 'channel' } });
            expect(actionableVideo.seriesName()).toBe('channel');
        });
    });
    describe('name', () => {
        it('should return a name', () => {
            const actionableVideo = actionableVideoFactory({ youtubeVideo: { title: 'title' } });
            expect(actionableVideo.name()).toBe('title');
        });
    });
    describe('tvdbContextFromYoutube', () => {
        it('should return a context', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.tvdbContextFromYoutube()).toBe(actionableVideo);
        });
    });
    describe('clearCache', () => {
        it('should clear the cache', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.clearCache();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(0);
        });
    });
    describe('generateSonarrEpisode', () => {
        it('should generate an episode', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.generateSonarrEpisode('1')).toBe(actionableVideo.sonarrEpisode);
        });
    });
});