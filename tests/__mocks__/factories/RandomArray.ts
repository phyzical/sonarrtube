
export const generateRandomArray = (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    generator: Function = () => Math.floor(Math.random() * 100),
    min: number = 3,
    max: number = 10
): unknown[] =>
    Array.from({ length: Math.floor(Math.random() * (max - min + 1)) + min }, () => generator());