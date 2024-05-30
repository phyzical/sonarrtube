const currentFileTimestamp = (): string => {
  return new Date()
    .toJSON()
    .replace(/T/g, "-")
    .replace(/Z/g, "")
    .replace(/:/g, "_")
    .split(".")[0];
};

export { currentFileTimestamp };
