import { writeFileSync } from 'fs';

import { Jimp, JimpInstance, JimpMime } from 'jimp';
import { Block, PSM, Word, createWorker } from 'tesseract.js';
import sharp from 'sharp';

import { log } from '@sonarrTube/helpers/Log.js';
import { cachePath } from '@sonarrTube/helpers/Cache.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

export const _cropImage = async (
    inputPath: string, rect: { x0: number, y0: number, x1: number, y1: number }
): Promise<void> => {
    log('cropping image', true);
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
    // Uncomment to see the new image i.e running tests/debugging
    // await newImage.write('test.png' as '`${string}.${string}`');
};

type Coordinates = { x0: number; y0: number; x1: number; y1: number; }

export const findThumbnailText = async (
    image: Awaited<ReturnType<typeof Jimp.read>>, attempt: number
): Promise<Coordinates | undefined> => {
    const worker = await createWorker(Constants.THUMBNAIL.TEXT.LANGUAGE, 1, {
        cachePath: cachePath(Constants.CACHE_FOLDERS.TESS)
        // logger: m => console.log(m), // Log progress
    });
    let blocks = [] as Block[];
    try {
        await worker.setParameters({
            tessedit_char_whitelist: Constants.THUMBNAIL.TEXT.FINDER_CHAR_LIST,
            tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        });

        blocks = (await worker.recognize(
            await image.greyscale()
                // if even means its the first attempt of each bounding box 
                .contrast(attempt == 2 ? 0.4 : 0.1)
                .getBuffer(JimpMime.png)
            , {}, { text: false, blocks: true })).data.blocks || [];
    } catch (e) {
        console.dir(e);
    } finally {
        await worker.terminate();
    }

    let coordinates: Coordinates | undefined;

    blocks.filter((element: Block) => element.confidence > Constants.THUMBNAIL.TEXT.CONFIDENCE)
        .forEach((element: Block) => {
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

    const buffer = Buffer.from(await res.arrayBuffer());

    if (extension == Constants.EXTENSIONS.WEBP) {
        log('converting webp to png', true);
        thumbnailPath = thumbnailPath.replace(Constants.EXTENSIONS.WEBP, Constants.EXTENSIONS.PNG);
        await sharp(buffer).png()
            .toFile(thumbnailPath);
    } else {
        writeFileSync(thumbnailPath, buffer);
    }

    let image = await Jimp.read(thumbnailPath);

    if (dimsCheck(image as JimpInstance)) {
        log(`Skipping as image dims are ${image.bitmap.width}x${image.bitmap.height}`, true);

        return '';
    }

    if (attempt >= Constants.THUMBNAIL.MAX_ATTEMPTS) {
        return thumbnailPath;
    }

    const coordinates = await findThumbnailText(image, attempt);

    if (!coordinates) {
        log('Skipping text Not Found', true);

        return '';
    }

    await _cropImage(thumbnailPath, coordinates);

    image = await Jimp.read(thumbnailPath);

    if (dimsCheck(image as JimpInstance)) {
        log(`Skipping as image dims are ${image.bitmap.width}x${image.bitmap.height}`, true);

        return '';
    }

    return thumbnailPath;
};

const dimsCheck = (image: JimpInstance): boolean => image.bitmap.width <= Constants.THUMBNAIL.MINIMUM_WIDTH ||
    image.bitmap.height <= Constants.THUMBNAIL.MINIMUM_HEIGHT;