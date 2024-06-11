import { config } from './Config.js';

const { verbose } = config();
export const log = (message: string, checkVerbosity: boolean = false): void => {
  if (message.includes('password') || (checkVerbosity && !verbose)) {
    return;
  }
  console.log(message);
};

