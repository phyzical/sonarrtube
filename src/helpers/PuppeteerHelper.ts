// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
const setHtmlInput = (el: Element, v: any): void => ((<HTMLInputElement>el).value = v);

const submitHtmlForm = (form: Element): void => (<HTMLFormElement>form).submit();
const clickHtmlElement = (button: Element): void => (<HTMLFormElement>button).click();
const delay = (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export { setHtmlInput, submitHtmlForm, clickHtmlElement, delay };
