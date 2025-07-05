import {ButtonClassNames} from './class-names.js';

class Button extends HTMLButtonElement {
  static observedAttributes = ['label'];

  // Start by calling 'super()' to establish the correct prototype chain.
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }

  connectedCallback() {
    console.log('Custom element has been added to the page.');

    const text = this.getAttribute('label');
    this.textContent = text;
    this.className = ButtonClassNames.root;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(
      `Attribute ${name} has changed from ${oldValue} to ${newValue}.`,
    );
  }
}

customElements.define('my-button', Button, {extends: 'button'});
