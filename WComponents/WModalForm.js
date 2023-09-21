import { WRender, WAjaxTools, ComponentsManager } from "../WModules/WComponentsTools.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { ModalConfig } from "../WModules/CommonModel.js";


class WModalForm extends HTMLElement {
    /**
     * 
     * @param {ModalConfig} Config 
     */
    constructor(Config) {
        super();
        this.ShadowRoot = true;
        this.DataRequire = true;
        this.Config = Config;
        //console.log(this.Config);
        for (const p in Config) {
            this[p] = Config[p];
        }
        if (this.StyleForm == "columnX1") {
            this.WidthContainer = "40%";
            this.DivColumns = this.Config.DivColumns = "calc(100% - 20px)";
        } else if (this.StyleForm == "columnX3") {
            this.WidthContainer = "80%";
            this.DivColumns = this.Config.DivColumns = "calc(30%) calc(30%) calc(30%)";
        } else if (this.StyleForm == "FullScreen") {
            this.WidthContainer = "100%";
            this.DivColumns = this.Config.DivColumns = "calc(30%) calc(30%) calc(30%)";
        } else {
            this.WidthContainer = "60%";
            this.DivColumns = this.Config.DivColumns = "calc(50% - 10px) calc(50% - 10px)";
        }
    }
    attributeChangedCallBack() {
        this.DrawSlide();
    }
    connectedCallback() {
        if (this.innerHTML != "") {
            return;
        } //NO MODAL
        if (this.ShadowRoot) {
            this.attachShadow({ mode: "open" });
            this.shadowRoot.append(StyleScrolls.cloneNode(true));
            this.shadowRoot.append(StylesControlsV2.cloneNode(true));
            this.shadowRoot.append(WRender.createElement(this.FormStyle()));
        } else {
            this.append(WRender.createElement(this.FormStyle()));
        }
        //NO MODAL
        this.append(StyleScrolls.cloneNode(true));
        this.append(WRender.createElement({
            type: "w-style",
            props: {
                ClassList: [
                    new WCssClass(".ModalContentWModal", {
                        "opacity": "0",
                        display: "none",
                        "background-color": "rgba(0, 0, 0, 0.5) !important",
                        "width": "100%",
                        "position": "fixed !important",
                        "top": "0px !important",
                        "left": "0px !important",
                        "bottom": "0px !important",
                        "transition": "all 0.3s",
                        "box-shadow": "0 0px 1px 0px #000",
                        "z-index": "20000 !important",
                        "overflow-y": "auto",
                        "padding-bottom": this.StyleForm == "FullScreen" ? 0 : 50
                    })
                ], MediaQuery: [{
                    condicion: "(max-width: 800px)",
                    ClassList: [
                        new WCssClass(".ModalContentWModal", {
                            "padding-bottom": "0px",
                        }),
                    ]
                }]
            }
        }))
        this.DrawComponent();
    }
    checkDisplay(prop) {
        let flag = true
        if (this.DisplayData != undefined &&
            this.DisplayData.__proto__ == Array.prototype) {
            const findProp = this.DisplayData.find(x => x == prop);
            if (!findProp) {
                flag = false;
            }
        }
        return flag;
    }
    DrawComponent = async () => {
        this.DarkMode = this.DarkMode ?? false;
        if (this.id == undefined || this.id == "") {
            this.id = "TempModal";
        }
        this.className = "ModalContentWModal";
        this.Modal = {
            class: "ContainerFormWModal",
            children: []
        };
        this.Modal.children.push(this.DrawModalHead());
        if (this.ObjectModal) { //AGREGA UN OBJETO AL MODAL ENVIDO DESDE LA CONFIGURACION
            const modalOb = this.ObjectModal.tagName ? WRender.Create(this.ObjectModal) : WRender.createElement(this.ObjectModal)
            this.Modal.children.push({ class: "ObjectModalContainer", children: [modalOb] });
        } else if (this.ObjectDetail || this.ModelObject || this.EditObject) { // MUESTRA EL DETALLE DE UN OBJETO EN UNA LISTA
            const { WForm } = await import("./WForm.js");
            this.Config.SaveFunction = (ObjectF, response) => {
                if (this.ObjectOptions != undefined) {  /**TODO REVISAR */
                    if (this.ObjectOptions.SaveFunction != undefined) {
                        this.ObjectOptions.SaveFunction(ObjectF,response);
                    }
                }
                this.close(false);
            }
            this.Form = new WForm(this.Config);
            this.Modal.children.push({ class: "ModalContent", children: [this.Form] });
        }
        if (this.ShadowRoot) {
            this.shadowRoot.append(WRender.Create(this.Modal));
        } else {
            this.append(WRender.Create(this.Modal));
        }
        ComponentsManager.modalFunction(this)
    }
    DrawModalHead() {
        if (this.HeadOptions == false || this.NoModal == true) {
            return "";
        }
        let icon = "";
        if (this.icon != undefined) {
            icon = WRender.CreateStringNode(`<img src="${this.icon}" class="HeaderIcon" alt="">`)
        }
        const InputClose = {
            type: 'button',
            props: {
                class: 'BtnClose', //class: 'Btn',
                type: "button",
                onclick: () => {
                    this.close(true);
                }, innerText: 'x'
            }
            //children: ['◄ Back']
        };
        const Section = {
            type: 'div',
            props: { className: "ModalHeader" },
            children: [
                icon, { type: "label", props: { innerText: this.title } }
            ]
        };
        if (this.CloseOption != false) {
            Section.children.push(InputClose)
        }
        return WRender.createElement(Section);
    }
    close = (RollBack = true) => {
        if (this.Form && RollBack) {
            this.Form.RollBack();
        }
        ComponentsManager.modalFunction(this);
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 500);
    }
    //STYLES----------------------------------------------------------------->
    FormStyle = () => {
        const Style = {
            type: "w-style",
            props: {
                ClassList: [
                    new WCssClass(" .ContainerFormWModal", {
                        "display": "grid",
                        "grid-template-rows": "70px calc(100% - 70px)",
                        //"overflow": "hidden",
                        "margin": "auto",
                        "margin-top": this.StyleForm == "FullScreen" ? 0 : 30,
                        "background-color": this.DarkMode ? "#444444" : "#fff",
                        "width": this.WidthContainer,
                        // "max-height": "calc(100vh - 120px)",
                        //"overflow-y": "auto",
                        // "min-height": this.StyleForm == "FullScreen" ? "100vh" : 200,
                        "border-radius": "0.3cm",
                        "position": "relative",
                        "box-shadow": "0 0px 3px 0px #000",
                        padding: "0 0 10px 0",
                        height: "fit-content"
                    }), new WCssClass(" .ContainerFormWModal h2", {
                        "padding": "10px",
                        "margin": "0px",
                        "background": "#09f",
                    }), new WCssClass(` .ContainerFormWModal h1,
                         .ContainerFormWModal h3,
                         .ContainerFormWModal h4, .ContainerFormWModal h5`, {
                        display: "block",
                        padding: "10px",
                        "text-align": "center",
                        font: "400 13.3333px !important"
                    }), new WCssClass(`.ModalContent`, {
                        //"overflow-y": "auto",
                        display: "block",
                        padding: 30
                    }),
                    //encabezado
                    new WCssClass(` .ModalHeader`, {
                        "color": this.DarkMode ? "#fff" : "#444",
                        "font-weight": "bold",
                        "font-size": "20px",
                        "display": "flex",
                        "justify-content": "center",
                        "align-items": "center",
                        padding: "40px 30px 20px 30px",
                        "margin-bottom": "20px",
                        "text-transform": "uppercase",
                        position: "relative"
                    }), new WCssClass(` .ModalElement`, {
                        "background-color": "#4da6ff",
                        padding: 10,
                        "border-radius": 5
                    }), new WCssClass(` .BtnClose`, {
                        "font-size": "18pt",
                        position: "absolute",
                        "color": "#b9b2b3",
                        "cursor": "pointer",
                        "width": "30px",
                        "border-radius": "10px",
                        "display": "flex",
                        "justify-content": "center",
                        "align-items": "center",
                        border: "none",
                        "background-color": "unset",
                        top: 10,
                        right: 20,
                    }), new WCssClass(` .HeaderIcon`, {
                        "height": "50px",
                        "width": "50px",
                        "position": "relative",
                        "left": "-10px;",
                    }), new WCssClass(`.ObjectModalContainer`, {
                       // overflow: "hidden",
                       // "overflow-y": 'auto',
                        "max-height": "calc(100vh - 120px)",
                        height: "100%",
                        width: "90%",
                        margin: "auto",
                        "margin-bottom": 20,
                        "text-align": "center",
                        padding: 5
                    }),
                ], MediaQuery: [{
                    condicion: "(max-width: 1200px)",
                    ClassList: [new WCssClass(" .ContainerFormWModal", {
                        width: "90%"
                    })]
                }, {
                    condicion: "(max-width: 800px)",
                    ClassList: [new WCssClass(" .ContainerFormWModal", {
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        height: "100%"
                    }), new WCssClass(" divForm", {
                        padding: "20px",
                        "display": "grid",
                        "grid-gap": "1rem",
                        "grid-template-columns": "calc(100% - 20px) !important",
                        "grid-template-rows": "auto",
                        "justify-content": "center"
                    }), new WCssClass(" .ContainerFormWModal", {
                        "margin-top": "0px",
                        "width": "100%",
                        "max-height": "calc(100vh - 0px)",
                        "height": "calc(100vh - 0px)",
                        "border-radius": "0cm",
                    }), new WCssClass("", {
                        "padding-bottom": "0px",
                    }), new WCssClass(`.ObjectModalContainer`, {
                        "max-height": "calc(100% - 80px)"
                    }),
                    ]
                }]
            }
        }
        return Style;
    }
}

