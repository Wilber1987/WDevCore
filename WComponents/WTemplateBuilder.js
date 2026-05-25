//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { ModalVericateAction } from "./ModalVericateAction.js";
import { PageType, WDocumentViewer } from "./WDocumentViewer.js";
import { WModalForm } from "./WModalForm.js";
// @ts-ignore
import { ModelProperty } from "../WModules/CommonModel.js";
import { EntityClass } from "../WModules/EntityClass.js";
import { html } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WAlertMessage } from "./WAlertMessage.js";

import "../libs/mdToHtml.js";
import TurndownService from "../libs/htmlToMd.js";
import "../libs/prims.js";
import { WContentManager } from "../WModules/WContentManager.js";
import { WChatComponent } from "./WChatComponent.js";
import { WRichTextToolbar } from "./FormComponents/WRichTextToolbar.js";


//#region DEFINICION DE TIPOS
export class TemplateData extends EntityClass {
    /** @param {Partial<TemplateData>} [props] */
    constructor(props) {
        super(props, 'DocumentsData');
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {Number?} */ Id_Template = null;
    /**@type {String?} */ Description = null;
    /**@type {Array<Section>} */ Sections = [];
}

export class Section {
    /** @param {Partial<Section>} [props] */
    constructor(props) {
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {string?} */ Id_Section = null;
    /**@type {Object?} */ Data = null;
    /**@type {any} */ Body;
}

export class TemplateData_ModelComponent extends EntityClass {
    /** @param {Partial<TemplateData_ModelComponent>} [props] */
    constructor(props) {
        super(props, 'DocumentsData');
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */ Id_Template = { type: "NUMBER", primary: true };
    /**@type {ModelProperty} */ Descripcion = { type: "TEXT" };
    //**@type {ModelProperty} */ Sections =  { type: "NUMBER", primary: true};
}

export class Section_ModelComponent {
    /**@type {ModelProperty} */ Body = { type: "RICHTEXT" }
}
//#endregion
class WTemplateBuilder extends HTMLElement {
    /**
     * @param {{ Data: TemplateData; PageType: string?; SectionActions: Array<{ name: string, action: Function, title: string? }>|undefined  }} Config
     */
    constructor(Config) {
        super();
        this.Config = Config ?? {};
        this.TemplateData = this.Config.Data ?? new TemplateData(); // Solo si viene del constructor
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.append(this.CustomStyle);
        this.OptionsContainer = html`<div class="options-container"></div>`;
        /**
         * @type {Node[]}
         */
        this.Dataset = []
        this.TemplateData.Sections.forEach(section => {
            const content = this.BuildWrappercontent(section)
            this.Dataset.push(...content)
        })

        this.RitchTextToolBar = new WRichTextToolbar({
            showTableBuilder: true,
            showHtmlEditor: true,
            showImageInput: true,
            //showParamInput: true,
            showFontSize: true,
            showFontColor: true
        });

        // Eventos específicos del toolbar que requieren contexto de WRichText
        // this.toolbar.addEventListener("command-executed", (e) => {
        //     // Para comandos execCommand, necesitamos el contexto del editor
        //     document.execCommand(e.detail.command, false, e.detail.value);
        //     this.#syncValue();
        // });

        this.DocumentViewer = new WDocumentViewer({
            PageType: this.Config.PageType ?? PageType.A4,
            CustomStyle: this.CustomStyle.cloneNode(true),
            Dataset: this.Dataset,
            //contentEditable: true,
            contentEditableAction: (/** @type {{ target: any; }} */ ev, /** @type {HTMLElement} */ page) => {
                // Obtenemos el shadowRoot del componente
                const shadowRoot = ev.target.getRootNode();

                // Obtenemos la selección dentro del shadow DOM
                const selection = shadowRoot.getSelection?.() ?? window.getSelection();

                if (!selection || selection.rangeCount === 0) return;

                const nodoActivo = selection.getRangeAt(0).startContainer;

                const sectionWrapper = nodoActivo.nodeType === Node.TEXT_NODE
                    ? nodoActivo.parentElement?.closest('.section-wrapper-content')
                    : nodoActivo.closest?.('.section-wrapper-content');

                if (!sectionWrapper) return;

                console.log('Section wrapper activo:', sectionWrapper);
                sectionWrapper.action();
            }
        });
        this.Container = html`<div class="template-builder-container">
            ${this.OptionsContainer}
            ${this.DocumentViewer}
        </div>`
        this.shadowRoot?.append(this.Container, this.CustomStyle, StylesControlsV2.cloneNode(true))
        this.btnAddSection = html`<button class="Btn-Mini"
            onclick="${() => this.AddSection()}">Agregar sección</button>`;
        this.btnSave = html`<button class="Btn-Mini"
            onclick="${() => {
                this.shadowRoot?.append(ModalVericateAction(async () => {
                    await this.GetTemplateData().Update();
                    WAlertMessage.Success("Cambios guardados", true);
                }, "¿Desea guardar los cambios?"))
            }}">Guardar</button>`

    }
    // Propiedades para gestionar el arrastre
    draggedItem = null;
    dragOverTarget = null;
    connectedCallback() {
        this.Draw();
        /*if (this.children.length > 0) {
            this.TemplateData.Sections.push(...(Array.from(this.children).map(child => new Section({
                Body: child.outerHTML,
            }))));
            this.DocumentViewer.Dataset.push(...this.TemplateData.Sections
                .map(section => this.BuildSectionWrapper(section)));
            this.DocumentViewer.Update();
        }*/
    }
    Draw = async () => {
        this.OptionsContainer.append(this.RitchTextToolBar)
        this.OptionsContainer.append(this.btnAddSection);
        this.OptionsContainer.append(this.btnSave);
    }
    AddSection() {
        this.shadowRoot?.append(new WModalForm({
            ModelObject: new Section_ModelComponent(),
            title: "Nueva",
            ObjectOptions: {
                SaveFunction: (/**@type {Section} */ newSection) => {
                    const newContent = this.BuildWrappercontent(newSection);
                    this.TemplateData.Sections.push(newSection)
                    this.DocumentViewer.Dataset?.push(...newContent);
                    this.DocumentViewer.Update();
                    // @ts-ignore
                    newContent[0].focus();
                }
            }
        }));
    }


