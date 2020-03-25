import "formdata-polyfill";
import "../fee";
import "./ux";

// from: https://developer.mozilla.org/en-US/docs/Web/API/ChildNode/remove
// Polyfill for HTMLElement.remove()
((arr) => {
  arr.forEach((item) => {
    // eslint-disable-next-line no-prototype-builtins
    if (item.hasOwnProperty("remove")) {
      return;
    }
    Object.defineProperty(item, "remove", {
      configurable: true,
      enumerable: true,
      value: function remove() {
        if (this.parentNode !== null) {
          this.parentNode.removeChild(this);
        }
      },
      writable: true,
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
