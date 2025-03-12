import { Episode as SonarrEpisodeType } from '@sonarrTube/types/sonarr/Episode.js';
import { Episode as TvdbEpisodeType } from '@sonarrTube/types/tvdb/Episode.js';
import { Series as SonarrSeriesType } from '@sonarrTube/types/sonarr/Series.js';
import { Series as TvdbSeriesType } from '@sonarrTube/types/tvdb/Series.js';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { cleanText } from '@sonarrTube/helpers/Puppeteer.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { ActionableSeries as ActionableSeriesType } from '@sonarrTube/types/ActionableSeries.js';
import { Channel as ChannelType } from '@sonarrTube/types/youtube/Channel';
import { Video } from '@sonarrTube/types/youtube/Video';

export class ActionableSeries implements ActionableSeriesType {
    videos: ActionableVideo[];
    sonarrSeries: SonarrSeriesType;
    tvdbSeries: TvdbSeriesType;
    youtubeContext: ChannelType;
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
                'Mismatch between tvdb and sonarr episodes! ' +
                `${this.sonarrSeries.episodes.length} vs ${this.tvdbSeries.episodes.length}`
            );
        }

        this.tvdbSeries.episodes = this.tvdbSeries.filterEpisodes();

        // find eps missing from tvdb, and where they line up
        for (const video of this.youtubeContext.videos) {
            const tvdbEpisodes = this.tvdbSeries
                .episodes
                .filter((episode: TvdbEpisodeType) => episode.productionCode == video.id);

            const tvdbEpisode = tvdbEpisodes[0];
            const sonarrEpisode = this.sonarrSeries
                .episodes
                .find((episode: SonarrEpisodeType) => episode.tvdbId == tvdbEpisode?.id);

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
                        youtubeVideo: video,
                        sonarrEpisode,
                        tvdbEpisode,
                        tvdbSeries: this.tvdbSeries,
                        sonarrSeries: this.sonarrSeries,
                        youtubeContext: this.youtubeContext
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
                    .find((episode: SonarrEpisodeType) => episode.tvdbId == tvdbEpisode?.id);
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
    _missingFromTvdbVideos: ActionableVideo[] | null = null;
    missingFromTvdbVideos = (): ActionableVideo[] => this._missingFromTvdbVideos ||= this
        .videos
        .filter(actionableVideo => actionableVideo.missingFromTvdb());

    // Detected as missing production codes
    _missingProductionCodeTvdbVideos: ActionableVideo[] | null = null;
    missingProductionCodeTvdbVideos = (): ActionableVideo[] => this._missingProductionCodeTvdbVideos ||= this.videos
        .filter(actionableVideo => actionableVideo.missingProductionCode());

    // Detected as not being in the youtube video list
    _unmatchedYoutubeVideos: ActionableVideo[] | null = null;
    unmatchedYoutubeVideos = (): ActionableVideo[] => this._unmatchedYoutubeVideos ||= this.videos
        .filter(actionableVideo => actionableVideo.unmatchedYoutubeVideo());

    // Detected as updatable with production codes
    _backfillableProductionCodeVideos: ActionableVideo[] = [];
    backfillableProductionCodeVideos = (downloadOnly: boolean = false): ActionableVideo[] => {
        const backfillVideos: ActionableVideo[] = [];
        if (downloadOnly) {
            return backfillVideos;
        }

        if (this._backfillableProductionCodeVideos.length) {
            return this._backfillableProductionCodeVideos;
        }

        for (const episode of this.missingProductionCodeTvdbVideos().filter(video => video.tvdbEpisode !== undefined)) {
            const tvdbEpisode = episode.tvdbEpisode as TvdbEpisodeType;

            const match = this.youtubeContext
                .videos
                .find(
                    (video) => cleanText(video.cleanTitle()) == cleanText(tvdbEpisode.name) ||
                        cleanText(video.backupTitle()) == cleanText(tvdbEpisode.name) ||
                        video.airedDate() == tvdbEpisode.aired
                );

            if (match) {
                episode.youtubeVideo = match;
                backfillVideos.push(episode);
            }
        }

        for (const episode of this.missingFromTvdbVideos().filter(video => video.youtubeVideo !== undefined)) {
            const youtubeVideo = episode.youtubeVideo as Video;

            const match = this.tvdbSeries
                .episodes
                .find(
                    (tvdbEpisode) =>
                        cleanText(youtubeVideo.cleanTitle()) == cleanText(tvdbEpisode.name) ||
                        cleanText(youtubeVideo.backupTitle()) == cleanText(tvdbEpisode.name) ||
                        youtubeVideo.airedDate() == tvdbEpisode.aired
                );

            if (match) {
                episode.tvdbEpisode = match;
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
    _backfillableImageVideos: ActionableVideo[] | null = null;
    backfillableImageVideos = (downloadOnly: boolean = false): ActionableVideo[] => {
        if (downloadOnly) {
            return [];
        }

        return this._backfillableImageVideos ||= this.videos.filter(video =>
            video.tvdbEpisode && video.youtubeVideo && !video.tvdbEpisode.image
        );
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
                    '(In the case the video was removed set its production code to ' +
                    `${Constants.YOUTUBE.VIDEO_REMOVED_FLAG} an d it will be skipped)`,
                    '(You may need to add these to ignore env, ' +
                    'if they were just backfilled they should be gone next run)',
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

