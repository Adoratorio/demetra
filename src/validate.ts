export const validateUrl = (url : string) => {
  const pattern = new RegExp(/^(http|https):\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/);
  return pattern.test(url);
}