customElements.define("w-modal-form", WModalForm);
export { WModalForm }

class WSimpleModalForm extends HTMLElement {
    constructor(Config = (new ModalConfig())) {
        super();
        this.attachShadow({ mode: "open" });
        this.append(this.modalStyle);
        this.shadowRoot.append(StyleScrolls.cloneNode(true));
        this.shadowRoot.append(StylesControlsV2.cloneNode(true));
        this.shadowRoot.append(this.FormStyle());
        this.Modal = WRender.Create({ class: "ContainerFormWModal" });
        this.shadowRoot.append(this.Modal);
        for (const p in Config) {
            this[p] = Config[p];
        }
        this.DrawComponent();

    }
    connectedCallback() { }
    DrawComponent = async () => {
        this.Modal.append(this.DrawModalHead());
        if (this.ObjectModal) { //AGREGA UN OBJETO AL MODAL ENVIDO DESDE LA CONFIGURACION
            this.Modal.append(WRender.Create({ class: "ObjectModalContainer", children: [this.ObjectModal] }));
        } else {
            this.Modal.append("definir contenido");
        }
        ComponentsManager.modalFunction(this)
    }
    DrawModalHead() {
        const InputClose = WRender.Create({
            tagName: 'button',
            class: 'BtnClose', //class: 'Btn',
            onclick: this.close
        });
        const Section = WRender.Create({
            className: "ModalHeader",
            innerHTML: this.title
        });
        Section.append(InputClose);
        return Section;
    }
    close = () => {
        ComponentsManager.modalFunction(this);
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 1000);
    }
    //STYLES----------------------------------------------------------------->
    modalStyle = css`
        w-simple-modal{
            position: fixed;
            background-color: rgba(255, 255, 255, 0.25);
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background-color: rgba(0, 0, 0, .5);
            z-index: 20000 !important;
            opacity: 0;
            transition: all 0.3s;
        }
   `
    FormStyle = () => {
        return css`
            :root {
                --color-primary: rgb(53, 128, 226);
                --color-secundary: rgb(255, 25, 133);
                --color-terciario: rgb(52, 12, 56);
            }

            .ContainerFormWModal {
                display: flex;
                flex-direction: column;
                top: 80px;
                margin: auto;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 5px 0 #999;
                width: 500px;
                position: absolute;
                left: 50%;
                transform: translate(-50%, 0%);
                padding: 2em;
                background: white;
                border-radius: 20px;
            }

            .BtnClose{
                right: 50px;
                text-align: center;
                top: 10px;
            }

            .ModalHeader {
                display: flex;
                justify-content: center;
                align-items: center;
                text-transform: uppercase;
                font-weight: 500;
                color: #1c4786;
                font-size: 20px;
                text-align: center;
                margin-bottom: 10px;
            }
        `;
    }
}

customElements.define("w-simple-modal", WSimpleModalForm);
export { WSimpleModalForm }