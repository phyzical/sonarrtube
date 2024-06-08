# sonarrtube

Adapter using sonarr + youtube + tvdb

## Requirements

* tvdb series must be added (can be empty for updating)
* sonarr must have it added also
* tvdb existing episodes must have productionCode (this is how we find the youtube url) otherwise a warning will be logged for fixing

## Flow

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
TODO:
  * Find any youtube videos given the context missing from tvdb and add them, for future downloading next run
    * note if any videos in tvdb are missing production codes this is reported and instead the only action that occurs is attempts to backfill. All of these warning must be actioned before adding new is allowed, this is to avoid over saturating a series with invalid series info.

TODO:
Add logic to exclude shows it from the sync (DownloadOnlySeries csv flag?)
Add a flag to clear cache?

NOTE!!!!!!

* if you update tvdb after scraping a show's links, make sure to clear the cache for it
* Please be careful around what show you start "managing" as tvdb is brittle at times, and you dont want to just drown a show with bad/duplicated episodes
* It can just fail sometimes.
* I suggest just running once a day at most.
* If you find that a show is being kept up to date, i.e there is someone else already automating/manually managing it then simply exclude it from the sync.

## Envs

copy the `.env.dist` to `.env` and fill out

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
