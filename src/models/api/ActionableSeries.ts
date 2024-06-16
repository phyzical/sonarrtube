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
            throw new Error(
                'Mismatch between tvdb and sonarr episodes!' +
                `${sonarrSeries.episodes.length} vs ${tvdbSeries.episodes.length}`
            );
        }

        this.tvdbSeries.episodes = tvdbSeries.filterEpisodes();

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

    missingFromTvdbVideosCached: ActionableVideo[] = [];
    missingFromTvdbVideos(): ActionableVideo[] {
        if (this.missingFromTvdbVideosCached.length) {
            return this.missingFromTvdbVideosCached;
            //  TODO: can we rejig to put this logic in ehre?
            // .filter(
            //     video => !this.backfillableVideos()
            //         .find(backfillVideo => video.youtubeVideo.id === backfillVideo.youtubeVideo.id)
            // );
        }

        this.missingFromTvdbVideosCached = this
            .videos
            .filter(actionableVideo => actionableVideo.missingFromTvdb());

        return this.missingFromTvdbVideosCached;
    }

    missingFromYoutubeVideosCached: ActionableVideo[] = [];
    missingFromYoutubeVideos(): ActionableVideo[] {
        if (this.missingFromYoutubeVideosCached.length) {
            return this.missingFromYoutubeVideosCached;
        }

        this.missingFromYoutubeVideosCached = this.videos.filter(actionableVideo => actionableVideo.missingYoutube());

        return this.missingFromYoutubeVideosCached;
    }

    missingProductionCodeTvdbVideosCached: ActionableVideo[] = [];
    missingProductionCodeTvdbVideos(): ActionableVideo[] {
        if (this.missingProductionCodeTvdbVideosCached.length) {
            return this.missingProductionCodeTvdbVideosCached;
        }

        this.missingProductionCodeTvdbVideosCached = this.videos
            .filter(actionableVideo => actionableVideo.missingProductionCode());

        return this.missingProductionCodeTvdbVideosCached;
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

        this.backfillableVideosCached = backfillVideos.filter((video, index, self) =>
            index === self.findIndex((v) => v.youtubeVideo.id === video.youtubeVideo.id)
        );

        return this.backfillableVideosCached;
    }

    futureTotal(): number {
        return this.tvdbSeries.episodes.length + this.missingFromTvdbVideos().length;
    }

    hasMissing(): boolean {
        const missing = this.futureTotal() != this.youtubeContext.videos.length;
        const separator = '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n';
        if (missing) {
            log(
                `\n${separator}` +
                `Warning: tvdb count (${this.tvdbSeries.episodes.length}) + ` +
                `to be added (${this.missingFromTvdbVideos().length}) ${this.futureTotal()} ` +
                `!= ${this.youtubeContext.videos.length} current youtube list\n`
            );

            log(`The following are affected (${this.youtubeContext.url});\n(You may need to add these to ignore)\n`);
            this
                .tvdbSeries
                .episodes
                .map(episode => new ActionableVideo(
                    {
                        tvdbEpisode: episode,
                        youtubeVideo: null,
                        sonarrEpisode: null,
                        tvdbSeries: this.tvdbSeries,
                        sonarrSeries: null
                    }
                ))
                .filter(video => !
                    this
                        .youtubeContext
                        .videos
                        .find(youtubeVideo => youtubeVideo.id == video.tvdbEpisode.productionCode)
                )
                .forEach(video => video.overviewLog());

            log(`\n${separator}`);
        }

        return missing;
    }
}

