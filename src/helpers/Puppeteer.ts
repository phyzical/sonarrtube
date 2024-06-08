// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const setHtmlInput = (el: Element, v: any): void => ((<HTMLInputElement>el).value = v);

export const submitHtmlForm = (form: Element): void => (<HTMLFormElement>form).submit();
export const clickHtmlElement = (button: Element): void => (<HTMLFormElement>button).click();
export const delay = (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

