//@ts-check
import { html, WRender } from "../../WModules/WComponentsTools.js"
import { css } from "../../WModules/WStyledRender.js"

/**
 * @typedef {Object} ToolbarCommand
 * @property {string} commandName - Nombre del comando execCommand
 * @property {string} [class] - Clase CSS para el botón
 * @property {string} label - Texto o etiqueta del botón
 * @property {string} type - "button" | "color" | "select"
 * @property {string} event - "onclick" | "onchange"
 * @property {any} [value] - Valor adicional para el comando
 */

/**
 * @typedef {Object} ToolbarConfig
 * @property {boolean} [showTableBuilder] - Mostrar botón de tabla
 * @property {boolean} [showHtmlEditor] - Mostrar botón de editor HTML
 * @property {boolean} [showImageInput] - Mostrar input de imagen URL
 * @property {boolean} [showParamInput] - Mostrar input de parámetros
 * @property {boolean} [showFontSize] - Mostrar selector de tamaño de fuente
 * @property {boolean} [showFontColor] - Mostrar selector de color de fuente
 * @property {ToolbarCommand[]} [customCommands] - Comandos personalizados adicionales
 * @property {HTMLTextAreaElement} [htmlEditor]
 */

class WRichTextToolbar extends HTMLElement {

    /**
     * @param {ToolbarConfig} [config]
     */
    constructor(config = {}) {
        super();
        this.config = {
            showTableBuilder: true,
            showHtmlEditor: true,
            showImageInput: true,
            showParamInput: false,
            showFontSize: true,
            showFontColor: true,
            showFontFamily: true,
            //showLineHeight: true,
            ...config
        };
        this.htmlEditor = config.htmlEditor
        this.style.display = "block";
        this.DrawComponent();
    }

    DrawComponent = async () => {
        this.innerHTML = "";
        this.append(WRichTextToolbarStyle.cloneNode(true));
        this.DrawOptions();
    }

    DrawOptions() {
        const OptionsSection = WRender.Create({
            tagName: "section", class: "WOptionsSection"
        });

        // Comandos por defecto
        const defaultCommands = [
            { commandName: "bold", class: "bold", label: "B", type: "button", event: "onclick" },
            { commandName: "italic", class: "italic", label: "I", type: "button", event: "onclick" },
            { commandName: "underline", class: "underline", label: "U", type: "button", event: "onclick" },
            { commandName: "insertUnorderedList", class: "list", label: "", type: "button", event: "onclick" },
            { commandName: "justifyLeft", class: "left", label: "", type: "button", event: "onclick" },
            { commandName: "justifyCenter", class: "center", label: "", type: "button", event: "onclick" },
            { commandName: "justifyRight", class: "right", label: "", type: "button", event: "onclick" },
        ];

        const commands = [...defaultCommands, ...(this.config.customCommands || [])];

        commands.forEach(command => {
            let CommandBtn = WRender.Create({
                tagName: "button",
                className: "ROption tooltipRitchOption tooltipRitchOptionBtn " + (command.class || ""),
                type: command.type,
                id: "ROption" + command.commandName,
                title: command.commandName,
                innerText: command.label || ""
            });

            // Icons SVG para comandos específicos
            if (command.class == "list") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 1H1V3H3V1Z" fill="#000000"></path> <path d="M3 5H1V7H3V5Z" fill="#000000"></path> <path d="M1 9H3V11H1V9Z" fill="#000000"></path> <path d="M3 13H1V15H3V13Z" fill="#000000"></path> <path d="M15 1H5V3H15V1Z" fill="#000000"></path> <path d="M15 5H5V7H15V5Z" fill="#000000"></path> <path d="M5 9H15V11H5V9Z" fill="#000000"></path> <path d="M15 13H5V15H15V13Z" fill="#000000"></path> </g></svg>`);
            } else if (command.class == "left") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 1H1V3H11V1Z" fill="#000000"></path> <path d="M1 5H15V7H1V5Z" fill="#000000"></path> <path d="M11 9H1V11H11V9Z" fill="#000000"></path> <path d="M15 13H1V15H15V13Z" fill="#000000"></path> </g></svg>`);
            } else if (command.class == "center") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 1H3V3H13V1Z" fill="#000000"></path> <path d="M1 5H15V7H1V5Z" fill="#000000"></path> <path d="M13 9H3V11H13V9Z" fill="#000000"></path> <path d="M15 13H1V15H15V13Z" fill="#000000"></path> </g></svg>`);
            } else if (command.class == "right") {
                CommandBtn.appendChild(html`<svg viewBox="0 -5 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 1H5V3H15V1Z" fill="#000000"></path> <path d="M1 5H15V7H1V5Z" fill="#000000"></path> <path d="M15 9H5V11H15V9Z" fill="#000000"></path> <path d="M15 13H1V15H15V13Z" fill="#000000"></path> </g></svg>`);
            }