    /**
     * @param {Section} editingO
     */
    EditSection(editingO) {
        editingO.Body = WContentManager.ParseContentToString(editingO.Body);
        const form = new WModalForm({
            ModelObject: new Section_ModelComponent(),
            EditObject: editingO,
            title: "Editar",
            CustomStyle: css`.RICHTEXT { height: 400px;}`,
            ObjectOptions: {
                SaveFunction: (/**@type {Section} */ newSection) => {
                    // @ts-ignore
                    sectionWrapper.append(...this.BuildWrappercontent(newSection, sectionWrapper));
                    this.DocumentViewer.Update();
                }
            }
        })
        //form.shadowRoot?.append(css` .RICHTEXT { height: 400px;}`)
        this.shadowRoot?.append(form);
    }
    /**
 * @param {any} editingObject
 * @returns {Array<Node>}
 */
    BuildWrappercontent(editingObject) {
        const content = WContentManager.ParseContent(editingObject.Body)

        /**@type {HTMLElement[]} */
        const returnData = []

        content.forEach(c => {
            const wrapper = html`<div class="section-wrapper-content" contenteditable="true">${c}</div>`

            // === 1. Configurar arrastre (tu código existente) ===
            //wrapper.setAttribute("draggable", "true");
            //wrapper.addEventListener("dragstart", this.dragStart);
            //wrapper.addEventListener("dragover", this.dragOver);
            //wrapper.addEventListener("drop", this.drop);
           // wrapper.addEventListener("dragend", this.dragEnd);

            // === 2. Evento input para sincronizar contenido ===
            wrapper.addEventListener("input", () => {
                const content = returnData.map(object => object.innerHTML).join('');
                editingObject.body = content
                console.log("contenido editado");
            })

            // === 3. Guardar selección al hacer mousedown (para toolbar) ===
            wrapper.addEventListener("mousedown", (ev) => this.RitchTextToolBar?.saveSelectionContainer?.(ev))

            // === 👉 NUEVO: Hover para mostrar/ocultar opciones ===

            // Crear el contenedor de opciones (oculto por defecto)
            const options = html`<div class="section-wrapper-options">
                <button class="option-btn delete-btn" title="Eliminar" onclick="${() => this.DeleteSection(editingObject, wrapper)}">
                    <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.048"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M9 4.5V6H6V7.5H18V6H15V4.5H9ZM6.75 8.25H8.25V17.6893L8.56066 18H15.4393L15.75 17.6893V8.25H17.25V18.3107L16.0607 19.5H7.93934L6.75 18.3107V8.25Z" fill="#080341"></path> </g></svg>
                </button>
            </div>`

            this.Config.SectionActions?.forEach(sectionAction => {
                options.append(html`<button class="option-btn" title="${sectionAction.title ?? ""}" 
                    onclick="${() => {
                        sectionAction.action(editingObject, wrapper)
                        console.log(wrapper);

                    }}">
                    ${sectionAction.name}
                </button>`);
            });

            // Función para mostrar opciones
            const showOptions = (/** @type {{ stopPropagation: () => void; }} */ ev) => {
                ev.stopPropagation();
                // Posicionar opciones en la esquina superior derecha del wrapper
                options.style.position = "absolute";
                options.style.top = "5px";
                options.style.right = "5px";
                options.style.display = "flex";
                options.style.gap = "4px";
                options.style.zIndex = "100";
                if (!options.parentNode) {
                    wrapper.appendChild(options);
                }
            }

            // Función para ocultar/remover opciones
            const hideOptions = () => {
                // Pequeño delay para permitir click en los botones sin que se oculten antes
                setTimeout(() => {
                    if (!options.matches(":hover") && !wrapper.matches(":hover")) {
                        options.remove();
                    }
                }, 150);
            }

            // Eventos hover en el wrapper
            wrapper.addEventListener("mouseenter", showOptions);
            wrapper.addEventListener("mouseleave", hideOptions);

            // Prevenir que el hover de las opciones cierre las opciones inmediatamente
            options.addEventListener("mouseenter", (e) => e.stopPropagation());
            options.addEventListener("mouseleave", hideOptions);


            // === 4. Agregar al array de retorno ===
            returnData.push(wrapper)
        })

        return returnData;
    }
    /**
     * @param {any} editingObject
     * @param {HTMLElement} sectionWrapper
     */
    DeleteSection(editingObject, sectionWrapper) {
        this.shadowRoot?.append(ModalVericateAction(() => {
            sectionWrapper.remove();
            this.DocumentViewer.Dataset?.splice(this.DocumentViewer.Dataset?.indexOf(editingObject), 1);
        }, "¿Esta seguro que desea eliminar esta sección?"))
    }

