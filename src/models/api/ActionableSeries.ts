import { Series as TvdbSeries } from './tvdb/Series.js';
import { Series as SonarrSeries } from './sonarr/Series.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Channel as YoutubeContext } from './youtube/Channel.js';
import { ActionableVideo } from './ActionableVideo.js';
import { log } from '../../helpers/Log.js';
import { cleanText } from '../../helpers/Puppeteer.js';

type ActionableSeriesType = {
    videos?: ActionableVideo[],
    sonarrSeries: SonarrSeries,
    tvdbSeries: TvdbSeries,
    youtubeContext: YoutubeContext
}

export class ActionableSeries {
    videos?: ActionableVideo[];
    sonarrSeries: SonarrSeries;
    tvdbSeries: TvdbSeries;
    youtubeContext: YoutubeContext;

    constructor({ sonarrSeries, tvdbSeries, youtubeContext }: ActionableSeriesType) {
        this.youtubeContext = youtubeContext;
        this.tvdbSeries = tvdbSeries;
        this.sonarrSeries = sonarrSeries;
        this.videos = [];

        if (sonarrSeries.episodes.length != tvdbSeries.episodes.length) {
            log('Warning there is a mismatch between tvdb and sonarr episodes! ' +
                `${sonarrSeries.episodes.length} vs ${tvdbSeries.episodes.length}`);
        }

        // find eps missing from tvdb, and where they line up
        for (const video of youtubeContext.videos) {
            const tvdbEpisode = tvdbSeries
                .episodes
                .find((episode: TvdbEpisode) => episode.productionCode == video.id);
            const sonarrEpisode = sonarrSeries
                .episodes
                .find((episode: SonarrEpisode) => episode.tvdbId == tvdbEpisode?.id);
            this.videos.push(
                new ActionableVideo({ youtubeVideo: video, sonarrEpisode, tvdbEpisode, tvdbSeries, sonarrSeries })
            );
        }

        // find eps with missing prod codes
        for (const tvdbEpisode of tvdbSeries.episodes.filter(episode => !episode.productionCode)) {
            const sonarrEpisode = sonarrSeries
                .episodes
                .find((episode: SonarrEpisode) => episode.tvdbId == tvdbEpisode?.id);

            this.videos.push(
                new ActionableVideo({ youtubeVideo: null, sonarrEpisode, tvdbEpisode, tvdbSeries, sonarrSeries })
            );
        }
        this.videos = this.videos
            .sort((x, y) => parseInt(y.aired().replace(/-/g, '')) - parseInt(x.aired().replace(/-/g, '')));
    }


    unDownloadedVideosCached: ActionableVideo[] = [];
    unDownloadedVideos(): ActionableVideo[] {
        if (this.unDownloadedVideosCached.length) {
            return this.unDownloadedVideosCached;
        }

        return this.videos.filter(actionableVideo => actionableVideo.unDownloaded());
    }

    missingFromTvdbVideosCached: ActionableVideo[] = [];
    missingFromTvdbVideos(): ActionableVideo[] {
        if (this.missingFromTvdbVideosCached.length) {
            //  TODO: can we rejig to put back on uncached side to avoid infinite loops?
            return this.missingFromTvdbVideosCached.filter(
                video => !this.backfillableVideos()
                    .find(backfillVideo => video.youtubeVideo.id === backfillVideo.youtubeVideo.id)
            );
        }

        return this
            .videos
            .filter(actionableVideo => actionableVideo.missingFromTvdb());

    }

    missingFromYoutubeVideosCached: ActionableVideo[] = [];
    missingFromYoutubeVideos(): ActionableVideo[] {
        if (this.missingFromYoutubeVideosCached.length) {
            return this.missingFromYoutubeVideosCached;
        }

        return this.videos.filter(actionableVideo => actionableVideo.missingYoutube());
    }

    missingProductionCodeTvdbVideosCached: ActionableVideo[] = [];
    missingProductionCodeTvdbVideos(): ActionableVideo[] {
        if (this.missingProductionCodeTvdbVideosCached.length) {
            return this.missingProductionCodeTvdbVideosCached;
        }

        return this.videos.filter(actionableVideo => actionableVideo.missingProductionCode());
    }

    backfillableVideosCached: ActionableVideo[] = [];
    backfillableVideos(downloadOnly: boolean = false): ActionableVideo[] {
        if (this.backfillableVideosCached.length) {
            return this.backfillableVideosCached;
        }

        const backfillVideos = [];

        if (!downloadOnly) {
            for (const episode of this.missingFromYoutubeVideos()) {
                episode.youtubeVideo = this.youtubeContext
                    .videos
                    .find(
                        (video) => cleanText(video.title()) == cleanText(episode.tvdbEpisode.name) ||
                            video.airedDate() == episode.tvdbEpisode.aired
                    );

                if (episode.youtubeVideo) {
                    backfillVideos.push(episode);
                }
            }

            for (const episode of this.missingFromTvdbVideos()) {
                episode.tvdbEpisode = this.tvdbSeries
                    .episodes
                    .find(
                        (tvdbEpisode) =>
                            cleanText(episode.youtubeVideo.title()) == cleanText(tvdbEpisode.name) ||
                            episode.youtubeVideo.airedDate() == tvdbEpisode.aired
                    );

                if (episode.tvdbEpisode) {
                    backfillVideos.push(episode);
                }
            }
        }

        return backfillVideos.filter((video, index, self) =>
            index === self.findIndex((v) => v.youtubeVideo.id === video.youtubeVideo.id)
        );
    }

    futureTotal(): number {
        return this.tvdbSeries.episodes.length +
            this.missingFromTvdbVideos().length -
            this.missingFromYoutubeVideos().length;
    }

    hasMissing(): boolean {
        const missing = this.futureTotal() != this.youtubeContext.videos.length;
        if (missing) {
            log(
                // eslint-disable-next-line max-len
                `\nWarning: tvdb count (${this.tvdbSeries.episodes.length}) + to be added (${this.missingFromYoutubeVideos().length}) ` +
                `- missing production code (${this.missingProductionCodeTvdbVideos().length}) ${this.futureTotal()} ` +
                `!= ${this.youtubeContext.videos.length} current youtube list\n` +
                'This means there is probably some items that still require action');

            log('Missing videos: \n' +
                this.missingFromYoutubeVideos()
                    .map(video => `${video.youtubeURL()} ${video.tvdbEditUrl()}`)
                    .join('\n')
            );
        }

        return missing;
    }
}

