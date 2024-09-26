import { generateRandomArray } from '@sonarrTube/factories/RandomArray';
import { Companies } from '@sonarrTube/types/tvdb/Companies';
import { Company } from '@sonarrTube/types/tvdb/Company';
import { companyFactory } from '@sonarrTube/factories/models/api/tvdb/Company';

export const companiesFactory = (): Companies => (
    {
        studio: generateRandomArray(() => companyFactory()) as Company[],
        network: generateRandomArray(() => companyFactory()) as Company[],
        production: generateRandomArray(() => companyFactory()) as Company[],
        distributor: generateRandomArray(() => companyFactory()) as Company[],
        special_effects: generateRandomArray(() => companyFactory()) as Company[],
    }
);