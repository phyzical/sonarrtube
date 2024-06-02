const verbose = false;
export const log = (message: string, checkVerbosity: boolean = false): void => {
  if (!checkVerbosity || verbose) console.log(message);
};

