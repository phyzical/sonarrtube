import { seriesFactory as sonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { seriesFactory as tvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';
import { actionableSeriesFactory } from '@sonarrTube/factories/models/api/ActionableSeries';
import { ActionableSeries } from '@sonarrTube/models/api/ActionableSeries';

describe('ActionableSeries', () => {
    describe('constructor', () => {
        it('Should log warning about multiple matches', async () => {
            const sonarrSeries = sonarrSeriesFactory();
            sonarrSeries.episodes = Array.from({ length: 3 }, () => sonarrSeries.episodes[0]);
            const youtubeContext = channelFactory();
            const tvdbSeries = tvdbSeriesFactory();
            tvdbSeries.episodes = Array.from({ length: 3 }, () => tvdbSeries.episodes[0]);
            tvdbSeries.episodes = tvdbSeries.episodes.map((episode) => {
                episode.productionCode = youtubeContext.videos[0].id;

                return episode;
            });

            const series = new ActionableSeries(
                {
                    sonarrSeries,
                    tvdbSeries,
                    youtubeContext
                }
            );
            expect(series.warnings).toEqual(
                expect.arrayContaining([
                    expect.stringContaining('Warning found multiple matches this shouldn\'t happen!')
                ])
            );
        });

        it('should throw if video counts dont match', async () => {
            await expect(async () => {
                const sonarrSeries = sonarrSeriesFactory();
                sonarrSeries.episodes = Array.from({ length: 7 }, () => sonarrSeries.episodes[0]);
                const tvdbSeries = tvdbSeriesFactory();
                tvdbSeries.episodes = Array.from({ length: 10 }, () => tvdbSeries.episodes[0]);

                return new ActionableSeries(
                    {
                        sonarrSeries,
                        tvdbSeries,
                        youtubeContext: channelFactory()
                    }
                );
            }).rejects.toThrow('Mismatch between tvdb and sonarr episodes! 7 vs 10');
        });
    });
    describe('unDownloadedVideos', () => {
        it('should return unDownloadedVideos without 3 if one has file, no sonarr and no tvdb', () => {
            const actionableSeries = actionableSeriesFactory();
            for (let i = 0; i < actionableSeries.videos.length; i++) {
                const video = actionableSeries.videos[i];
                if (video.sonarrEpisode) {
                    video.sonarrEpisode.hasFile = false;
                }
            }

            actionableSeries.videos[0].sonarrEpisode = undefined;
            actionableSeries.videos[1].youtubeVideo = undefined;
            if (actionableSeries.videos[2].sonarrEpisode) {
                actionableSeries.videos[2].sonarrEpisode.hasFile = true;
            }

            const result = actionableSeries.unDownloadedVideos();
            const expectedVideos = actionableSeries.videos.slice(3, actionableSeries.videos.length);
            expect(result).toBeArrayOfSize(expectedVideos.length);
            expect(result).toEqual(expect.arrayContaining(expectedVideos));
        });
    });
    describe('missingFromTvdbVideos', () => {
        it('should return missingFromTvdbVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].tvdbEpisode = undefined;
            const result = actionableSeries.missingFromTvdbVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([actionableSeries.videos[0]]);
        });

        it('should return whats in the cache', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].tvdbEpisode = undefined;
            const expectedVideo = actionableSeries.videos[3];
            expectedVideo.tvdbEpisode = undefined;
            actionableSeries._missingFromTvdbVideos = [expectedVideo];
            const result = actionableSeries.missingFromTvdbVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([expectedVideo]);
        });
    });
    describe('missingProductionCodeTvdbVideos', () => {
        it('should return video missing tvdbEpisode production code', () => {
            const actionableSeries = actionableSeriesFactory();
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode.productionCode = '';
            }
            const result = actionableSeries.missingProductionCodeTvdbVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([actionableSeries.videos[0]]);
        });

        it('should return only 1 from cache', () => {
            const actionableSeries = actionableSeriesFactory();
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode.productionCode = '';
            }
            if (actionableSeries.videos[3].tvdbEpisode) {
                actionableSeries.videos[3].tvdbEpisode.productionCode = '';
            }
            const expectedVideo = actionableSeries.videos[3];
            actionableSeries._missingProductionCodeTvdbVideos = [expectedVideo];
            const result = actionableSeries.missingProductionCodeTvdbVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([expectedVideo]);
        });

    });
    describe('unmatchedYoutubeVideos', () => {
        it('should return unmatchedYoutubeVideos', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].youtubeVideo = undefined;
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode.productionCode = '12345';
            }
            const result = actionableSeries.unmatchedYoutubeVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([actionableSeries.videos[0]]);
        });

        it('should return 1 unmatchedYoutubeVideos from cache', () => {
            const actionableSeries = actionableSeriesFactory();
            actionableSeries.videos[0].youtubeVideo = undefined;
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode.productionCode = '12345';
            }

            actionableSeries.videos[3].youtubeVideo = undefined;
            if (actionableSeries.videos[3].tvdbEpisode) {
                actionableSeries.videos[3].tvdbEpisode.productionCode = '12345';
            }

            const expectedVideo = actionableSeries.videos[3];
            actionableSeries._unmatchedYoutubeVideos = [expectedVideo];

            const result = actionableSeries.unmatchedYoutubeVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([expectedVideo]);
        });
    });
    describe('backfillableProductionCodeVideos', () => {
        it('should return 1 backfillableProductionCodeVideos from cache', () => {
            const actionableSeries = actionableSeriesFactory();

            const expectedVideo = actionableSeries.videos[3];
            actionableSeries._backfillableProductionCodeVideos = [expectedVideo];

            const result = actionableSeries.backfillableProductionCodeVideos();
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([expectedVideo]);
        });

        it('should return empty array when downlaod only', () => {
            const actionableSeries = actionableSeriesFactory();
            expect(actionableSeries.backfillableProductionCodeVideos(true)).toEqual([]);
        });

        describe('dealing with missingProductionCodeTvdbVideos', () => {
            it('should return backfillableProductionCodeVideos when matching by fulltitle', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode.productionCode = '';
                    actionableSeries.youtubeContext.videos[0].fulltitle = actionableSeries.videos[0].tvdbEpisode.name;
                    actionableSeries.videos[0].youtubeVideo = undefined;
                }

                expect(actionableSeries.videos[0].youtubeVideo).not.toEqual(actionableSeries.youtubeContext.videos[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);

                expect(result).toBeArrayOfSize(1);
                expect(result).toEqual([actionableSeries.videos[0]]);
                expect(actionableSeries.videos[0].youtubeVideo).toEqual(actionableSeries.youtubeContext.videos[0]);
            });

            it('should return backfillableProductionCodeVideos when matching by title', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode.productionCode = '';
                    actionableSeries.youtubeContext.videos[0].title = actionableSeries.videos[0].tvdbEpisode.name;
                    actionableSeries.videos[0].youtubeVideo = undefined;
                }

                expect(actionableSeries.videos[0].youtubeVideo).not.toEqual(actionableSeries.youtubeContext.videos[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);

                expect(result).toBeArrayOfSize(1);
                expect(result).toEqual([actionableSeries.videos[0]]);
                expect(actionableSeries.videos[0].youtubeVideo).toEqual(actionableSeries.youtubeContext.videos[0]);
            });

            it('should return backfillableProductionCodeVideos when matching by aired', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode.productionCode = '';
                    actionableSeries.youtubeContext.videos[0].upload_date = '20200102';
                    actionableSeries.videos[0].tvdbEpisode.aired = '2020-01-02';
                    actionableSeries.videos[0].youtubeVideo = undefined;
                }

                expect(actionableSeries.videos[0].youtubeVideo).not.toEqual(actionableSeries.youtubeContext.videos[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);

                expect(result).toBeArrayOfSize(1);
                expect(result).toEqual([actionableSeries.videos[0]]);
                expect(actionableSeries.videos[0].youtubeVideo).toEqual(actionableSeries.youtubeContext.videos[0]);
            });

            it('should return nothing backfillableProductionCodeVideos when no matches', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode.productionCode = '';
                    actionableSeries.videos[0].youtubeVideo = undefined;
                }

                expect(actionableSeries.videos[0].youtubeVideo).not.toEqual(actionableSeries.youtubeContext.videos[0]);
                const result = actionableSeries.backfillableProductionCodeVideos(false);
                expect(result).toBeArrayOfSize(0);
                expect(result).toEqual([]);
                expect(actionableSeries.videos[0].youtubeVideo).not.toEqual(actionableSeries.youtubeContext.videos[0]);
            });
        });

        describe('dealing with missingFromTvdbVideos', () => {
            it('should return backfillableProductionCodeVideos when matching by fulltitle', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode = undefined;

                    if (actionableSeries.videos[0].youtubeVideo) {
                        actionableSeries.videos[0].
                            youtubeVideo.fulltitle = actionableSeries.tvdbSeries.episodes[0].name;
                    }
                }

                expect(actionableSeries.videos[0].tvdbEpisode).not.toEqual(actionableSeries.tvdbSeries.episodes[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);

                expect(result).toBeArrayOfSize(1);
                expect(result).toEqual([actionableSeries.videos[0]]);
                expect(actionableSeries.videos[0].tvdbEpisode).toEqual(actionableSeries.tvdbSeries.episodes[0]);
            });

            it('should return backfillableProductionCodeVideos when matching by title', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode = undefined;

                    if (actionableSeries.videos[0].youtubeVideo) {
                        actionableSeries.videos[0].
                            youtubeVideo.title = actionableSeries.tvdbSeries.episodes[0].name;
                    }
                }

                expect(actionableSeries.videos[0].tvdbEpisode).not.toEqual(actionableSeries.tvdbSeries.episodes[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);

                expect(result).toBeArrayOfSize(1);
                expect(result).toEqual([actionableSeries.videos[0]]);
                expect(actionableSeries.videos[0].tvdbEpisode).toEqual(actionableSeries.tvdbSeries.episodes[0]);
            });

            it('should return backfillableProductionCodeVideos when matching by aired', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode = undefined;

                    if (actionableSeries.videos[0].youtubeVideo) {
                        actionableSeries.tvdbSeries.episodes[0].aired = '2020-01-02';
                        actionableSeries.videos[0].
                            youtubeVideo.upload_date = '20200102';
                    }
                }

                expect(actionableSeries.videos[0].tvdbEpisode).not.toEqual(actionableSeries.tvdbSeries.episodes[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);

                expect(result).toBeArrayOfSize(1);
                expect(result).toEqual([actionableSeries.videos[0]]);
                expect(actionableSeries.videos[0].tvdbEpisode).toEqual(actionableSeries.tvdbSeries.episodes[0]);
            });

            it('should return nothing backfillableProductionCodeVideos when no matches', () => {
                const actionableSeries = actionableSeriesFactory();
                // when matching by
                if (actionableSeries.videos[0].tvdbEpisode) {
                    actionableSeries.videos[0].tvdbEpisode.productionCode = '';
                    actionableSeries.videos[0].tvdbEpisode = undefined;
                }

                expect(actionableSeries.videos[0].tvdbEpisode).not.toEqual(actionableSeries.tvdbSeries.episodes[0]);

                const result = actionableSeries.backfillableProductionCodeVideos(false);
                expect(result).toBeArrayOfSize(0);
                expect(result).toEqual([]);
                expect(actionableSeries.videos[0].tvdbEpisode).not.toEqual(actionableSeries.tvdbSeries.episodes[0]);
            });
        });

        it('should throw when no youtube vid found given backfillable match', () => {
            const actionableSeries = actionableSeriesFactory();
            // when matching by
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode = undefined;

                if (actionableSeries.videos[0].youtubeVideo) {
                    actionableSeries.tvdbSeries.episodes[0].aired = '2020-01-02';
                    actionableSeries.videos[0].
                        youtubeVideo.upload_date = '20200102';
                    actionableSeries.videos[0].youtubeVideo.id = '';
                }
            }

            expect(() => actionableSeries.backfillableProductionCodeVideos(false))
                .toThrow('Youtube video not found, this shouldn\'t happen!');
        });

        it('should dedupe when multiple matches for same youtube video', () => {
            const actionableSeries = actionableSeriesFactory();
            // when matching by
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode = undefined;

                if (actionableSeries.videos[0].youtubeVideo) {
                    actionableSeries.tvdbSeries.episodes[0].aired = '2020-01-02';
                    actionableSeries.videos[0].
                        youtubeVideo.upload_date = '20200102';
                    actionableSeries.videos[0].youtubeVideo.id = '123';
                }
            }

            if (actionableSeries.videos[1].tvdbEpisode) {
                actionableSeries.videos[1].tvdbEpisode = undefined;

                if (actionableSeries.videos[1].youtubeVideo) {
                    actionableSeries.tvdbSeries.episodes[1].aired = '2020-01-03';
                    actionableSeries.videos[1].
                        youtubeVideo.upload_date = '20200103';
                    actionableSeries.videos[1].youtubeVideo.id = '123';
                }
            }

            const result = actionableSeries.backfillableProductionCodeVideos(false);
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([actionableSeries.videos[0]]);
        });
    });
    describe('backfillableImageVideos', () => {
        it('should return empty if download only', () => {
            const actionableSeries = actionableSeriesFactory();
            const result = actionableSeries.backfillableImageVideos(true);
            expect(result).toBeArrayOfSize(0);
            expect(result).toEqual([]);
        });

        it('should return videos missing images', () => {
            const actionableSeries = actionableSeriesFactory();
            const video = actionableSeries.videos[0];
            if (video && video.tvdbEpisode) {
                video.tvdbEpisode.image = '';
            }
            const result = actionableSeries.backfillableImageVideos(false);
            expect(result).toBeArrayOfSize(1);
            expect(result).toEqual([video]);
        });

        it('should return empty when all contain images, missing tvdb or youtube', () => {
            const actionableSeries = actionableSeriesFactory();
            if (actionableSeries.videos[0]) {
                actionableSeries.videos[0].tvdbEpisode = undefined;
            }

            if (actionableSeries.videos[1]) {
                actionableSeries.videos[1].youtubeVideo = undefined;
            }
            const result = actionableSeries.backfillableImageVideos(false);
            expect(result).toBeArrayOfSize(0);
            expect(result).toEqual([]);
        });
    });
    describe('futureTotal', () => {


        it('should return futureTotal', () => {
            const actionableSeries = actionableSeriesFactory();

            actionableSeries.videos[0].youtubeVideo = undefined;
            if (actionableSeries.videos[0].tvdbEpisode) {
                actionableSeries.videos[0].tvdbEpisode.productionCode = '12345';
            }
            const unmatchedYoutubeVideos = 1;

            actionableSeries.videos[1].tvdbEpisode = undefined;
            actionableSeries.videos[2].tvdbEpisode = undefined;
            const missingTvdbCount = 2;

            const result = actionableSeries.futureTotal();
            expect(result).toBe(
                actionableSeries.tvdbSeries.episodes.length + missingTvdbCount - unmatchedYoutubeVideos
            );
        });
    });

    describe('hasMissing', () => {
        it('should return hasMissing, clear cache when missing tvdb code', async () => {
            const actionableSeries = actionableSeriesFactory();
            const video = actionableSeries.videos[0];
            if (video.tvdbEpisode) {
                video.tvdbEpisode.productionCode = '';
                actionableSeries.youtubeContext.videos.pop();
            }
            const clearCache = jest.spyOn(video, 'clearCache');
            const result = actionableSeries.hasMissing();
            expect(actionableSeries.warnings.length).toBe(2);
            expect(clearCache).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('when none missing return false', () => {
            const actionableSeries = actionableSeriesFactory();
            const result = actionableSeries.hasMissing();
            expect(result).toBe(false);
        });
    });
});