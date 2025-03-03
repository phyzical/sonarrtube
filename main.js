import { install } from 'source-map-support';
install();

// eslint-disable-next-line no-restricted-imports
import { run } from './build/entry/Runner.js';
await run();