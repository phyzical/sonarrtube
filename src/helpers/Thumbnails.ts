import { existsSync, unlinkSync, writeFileSync } from 'fs';

import webp from 'webp-converter';
import { Jimp, JimpMime } from 'jimp';
import { PSM, Word, createWorker } from 'tesseract.js';

import { log } from '@sonarrTube/helpers/Log.js';
import { cachePath } from '@sonarrTube/helpers/Cache.js';
import { delay } from '@sonarrTube/helpers/Puppeteer.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

export const cropImage = async (
    inputPath: string, rect: { x0: number, y0: number, x1: number, y1: number }
): Promise<void> => {
    const originalImage = await Jimp.read(inputPath);
    const { width, height } = originalImage.bitmap;

    // Calculate dimensions and positions for the leftover segments
    const topSegmentHeight = rect.y0;
    const bottomSegmentHeight = height - rect.y1;
    const leftSegmentWidth = rect.x0;
    const rightSegmentWidth = width - rect.x1;

    // Create a new image with the same width and adjusted height
    // For simplicity, this example assumes vertical alignment of top and bottom segments only
    const newHeight = topSegmentHeight + bottomSegmentHeight;
    const newWidth = leftSegmentWidth + rightSegmentWidth;

    const newImage = new Jimp({ width: newWidth, height: newHeight, color: 0xff0000ff });

    // Copy the top segment
    if (topSegmentHeight > 0) {
        const topSegment = originalImage.clone().crop({ x: 0, y: 0, w: width, h: topSegmentHeight });
        newImage.composite(topSegment, 0, 0);
    }

    // Copy the bottom segment
    if (bottomSegmentHeight > 0) {
        const bottomSegment = originalImage.clone().crop({ x: 0, y: rect.y1, w: width, h: bottomSegmentHeight });
        newImage.composite(bottomSegment, 0, topSegmentHeight); // Position directly below the top segment
    }

    // Copy the left segment
    if (leftSegmentWidth > 0) {
        const leftSegment = originalImage.clone().crop({ x: 0, y: 0, w: leftSegmentWidth, h: height });
        newImage.composite(leftSegment, 0, 0); // Position at the start
    }

    // Copy the right segment
    if (rightSegmentWidth > 0) {
        const rightSegment = originalImage.clone().crop({ x: rect.x1, y: 0, w: rightSegmentWidth, h: height });
        newImage.composite(rightSegment, leftSegmentWidth, 0); // Position directly after the left segment
    }

    // Save the new image
    await newImage.write(inputPath as '`${string}.${string}`');
};

type Coordinates = { x0: number; y0: number; x1: number; y1: number; }

export const findThumbnailText = async (
    image: Awaited<ReturnType<typeof Jimp.read>>, attempt: number
): Promise<Coordinates | undefined> => {
    const worker = await createWorker(Constants.THUMBNAIL.TEXT.LANGUAGE, 1, {
        cachePath: cachePath(Constants.CACHE_FOLDERS.TESS)
        // logger: m => console.log(m), // Log progress
    });
    let words = [] as Word[];
    try {
        await worker.setParameters({
            tessedit_char_whitelist: Constants.THUMBNAIL.TEXT.FINDER_CHAR_LIST,
            tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        });

        words = (await worker.recognize(
            await image.invert()
                .greyscale()
                // if even means its the first attempt of each bounding box 
                .contrast(attempt == 2 ? 0.4 : 0.1)
                .getBuffer(JimpMime.png)
        )).data.words;
    } finally {
        await worker.terminate();
    }

    let coordinates: Coordinates | undefined;

    words.filter((element: Word) =>
        element.direction == Constants.THUMBNAIL.TEXT.DIRECTION &&
        element.text.length >= (attempt == 3 ? 1 : Constants.THUMBNAIL.TEXT.LENGTH) &&
        element.font_size > Constants.THUMBNAIL.TEXT.FONT_SIZE
    ).forEach((element: Word) => {
        if (!coordinates) {
            coordinates = {
                x0: element.bbox.x0, y0: element.bbox.y0, x1: element.bbox.x1, y1: element.bbox.y1
            };
        } else {
            if (element.bbox.x0 < coordinates.x0) {
                coordinates.x0 = element.bbox.x0;
                coordinates.y0 = element.bbox.y0;
            }
            if (element.bbox.x1 > coordinates.x1) {
                coordinates.x1 = element.bbox.x1;
                coordinates.y1 = element.bbox.y1;
            }
        }
    });

    return coordinates;
};


export const processThumbnail = async (
    thumbnailUrl: string, id: string, attempt: number = 0
): Promise<string> => {
    log(`downloading ${thumbnailUrl}`, true);
    const urlSplits = thumbnailUrl.split('.');
    const extension = urlSplits[urlSplits.length - 1];
    let thumbnailPath = cachePath(`${Constants.CACHE_FOLDERS.THUMBNAIL}/${id}_${attempt}.${extension}`);
    const res = await fetch(thumbnailUrl);

    console.log(res)

    const buffer = Buffer.from(await res.arrayBuffer());

    writeFileSync(thumbnailPath, buffer);
    if (extension == Constants.EXTENSIONS.WEBP) {
        log('converting webp to png', true);
        const webpPath = thumbnailPath;
        thumbnailPath = thumbnailPath.replace(Constants.EXTENSIONS.WEBP, Constants.EXTENSIONS.PNG);
        await webp.dwebp(webpPath, thumbnailPath, '-o');
        let checksCount = 0;
        while (!existsSync(thumbnailPath) && checksCount < 5) {
            /* istanbul ignore next */
            await delay(500);
            /* istanbul ignore next */
            checksCount++;
        }
        unlinkSync(webpPath);
    }

    let image = await Jimp.read(thumbnailPath);

    if (
        image.bitmap.width < Constants.THUMBNAIL.MINIMUM_WIDTH &&
        image.bitmap.height < Constants.THUMBNAIL.MINIMUM_HEIGHT
    ) {
        return '';
    }

    if (attempt >= 4) {
        return thumbnailPath;
    }

    const coordinates = await findThumbnailText(image, attempt);

    if (!coordinates) {
        return thumbnailPath;
    }

    await cropImage(thumbnailPath, coordinates);

    image = await Jimp.read(thumbnailPath);

    if (
        image.bitmap.width < Constants.THUMBNAIL.MINIMUM_WIDTH &&
        image.bitmap.height < Constants.THUMBNAIL.MINIMUM_HEIGHT
    ) {
        return '';
    }

    return thumbnailPath;
};