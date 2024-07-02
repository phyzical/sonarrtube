# sonarrtube <img src="logo.png" alt="Alt text" title="sonarrtube" width="100" height="100">

Adapter using sonarr + youtube + tvdb

## Requirements

* tvdb series must be added (can be empty for updating)
* sonarr must have it added also
* tvdb existing episodes must have productionCode (this is how we find the youtube url) otherwise a warning will be logged for fixing

## Flow

if you set `DOWNLOAD_ONLY=true` then it will just download and none of the tvdb envs are needed

* Hit sonarr for shows of type youtube
* Exclude any episodes that are season 0 / special
* For each of these;
  * Pull down youtube context from tvdb series page, either a link containing playlist/channel or fall back to an alias lookup for all videos
  * Pull down all episode information from tvdb (caches this for performant future runs/ reduce load on tvdb)
  * Pull down all video information from youtube (based on the found context 2 points up)
  * Find any episodes in sonarr that are hasFile false (Means for download)
    * Find these in tvdb by id match up to sonarr tvdbId
    * Given the youtube production code (If you see invalid production code you will need to action these before a download can happen as the video simply isn't found given the context i.e the playlist doesn't contain the linked video)
    * Download from youtube and put in the provided folder given sonarr series rootFolder + folderPath
  * Find any youtube videos given the context missing from tvdb and add them, for future downloading next run
    * note if any videos in tvdb are missing production codes this is reported and instead the only action that occurs is attempts to backfill. All of these warning must be actioned before adding new is allowed, this is to avoid over saturating a series with invalid series info.
    * if you know that these videos are not part of the playlist anymore 100% add them to `SKIP_FROM_SYNC_TVDB_EPISODES_IDS` please verify that you will not duplicate episodes though

NOTE!!!!!!

* if you update tvdb after scraping a show's links, make sure to clear the cache for it
* Please be careful around what show you start "managing" as tvdb is brittle at times, and you dont want to just drown a show with bad/duplicated episodes
* It can just fail sometimes.
* I suggest just running once a day at most.
* If you find that a show is being kept up to date, i.e there is someone else already automating/manually managing it then simply exclude it from the sync.

## Envs

copy the `.env.dist` to `.env` and fill out

| Env                              | Required?              | Default         | Description                                                               |
| -------------------------------- | ---------------------- | --------------- | ------------------------------------------------------------------------- |
| ENV_FILE                         | no                     | '.env'          | File path to env file                                                     |
|                                  |                        |                 |                                                                           |
| TVDB_USERNAME                    | Only if syncing        | ''              | Username used for tvdb                                                    |
|                                  |                        |                 |                                                                           |
| TVDB_PASSWORD                    | Only if syncing        | ''              | Password used for tvdb                                                    |
|                                  |                        |                 |                                                                           |
| TVDB_EMAIL                       | Only if syncing        | ''              | Email used for tvdb                                                       |
|                                  |                        |                 |                                                                           |
| TVDB_API                         | Yes                    | ''              | Api key used for tvdb api                                                 |
|                                  |                        |                 |                                                                           |
| SONARR_API                       |                        | ''              | api key for your sonarr instance                                          |
|                                  |                        |                 |                                                                           |
| SONARR_HOST                      |                        | ''              | ip:port of your sonarr instance                                           |
|                                  |                        |                 |                                                                           |
| YOUTUBE_COOKIE_FILE              | no, but is recommended | ''              | Cookie extraction from youtube to avoid it thinking your a bot            |
|                                  |                        |                 | see [Cookie help](https://github.com/ytdl-org/youtube-dl/issues/30665)    |
|                                  |                        |                 |                                                                           |
|                                  |                        |                 |                                                                           |
| YOUTUBE_ENABLE_SPONSORBLOCK      | no                     | 'true'          | Enables sponsor block, to remove in video ads                             |
|                                  |                        |                 |                                                                           |
| YOUTUBE_DOWNLOAD_DELAY_MONTHS    | no                     | '0'             | This delays when to download a video to increase the chance               |
|                                  |                        |                 | of sponsorblock having entries added                                      |
|                                  |                        |                 |                                                                           |
| CACHE_DIR                        | no                     | './cache'       | Directory to store api cache, error logs ect.                             |
|                                  |                        |                 |                                                                           |
| PREVIEW_ONLY                     | no                     | 'true'          | will not download or perform any write changes to tvdb                    |
|                                  |                        |                 |                                                                           |
| DOWNLOAD_ONLY                    | no                     | 'true'          | Use tvdb as readonly                                                      |
|                                  |                        |                 |                                                                           |
| OUTPUT_DIR                       | no                     | './downloads'   | Where to save youtube downloads                                           |
|                                  |                        |                 |                                                                           |
| VERBOSE_LOGS                     | no                     | 'false'         |                                                                           |
|                                  |                        |                 |                                                                           |
| TITLE_CLEANER_REGEX              | no                     | ''              | Provide a global regex of text to be removed from any youtube video title |
|                                  |                        |                 | For example a video may contain the channel title in its title            |
|                                  |                        |                 | this can be used to remove it before adding to tvdb                       |
|                                  |                        |                 |                                                                           |
| ONLY_SYNC_TVDB_SERIES_IDS        | no                     | ''              | These are the tvdb ids that you do want want to manage                    |
|                                  |                        |                 |                                                                           |
| SKIP_FROM_SYNC_TVDB_SERIES_IDS   | no                     | ''              | These are the tvdb ids that you do not want to manage                     |
|                                  |                        |                 | these series ids will never try to add or edit episodes                   |
|                                  |                        |                 |                                                                           |
| SKIP_FROM_SYNC_TVDB_EPISODES_IDS | no                     | ''              | These are the tvdb ids that you do not want to manage                     |
|                                  |                        |                 | these episodes ids will be skipped as part of the syncing                 |
|                                  |                        |                 |                                                                           |
| FORCE_CLEAR_CACHE                | no                     | './cache'       | set to true to reset all cached data                                      |
|                                  |                        |                 |                                                                           |
| NOTIFICATION_WEBHOOK             | no                     | ''              | Webhook url to send successful downloads, warnings, updates and errors to |
|                                  |                        |                 | designed for discord, may work with others                                |
|                                  |                        |                 |                                                                           |
| RE_RUN_INTERVAL                  | no                     | '1440'  (1 day) | Amount of minutes to wait before rerunning                                |
|                                  |                        |                 | provided in minutes                                                       |
|                                  |                        |                 |                                                                           |

## Local

`yarn build` or `npm run build` or `make builds`
then
`yarn install` or `make install`
then
`make run`

## Docker

reference the .env.dist for envs to add

`make build-image`
`make run-image`

## TODO

* tests
* mask it an cli, npm package
* notifications
* ability to run as a cron
