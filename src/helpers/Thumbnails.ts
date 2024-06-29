import webp from 'webp-converter';
import Jimp from 'jimp';
import { PSM, createWorker } from 'tesseract.js';
import { log } from './Log.js';
import { cachePath } from './Cache.js';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { delay } from './Puppeteer.js';
import { Constants } from '../types/config/Constants.js';

const cropImage = async (
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
    const newImage = new Jimp(newWidth, newHeight, 0x00000000);

    // Copy the top segment
    if (topSegmentHeight > 0) {
        const topSegment = originalImage.clone().crop(0, 0, width, topSegmentHeight);
        newImage.composite(topSegment, 0, 0);
    }

    // Copy the bottom segment
    if (bottomSegmentHeight > 0) {
        const bottomSegment = originalImage.clone().crop(0, rect.y1, width, bottomSegmentHeight);
        newImage.composite(bottomSegment, 0, topSegmentHeight); // Position directly below the top segment
    }

    // Copy the left segment
    if (leftSegmentWidth > 0) {
        const leftSegment = originalImage.clone().crop(0, 0, leftSegmentWidth, height);
        newImage.composite(leftSegment, 0, 0); // Position at the start
    }

    // Copy the right segment
    if (rightSegmentWidth > 0) {
        const rightSegment = originalImage.clone().crop(rect.x1, 0, rightSegmentWidth, height);
        newImage.composite(rightSegment, leftSegmentWidth, 0); // Position directly after the left segment
    }

    // Save the new image
    await newImage.writeAsync(inputPath);
};

type Coordinates = { x0: number; y0: number; x1: number; y1: number; }

const findThumbnailText = async (imagePath: string, attempt: number): Promise<Coordinates> => {
    const worker = await createWorker(Constants.THUMBNAIL.TEXT.LANGUAGE, 1, {
        cachePath: cachePath(Constants.CACHE_FOLDERS.TESS)
        // logger: m => console.log(m), // Log progress
    });

    try {
        worker.setParameters({
            tessedit_char_whitelist: Constants.THUMBNAIL.TEXT.FINDER_CHAR_LIST,
            tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        });
        const image = await Jimp.read(imagePath);

        const res = await worker.recognize(
            await image.grayscale().invert()
                // if even means its the first attempt of each bounding box 
                .contrast(attempt == 2 ? 0.4 : 0.1)
                .getBufferAsync(Jimp.MIME_PNG)
        );

        let coordinates = null;

        res.data.words.forEach(element => {
            if (
                element.direction == Constants.THUMBNAIL.TEXT.DIRECTION &&
                element.text.length >= (attempt == 3 ? 1 : Constants.THUMBNAIL.TEXT.LENGTH) &&
                element.font_size > Constants.THUMBNAIL.TEXT.FONT_SIZE
            ) {
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
            }
        });

        return coordinates;
    } finally {
        await worker.terminate();
    }
};

export const processThumbnail = async (thumbnailUrl: string, id: string, attempt: number = 0): Promise<string> => {
    log(`downloading ${thumbnailUrl}`, true);
    const urlSplits = thumbnailUrl.split('.');
    const extension = urlSplits[urlSplits.length - 1];
    let thumbnailPath = cachePath(`${Constants.CACHE_FOLDERS.THUMBNAIL}/${id}_${attempt}.${extension}`);
    const res = await fetch(thumbnailUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(thumbnailPath, buffer);
    if (extension == Constants.EXTENSIONS.WEBP) {
        const webpPath = thumbnailPath;
        thumbnailPath = thumbnailPath.replace(Constants.EXTENSIONS.WEBP, Constants.EXTENSIONS.PNG);
        await webp.dwebp(webpPath, thumbnailPath, '-o');
        delay(3000);
        unlinkSync(webpPath);
    }

    if (!existsSync(thumbnailPath)) {
        throw new Error('Failed to save thumbnail');
    }

    if (attempt == 4) {
        return thumbnailPath;
    }

    const coordinates = await findThumbnailText(thumbnailPath, attempt);

    if (!coordinates) {
        return thumbnailPath;
    }

    await cropImage(thumbnailPath, coordinates);

    const image = await Jimp.read(thumbnailPath);

    if (
        image.bitmap.width < Constants.THUMBNAIL.MINIMUM_WIDTH &&
        image.bitmap.height < Constants.THUMBNAIL.MINIMUM_HEIGHT
    ) {
        return;
    }

    return thumbnailPath;
};