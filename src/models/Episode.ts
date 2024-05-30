import { EpisodeInformation } from "./EpisodeInformation.js";
import { EpisodeInterface } from "../interfaces/EpisodeInterface.js";
import fs from "fs";

class Episode implements EpisodeInterface {
  informationFile: string;
  thumbnailFile: string;
  thumbnailFileTile: string;
  folder: string;
  name: string;

  information(): EpisodeInformation {
    return new EpisodeInformation(
      JSON.parse(fs.readFileSync(this.informationFilePath()).toString())
    );
  }

  informationFilePath(): string {
    return [this.folder, this.informationFile].join('/')
  }

  thumbnailFilePath(): string {
    let thumbnailPath = this.thumbnailFile
    if (!thumbnailPath) {
      thumbnailPath = this.thumbnailFileTile
    }
    return [this.folder, thumbnailPath].join('/')
  }

  title() {
    return this.name.substring(this.name.indexOf(".") + 1)
  }
}

export { Episode };
