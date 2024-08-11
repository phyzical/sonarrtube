import { config } from '@sonarrTube/helpers/Config';
import { notify } from '@sonarrTube/helpers/Notifications';


describe('Notifications', () => {
    let consoleSpy: jest.SpyInstance;
    let doRequest: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => null);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        doRequest = jest.spyOn(require('@sonarrTube/helpers/Requests'), 'doRequest').mockImplementation(() => null);
    });

    it('should log message', () => {
        notify('test');
        expect(consoleSpy).toHaveBeenCalledWith('test');
        expect(doRequest).not.toHaveBeenCalled();
    });

    describe('with webhook', () => {
        beforeEach(() => {
            const orginalConfig = config();
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            jest.spyOn(require('@sonarrTube/helpers/Config'), 'config').mockImplementation(() => ({
                ...orginalConfig,
                notificationWebhook: 'http://localhost',
            }));
        });

        it('should log message', () => {
            notify('test');
            expect(consoleSpy).toHaveBeenCalledWith('test');
            expect(doRequest).toHaveBeenCalledWith('http://localhost', 'POST',
                { 'Content-Type': 'application/json' }, undefined,
                // eslint-disable-next-line max-len
                '{"content":"test","username":"sonarrTubeBot","avatar_url":" https://github.com/phyzical/sonarrtube/blob/main/logo.png"}',
            );
        });
    });
});