    Update() {
        this.Draw();
    }

    GetTemplateData() {

        return this.TemplateData;
    }

    // --- MÉTODOS DE DRAG AND DROP ---
    //#region EVENTOS DRAG AN DROP

    /** @param {DragEvent} e */
    dragStart = (e) => {
        // @ts-ignore
        const target = e.target?.closest(".section-wrapper");
        if (target) {
            this.draggedItem = target;
            // @ts-ignore
            e.dataTransfer.effectAllowed = 'move';
            // @ts-ignore
            e.dataTransfer.setData('text/html', ''); // Dato ficticio, necesario para algunos navegadores

            // Efecto visual para el elemento que se está arrastrando
            setTimeout(() => {
                target.style.opacity = '0.4';
            }, 0);
        }
    }

    /** @param {DragEvent} e */
    dragOver = (e) => {
        // @ts-ignore
        const target = e.target.closest(".section-wrapper");
        // La condición clave: asegurar que el destino es una sección, no es el elemento que se arrastra, 
        // y está dentro del DocumentViewer (el contenedor permitido).
        if (target && target !== this.draggedItem && target.parentNode.contains(target)) {
            e.preventDefault(); // Permite que el evento 'drop' se dispare
            // @ts-ignore           
            e.dataTransfer.dropEffect = 'move';
            // Limpiar borde del target anterior
            if (this.dragOverTarget && this.dragOverTarget !== target) {
                // @ts-ignore
                this.dragOverTarget.style.borderTop = '';
                // @ts-ignore
                this.dragOverTarget.style.borderBottom = '';
            }

            const rect = target.getBoundingClientRect();
            const y = e.clientY - rect.top;

            // Determinar si insertar antes (mitad superior) o después (mitad inferior)
            if (y < rect.height / 2) {
                target.style.borderTop = 'dashed 3px var(--success-color, #4CAF50)';
                target.style.borderBottom = '';
            } else {
                target.style.borderTop = '';
                target.style.borderBottom = 'dashed 3px var(--success-color, #4CAF50)';
            }
            this.dragOverTarget = target;
        } else {
            // Limpiar borde si el arrastre no está sobre un target válido
            if (this.dragOverTarget) {
                // @ts-ignore
                this.dragOverTarget.style.borderTop = '';
                // @ts-ignore
                this.dragOverTarget.style.borderBottom = '';
                this.dragOverTarget = null;
            }
        }
    }

