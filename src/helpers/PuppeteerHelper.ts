const setHtmlInput = (el: Element, v: any): void =>
  ((<HTMLInputElement>el).value = v);

const submitHtmlForm = (form: Element): void => (<HTMLFormElement>form).submit();
const clickHtmlElement = (button: Element): void => (<HTMLFormElement>button).click();
const delay = (time: number): Promise<void> => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

export {
  setHtmlInput,
  submitHtmlForm,
  clickHtmlElement,
  delay
};
