
import { consoleSpy, mockConfig } from 'tests/config/jest.setup';

import { log } from '@sonarrTube/helpers/Log';

describe('Log', () => {
    beforeEach(() => {
        mockConfig({ verbose: false });
        consoleSpy.mockClear();
    });

    it('should log message', () => {
        log('test');
        expect(consoleSpy).toHaveBeenCalledWith('test');
    });

    it('should not log message if message contains password', () => {
        log('password');
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    describe('with verbosity', () => {
        describe('with verbosity', () => {
            beforeEach(() => {
                mockConfig({ verbose: true });
            });

            it('should log message if verbose is true', () => {
                log('test', true);
                expect(consoleSpy).toHaveBeenCalledWith('test');
            });
        });


        it('should not log message if verbose is false', () => {
            log('test', true);
            expect(consoleSpy).not.toHaveBeenCalled();
        });
    });
});