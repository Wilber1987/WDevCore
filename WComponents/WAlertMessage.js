//@ts-check

import { html } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";


export class WAlertMessage extends HTMLElement {
    /**
    * conecta un nuevo alert en el document body
    * @param {{ Message: String, CloseOption?:  Boolean, Direction?: String , Temporal?: Boolean, Type?: String }} Config 
    */
    static Connect(Config) {
        document.body.appendChild(new WAlertMessage(Config));
    }
    /**
    * @param {{ Message: String, CloseOption?:  Boolean, Direction?: String , Temporal?: Boolean, Type?: String }} Config 
    */
    constructor(Config) {
        super();
        this.attachShadow({ mode: 'open' });
        this.visible = true;
        this.Message = Config.Message;
        this.CloseOption = Config.CloseOption ?? true;
        this.Direction = Config.Direction ?? 'top';
        this.Temporal = Config.Temporal ?? false;
        this.Type = Config.Type ?? 'info';
    }

    connectedCallback() {
        this.Draw();
        if (this.Temporal) {
            setTimeout(() => this.Close(), 10000);
        }
    }
    Close() {
        this.remove();
    }

    Draw() {
        if (!this.visible || !this.Message) {
            // @ts-ignore
            this.shadowRoot.innerHTML = '';
            return;
        }
        const template = html`<div class="alerta ${this.Direction} ${this.Type}">
            ${this.CustomStyles}
            <span>${this.Message}</span>
            ${this.CloseOption ? html`<button onclick="${() => this.Close()}">&times;</button>` : ''}
        </div>`;
        this.shadowRoot?.append(template);
    }
    CustomStyles = css`
     .alerta {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 1.5rem;
        border-radius: 0.25rem;
        box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
        z-index: 9999;
        max-width: 80%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: fadeIn 0.3s ease-out;
        font-family: sans-serif;
    }

    .top {
        top: 1rem;
    }

    .bottom {
        bottom: 1rem;
    }

    .alerta.danger {
        background-color: #fdeff0;
        color: #a50515;       
        border: 0px solid #f5c6cb; border-left: 20px solid  #a50515;
    }

    .alerta.success {
        background-color: #ebfcef;
        color: #02b12b;        
        border: 0px solid #c3e6cb;border-left: 20px solid  #02b12b;
    }

    .alerta.warning {
        background-color: #fffcf1;
        color: #df5c11;       
        border: 0px solid #ffeeba; border-left: 20px solid  #df5c11;
    }

    .alerta.info {
        background-color: #ecfcff;
        color: #005396;        
        border: 0px solid #bee5eb;border-left: 20px solid  #005396;
    }

    button {
        background: none;
        border: none;
        font-size: 1.2rem;
        color: inherit;
        cursor: pointer;
        margin-left: 1rem;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    `;
    /** limpia todas las alertas del nodo enviado o del documenro 
    * @param {Document | HTMLElement} [node] 
    */
    static Clear(node = document) {
        node.querySelectorAll("w-alert-mensaje").forEach(a => a.remove());
    }
}

customElements.define('w-alert-mensaje', WAlertMessage);

