import { config } from '@sonarrTube/helpers/Config';
import { log } from '@sonarrTube/helpers/Log';

describe('Log', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => null);
        const orginalConfig = config();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        jest.spyOn(require('@sonarrTube/helpers/Config'), 'config').mockImplementation(() => ({
            ...orginalConfig,
            verbose: false,
        }));
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
                const orginalConfig = config();
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                jest.spyOn(require('@sonarrTube/helpers/Config'), 'config').mockImplementation(() => ({
                    ...orginalConfig,
                    verbose: true,
                }));
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