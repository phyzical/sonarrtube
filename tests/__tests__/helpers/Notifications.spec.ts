import { consoleSpy, doRequestSpy, mockConfig } from 'tests/config/jest.setup';

import { notify } from '@sonarrTube/helpers/Notifications';

describe('Notifications', () => {

    it('should log message', () => {
        notify('test');
        expect(consoleSpy).toHaveBeenCalledWith('test');
        expect(doRequestSpy).not.toHaveBeenCalled();
    });

    describe('with webhook', () => {
        beforeEach(() => {
            mockConfig(
                {
                    notificationWebhook: 'http://localhost',
                }
            );
        });

        it('should log message', () => {
            notify('test');
            expect(consoleSpy).toHaveBeenCalledWith('test');
            expect(doRequestSpy).toHaveBeenCalledWith('http://localhost', 'POST',
                { 'Content-Type': 'application/json' }, undefined,
                // eslint-disable-next-line max-len
                '{"content":"test","username":"sonarrTubeBot","avatar_url":" https://github.com/phyzical/sonarrtube/blob/main/logo.png"}',
            );
        });
    });
});