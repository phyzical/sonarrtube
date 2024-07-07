import { Statistics } from '@sonarrTube/types/sonarr/Statistics.js';

export type Season = { seasonNumber: number, monitored: boolean, statistics: Statistics[] }
