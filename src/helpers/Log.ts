import { config } from '@sonarrTube/helpers/Config.js';

export const log = (message: string, checkVerbosity: boolean = false): void => {
  const { verbose } = config();

  if ((typeof message == 'string' && message.includes('password')) || (checkVerbosity && !verbose)) {
    return;
  }
  console.log(message);
};

