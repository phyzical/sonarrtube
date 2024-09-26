import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';

import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

describe('ActionableVideo', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableVideo', () => {
            expect(actionableVideoFactory()).toBeInstanceOf(ActionableVideo);
        });
    });
});