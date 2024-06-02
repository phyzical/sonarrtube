import { install } from 'source-map-support';
import { ShowSubmitter } from './build/ShowSubmitter.js';

install();
new ShowSubmitter().start();
