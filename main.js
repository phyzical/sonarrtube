import { install } from 'source-map-support';
install();

import { run } from './build/Runner.js';
await run();