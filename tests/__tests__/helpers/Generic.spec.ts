import { currentFileTimestamp, getYoutubeDelayString, handleSignal } from '@sonarrTube/helpers/Generic';
import { consoleSpy, processSpy } from '@sonarrTube/mocks/Spies';

describe('currentFileTimestamp', () => {
    it('should return a string in the format of a timestamp', () => {
        const result = currentFileTimestamp();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/\d{4}-\d{2}-\d{2}-\d{2}_\d{2}_\d{2}/);
    });
});

describe('handleSignal', () => {

    it('should log a message', () => {
        handleSignal('SIGINT');
        expect(consoleSpy).toHaveBeenCalledWith('Received SIGINT. Graceful shutdown...');
        expect(processSpy).toHaveBeenCalledWith(0);
    });
});

describe('getYoutubeDelayString', () => {
    it('should return a string in the format of a date without timestamp', () => {
        const result = getYoutubeDelayString();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/\d{4}\d{2}\d{2}/);
    });
});
