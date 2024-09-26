import { mockConfig } from 'tests/config/jest.setup';

import { videoFactory } from '@sonarrTube/factories/models/api/youtube/Video';
import { Video } from '@sonarrTube/models/api/youtube/Video';
import { Constants } from '@sonarrTube/types/config/Constants';

describe('Video', () => {
    describe('constructor', () => {
        it('should create an instance of Video', () => {
            expect(videoFactory()).toBeInstanceOf(Video);
        });
    });
    describe('cleanDescription', () => {
        it('should return a string', () => {
            const video = videoFactory();
            const result = video.cleanDescription();
            expect(result).toBeString();
        });

        it('limits when longer than 100', () => {
            const video = videoFactory({ description: 'a'.repeat(101) });
            const result = video.cleanDescription();
            expect(result).toBe('a'.repeat(100));
        });

        it('uses title if no description', () => {
            const video = videoFactory({ description: null });
            const result = video.cleanDescription();
            expect(result).toBe(video.cleanTitle());
        });

        it('description includes sponsor uses title', () => {
            const video = videoFactory({ description: 'sponsor' });
            const result = video.cleanDescription();
            expect(result).toBe(video.cleanTitle());
        });
    });
    describe('cleanTitle', () => {
        beforeEach(() => {
            mockConfig({
                titleCleanerRegex: new RegExp('MAGICSTRINGFOR_REPLACING')
            });
        });
        it('should return a string that replaces by regex and isnt longer than 100', () => {
            const video = videoFactory({ fulltitle: 'a'.repeat(101) + 'MAGICSTRINGFOR_REPLACING' });
            const result = video.cleanTitle();
            expect(result).toBe('a'.repeat(100));
        });
    });
    describe('backupTitle', () => {
        it('should return a string', () => {
            const video = videoFactory();
            const result = video.backupTitle();
            expect(result).toBeString();
        });

        it('should return a string that replaces by regex and isnt longer than 100', () => {
            const video = videoFactory({ title: 'a'.repeat(101) + 'MAGICSTRINGFOR_REPLACING' });
            const result = video.backupTitle();
            expect(result).toBe('a'.repeat(100));
        });
    });
    describe('runTime', () => {
        it('should return a rounded number / 60', () => {
            const video = videoFactory({ duration: 121 });
            const result = video.runTime();
            expect(result).toBe('2');
        });

        it('should return 1 if below 1', () => {
            const video = videoFactory({ duration: 1 });
            const result = video.runTime();
            expect(result).toBe('1');
        });
    });
    describe('airedDate', () => {
        it('should return a string in date format', () => {
            const video = videoFactory({ upload_date: '20200102' });
            const result = video.airedDate();
            expect(result).toBe('2020-01-02');
        });
    });
    describe('season', () => {
        it('should return the year as season', () => {
            const video = videoFactory({ upload_date: '20200102' });
            const result = video.season();
            expect(result).toBe(2020);
        });
    });
    describe('url', () => {
        it('should return a string', () => {
            const video = videoFactory();
            const result = video.url();
            expect(result).toBe(`${Constants.YOUTUBE.HOST}/watch?v=${video.id}`);
        });
    });
});