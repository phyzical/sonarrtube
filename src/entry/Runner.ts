import { ShowSubmitter } from '@sonarrTube/entry/ShowSubmitter.js';
import { config } from '@sonarrTube/helpers/Config.js';
import { handleSignal } from '@sonarrTube/helpers/Generic.js';

export const run = async (): Promise<void> => {
  const rerunInterval = config().reRunInterval;
  const nextRunTime = (): Date => new Date((new Date()).getTime() + rerunInterval);

  // Listen for termination signals
  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);

  let nextRun = nextRunTime();
  let running = false;
  const start = async (): Promise<void> => {

    if (running) {
      return;
    }
    running = true;
    nextRun = nextRunTime();
    await new ShowSubmitter().start();
    console.log(`Next run at ${nextRun}`);
    running = false;
  };

  start();

  setInterval(start, rerunInterval);
};