import { writeFileSync } from 'fs';

import { Jimp, JimpInstance, JimpMime } from 'jimp';
import { Block, PSM, createWorker } from 'tesseract.js';
import sharp from 'sharp';

import { log } from '@sonarrTube/helpers/Log.js';
import { cachePath } from '@sonarrTube/helpers/Cache.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

export const _removeText = async (
    inputPath: string, blocks: Block[]
): Promise<void> => {
    log('Removing text from image', true);
    const originalImage = await Jimp.read(inputPath);

    const coordinates = _calculateCoordinates(blocks);

    let newImage = await _cropImageByX(originalImage, coordinates);
    if (imageToSmall(newImage as JimpInstance)) {
        newImage = await _cropImageByY(originalImage, coordinates);
    }
    if (imageToSmall(newImage as JimpInstance)) {
        newImage = await _blackenText(originalImage, coordinates) as JimpInstance;
    }

    // Save the new image
    await newImage.write(inputPath as '`${string}.${string}`');
    // await newImage.write('debug.png' as '`${string}.${string}`');
};

const _blackenText = async (
    originalImage: Awaited<ReturnType<typeof Jimp.read>>,
    coordinates: Coordinates
): Promise<Awaited<ReturnType<typeof Jimp.read>>> => {
    const { x0, y0, x1, y1 } = coordinates;
    const newImage = await originalImage.clone();
    await newImage.scan(x0, y0, x1 - x0, y1 - y0, (_x, _y, idx) => {
        newImage.bitmap.data[idx] = 0;
        newImage.bitmap.data[idx + 1] = 0;
        newImage.bitmap.data[idx + 2] = 0;
    });

    return newImage;
};


const _cropImageByX = async (
    originalImage: Awaited<ReturnType<typeof Jimp.read>>,
    coordinates: Coordinates
): Promise<JimpInstance> => {
    const { width, height } = originalImage.bitmap;

    const { x0, x1, } = coordinates;

    // Calculate dimensions and positions for the leftover segments
    const leftSegmentWidth = x0;
    const rightSegmentWidth = width - x1;

    // Create a new image with the same width and adjusted height
    // For simplicity, this example assumes vertical alignment of top and bottom segments only
    const newWidth = leftSegmentWidth + rightSegmentWidth;

    const newImage = new Jimp({ width: newWidth, height, color: 0xff0000ff });

    // Copy the left segment
    if (leftSegmentWidth > 0) {
        const leftSegment = await originalImage.clone().crop({ x: 0, y: 0, w: leftSegmentWidth, h: height });
        await newImage.composite(leftSegment, 0, 0); // Position at the start
    }

    // Copy the right segment
    if (rightSegmentWidth > 0) {
        const rightSegment = await originalImage.clone().crop({ x: x1, y: 0, w: rightSegmentWidth, h: height });
        await newImage.composite(rightSegment, leftSegmentWidth, 0); // Position directly after the left segment
    }

    return newImage;
};

const _cropImageByY = async (
    originalImage: Awaited<ReturnType<typeof Jimp.read>>,
    coordinates: Coordinates
): Promise<JimpInstance> => {
    const { width, height } = originalImage.bitmap;

    const { x0, y0, x1, y1 } = coordinates;

    // Calculate dimensions and positions for the leftover segments
    const bottomSegmentHeight = y0;
    const topSegmentHeight = height - y1;
    const leftSegmentWidth = x0;
    const rightSegmentWidth = width - x1;

    // Create a new image with the same width and adjusted height
    // For simplicity, this example assumes vertical alignment of top and bottom segments only
    const newWidth = leftSegmentWidth + rightSegmentWidth;

    const newImage = new Jimp({ width: newWidth, height, color: 0xff0000ff });

    // Copy the top segment
    if (topSegmentHeight > 0) {
        const topSegment = await originalImage.clone().crop({ x: 0, y: 0, w: width, h: topSegmentHeight });
        await newImage.composite(topSegment, 0, 0);
    }

    // Copy the bottom segment
    if (bottomSegmentHeight > 0) {
        const bottomSegment = await originalImage.clone().crop(
            { x: 0, y: y1, w: width, h: bottomSegmentHeight });
        await newImage.composite(bottomSegment, 0, topSegmentHeight); // Position directly below the top segment
    }

    return newImage;
};

export const findThumbnailText = async (
    image: Awaited<ReturnType<typeof Jimp.read>>, attempt: number
): Promise<Block[]> => {
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

    return blocks.filter((element: Block) => element.confidence > Constants.THUMBNAIL.TEXT.CONFIDENCE);
};

type Coordinates = { x0: number; y0: number; x1: number; y1: number; }

const _calculateCoordinates = (blocks: Block[]): Coordinates => {
    let coordinates: Coordinates = {} as Coordinates;

    blocks.forEach((element: Block, i: number) => {
        if (!i) {
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

    const image = await Jimp.read(thumbnailPath);

    if (imageToSmall(image as JimpInstance)) {
        log(`Skipping as image dims are ${image.bitmap.width}x${image.bitmap.height}`, true);

        return '';
    }

    if (attempt >= Constants.THUMBNAIL.MAX_ATTEMPTS) {
        return thumbnailPath;
    }

    const boxes = await findThumbnailText(image, attempt);

    if (boxes.length == 0) {
        log('Skipping text Not Found', true);

        return '';
    }

    await _removeText(thumbnailPath, boxes);

    return thumbnailPath;
};

const imageToSmall = (image: JimpInstance): boolean => image.bitmap.width <= Constants.THUMBNAIL.MINIMUM_WIDTH ||
    image.bitmap.height <= Constants.THUMBNAIL.MINIMUM_HEIGHT;