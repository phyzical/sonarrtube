import { config } from './Config.js';

const { verbose } = config();
export const log = (message: string, checkVerbosity: boolean = false): void => {
  if (!checkVerbosity || verbose) { console.log(message); }
};