            // @ts-ignore
            CommandBtn[command.event] = () => {
                console.log("command.event");
                const ROption = this.querySelector("#ROption" + command.commandName);
                // @ts-ignore
                document.execCommand(command.commandName, false, ROption.value);

            };

            OptionsSection.append(WRender.Create({
                class: "tooltipRitchOption",
                children: [CommandBtn, { tagName: "span", class: "tooltipRitchOptiontext", children: [command.commandName] }]
            }));
        });

        // Botón de Tabla
        if (this.config.showTableBuilder) {
            const tableBtn = html`<div onclick="${() => this.DisplayTableBuilder()}" class="tableBtn ROption tooltipRitchOption tooltipRitchOptionBtn">${this.tableBuilder}
                <svg  viewBox="0 0 20 20"><path d="M3 6v3h4V6H3zm0 4v3h4v-3H3zm0 4v3h4v-3H3zm5 3h4v-3H8v3zm5 0h4v-3h-4v3zm4-4v-3h-4v3h4zm0-4V6h-4v3h4zm1.5 8a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 17V4c.222-.863 1.068-1.5 2-1.5h13c.932 0 1.778.637 2 1.5v13zM12 13v-3H8v3h4zm0-4V6H8v3h4z"></path></svg>
                <svg  viewBox="0 0 10 10"><path d="M.941 4.523a.75.75 0 1 1 1.06-1.06l3.006 3.005 3.005-3.005a.75.75 0 1 1 1.06 1.06l-3.549 3.55a.75.75 0 0 1-1.168-.136L.941 4.523z"></path></svg>
            </div>`
            tableBtn.addEventListener('mousedown', (e) => {
                //this.#saveSelectionContainer()
            }, { capture: true });
            OptionsSection.append(tableBtn)
        }

        // Botón de Editor HTML
        if (this.config.showHtmlEditor) {
            OptionsSection.append(html`<div onclick="${() => this.ToggleHtmlEditor()}" class="htmlBtn ROption tooltipRitchOption tooltipRitchOptionBtn">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M4 16v-2H2v2H1v-5h1v2h2v-2h1v5H4zM7 16v-4H5.6v-1h3.7v1H8v4H7zM10 16v-5h1l1.4 3.4h.1L14 11h1v5h-1v-3.1h-.1l-1.1 2.5h-.6l-1.1-2.5H11V16h-1zM19 16h-3v-5h1v4h2v1zM9.4 4.2L7.1 6.5l2.3 2.3-.6 1.2-3.5-3.5L8.8 3l.6 1.2zm1.2 4.6l2.3-2.3-2.3-2.3.6-1.2 3.5 3.5-3.5 3.5-.6-1.2z"></path> </g> </g></svg>
            </div>`);
        }

        // Selector de Tamaño de Fuente
        if (this.config.showFontSize) {
            OptionsSection.append(WRender.Create({
                class: "tooltipRitchOption",
                children: [
                    WRender.Create({
                        tagName: "select",
                        className: "ROption font-select",
                        onchange: (/** @type {{ target: { value: number; }; }} */ ev) => this.changeFontSize(ev.target.value),
                        children: [
                            { tagName: "option", value: 3, innerText: "A" },
                            { tagName: "option", value: 1, innerText: "8 px" },
                            { tagName: "option", value: 2, innerText: "10 px" },
                            { tagName: "option", value: 3, innerText: "12 px" },
                            { tagName: "option", value: 4, innerText: "14 px" },
                            { tagName: "option", value: 5, innerText: "18 px" },
                            { tagName: "option", value: 6, innerText: "24 px" },
                            { tagName: "option", value: 7, innerText: "32 px" },
                        ]
                    })
                ]
            }));
        }

        // === 👉 NUEVO: Selector de Tipo de Fuente (Font Family) ===
        if (this.config.showFontFamily) {
            OptionsSection.append(WRender.Create({
                class: "tooltipRitchOption",
                children: [
                    WRender.Create({
                        tagName: "select",
                        className: "ROption font-type-select",
                        innerHTML: `<option value="Arial"><strong style="font-size: 18px; font-weight: bold">ƒ</strong> - Fuente</option>
                           <option value="Arial">Arial</option>
                           <option value="Verdana">Verdana</option>
                           <option value="Times New Roman">Times New Roman</option>
                           <option value="Courier New">Courier New</option>
                           <option value="Georgia">Georgia</option>
                           <option value="Tahoma">Tahoma</option>
                           <option value="Trebuchet MS">Trebuchet MS</option>
                           <option value="Impact">Impact</option>`,
                        onchange: (/** @type {{ target: { value: string; }; }} */ ev) => this.changeFontFamily(ev.target.value),
                    })
                ]
            }));
        }

        // // === 👉 NUEVO: Selector de Interlineado (Line Height) ===
        // if (this.config.showLineHeight) {
        //     OptionsSection.append(WRender.Create({
        //         class: "tooltipRitchOption",
        //         children: [
        //             WRender.Create({
        //                 tagName: "select",
        //                 className: "ROption font-select",
        //                 innerHTML: `<option value="1">📏 Interlineado</option>
        //                    <option value="1">Simple (1.0)</option>
        //                    <option value="1.15">1.15</option>
        //                    <option value="1.5" selected>1.5 líneas</option>
        //                    <option value="2">Doble (2.0)</option>
        //                    <option value="2.5">2.5</option>
        //                    <option value="3">Triple (3.0)</option>`,
        //                 onchange: (/** @type {{ target: { value: number; }; }} */ ev) => this.changeLineHeight(ev.target.value),
        //             })
        //         ]
        //     }));
        // }

        // Selector de Color de Fuente
        if (this.config.showFontColor) {
            OptionsSection.append(WRender.Create({
                class: "tooltipRitchOption",
                children: [
                    WRender.Create({
                        tagName: "input",
                        className: "ROption font-select",
                        type: "color",
                        onchange: (/** @type {{ target: { value: String; }; }} */ ev) => this.changeFontColor(ev.target.value),
                    })
                ]
            }));
        }

        // Input de Imagen URL
        if (this.config.showImageInput) {
            const ImageContainer = html`<div class="ToolWithInputContainer tooltipRitchOption">            
                <button class="ROption tooltipRitchOptionBtn insert-image-btn" title="Insertar Imagen (URL)" 
                    onclick="${(/** @type {{ preventDefault: () => void; }} */ e) => {
                    e.preventDefault();
                    const input = this.querySelector(".image-url-input");
                    // @ts-ignore
                    const isHidden = input.style.display !== "inline-block";
                    // @ts-ignore
                    input.style.display = !isHidden ? "none" : "inline-block";
                    if (isHidden) {
                        // @ts-ignore
                        input.focus();
                    }
                }}"> 
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H15V15H1V1ZM6 9L8 11L13 6V13H3V12L6 9ZM6.5 7C7.32843 7 8 6.32843 8 5.5C8 4.67157 7.32843 4 6.5 4C5.67157 4 5 4.67157 5 5.5C5 6.32843 5.67157 7 6.5 7Z" fill="#000000"></path> </g></svg>          
            </button>
            <input type= "url" style="display:none" placeholder= "Image URL" class="ROption tool-input image-url-input"  onkeypress="${(/** @type {{ key: string; preventDefault: () => void; target: { value: string; style: { display: string; }; }; }} */ e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.insertImage(e.target.value);
                        // @ts-ignore
                        e.target.value = "";
                        // @ts-ignore
                        e.target.style.display = "none";
                    }
                }}">
        </div>`
            OptionsSection.append(ImageContainer);
        }

        // Input de Parámetro
        if (this.config.showParamInput) {
            const ParamContainer = html`<div class="ToolWithInputContainer tooltipRitchOption">
                <button class="ROption  tooltipRitchOptionBtn bold" title="Insertar el nombre del parámetro" onclick="${(/** @type {{ preventDefault: () => void; }} */ e) => {
                    e.preventDefault();
                    const input = this.querySelector(".param-input");
                    // @ts-ignore
                    const isHidden = input.style.display !== "inline-block";
                    // @ts-ignore
                    input.style.display = !isHidden ? "none" : "inline-block";
                    if (isHidden) {
                        // @ts-ignore
                        input.focus();
                    }
                }}">P</button>
            <input type= "text" placeholder= "Nombre del parámetro" class="ROption tool-input param-input" onkeypress="${(/** @type {{ key: string; preventDefault: () => void; target: { value: string; style: { display: string; }; }; }} */ e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const paramValue = e.target.value.trim();
                        console.log(paramValue);

                        // 1. Ocultar y limpiar el input
                        e.target.value = "";
                        e.target.style.display = "none";
                        if (paramValue) {
                            // 3. Devolver el foco al editor (necesario para execCommand)
                            this.savedSelection?.focus();
                            // 4. Insertar el texto en la posición restaurada
                            const formattedText = `{{ ${paramValue} }}`;
                            document.execCommand("insertText", false, formattedText);
                            this.savedSelection?.dispatchEvent(new Event('input'));
                        } else {
                            // Si no hay valor, solo asegura el foco
                            this.savedSelection?.focus();
                        }
                    }
                }}">
        </div>`
            OptionsSection.append(ParamContainer);
        }

        this.append(OptionsSection);
    }

    DisplayTableBuilder() {
        if (this.tableBuilder.className.includes("active")) {
            this.tableBuilder.classList.remove("active")
        } else {
            this.tableBuilder.classList.add("active")
        }
    }
    tableBuilder = html`<div class="tableBuilder" tabindex="-1">
        <div class="ck">
            <div class="btn-container">
                ${this.BuildBtnTableMap(10)}    
            </div>
        </div>        
        <style>
            .tableBuilder {
                position: absolute;
                display: none;
                flex-direction: column;
                top: 40px;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary-color);
                box-shadow: #c5c5c5 0 0 5px 0;
                padding: 10px 10px 20px 10px;
            }
            .tableBuilder.active {
                display: flex;
            }
            .tableBuilder .btn-container{
                display: grid;
                grid-template-columns: repeat(10, 15px);
                grid-template-rows: repeat(10, 15px);
                gap: 2px;
            }
            .tableBuilder .btn-container button{
                overflow: hidden;
                border:none;
            }
            .tableBuilder .btn-container button span{
                display: none;
                position: absolute;
            }
            .tableBuilder .btn-container button:hover{
                background-color: #92c5e6;
            }
            .tableBuilder .btn-container button:hover > span{
                display: block;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
            }
        </style>
    </div>`
    /**
     * @param {number} num
     */
    BuildBtnTableMap(num) {
        const BtnArray = [];
        for (let indexCol = 1; indexCol <= num; indexCol++) {
            for (let indexRow = 1; indexRow <= num; indexRow++) {
                BtnArray.push(html`<button onclick="${(/** @type {any} */ ev) => { this.CreateTable(ev) }}"><span>${indexCol} × ${indexRow}</span></button>`);
            }
        }
        return BtnArray
    }
    /**
     * @param {any} ev
     */
    CreateTable(ev) {
        const table = this.CreateHtmlTable(ev);
        // 👉 Insertar directamente en el contenedor guardado
        if (this.savedSelection && typeof this.savedSelection.append === 'function') {
            this.savedSelection.append(table);
        }
        //this.savedSelection?.append(this.CreateHtmlTable(ev));
        //this.value = this.savedSelection?.innerHTML;
    }
    /**
    * @param {{ target: any; }} event
    */
    CreateHtmlTable(event) {
        const button = event.target;
        const sizeString = button.querySelector('span').textContent;
        const [rows, cols] = sizeString.split(' × ').map(Number);
        const table = html`<table class="my-table"> <style>
             .my-table  {      
                font-family: Verdana, Geneva, Tahoma, sans-serif;  
                width: 100%;
                border-collapse: collapse;
            }
            .my-table th,  .my-table td  {
                border: solid 1px var(--fifty-color);)
                padding: 5px;
                line-height: 15px;
                font-size: 15px;
                min-height: 25px;
                margin: 0px;
                word-wrap: break-word; 
                word-break: break-all; 
                white-space: normal;  
            }
            .my-table th  {
                font-weight: bold;
            }   
            .my-table th label::first-letter {
                text-transform: uppercase;
            }
            .my-table tr:nth-child(odd) {
                background-color: rgba(0, 0, 0, 0.05);
            }
        </style></table>`;
        for (let i = 0; i < rows; i++) {
            const row = WRender.Create({ tagName: "tr" });
            for (let j = 0; j < cols; j++) {
                if (i == 0) {
                    row.append(WRender.Create({ tagName: "th", innerHTML: "&nbsp;" }));
                } else {
                    row.append(WRender.Create({ tagName: "td", innerHTML: "&nbsp;" }));
                }
            }
            table.appendChild(row);
        }
        return table;
    }

    ToggleHtmlEditor() {
        if (this.htmlEditor != undefined && this.htmlEditor.style.display === "none") {
            this.htmlEditor.style.display = "block";
            this.savedSelection.style.display = "none";
            // @ts-ignore
            this.htmlEditor.value = this.value;
        } else {
            // @ts-ignore
            this.htmlEditor.style.display = "none";
            this.savedSelection.style.display = "block";
            // @ts-ignore
            this.value = this.htmlEditor.value;
            this.savedSelection.innerHTML = this.value;
        }
    }
    /**
     * @param {number} step
     */
    changeFontSize(step) {
        // 1–7 son los tamaños válidos en execCommand
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        /**@type {number} */
        const newSize = Math.min(7, Math.max(1, step));
        document.execCommand("fontSize", false, newSize.toString());
    }
    /**
     * @param {string} fontFamily
     */
    changeFontFamily(fontFamily) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        document.execCommand("fontName", false, fontFamily);
    }   
    /**
    * @param {string} color
    */
    changeFontColor(color) {
        // 1–7 son los tamaños válidos en execCommand
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        document.execCommand("foreColor", false, color);
    }
    /**
     * Inserta una imagen en el editor en la posición actual del cursor/selección.
     * @param {string} url - La URL de la imagen a insertar.
     */
    insertImage = (url) => {
        if (url && url.trim() !== "") {
            this.savedSelection?.append(html`<img class="content-image" src="${url.trim()}">`);
        }
        this.savedSelection?.focus();
    }
    /**
     * Guarda el elemento contenedor de la selección actual
     * @returns {boolean} - True si se logró guardar el contenedor
     * @param {{ target: any }} ev
     */
    saveSelectionContainer(ev) {
        this.savedSelection = ev.target;

        /*const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 ) return false;

        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;

        // Si es nodo de texto, subir al elemento padre
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentNode;
        }

        // Validar que el contenedor esté dentro del editor
        //if (!this.isNodeInEditor(container)) return false;

        // 👉 Guardar directamente el elemento contenedor
        this.savedSelection = container;
        console.log( this.savedSelection);*/

        return true;
    }
    /**@type {HTMLElement?} */
    #savedSelection = null;



}


