import { WRender, WArrayF, ComponentsManager, WAjaxTools } from "../WModules/WComponentsTools.js";
import { css, WCssClass, WStyledRender } from "../WModules/WStyledRender.js";
import { StyleScrolls, StylesControlsV1 } from "../StyleModules/WStyleComponents.js";
import { WModalForm } from "./WModalForm.js";
import { WIcons, WIconsPath } from "../WModules/WIcons.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";

/**
 * @typedef {Object} ConfigMS 
 *  * @property {Array} Dataset
    * @property {Array} [selectedItems]
    * @property {Function} [action]
    * @property {String} [id]
    * @property {Object} [ModelObject]
    * @property {Boolean} [MultiSelect]
    * @property {Boolean} [FullDetail]
    * @property {Boolean} [AddObject]
    * @property {String} [AddPatern]
**/

class MultiSelect extends HTMLElement {
    /**
     * @param {ConfigMS} Config 
     * @param {HTMLElement} [Style] 
     */
    constructor(Config = (new ConfigMS()), Style = null) {
        super();
        this.Config = Config;
        this.id = Config.id;
        this.Dataset = this.Config.Dataset ?? [];
        this.ModelObject = this.Config.ModelObject ?? undefined;
        this.attachShadow({ mode: 'open' });
        this.selectedItems = this.Config.selectedItems ?? [];
        this.NameSelected = "";
        this.FieldName = "";
        this.FullDetail = this.Config.FullDetail ?? true;
        this.SubOptionsFieldName = "";
        WRender.SetStyle(this, {
            display: "block",
            position: "relative",
            boxShadow: "0 0 4px 0 rgb(0,0,0,50%)",
            fontSize: "12px",
            height: "initial",
            padding: "2px"
        });

        this.MultiSelect = this.Config.MultiSelect ?? true;
        this.LabelMultiselect = WRender.Create({
            className: "LabelMultiselect " + (this.MultiSelect ? "multi" : "select"), children: [
                { className: "selecteds" },
                { tagName: "span", className: "btnSelect" }
            ]
        });
        this.OptionsContainer = WRender.Create({ className: "OptionsContainer MenuInactive" });
        this.SearchControl = WRender.Create({
            tagName: "input",
            class: "txtControl",
            placeholder: "Buscar...",
            onchange: async (ev) => {
                const Dataset = await WArrayF.searchFunction(this.Dataset, ev.target.value);
                //console.log(Dataset, this.ModelObject, this.ModelObject?.Get );
                if (this.ModelObject?.__proto__ == Function.prototype) {
                    this.ModelObject = this.ModelObject();
                }
                if (Dataset.length == 0 && this.ModelObject?.Get != undefined) {
                    var filterObject = {}
                    filterObject[this.DisplayName] = ev.target.value
                    const responseDataset = await new this.ModelObject.constructor(filterObject).Get();
                    responseDataset?.forEach(r => {
                        this.Dataset.push(r);
                    })
                    return responseDataset;
                }
                if (Dataset.length == 0 && this.Config.AddObject == true) {
                    const targetControl = ev.target;
                    const addBtn = this.addBtn(targetControl)
                    this.tool.append(addBtn)
                } else {
                    this.Draw(Dataset);
                }
            }
        });
        this.shadowRoot.append(
            this.LabelMultiselect,
            StyleScrolls.cloneNode(true),
            MainMenu.cloneNode(true)
        );
        if (Style != null && Style.__proto__ == WStyledRender.prototype) {
            this.shadowRoot.append(Style);
        }
        this.shadowRoot.append(this.SetOptions());
        this.LabelMultiselect.onclick = this.DisplayOptions;
    }

    addBtn(targetControl) {
        const addBtn = WRender.Create({
            tagName: 'input', type: 'button', className: 'addBtn', value: 'Agregar+', onclick: async () => {
                if (this.ModelObject != undefined) {
                    this.ModalCRUD(undefined, targetControl, addBtn)
                } else {
                    let regex = this.Config?.AddPatern ? new RegExp(this.Config?.AddPatern) : undefined;
                    if (this.Config?.AddPatern == undefined || regex?.test(targetControl.value)) {
                        this.Dataset.push(targetControl.value);
                        this.selectedItems.push(targetControl.value);
                        targetControl.value = "";
                        this.Draw(await WArrayF.searchFunction(this.Dataset, targetControl.value));
                        this.DrawLabel();
                        addBtn.remove();
                        const tool = targetControl.parentNode.querySelector(".ToolTip");
                        if (tool != null) {
                            tool.remove();
                        }
                    } else {
                        addBtn.remove();
                        this.createAlertToolTip(targetControl, `Formato inválido`);
                    }
                }

            }
        });
        return addBtn;
    }

