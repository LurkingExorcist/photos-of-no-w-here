export const spy = () => {
  return (...args: unknown[]) => {
    console.log(...args);
    return args[0];
  };
};
