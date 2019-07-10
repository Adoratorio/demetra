export const validateUrl = (url : string) => {
  const pattern = new RegExp(/^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/);
  return pattern.test(url);
}