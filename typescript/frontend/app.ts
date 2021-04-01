import "formdata-polyfill";
import "./fee";
import "./ux";

// from: https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
// Polyfill for HTMLElement.remove()
((array) => {
  // eslint-disable-next-line unicorn/no-array-for-each
  array.forEach((item) => {
    // eslint-disable-next-line no-prototype-builtins
    if (item.hasOwnProperty("remove")) {
      return;
    }
    Object.defineProperty(item, "remove", {
      configurable: true,
      enumerable: true,
      value: function remove() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (this.parentNode !== null) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          this.remove();
        }
      },
      writable: true,
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
