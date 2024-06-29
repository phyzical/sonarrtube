import { Series as TvdbSeries } from './tvdb/Series.js';
import { Series as SonarrSeries } from './sonarr/Series.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Channel as YoutubeContext } from './youtube/Channel.js';
import { ActionableVideo } from './ActionableVideo.js';
import { log } from '../../helpers/Log.js';
import { cleanText } from '../../helpers/Puppeteer.js';
import { Constants } from '../../types/config/Constants.js';

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
    backfillDownloadOnly: boolean = false;

    constructor({ sonarrSeries, tvdbSeries, youtubeContext }: ActionableSeriesType) {
        this.youtubeContext = youtubeContext;
        this.tvdbSeries = tvdbSeries;
        this.sonarrSeries = sonarrSeries;
        this.videos = [];

        if (this.sonarrSeries.episodes.length != this.tvdbSeries.episodes.length) {
            throw new Error(
                'Mismatch between tvdb and sonarr episodes!' +
                `${this.sonarrSeries.episodes.length} vs ${this.tvdbSeries.episodes.length}`
            );
        }

        this.tvdbSeries.episodes = this.tvdbSeries.filterEpisodes();

        // find eps missing from tvdb, and where they line up
        for (const video of this.youtubeContext.videos) {
            const tvdbEpisodes = this.tvdbSeries
                .episodes
                .filter((episode: TvdbEpisode) => episode.productionCode == video.id);

            const tvdbEpisode = tvdbEpisodes[0];
            const sonarrEpisode = this.sonarrSeries
                .episodes
                .find((episode: SonarrEpisode) => episode.tvdbId == tvdbEpisode?.id);

            if (tvdbEpisodes.length > 1) {
                log('Warning found multiple matches this shouldn\'t happen! This is probably a duplicate issue\n'
                    + 'If you are sure its a duplicate please just set the production code to ' +
                    `${Constants.YOUTUBE.VIDEO_REMOVED_FLAG} for one`
                );
                tvdbEpisodes.forEach(episode => {
                    const tempVideo = new ActionableVideo(
                        {
                            youtubeVideo: video, sonarrEpisode,
                            tvdbEpisode: episode, tvdbSeries: this.tvdbSeries,
                            sonarrSeries: this.sonarrSeries, youtubeContext: this.youtubeContext
                        }
                    );
                    tempVideo.overviewLog();
                    tempVideo.clearCache();
                });
            }

            this.videos.push(
                new ActionableVideo(
                    {
                        youtubeVideo: video, sonarrEpisode,
                        tvdbEpisode, tvdbSeries: this.tvdbSeries,
                        sonarrSeries: this.sonarrSeries, youtubeContext: this.youtubeContext
                    }
                )
            );
        }

        for (const tvdbEpisode of this.tvdbSeries.episodes) {
            // find eps with missing prod codes Or missing from youtube context
            if (
                !tvdbEpisode.productionCode ||
                this.youtubeContext.videos.find(video => video.id == tvdbEpisode.productionCode) == null
            ) {
                const sonarrEpisode = this.sonarrSeries
                    .episodes
                    .find((episode: SonarrEpisode) => episode.tvdbId == tvdbEpisode?.id);
                this.videos.push(
                    new ActionableVideo(
                        {
                            youtubeVideo: null, sonarrEpisode,
                            tvdbEpisode, tvdbSeries: this.tvdbSeries,
                            sonarrSeries: this.sonarrSeries, youtubeContext: this.youtubeContext
                        }
                    )
                );
            }
        }

        this.videos = this.videos
            .sort((x, y) => parseInt(x.aired().replace(/-/g, '')) - parseInt(y.aired().replace(/-/g, '')));
    }

    unDownloadedVideosCached: ActionableVideo[] = [];
    unDownloadedVideos(): ActionableVideo[] {
        if (this.unDownloadedVideosCached.length) {
            return this.unDownloadedVideosCached;
        }

        this.unDownloadedVideosCached = this.videos.filter(actionableVideo => actionableVideo.unDownloaded());

        return this.unDownloadedVideosCached;
    }

    // Detected as addable
    _missingFromTvdbVideos: ActionableVideo[] = null;
    missingFromTvdbVideos(): ActionableVideo[] {
        if (this._missingFromTvdbVideos) {
            return this._missingFromTvdbVideos;
        }

        this._missingFromTvdbVideos = this
            .videos
            .filter(actionableVideo => actionableVideo.missingFromTvdb());

        return this._missingFromTvdbVideos;
    }

    // Detected as missing production codes
    _missingProductionCodeTvdbVideos: ActionableVideo[] = null;
    missingProductionCodeTvdbVideos(): ActionableVideo[] {
        if (this._missingProductionCodeTvdbVideos) {
            return this._missingProductionCodeTvdbVideos;
        }

        this._missingProductionCodeTvdbVideos = this.videos
            .filter(actionableVideo => actionableVideo.missingProductionCode());

        return this._missingProductionCodeTvdbVideos;
    }

    // Detected as not being in the youtube video list
    _unmatchedYoutubeVideos: ActionableVideo[] = null;
    unmatchedYoutubeVideos(): ActionableVideo[] {
        if (this._unmatchedYoutubeVideos) {
            return this._unmatchedYoutubeVideos;
        }

        this._unmatchedYoutubeVideos = this.videos
            .filter(actionableVideo => !actionableVideo.missingProductionCode() && actionableVideo.missingYoutube());

        return this._unmatchedYoutubeVideos;
    }

    // Detected as updatable with production codes
    _backfillableProductionCodeVideos: ActionableVideo[] = null;
    backfillableProductionCodeVideos(downloadOnly: boolean = false): ActionableVideo[] {
        if (this._backfillableProductionCodeVideos) {
            return this._backfillableProductionCodeVideos;
        }

        const backfillVideos = [];
        if (downloadOnly) {
            return backfillVideos;
        }

        for (const episode of this.missingProductionCodeTvdbVideos()) {
            episode.youtubeVideo = this.youtubeContext
                .videos
                .find(
                    (video) => cleanText(video.title()) == cleanText(episode.tvdbEpisode.name) ||
                        cleanText(video.backupTitle()) == cleanText(episode.tvdbEpisode.name) ||
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
                        cleanText(episode.youtubeVideo.backupTitle()) == cleanText(tvdbEpisode.name) ||
                        episode.youtubeVideo.airedDate() == tvdbEpisode.aired
                );

            if (episode.tvdbEpisode) {
                backfillVideos.push(episode);
            }
        }

        this._backfillableProductionCodeVideos = backfillVideos.filter((video, index, self) =>
            index === self.findIndex((v) => v.youtubeVideo.id === video.youtubeVideo.id)
        );

        return this._backfillableProductionCodeVideos;
    }

    // Detected as updatable with production codes
    _backfillableImageVideos: ActionableVideo[] = null;
    backfillableImageVideos(downloadOnly: boolean = false): ActionableVideo[] {
        if (this._backfillableImageVideos) {
            return this._backfillableImageVideos;
        }

        const backfillVideos = [];
        if (downloadOnly) {
            return backfillVideos;
        }

        this._backfillableImageVideos = this.videos.filter(video =>
            video.tvdbEpisode && video.youtubeVideo && !video.tvdbEpisode.image
        );

        return this._backfillableImageVideos;
    }

    futureTotal(): number {
        return this.tvdbSeries.episodes.length +
            this.missingFromTvdbVideos().length - this.unmatchedYoutubeVideos().length;
    }

    hasMissing(): boolean {
        const missing = this.futureTotal() != this.youtubeContext.videos.length;
        const separator = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n';
        if (missing) {
            log(
                `\n${separator}` +
                `Warning: tvdb count (${this.tvdbSeries.episodes.length}) + ` +
                `to be added (${this.missingFromTvdbVideos().length}) - ` +
                `unmatched with production code (${this.unmatchedYoutubeVideos().length}) ${this.futureTotal()} ` +
                `!= ${this.youtubeContext.videos.length} current youtube list\n`
            );

            log(
                [
                    `The following are affected (${this.youtubeContext.url});`,
                    // eslint-disable-next-line max-len
                    '(In the case the video was removed set its production code to ' +
                    `${Constants.YOUTUBE.VIDEO_REMOVED_FLAG} and it will be skipped)`,
                    '(You may need to add these to ignore env)',
                ].join('\n')
            );

            this.missingProductionCodeTvdbVideos()//.concat(this.unmatchedYoutubeVideos())
                .forEach(video => {
                    video.overviewLog();
                    video.clearCache();
                });

            log(`\n${separator}`);
        }

        return missing;
    }
}