const WRichTextToolbarStyle = css` 
    w-rich-text-toolbar .WOptionsSection {
        margin: 0px;
        border-radius: 4px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
        background-color: var(--tertiary-color);
        position: relative;
        gap: 10px;
    }  

    w-rich-text-toolbar .ROption {
        border: none;
        padding: 3px;
        margin: 0px;
        display: grid;
        background-color: transparent;
        color: var(--font-primary-color);
        cursor: pointer;
        transition: all 0.3s;
    }
    .ROption.font-select {  
        width: 65px;
        border: 1px solid #999;
        border-radius: 5px;
        padding: 5px;
    }
    .ROption.font-type-select {
        width: 120px;
        border: 1px solid #999;
        border-radius: 5px;
        padding: 5px;   
    }
    .content-image {
        max-width: 100%;
    }    
    w-rich-text-toolbar .ROption:hover {
        color: var(--font-secundary-color);
    }
    w-rich-text-toolbar .ROption:hover > svg {
        fill: var(--font-secundary-color);
    }
    w-rich-text-toolbar .ROption svg {
        fill: var(--font-primary-color);
        height: 20px;
        width: 20px;
    }
    w-rich-text-toolbar .ROption svg path {
        fill: var(--font-primary-color);
    }
    w-rich-text-toolbar .ROption:hover > svg path {
        fill: var(--font-secundary-color);
    }

    .tooltipRitchOption {
        position: relative;
        display: inline-block;
        padding: 0px;
    }

    .tooltipRitchOptiontext {
        visibility: hidden;
        min-width: 120px;
        background-color: var(--primary-color);
        color: var(--font-primary-color);
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        bottom: 150%;
        left: 50%;
        margin-left: -60px;
        box-shadow: 0 0 2px 0 #999;
    }

    .tooltipRitchOption:hover .tooltipRitchOptiontext {
        visibility: visible;
    } 

    .tooltipRitchOptionBtn {
        cursor: pointer;
        width: 20px;
        height: 20px;
        padding: 10px 20px;
        border: none;
        background-color: #f5f5f5;
        color: #000;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    .list, .link, .center, .right, .left {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
    }
    .bold {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        font-size: 18px;
    }
    .italic {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        font-style: italic;
        font-size: 18px;
    }
    .underline {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        text-decoration: underline;
        font-size: 18px;
    }
    .htmlBtn {
        border: none;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 18px;
        background-image: url("/WDevCore/Icons/code.png");
    }
    .ToolWithInputContainer {
        display: flex;
        align-items: center;
        text-align: left;
    }
    w-rich-text-toolbar .tool-input {
        width: 150px; 
        padding: 5px; 
        margin-left: 5px; 
        display: none; 
        border-radius: 5px; 
        border: 1px solid var(--fifty-color);
    }
    .tableBtn {
        display: flex !important;
        gap: 5px;
        width: 50px;
        align-items: center;
        position: relative;
    }
    .tableBtn svg{
        height: 20px;
        width: 20px;
    }
    .tableBtn svg:last-child{
        height: 10px;
        width: 10px;
    }
`;

customElements.define("w-rich-text-toolbar", WRichTextToolbar);
export { WRichTextToolbar };