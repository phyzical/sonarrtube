import fs from "fs";
import { Episode } from "../Episode.js";
import { log } from "../../helpers/LogHelper.js";

class FileHandler {
  folder: string;

  constructor(folder: string) {
    this.folder = folder;
  }

  private getDirectories(source: string): Array<string> {
    return fs
      .readdirSync(source, {
        withFileTypes: true,
      })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  }

  private fileAccumulator(acc: Array<string>, file: string): Array<string> {
    const firstCharToNum = <number>(<unknown>file[0]);
    // if first letter is a number assume its an unproccessed episode this means that
    // if we ever have shows that start with numbers we are screwed TODO check all chars before first . is numbers
    // this still wont work if the whole show is numbers though
    if (!isNaN(firstCharToNum) && file.includes(".mp4")) {
      acc.push(file.replace(".mp4", ""));
    }
    return acc;
  }

  async renameEpisodeFiles(
    fileToRename: string,
    episodeText: string,
    series: string,
    season: string
  ): Promise<void> {
    log(`starting renaming ${fileToRename}`);
    const seasonFolder = [this.folder, series, season].join("/");
    const files = fs.readdirSync(seasonFolder);
    if (episodeText.length > 0) {
      files.forEach(function (file) {
        if (
          file.includes(`${fileToRename}.`) ||
          file.includes(`${fileToRename}-`)
        ) {
          const filePath = [seasonFolder, file].join("/");
          if (file.includes(".description") || file.includes(".json")) {
            fs.unlinkSync(filePath);
          } else {
            const newName = `${series.replace(
              /-/g,
              "."
            )}.${episodeText}${file.substring(file.indexOf("."))}`;
            fs.renameSync(filePath, [seasonFolder, newName].join("/"));
          }
        }
      });
    } else {
      log("renaming failed probably means it didn't get added correctly?");
      files.forEach(function (file) {
        if (file.includes(fileToRename)) {
          const errorDir = [seasonFolder, "errored"].join("/");
          if (!fs.existsSync(errorDir)) {
            fs.mkdirSync(errorDir);
          }
          fs.renameSync(
            [seasonFolder, file].join("/"),
            [errorDir, file].join("/")
          );
        }
      });
    }
    log("finished renaming");
  }

  getFilesToProcess(): Record<string, unknown> {
    log("Collating episodes");
    const directories = this.getDirectories(this.folder);
    const filesForProcessing = directories.reduce(
      (
        seriesAcc: Record<string, unknown>,
        series: string
      ): Record<string, unknown> => {
        const seriesPath = [this.folder, series].join("/");
        const seasonAccumulator = (
          seasonAcc: Record<string, unknown>,
          season: string
        ): Record<string, unknown> => {
          const seasonPath = [seriesPath, season].join("/");
          const files = fs.readdirSync(seasonPath);
          const episodeAccumulator = (key: string): Episode => {
            const informationFile = files.find(function (file) {
              return file.includes(key) && file.includes(".json");
            });
            let thumbnailFile = files.find(function (file) {
              return (
                file.includes(key) &&
                (file.includes("-screen.jpg") || file.includes("-thumb.jpg"))
              );
            });
            const thumbnailFileTile = files.find(function (file) {
              return file.includes(key) && file.includes(".jpg");
            });

            if (!thumbnailFile) {
              thumbnailFile = thumbnailFileTile;
            }

            const episode = new Episode();
            episode.folder = seasonPath;
            episode.informationFile = informationFile;
            episode.thumbnailFile = thumbnailFile;
            episode.thumbnailFileTile = thumbnailFileTile;
            episode.name = key;
            return episode;
          };
          seasonAcc[season] = files
            .reduce(this.fileAccumulator, [])
            .map(episodeAccumulator);
          return seasonAcc;
        };
        seriesAcc[series] = this.getDirectories(seriesPath)
          .filter((dirName) => new RegExp(/season/i).test(dirName))
          .reduce(seasonAccumulator, {});
        return seriesAcc;
      },
      {}
    );
    log("Collated episodes");
    return filesForProcessing;
  }
}

export { FileHandler };
