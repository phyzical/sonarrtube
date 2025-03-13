import { writeFileSync } from 'fs';

import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { seriesFactory as TvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { seriesFactory as SonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

describe('ActionableVideo', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableVideo', () => {
            expect(actionableVideoFactory()).toBeInstanceOf(ActionableVideo);
        });
    });
    describe('unDownloaded', () => {
        it('should return false if sonarrEpisode is missing', () => {
            const sonarrSeries = SonarrSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { sonarrSeries });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });

        it('should return false if youtube is missing', () => {
            const youtubeContext = channelFactory({ videos: [] });
            const actionableVideo = actionableVideoFactory(0, { youtubeContext });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });

        it('should return false if sonarrEpisode has a file', () => {
            const actionableVideo = actionableVideoFactory(0, { sonarrEpisode: { hasFile: true } });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });

        it('should return true if sonarrEpisode missing a file', () => {
            const actionableVideo = actionableVideoFactory(0, { sonarrEpisode: { hasFile: false } });
            expect(actionableVideo.unDownloaded()).toBe(true);
        });
    });
    describe('missingFromTvdb', () => {
        it('should return false if tvdbEpisode is present', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.missingFromTvdb()).toBe(false);
        });
        it('should return true if tvdbEpisode is missing', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });

            expect(actionableVideo.missingFromTvdb()).toBe(true);
        });
    });
    describe('missingYoutube', () => {
        it('should return false if youtubeVideo is present', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.missingYoutube()).toBe(false);
        });
        it('should return true if youtubeVideo is missing', () => {
            const youtubeContext = channelFactory({ videos: [] });
            const actionableVideo = actionableVideoFactory(0, { youtubeContext });
            expect(actionableVideo.missingYoutube()).toBe(true);
        });
    });
    describe('missingProductionCode', () => {
        it('should return false if tvdbEpisode is missing', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(actionableVideo.missingProductionCode()).toBe(false);
        });
        it('should return false if tvdbEpisode has a production code', () => {
            const actionableVideo = actionableVideoFactory(0, { tvdbEpisode: { productionCode: '123' } });
            expect(actionableVideo.missingProductionCode()).toBe(false);
        });
        it('should return true if tvdbEpisode does not have a production code', () => {
            const actionableVideo = actionableVideoFactory(0, { tvdbEpisode: { productionCode: undefined } });
            expect(actionableVideo.missingProductionCode()).toBe(true);
        });
    });
    describe('tvdbEditUrl', () => {
        it('should return null', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(actionableVideo.tvdbEditUrl()).toBe(undefined);
        });
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.tvdbEditUrl()).toBeString();
            expect(actionableVideo.tvdbEditUrl())
                .toBe(actionableVideo.tvdbEpisode?.editURL());
        });
    });
    describe('tvdbInfoCache', () => {
        it('should return null', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(actionableVideo.tvdbInfoCache()).toBe(undefined);
        });
        it('should return a cache key', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seriesId = 1;
                actionableVideo.tvdbEpisode.id = 2;
            }

            expect(actionableVideo.tvdbInfoCache()).toContain('/tvdb/1/2.json');
        });
    });
    describe('thumbnailCacheFile', () => {
        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.thumbnailCacheFile()).toThrow('Episode not found this shouldn\'t happen!');
        });
        it('should return a cache key', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seriesId = 1;
            }
            expect(actionableVideo.thumbnailCacheFile()).toContain('/tvdb/1/thumbnails.txt');
        });
    });
    describe('thumbnailUploadAttemptCount', () => {
        it('should return 0 when cache doesn\t exist', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(0);
        });
        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.thumbnailUploadAttemptCount())
                .toThrow('Episode not found this shouldn\'t happen!');
        });

        it('should return the correct count', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seriesId = 1;
                actionableVideo.tvdbEpisode.id = 2;
            }
            const cachePath = actionableVideo.thumbnailCacheFile();
            writeFileSync(cachePath, [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 5, 6, 7].join('\n'));
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(3);
        });
    });
    describe('addThumbnailUploadAttempt', () => {
        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.addThumbnailUploadAttempt())
                .toThrow('Episode not found this shouldn\'t happen!');
        });
        it('should increment the count', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.addThumbnailUploadAttempt();
            actionableVideo.addThumbnailUploadAttempt();
            actionableVideo.addThumbnailUploadAttempt();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(3);
        });
    });
    describe('season', () => {
        it('should return a season given tvdbEpisode', () => {
            const actionableVideo = actionableVideoFactory(0, { tvdbEpisode: { seasonNumber: 1 } });
            expect(actionableVideo.season()).toBe(1);
        });

        it('should return a season given youtube', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const youtubeContext = channelFactory();
            youtubeContext.videos[0].upload_date = '20200101';
            const actionableVideo = actionableVideoFactory(0, {
                tvdbSeries, youtubeContext, tvdbEpisode: undefined, youtubeVideo: youtubeContext.videos[0]
            });
            expect(actionableVideo.season()).toBe(2020);
        });
    });
    describe('aired', () => {
        it('should return an aired date tvdbEpisode', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });

            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            if (actionableVideo.youtubeVideo) {
                actionableVideo.youtubeVideo.upload_date = '20200101';
            }
            expect(actionableVideo.aired()).toBe('2020-01-01');
        });

        it('should return an aired date youtube', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.aired = '20200101';
            }
            expect(actionableVideo.aired()).toBe('20200101');
        });
    });
    describe('youtubeURL', () => {
        it('should return a URL when tvdb', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.productionCode = '123';
            }
            expect(actionableVideo.youtubeURL()).toContain('123');
        });

        it('should return a URL when youtube', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.productionCode = '';
            }

            if (actionableVideo.youtubeVideo) {
                actionableVideo.youtubeVideo.id = '256';
            }
            expect(actionableVideo.youtubeURL()).toContain('256');
        });

        it('should return a URL when tvdbcontext', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const youtubeContext = channelFactory();
            if (youtubeContext.videos[0]) {
                youtubeContext.videos[0].id = '958';
            }
            const actionableVideo = actionableVideoFactory(0, {
                tvdbSeries, youtubeContext, tvdbEpisode: undefined, youtubeVideo: youtubeContext.videos[0]
            });
            expect(actionableVideo.youtubeURL()).toContain('958');
        });
    });
    describe('summary', () => {
        it('should return a summary when all urls', () => {
            const actionableVideo = actionableVideoFactory();
            const summary = actionableVideo.summary();
            const expectedSubstrings = [
                'Title:',
                'Aired date:',
                'Season:',
                'Youtube url:',
                'Tvdb url:',
                'Tvdb cache:'
            ];

            expectedSubstrings.forEach(substring => {
                expect(summary).toContain(substring);
            });

            const expectedMissingSubstrings = [
                'Search url:',
            ];

            expectedMissingSubstrings.forEach(substring => {
                expect(summary).not.toContain(substring);
            });
        });

        it('should return a summary without all optional urls', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const youtubeContext = channelFactory({ videos: [] });
            const actionableVideo = actionableVideoFactory(0, {
                tvdbSeries, youtubeContext
            });
            const summary = actionableVideo.summary();
            const expectedSubstrings = [
                'Title:',
                'Aired date:',
                'Season:',
                'Search url:',
            ];

            const expectedMissingSubstrings = [
                'Youtube url:',
                'Tvdb url:',
                'Tvdb cache:'
            ];

            expectedMissingSubstrings.forEach(substring => {
                expect(summary).not.toContain(substring);
            });

            expectedSubstrings.forEach(substring => {
                expect(summary).toContain(substring);
            });
        });
    });

    describe('youtubeSearchURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.name = 'title';
            }
            if (actionableVideo.youtubeVideo) {
                actionableVideo.youtubeVideo.channel = 'series';
            }
            expect(actionableVideo.youtubeSearchURL()).toBe(
                'https://www.youtube.com/results?search_query=series%20title'
            );
        });
    });
    describe('youtubeChannelSearchURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.youtubeContext) {
                actionableVideo.youtubeContext.url = 'https://www.youtube.com/channel';
            }
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.name = 'title';
            }
            expect(actionableVideo.youtubeChannelSearchURL())
                .toBe('https://www.youtube.com/channel?query=title');
        });
    });
    describe('seriesName', () => {
        it('should return a name when youtube', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.youtubeVideo) {
                actionableVideo.youtubeVideo.channel = 'channel';
            }
            expect(actionableVideo.seriesName()).toBe('channel');
        });

        it('should return a name when tvdb', () => {
            const youtubeContext = channelFactory({ videos: [] });
            const actionableVideo = actionableVideoFactory(0, {
                youtubeContext
            });
            if (actionableVideo.tvdbSeries) {
                actionableVideo.tvdbSeries.name = 'channel';
            }
            expect(actionableVideo.seriesName()).toBe('channel');
        });
    });
    describe('name', () => {
        it('should return a name when tvdb', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.name = 'title';
            }
            expect(actionableVideo.name()).toBe('title');
        });

        it('should return a name when youtube', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, {
                tvdbSeries
            });
            if (actionableVideo.youtubeVideo) {
                actionableVideo.youtubeVideo.fulltitle = 'title';
            }
            expect(actionableVideo.name()).toBe('title');
        });

        it('should return a name when context', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const youtubeContext = channelFactory();
            if (youtubeContext.videos[0]) {
                youtubeContext.videos[0].fulltitle = 'title';
            }
            const actionableVideo = actionableVideoFactory(0, {
                tvdbSeries, youtubeContext
            });
            expect(actionableVideo.name()).toBe('title');
        });

        it('should return nothing when nothing', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const youtubeContext = channelFactory({ videos: [] });
            const actionableVideo = actionableVideoFactory(0, {
                tvdbSeries, youtubeContext
            });
            expect(actionableVideo.name()).toBeEmpty();
        });
    });
    describe('tvdbContextFromYoutube', () => {
        it('should return a context', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.youtubeVideo) {
                actionableVideo.youtubeVideo.thumbnail = 'channel';
                actionableVideo.youtubeVideo.id = 'channel';
                actionableVideo.youtubeVideo.fulltitle = 'channel';
                actionableVideo.youtubeVideo.description = 'channel';
                actionableVideo.youtubeVideo.duration = 5;
                actionableVideo.youtubeVideo.thumbnail = 'channel';
                actionableVideo.youtubeVideo.upload_date = '20241217';
            }

            const res = actionableVideo.tvdbContextFromYoutube();

            expect(res?.image).toBe('channel');
            expect(res?.productionCode).toBe('channel');
            expect(res?.name).toBe('channel');
            expect(res?.overview).toBe('channel');
            expect(res?.runtime).toBe(5);
            expect(res?.seasonNumber).toBe(2024);
            expect(res?.aired).toBe('2024-12-17');
        });

        it('should return null when no youtube', () => {
            const youtubeContext = channelFactory({ videos: [] });
            const actionableVideo = actionableVideoFactory(0, {
                youtubeContext
            });
            expect(actionableVideo.tvdbContextFromYoutube()).toBeUndefined();
        });
    });
    describe('clearCache', () => {
        it('should clear the cache', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.clearCache();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(0);
        });

        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.clearCache())
                .toThrow('Episode not found this shouldn\'t happen!');
        });
    });
    describe('generateSonarrEpisode', () => {
        it('should generate an episode', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seasonNumber = 2;
            }
            const res = actionableVideo.generateSonarrEpisode('1');
            expect(res.seasonNumber).toBe(2);
            expect(res.episodeNumber).toBe(1);
            expect(res.hasFile).toBe(false);
            expect(res.series).toBe(actionableVideo.sonarrSeries);

        });

        it('should throw when season is missing', () => {
            const actionableVideo = actionableVideoFactory();
            jest.spyOn(actionableVideo, 'season').mockImplementation(() => undefined);
            expect(() => actionableVideo.generateSonarrEpisode('1'))
                .toThrow('season not found this shouldn\'t happen!');
        });
    });

    describe('outputFilename', () => {
        it('should generate an episode', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.sonarrEpisode) {
                actionableVideo.sonarrEpisode.seasonNumber = 2;
                actionableVideo.sonarrEpisode.episodeNumber = 1;
                actionableVideo.sonarrSeries.title = 'blah';
            }
            expect(actionableVideo.outputFilename()).toBe('blah.s02e01');
        });

        it('should throw when episode missing is missing', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.sonarrEpisode = undefined;
            expect(() => actionableVideo.outputFilename())
                .toThrow('Episode not found this shouldn\'t happen!');
        });
    });

    describe('outputSeasonDirectory', () => {
        it('should generate an episode', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.sonarrEpisode) {
                actionableVideo.sonarrEpisode.seasonNumber = 2;
                actionableVideo.sonarrSeries.path = 'blah';
            }
            expect(actionableVideo.outputSeasonDirectory()).toBe('blah/Season 02');
        });

        it('should throw when episode missing is missing', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.sonarrEpisode = undefined;
            expect(() => actionableVideo.outputSeasonDirectory())
                .toThrow('Episode not found this shouldn\'t happen!');
        });
    });

    describe('cleanNumber', () => {
        it('if > 10', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.cleanNumber(2)).toBe('02');
        });

        it('if < 10', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.cleanNumber(11)).toBe('11');
        });
    });
});