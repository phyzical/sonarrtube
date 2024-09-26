
import { faker } from '@faker-js/faker';

import { Rating } from '@sonarrTube/types/sonarr/Rating';

export const ratingFactory = (): Rating => (
    {
        votes: faker.number.int(),
        value: faker.number.float()
    }
);