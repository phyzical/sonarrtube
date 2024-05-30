import { EpisodeInformationInterface } from "../interfaces/submitter/EpisodeInformationInterface.js";
import { InformationInterface } from "../interfaces/youtube/InformationInterface.js";

class EpisodeInformation implements EpisodeInformationInterface {
  informationJson: InformationInterface;

  constructor(informationJson: InformationInterface) {
    this.informationJson = informationJson;
  }

  description(): string {
    let description = this.informationJson.description;
    const crappyDescriptionRegex = new RegExp(/(sponsor)+|(download)+/i);

    if (
      !description ||
      description.length > 100 ||
      crappyDescriptionRegex.test(description)
    ) {
      description = this.title();
    }

    return description;
  }

  title(): string {
    return this.informationJson.fulltitle;
  }

  url(): string {
    return this.informationJson.id;
  }

  runTime(): string {
    const runtime = Math.floor(this.informationJson.duration / 60);
    return runtime > 1 ? runtime.toString() : "1";
  }

  airedDate(): string {
    const airDate = this.informationJson.upload_date; //'01/02/2020'
    return (
      airDate.slice(0, 4) +
      "-" +
      airDate.slice(4, 6) +
      "-" +
      airDate.slice(6, 8)
    );
  }
}

export { EpisodeInformation };
