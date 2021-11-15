/* solve problem when search , every letter write in search box send request 
   this is not the best practies 
   you should send one request after write all letters(word)
   How ? used debounce function by me 
   note : there is library contain debounce called lodash
   */
export function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, time);
  };
}