    createAlertToolTip(control, message) {
        if (!control.parentNode.querySelector(".ToolTip")) {
            const toolTip = WRender.Create({
                tagName: "span",
                innerHTML: message,
                className: "ToolTip"
            });
            control.parentNode.append(toolTip);
        }
        WRender.SetStyle(control, {
            boxShadow: "0 0 3px #ef4d00"
        });
        control.focus();
    }

    connectedCallback() {
        this.Draw();
        this.DrawLabel();
    }

    Draw = (Dataset = this.Dataset) => {
        this.OptionsContainer.innerHTML = "";
        Dataset.forEach((element, index) => {
            if (element == null) { return; }
            const OType = this.MultiSelect == true ? "checkbox" : "radio";
            const OptionLabel = WRender.Create({
                tagName: "label", htmlFor: "OType" + (element.id_ ?? element.id ?? "ElementIndex_" + index),
                innerText: this.DisplayText(element, index), className: "OptionLabel"
            });
            const Option = WRender.Create({
                tagName: "input",
                id: "OType" + (element.id_ ?? element.id ?? "ElementIndex_" + index),
                type: OType,
                name: element.name,
                checked: WArrayF.FindInArray(element, this.selectedItems),
                className: "Option", onchange: (ev) => {
                    this.selectedItems = OType == "checkbox" ? this.selectedItems : [];
                    const control = ev.target;
                    const index = this.selectedItems.indexOf(element);
                    if (index == -1 && control.checked == true) {
                        this.NameSelected = element.name;
                        this.FieldName = element.FieldName;
                        this.SubOptionsFieldName = element.SubOptionsFieldName;
                        if (WArrayF.FindInArray(element, this.selectedItems) == false) {
                            this.selectedItems.push(element);
                        } else {
                            console.log("Item Existente")
                        }
                    } else {
                        this.selectedItems.splice(index, 1);
                        if (this.selectedItems.length == 0) {
                            this.NameSelected = "";
                            this.FieldName = "";
                            this.SubOptionsFieldName = "";
                        }
                    }
                    if (this.Config.action) {
                        this.Config.action(this.selectedItems);
                    }
                    this.DrawLabel();
                }
            });
            if (!this.MultiSelect) {
                Option.onclick = this.DisplayOptions;
            }
            const SubContainer = WRender.Create({ className: "SubMenu" });
            if (element.SubOptions != undefined && element.SubOptions.__proto__ == Array.prototype) {
                element.SubMultiSelect = new MultiSelect({
                    Dataset: element.SubOptions,
                    SubFunction: () => {
                        //pendiente
                    }
                }, new WStyledRender(SubMenu));
                element.selectedItems = element.SubMultiSelect.selectedItems;
                SubContainer.append(element.SubMultiSelect);
            }

            const Options = WRender.Create({
                className: "OContainer",
                children: [OptionLabel, Option, SubContainer]
            });
            this.OptionsContainer.append(Options);
            if (this.FullDetail && typeof element !== "string") {
                Options.append(this.BuilDetail(element))
            }
        });
    }
    SetOptions = () => {
        this.tool = new WToolTip([
            this.SearchControl,
            this.OptionsContainer
        ]);
        return this.tool
    }
    DrawLabel = () => {
        this.LabelMultiselect.querySelector(".selecteds").innerHTML =
            this.selectedItems.length == 0 ? "Seleccionar: " : "";
        let sum = 0;
        let add = 0;
        let labelsWidth = 0;
        this.selectedItems.forEach((element, index) => {
            if (!this.MultiSelect) {
                this.LabelMultiselect.querySelector(".selecteds").innerHTML = "";
            }
            const LabelM = WRender.Create({
                tagName: "label",
                innerText: this.DisplayText(element, index),
            });

            if (this.MultiSelect == true) {
                LabelM.append(WRender.Create({
                    tagName: "button", innerText: "x", onclick: () => {
                        const index = this.selectedItems.indexOf(element);
                        this.selectedItems.splice(index, 1);
                        if (this.selectedItems.length == 0) {
                            this.NameSelected = "";
                            this.FieldName = "";
                            this.SubOptionsFieldName = "";
                        }
                        this.DrawLabel();
                        this.Draw();
                        if (this.Config.action) {
                            this.Config.action(this.selectedItems);
                        }
                    }
                }));
            }
            //console.log(labelsWidth);
            const selectedsContainer = this.LabelMultiselect.querySelector(".selecteds");
            if (sum == 0) {
                selectedsContainer.append(LabelM);
                labelsWidth = labelsWidth + LabelM.offsetWidth;
                add++;
            }
            //console.log(labelsWidth + 100);
            if (selectedsContainer.offsetWidth <= labelsWidth + 100) {
                sum++;
            }
            //console.log(selectedsContainer.offsetWidth, labelsWidth);

        });
        if (this.selectedItems.length - add > 0) {
            this.LabelMultiselect.querySelector(".selecteds").append(WRender.Create({
                tagName: "label",
                innerText: "+" + (this.selectedItems.length - add).toString()
            }))
        }
    }
    DisplayText(element, index) {
        if (typeof element === "string") {
            return element
        }
        this.DisplayName = undefined;
        const keys = ["tipo",
            "Descripcion",
            "descripcion",
            "desc",
            "name",
            "Name",
            "nombre",
            "Nombre",
            "Nombres",
            "Descripcion_Servicio"]
        for (const key in element) {
            if (keys.find(k => k == key) != null) {
                this.DisplayName = key;
                break;
            }
        }
        return element[this.DisplayName] ?? "Element" + index;
    }
    DisplayOptions = () => {
        if (this.tool.className.includes("toolActive")) {
            this.LabelMultiselect.querySelector("span").className = "btnSelect"
            this.tool.className = "toolInactive";
        } else {
            this.LabelMultiselect.querySelector("span").className = "btnSelect spanActive"
            this.tool.className = "toolActive";
        }
    }
    BuilDetail = (element) => {
        const elementDetail = WRender.Create({ className: "ElementDetail" });
        for (const prop in WArrayF.replacer(element)) {
            if (this.IsDrawableProp(element, prop)) {
                elementDetail.append(WRender.Create({ className: "ElementProp", innerHTML: WOrtograficValidation.es(prop) + ":" }));
                elementDetail.append(WRender.Create({ className: "ElementValue", innerHTML: WOrtograficValidation.es(element[prop]) }));
            }
        }
        return elementDetail;
    }
    IsDrawableProp(element, prop) {
        if (this.ModelObject == undefined && (typeof element[prop] == "number" || typeof element[prop] == "string")) {
            return true;
        }
        else if (this.ModelObject == undefined
            || (this.ModelObject[prop]?.type == undefined
                || this.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
                || this.ModelObject[prop]?.primary == true
                || this.ModelObject[prop]?.hidden == true
                || this.ModelObject[prop]?.hiddenInTable == true)
            || element[prop] == null || element[prop] == undefined
            || element[prop]?.__proto__ == Function.prototype
            || element[prop]?.__proto__.constructor.name == "AsyncFunction") {
            return false;
        }
        return true;
    }
    ModalCRUD(element, targetControl, addBtn) {
        this.shadowRoot?.append(
            new WModalForm({
                ModelObject: this.ModelObject,
                EntityModel: this.EntityModel,
                AutoSave: this.Config.AutoSave ?? false,
                ParentModel: this.Config.ParentModel,
                ParentEntity: this.Config.ParentEntity,
                EditObject: element,
                icon: this.Config.icon,
                ImageUrlPath: this.Config.ImageUrlPath,
                title: element ? "Editar" : "Nuevo",
                ValidateFunction: this.Config.ValidateFunction,
                ObjectOptions: {
                    Url: element ? this.Options?.UrlUpdate : this.Options?.UrlAdd,
                    AddObject: element ? false : true,
                    SaveFunction: async (NewObject) => {
                        this.Dataset.push(NewObject);
                        if (!this.MultiSelect) {
                            this.selectedItems.shift();
                        }
                        this.selectedItems.push(NewObject);

                        targetControl.value = "";
                        this.Draw(await WArrayF.searchFunction(this.Dataset, targetControl.value));
                        this.DrawLabel();
                        if (this.Config.action != undefined) {
                            this.Config.action(this.selectedItems);
                        }
                        addBtn.remove();
                        const tool = targetControl.parentNode.querySelector(".ToolTip");
                        if (tool != null) {
                            tool.remove();
                        }
                    }
                }
            }));
    }
}
customElements.define("w-multi-select", MultiSelect);
export { MultiSelect }

