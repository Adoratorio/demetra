export const validateUrl = (url : string) => {
  const pattern = new RegExp(/^(http|https):\/\/[\w\-\.]*(:[0-9]+)?\/?(api)*(\.php)*$/i);
  return pattern.test(url);
}