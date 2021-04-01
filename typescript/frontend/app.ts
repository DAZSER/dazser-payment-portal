/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import "formdata-polyfill";
import "./fee";
import "./ux";

// from: https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
// Polyfill for HTMLElement.remove()
((array) => {
  array.forEach((item) => {
    // eslint-disable-next-line no-prototype-builtins
    if (item.hasOwnProperty("remove")) {
      return;
    }
    Object.defineProperty(item, "remove", {
      configurable: true,
      enumerable: true,
      value: function remove() {
        if (this.parentNode !== null) {
          this.remove();
        }
      },
      writable: true,
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