class WToolTip extends HTMLElement {
    constructor(Element) {
        super();
        this.append(WRender.Create(Element))
        this.append(css`
            w-tooltip{
                position: absolute;
                width: 100%;
                z-index: 1;
                box-shadow: 0 0 5px rgb(0 0 0 / 50%);
                transition: all .1s;
                max-height: 0px;
                background-color: #fff;
                overflow: hidden;  
                left: 0;             
            }
            w-tooltip.active {
                max-height: 600px;
                overflow: auto;                
            }
        `)
    }
    connectedCallback() { }
    Display = async () => {
        setTimeout(() => {
            if (this.className == "active") {
                this.className = "";
            } else {
                this.className = "active"
            }
        }, 100);
    }
}
customElements.define('w-tooltip', WToolTip);
export { WToolTip }


const MainMenu = css`
    .LabelMultiselect {
        padding: 0px 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        cursor: pointer;
        height: 100%;
        height: 34px;
    }
    .LabelMultiselect .selecteds {       
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        min-height: 33px;
        width: calc(100% - 30px);
        overflow-x: auto;
    } 
    .toolActive {       
        border: solid 1px #9b9b9b;
        max-height: 600px;
        min-width: 300px;
    }
    .toolInactive {
        max-height: 0px !important;
    }
    .LabelMultiselect label {
        padding: 5px;
        border-radius: 0.3cm;
        background-color: #009f97;  color: #fff;margin: 3px;  
        font-size: 11px;
        align-items: center;
        overflow: hidden;        
        line-height: 18px;
        display: flex;
    }
    .LabelMultiselect label button {
        border: none;
        margin-left: 3px;
        cursor: pointer;
        font-weight: bold;
        border-left: solid 2px #062e2c;
        background: none;
    }
    .OptionsContainer {
        max-height: 500px;
        overflow-y: auto; overflow-y: overlay;
        transition: all .1s;
        width: 100%;
        background: #fff;
        position: relative;
        box-shadow: 0 0 4px 0 rgb(0, 0, 0, 50%);
    }
    .MenuActive {
        max-height: 500px;
    }
    .OContainer {
        transition: all 0.1s;
        cursor: pointer;
        display: grid;
        background: #fff;
        border-bottom: solid 1px #f1f1f1;
        grid-template-columns: calc(100% - 40px) 40px;
        grid-row: auto auto;
        align-items: center;
    }
    .OContainer:hover {
        background: #eee;
    }
    .OptionLabel {
        width: 100%;
        cursor: pointer;
        padding: 10px 10px;
        text-align: justify;
    }
    .SubMenu {
        max-height: 0px;
        width: 100%;
        grid-column: 1/3;
        background-color: rgb(0, 0, 0, 35%);
        transition: all 0.1s;
        overflow: hidden;
    }
    .SubMenu w-multi-select:first-child {
        margin: 10px;
    }
    .Option:checked~.SubMenu {
        max-height: 500px;
    }
    .txtControl {
        width: calc(100% - 30px);
        padding: 10px 15px;
        border: none;
        outline: none;
    }
    .txtControl:active,
    .txtControl:focus {
        border: none;
        outline: none;
        box-shadow: 0 0 5px #4894aa;
    }
    .btnSelect {
        height: 15px;
        width: 18px;
        border-radius: 50%;
        position: absolute;
        right: 0px;
        margin-right: 10px;
        background: #000;
        clip-path: polygon(50% 50%, 100% 0%, 100% 50%, 50% 100%, 0% 50%, 0% 0%);
        transition: all 0.1s;
    }
    .spanActive {
        transform: rotate(-180deg);
    }
    .ElementDetail {
        display: grid;
        grid-template-columns: 100px calc(100% - 110px);
        padding: 10px;
        background-color: #eeeeee;
        border-radius: 10px;
        margin: 10px;
        font-size: 11px;
        grid-column: span 2;
        font-weight: 500;
    }
    .ElementDetail:hover,  .OContainer:hover > .ElementDetail {
        background-color: #d2d2d2;
    }
    .addBtn{
        position: absolute;
        right: 10px;
        top: 5px;
        padding: 5px;
        font-size: 11px;
        color: #fff;
        border: none;
        background-color: #479207;
        cursor: pointer;
        border-radius: 5px;
        font-size: 9px;
    }
    .ToolTip {
        position: absolute;
        padding: 5px 15px;
        border-radius: 0.3cm;
        font-size: 10px;
        font-weight: 500;
        color: rgb(227, 0, 0);
        top: 7px;
        right: 50px;
    }
`
const SubMenu = {
    ClassList: [
        new WCssClass(`.OptionsContainer`, {
            "max-height": 500,
            position: "relative",
            "box-shadow": "none",
        })
    ]
}