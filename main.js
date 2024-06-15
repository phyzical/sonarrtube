import { install } from 'source-map-support';
install();

import { ShowSubmitter } from './build/ShowSubmitter.js';

new ShowSubmitter().start();
