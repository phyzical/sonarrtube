import { Series as TvdbSeries } from './tvdb/Series.js';
import { Series as SonarrSeries } from './sonarr/Series.js';
import { Episode as SonarrEpisode } from './sonarr/Episode.js';
import { Episode as TvdbEpisode } from './tvdb/Episode.js';
import { Channel as YoutubeContext } from './youtube/Channel.js';
import { ActionableVideo } from './ActionableVideo.js';
import { cleanText } from '../../helpers/Puppeteer.js';
import { Constants } from '../../types/config/Constants.js';

type ActionableSeriesType = {
    videos?: ActionableVideo[],
    sonarrSeries: SonarrSeries,
    tvdbSeries: TvdbSeries,
    youtubeContext: YoutubeContext
}

export class ActionableSeries {
    videos: ActionableVideo[];
    sonarrSeries: SonarrSeries;
    tvdbSeries: TvdbSeries;
    youtubeContext: YoutubeContext;
    backfillDownloadOnly: boolean = false;
    warnings: string[];

    constructor({ sonarrSeries, tvdbSeries, youtubeContext }: ActionableSeriesType) {
        this.youtubeContext = youtubeContext;
        this.tvdbSeries = tvdbSeries;
        this.sonarrSeries = sonarrSeries;
        this.videos = [];
        this.warnings = [];

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
                this.warnings.push(
                    'Warning found multiple matches this shouldn\'t happen! This is probably a duplicate issue\n'
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
                    this.warnings.push(tempVideo.summary());
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
                            sonarrEpisode,
                            tvdbEpisode, tvdbSeries: this.tvdbSeries,
                            sonarrSeries: this.sonarrSeries, youtubeContext: this.youtubeContext
                        }
                    )
                );
            }
        }

        this.videos = this.videos
            .sort((x, y) => parseInt(x.aired()?.replace(/-/g, '') || '0') -
                parseInt(y.aired()?.replace(/-/g, '') || '0'));
    }

    unDownloadedVideos = (): ActionableVideo[] => this.videos.filter(actionableVideo => actionableVideo.unDownloaded());

    // Detected as addable
    _missingFromTvdbVideos: ActionableVideo[] = [];
    missingFromTvdbVideos = (): ActionableVideo[] => {
        if (this._missingFromTvdbVideos) {
            return this._missingFromTvdbVideos;
        }

        this._missingFromTvdbVideos = this
            .videos
            .filter(actionableVideo => actionableVideo.missingFromTvdb());

        return this._missingFromTvdbVideos;
    };

    // Detected as missing production codes
    _missingProductionCodeTvdbVideos: ActionableVideo[] = [];
    missingProductionCodeTvdbVideos = (): ActionableVideo[] => {
        if (this._missingProductionCodeTvdbVideos) {
            return this._missingProductionCodeTvdbVideos;
        }

        this._missingProductionCodeTvdbVideos = this.videos
            .filter(actionableVideo => actionableVideo.missingProductionCode());

        return this._missingProductionCodeTvdbVideos;
    };

    // Detected as not being in the youtube video list
    _unmatchedYoutubeVideos: ActionableVideo[] = [];
    unmatchedYoutubeVideos = (): ActionableVideo[] => {
        if (this._unmatchedYoutubeVideos) {
            return this._unmatchedYoutubeVideos;
        }

        this._unmatchedYoutubeVideos = this.videos
            .filter(actionableVideo => !actionableVideo.missingProductionCode() && actionableVideo.missingYoutube());

        return this._unmatchedYoutubeVideos;
    };

    // Detected as updatable with production codes
    _backfillableProductionCodeVideos: ActionableVideo[] = [];
    backfillableProductionCodeVideos = (downloadOnly: boolean = false): ActionableVideo[] => {
        if (this._backfillableProductionCodeVideos) {
            return this._backfillableProductionCodeVideos;
        }

        const backfillVideos: ActionableVideo[] = [];
        if (downloadOnly) {
            return backfillVideos;
        }

        for (const episode of this.missingProductionCodeTvdbVideos()) {
            const tvdbEpisode = episode.tvdbEpisode;
            if (!tvdbEpisode) {
                continue;
            }

            episode.youtubeVideo = this.youtubeContext
                .videos
                .find(
                    (video) => cleanText(video.title()) == cleanText(tvdbEpisode.name) ||
                        cleanText(video.backupTitle()) == cleanText(tvdbEpisode.name) ||
                        video.airedDate() == tvdbEpisode.aired
                );

            if (episode.youtubeVideo) {
                backfillVideos.push(episode);
            }
        }

        for (const episode of this.missingFromTvdbVideos()) {
            const youtubeVideo = episode.youtubeVideo;
            if (!youtubeVideo) {
                continue;
            }

            episode.tvdbEpisode = this.tvdbSeries
                .episodes
                .find(
                    (tvdbEpisode) =>
                        cleanText(youtubeVideo.title()) == cleanText(tvdbEpisode.name) ||
                        cleanText(youtubeVideo.backupTitle()) == cleanText(tvdbEpisode.name) ||
                        youtubeVideo.airedDate() == tvdbEpisode.aired
                );

            if (episode.tvdbEpisode) {
                backfillVideos.push(episode);
            }
        }

        if (backfillVideos.find(video => !video.youtubeVideo?.id)) {
            throw new Error('Youtube video not found, this shouldn\'t happen!');
        }

        // DEDUPLICATE
        this._backfillableProductionCodeVideos = backfillVideos.filter((video, index, self) =>
            index === self.findIndex((video2) => video2.youtubeVideo?.id === video.youtubeVideo?.id)
        );

        return this._backfillableProductionCodeVideos;
    };

    // Detected as updatable with production codes
    _backfillableImageVideos: ActionableVideo[] = [];
    backfillableImageVideos = (downloadOnly: boolean = false): ActionableVideo[] => {
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
    };

    futureTotal = (): number => this.tvdbSeries.episodes.length +
        this.missingFromTvdbVideos().length - this.unmatchedYoutubeVideos().length;

    hasMissing = (): boolean => {
        const missing = this.futureTotal() != this.youtubeContext.videos.length;
        if (missing) {
            this.warnings.push(
                [
                    `\n${Constants.SEPARATOR}`,
                    `Warning: tvdb count (${this.tvdbSeries.episodes.length}) + ` +
                    `to be added (${this.missingFromTvdbVideos().length}) - ` +
                    `unmatched with production code (${this.unmatchedYoutubeVideos().length}) ${this.futureTotal()} ` +
                    `!= ${this.youtubeContext.videos.length} current youtube list`,
                    `The following are affected (${this.youtubeContext.url});`,
                    // eslint-disable-next-line max-len
                    '(In the case the video was removed set its production code to ' +
                    `${Constants.YOUTUBE.VIDEO_REMOVED_FLAG} and it will be skipped)`,
                    '(You may need to add these to ignore env)',
                ].join('\n')
            );

            this.missingProductionCodeTvdbVideos()//.concat(this.unmatchedYoutubeVideos())
                .forEach(video => {
                    this.warnings.push(video.summary());
                    video.clearCache();
                });
        }

        return missing;
    };
}

