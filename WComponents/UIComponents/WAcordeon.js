//@ts-check
import { html } from "../../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../../WModules/WOrtograficValidation.js";
import { css } from "../../WModules/WStyledRender.js";
/**
 * @typedef {Object} Config 
    * @property {Function} [action]
    * @property {boolean} [displayed]
    * @property {HTMLStyleElement|Node} [CustomStyle]
    * @property {Array<{ name: String; content: String|HTMLElement|Node}>} [Dataset]
**/
class WAcorden extends HTMLElement {

    /**
    * @param {Config} Config 
    */
    constructor(Config) {
        super();
        this.Config = Config;
        this.attachShadow({ mode: 'open' });
        if (Config.CustomStyle) {
            this.shadowRoot?.append(Config.CustomStyle.cloneNode(true))
        }
        this.Acordeon = html`<div class="accordion"></div>`;
        this.shadowRoot?.append(this.CustomStyle, this.Acordeon);
        this.Draw();

    }
    connectedCallback() { }
    Draw = async () => {
        this.Config.Dataset?.forEach(element => {
            const isActive = !!this.Config.displayed;
            const content = html`<div class="element-content ${isActive ? "active" : ""}" 
                id="content_${element.name?.toString().replaceAll(" ", "")}">
                ${element.content}
            </div>`;

            const button = html`<div class="accordion-button ${isActive ? "active-btn" : ""}">
                ${element.name}
            </div>`;

            button.addEventListener("click", () => {
                const isOpen = content.classList.contains("active");
                content.classList.toggle("active", !isOpen);
                button.classList.toggle("active-btn", !isOpen);
            });

            this.Acordeon?.append(html`<div class="element-container">
                ${button}
                ${content}
            </div>`);
        });
    }

    update() {
        this.Draw();
    }
    CustomStyle = css`
@import url(/css/variables.css);

* {
    font-family: Montserrat, sans-serif;
    box-sizing: border-box;
}

.accordion {
    border-radius: 14px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8e8e8;
}

.element-container {
    border-bottom: 1px solid #ececec;
    transition: background-color 0.3s ease;
}

.element-container:last-child {
    border-bottom: none;
}

.element-container:hover {
    background-color: #fafbfc;
}

.accordion-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 22px;
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    cursor: pointer;
    user-select: none;
    text-transform: capitalize;
    transition: all 0.3s ease;
    position: relative;
}

.accordion-button::after {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-right: 2.5px solid #6c757d;
    border-bottom: 2.5px solid #6c757d;
    transform: rotate(45deg);
    transition: transform 0.35s ease, border-color 0.3s ease;
    margin-left: 12px;
    flex-shrink: 0;
}

.accordion-button:hover {
    color:  #4a6cf7;
}

.accordion-button:hover::after {
    border-color:  #4a6cf7;
}

.accordion-button.active-btn {
    background: linear-gradient(90deg, rgba(74,108,247,0.06) 0%, rgba(74,108,247,0) 100%);
}

.accordion-button.active-btn::after {
    transform: rotate(-135deg);
    border-color: var(--secundary-color, #4a6cf7);
}

.element-content {
    max-height: 0;
    overflow: hidden;
    padding: 0 22px;
    color: #4a5568;
    font-size: 0.95rem;
    line-height: 1.6;
    transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                padding 0.45s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.3s ease;
    opacity: 0;
}

.element-content.active {
    max-height: 1000px; /* ajusta si tienes contenido muy largo */
    padding: 18px 22px 22px 22px;
    opacity: 1;
}

/* ---- Detalle interno ---- */
.detail-content {
    display: flex;
    flex-direction: column;
    border: 1px solid #eef0f3;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
}

.detail-content .container {
    display: flex;
    flex: 1;
}

.detail-content .container .element-description {
    flex: 1;
    display: grid;
    grid-template-rows: 50% 50%;
}

.detail-content .container .element-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min-content, 1fr));
    flex: 3;
}

.detail-content .container .element-details .element-detail {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.header {
    flex: 1;
    padding: 12px 14px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    background-color: var(--secundary-color, #4a6cf7);
    color: #fff;
}

.value {
    flex: 1;
    padding: 12px 14px;
}

.container:nth-of-type(even) {
    background-color: #f9fafb;
}

.hidden { display: none; }

@media (max-width: 800px) {
    .detail-content .container,
    .detail-content .element-details {
        flex-direction: column;
    }
    .hidden { display: block; }
    .element-detail { flex-direction: row; }
    .accordion-button { padding: 14px 16px; font-size: 0.95rem; }
}
`
}
customElements.define('w-acordeon', WAcorden);
export { WAcorden }