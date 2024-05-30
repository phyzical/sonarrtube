# sonarrtube
Adapter using sonarr + youtube + tvdb

In the past i would download a channel, then run a [custom app using puppteer](https://github.com/phyzical/infrastructure/blob/master/scripts/unraid/showSubmitter/src/ShowSubmitter.ts) once in a blue moon to take all the youtube scraped info to update tvdb, then sonarr would jsut listen for new files of tvdb updated and scanned the local dir.
This worked but was iffy around how to match up existing entries as authors love to change the title of their videos. Also the manually managed channels required intervention form time to time.

I then stumbled across another approuch to the problem [RandomNinjaAtk/arr-scripts YoutubeSeriesDownloader](https://github.com/RandomNinjaAtk/arr-scripts/blob/main/sonarr/YoutubeSeriesDownloader.service)
this made me relise jeez im doing this backwards.

So instead this repo will rework the above mentioned custom library to instead pre-add/sync youtube to tvdb Then run the core logic of this script to handle the downloads. 
There will proably be a disconnect i.e you run a sync, then it downloads once tvdb udpates (can take time due to approvals, just tvdb thinmgs) but it will jsut happen next time its run.
This then removes the complexity around name matching, and will simply rely on the production code for matching.

TODO:
Add test sync mode
Add logic to output files that couldnt be matched
Add logic to fallback to the title seach the old library used if production code isnt found before adding
Add logic to exlude it from the sync (TODO)
Dockerise


NOTE!!!!!! 
* Please be careful around what show you start "managing" as tvdb is brittle at times, and you dont want to just drown a show with bad/duplicated episodes
* It can just fail sometimes.
* I suggested just running once a day at most.
* If you find that a show is being kept up to date, i.e there is someone else already automating/manually managing it then simply exlude it from the sync.