    /** @param {DragEvent} e */
    drop = (e) => {
        e.preventDefault();
        if (!this.draggedItem || !this.dragOverTarget) return;
        // @ts-ignore
        this.draggedItem.style.opacity = ''; // Restablecer opacidad
        const source = this.draggedItem;
        const target = this.dragOverTarget;
        // @ts-ignore
        const isInsertBefore = target.style.borderTop;

        // Limpiar bordes
        // @ts-ignore
        target.style.borderTop = '';
        // @ts-ignore
        target.style.borderBottom = '';
        this.dragOverTarget = null;

        // Mover el elemento en el DOM
        if (isInsertBefore) {
            // @ts-ignore
            target.parentNode.insertBefore(source, target);
        } else {
            // Insertar después del elemento target
            // @ts-ignore
            target.parentNode.insertBefore(source, target.nextSibling);
        }

        // Restablecer estado de arrastre
        this.draggedItem = null;

        // Sincronizar el Dataset interno
        this.updateDatasetOrder();
    }

    /** @param {DragEvent} e */
    // @ts-ignore
    dragEnd = (e) => {
        // Limpieza final si se cancela o finaliza el arrastre
        if (this.draggedItem) {
            // @ts-ignore
            this.draggedItem.style.opacity = '';
        }
        if (this.dragOverTarget) {
            // @ts-ignore
            this.dragOverTarget.style.borderTop = '';
            // @ts-ignore
            this.dragOverTarget.style.borderBottom = '';
        }
        this.draggedItem = null;
        this.dragOverTarget = null;
    }
    //#endregion

    /**
     * Sincroniza el Dataset interno del DocumentViewer con el orden actual del DOM.
     */
    updateDatasetOrder = () => {
        /**
         * @type {Element[]}
         */
        const newDataset = [];
        // Seleccionamos todas las secciones dentro del DocumentViewer
        const sectionsInDOM = this.DocumentViewer.shadowRoot?.querySelectorAll(".section-wrapper");
        sectionsInDOM?.forEach(section => {
            newDataset.push(section);
        });
        // Reemplazar el Dataset con el nuevo orden
        this.DocumentViewer.Dataset = newDataset;
    }

    CustomStyle = css`
        * {            
            text-align: justify;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            border: 2px solid #ddd;
        }
        table th {
            background: #f5f5f5;
            text-align: left;
            padding: 6px 10px;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
        }
        table td {
            padding: 6px 10px;
            border-bottom: 1px solid #eee;
        }
        table tr:last-child td {
            border-bottom: none;
        }
        .options-container {
            padding: 10px;
            border: 1px solid #dfdfdf;
            z-index:1;
            display: flex;
            height: 60px;
            justify-content: flex-end;
            gap: 10px;
        }

        .option-btn {
            padding: 0;
            border: 0;
            font-size: 25px;
            border: unset;
            background-color: unset;
            cursor: pointer;
            svg {
                height: 25px;
                width: 25px;
            }
        }
        .template-builder-container{
            display: flex;
            flex-direction: column;
            height: 100%;
            box-sizing: border-box;
        }
        w-document-viewer {
            height: calc(100% - 100px);
            box-sizing: border-box;
            display: block;
        }
        .section-wrapper{
            /* Agregamos cursor: grab para indicar que es arrastrable */
            cursor: grab;
        }
        /* ... (rest of the CustomStyle is unchanged) ... */
        .section-wrapper {
            width: 100%;
            display: block;
            border-bottom: dashed 2px #cac9c9;
            padding: 10px 0;
            position: relative;
            padding-top: 20px;
            cursor: grab; /* Indica que es arrastrable */   
        } 
        .section-wrapper-content {
            position: relative;
        }
        .section-wrapper-options {
            background-color: rgba(0, 0 , 0, 0.2);
            margin-top: -30px;
            padding: 5px;
            display: flex;
            align-items: center;
        }

        .section-wrapper-content:focus-visible {
            outline: #b1b1b1 auto 1px;
        }
        .section-wrapper-option {
            position: absolute;
            right: 10px;
            top:5px;
            button {
                height: 20px;
                font-size: 10px;
                background-color: #0873a5;
                cursor: pointer;
                border: none;
                border-radius: 5px;
                color: #fff;
            }
        }
     `
}
customElements.define('w-template-builder', WTemplateBuilder);
export { WTemplateBuilder }