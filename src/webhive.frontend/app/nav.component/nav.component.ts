const styles = document.createElement('style');
styles.textContent = require('./nav.component.css');

const template = document.createElement('template');
template.innerHTML = require('./nav.component.html');

export class NavComponent extends HTMLElement {

    /**
     * Return an array containing the names of the attributes you want to observe.
     */
    static get observedAttributes() {
        return [];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    private get shadow() {
        if (!this.shadowRoot) {
            throw new Error('shadowRoot is null');
        }
        return this.shadowRoot;
    }

    /**
     * Invoked each time the custom element is appended into a document-connected element.
     * This will happen each time the node is moved, and may happen before the element's contents
     * have been fully parsed
     */
    connectedCallback() {
        if (!this.shadow.firstChild) {
            this.shadow.appendChild(styles.cloneNode(true));
            const element = document.importNode(template.content, true).firstElementChild;
            this.shadow.appendChild(<Node>element);
        }
        this.shadow.addEventListener('click', this);
    }

    /**
     * Invoked each time the custom element is disconnected from the document's DOM.
     */
    disconnectedCallback() {
        this.shadow.removeEventListener('click', this);
    }

    /**
     * Invoked each time one of the custom element's attributes is added, removed, or changed.
     * Which attributes to notice change for is specified in a static get observedAttributes method
     */
    attributeChangedCallback(name, oldValue, newValue) {

    }

    handleEvent(event: Event) {
        const anchor = (event.target as HTMLAnchorElement);
        if (event.type === 'click' && anchor && anchor.nodeName === 'A') {
            const detail = { href: anchor.getAttribute('href') };
            window.dispatchEvent(new CustomEvent('navigate', { detail }));
            event.preventDefault();
        }
    }

}

customElements.define('nav-component', NavComponent);
