//@ts-check
import { html } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";

export class WCardDetailV1 extends HTMLElement {
    /**
     * @typedef {Object} ComponentsConfig 
        * @property {String?} [Title] 
        * @property {String?} [Body] 
        * @property {String?} [Color] 
        * @property {String?} [Image]
        * @property {Array<{ name: string, action: Function}>?} [Actions]  
    **/
    /**
    * @param {ComponentsConfig} Config 
    */
    constructor(Config = {}) {
        super();
        this.Config = Config;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.append(this.CustomStyle);
        this.Draw();
    }
    connectedCallback() { }
    Draw = () => {
        const card = html`<div class="task">
           <div class="tags">
                <img class="img-cover" src="${this.Config.Image ?? "carBackground.jpg"}">
                <div class="viewer">
                    <span class="tag" style="background-color: ${this.Config.Color ? this.Config.Color : " rgb(106, 27,154)"};">${this.Config.Title}</span>
                    <button class="options">
                        <div>
                            <svg xml:space="preserve" viewBox="0 0 41.915 41.916" xmlns:xlink="http://www.w3.org/1999/xlink"
                                xmlns="http://www.w3.org/2000/svg" id="Capa_1" version="1.1" fill="#000000">
                                <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
                                <g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <g>
                                        <g>
                                            <path
                                                d="M11.214,20.956c0,3.091-2.509,5.589-5.607,5.589C2.51,26.544,0,24.046,0,20.956c0-3.082,2.511-5.585,5.607-5.585 C8.705,15.371,11.214,17.874,11.214,20.956z">
                                            </path>
                                            <path
                                                d="M26.564,20.956c0,3.091-2.509,5.589-5.606,5.589c-3.097,0-5.607-2.498-5.607-5.589c0-3.082,2.511-5.585,5.607-5.585 C24.056,15.371,26.564,17.874,26.564,20.956z">
                                            </path>
                                            <path
                                                d="M41.915,20.956c0,3.091-2.509,5.589-5.607,5.589c-3.097,0-5.606-2.498-5.606-5.589c0-3.082,2.511-5.585,5.606-5.585 C39.406,15.371,41.915,17.874,41.915,20.956z">
                                            </path>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
            <p class=""> ${this.Config.Body}</p>
            <div class="stats">
                ${this.Config.Actions?.map(action => html`<a onclick="${(/** @type {any} */ ev) => { action.action(ev) }}">${action.name}</a>`)}
            </div>
        </div>`
        this.shadowRoot?.append(card)
    }

    update() {
        this.Draw();
    }
    CustomStyle = css`
        .component{
            display: block;
        }  
        .task {
            position: relative;
            color: #2e2e2f;
            background-color: var(--secundary-color);
            overflow: hidden;
            border-radius: 8px;
            box-shadow: rgba(99, 99, 99, 0.1) 0px 2px 8px 0px;
            border: 3px dashed transparent;
            min-width: 340px;
            border: solid #e6e6e6 1px;
            min-height: 220px;
            display: grid;
            grid-template-rows: 80px 100px 40px;
            gap: 5px;
        }
        .labelheader {
            margin: 0px 10px;
            display: block;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
            z-index: 1;
            color: #fff;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px;
            border-radius: 10px;
        }

        .task p {
            font-size: 13px;
            margin: 0px 10px;           
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            z-index: 1;
            color: #fff;
            background-color: rgba(0, 0, 0, 0.4);
            padding: 10px;
            border-radius: 10px;
            height: 40px;
        }

        .task:hover {
            box-shadow: rgba(99, 99, 99, 0.3) 0px 2px 8px 0px;
            border-color: rgba(162, 179, 207, 0.2) !important;
        }

        .tag {
            border-radius: 100px;
            padding: 4px 13px;
            font-size: 0.8rem;
            font-weight: bold;
            color: #ffffff;
            background-color: #1389eb;
            display: -webkit-box;
            -webkit-line-clamp: 2; /* Limitar a 2 líneas */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 300px;
        }

        .tags {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
        }
        .tags .img-cover {
            position: absolute;
            width: 100%;
            height: 180px;
            top: 0;
            left: 0;   
            object-fit: cover;       
        }

        .options {
            background: transparent;
            border: 0;
            color: #c4cad3;
            font-size: 17px;
        }

        .options svg {
            fill: #9fa4aa;
            width: 20px;
        }

        .stats {
            position: relative;
            width: -webkit-fill-available;
            color: #9fa4aa;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;  
            padding: 10px;      
        }
        .viewer {
            justify-content: space-between;
            display: flex;
            width: -webkit-fill-available;
            align-items: center;
            z-index: 1;
            margin: 10px;
        }
        .stats div {
            margin-right: 1rem;
            height: 20px;
            display: flex;
            align-items: center;
            cursor: pointer;
            width: 100%;
            gap: 10px;
        }
        .stats div a{
            transition: all 0.5s;
        }
        .stats div a:hover{
            color: #2e2e2f;
        }

        .stats svg {
            margin-right: 5px;
            height: 100%;
            stroke: #9fa4aa;
        }

        .viewer .img-participantes {
            height: 30px;
            width: 30px;
            background-color: rgb(28, 117, 219);
            margin-right: -10px;
            border-radius: 50%;
            border: 1px solid #fff;
            display: grid;
            align-items: center;
            text-align: center;
            font-weight: bold;
            color: #fff;
            padding: 2px;
        }

        .viewer span svg {
            stroke: #fff;
        }                
     `
}
customElements.define('w-card-v1', WCardDetailV1);