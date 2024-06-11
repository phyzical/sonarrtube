import { SonarrConfig } from './SonarrConfig.js';
import { TVDBConfig } from './TVDBConfig.js';
import { YoutubeConfig } from './YoutubeConfig.js';

export type Config = {
    tvdb: TVDBConfig
    youtube: YoutubeConfig,
    sonarr: SonarrConfig
    cacheDir: string
    preview: boolean
    outputDir: string
    verbose: boolean
    downloadOnly: boolean
    titleCleanerRegex: RegExp
}


