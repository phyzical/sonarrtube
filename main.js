import { install } from 'source-map-support';
install();
import { ShowSubmitter } from './build/ShowSubmitter.js';
import { config } from './build/helpers/Config.js';
const rerunInterval = config().reRunInterval;
let running = false;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const start = async () => {
    if (!running) {
        return;
    }
    running = true;
    await new ShowSubmitter().start();
    console.log(`Next run at ${new Date((new Date()).getTime() + rerunInterval)}`);
    running = false;
};
start();
// eslint-disable-next-line no-undef
setInterval(start, rerunInterval);
