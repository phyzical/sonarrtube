import { SonarrConfig } from '@sonarrTube/types/config/SonarrConfig.js';
import { TVDBConfig } from '@sonarrTube/types/config/TVDBConfig.js';
import { YoutubeConfig } from '@sonarrTube/types/config/YoutubeConfig.js';

export type Config = {
    tvdb: TVDBConfig
    youtube: YoutubeConfig,
    sonarr: SonarrConfig
    cacheDir: string
    preview: boolean
    verbose: boolean
    downloadOnly: boolean
    titleCleanerRegex: RegExp
    notificationWebhook: string
    reRunInterval: number,
    isDocker: boolean
}


