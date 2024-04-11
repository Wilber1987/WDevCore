//@ts-check
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
// @ts-ignore
import { ModelProperty } from "../WModules/CommonModel.js";
import { EntityClass } from "../WModules/EntityClass.js";
import { WRender, WArrayF } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { WCssClass, css } from "../WModules/WStyledRender.js";
import { MultiSelect } from "./WMultiSelect.js";
/**
 * @typedef {Object} FilterConfig 
 *  * @property {Array} Dataset  
    * @property {Function} FilterFunction
    * @property {Boolean} [Display]
    * @property {Boolean} [AutoFilter]
    * @property {Boolean} [AutoSetDate]
    * @property {Object} [ModelObject]
    * @property {Object} [EntityModel]
**/

class WFilterOptions extends HTMLElement {
    /**
     * 
     * @param {FilterConfig} Config 
     */
    constructor(Config) {
        super();
        this.Config = Config;
        this.Dataset = Config.Dataset;
        this.FilterFunction = Config.FilterFunction;
        this.ModelObject = Config.ModelObject;
        this.EntityModel = Config.EntityModel;
        this.Display = Config.Display;
        this.FilterContainer = WRender.Create({ className: "filter-container" });
        /** @type {Array} */
        this.FilterControls = [];
        this.attachShadow({ mode: "open" });
        this.shadowRoot?.append(StyleScrolls.cloneNode(true));
        this.shadowRoot?.append(StylesControlsV2.cloneNode(true));
        this.shadowRoot?.append(WRender.createElement(this.styles));
        this.shadowRoot?.append(this.FilterContainer);
        this.DrawFilter();
    }
    connectedCallback() {
    }
    DrawFilter = async () => {
        this.FilterContainer.innerHTML = "";
        const ControlOptions = WRender.Create({ class: "OptionContainer " + (this.Display ? "OptionContainerActive" : "") })
        this.FilterContainer.append(WRender.Create({
            class: "options", children: [
                { tagName: "label", innerText: "Filtros" },
                {//display
                    tagName: 'input', style: 'transform: rotate(0deg)', class: 'BtnDinamictT', type: "button", value: '>', onclick: async (ev) => {
                        if (ControlOptions.className == "OptionContainer") {
                            ev.target.style["transform"] = "rotate(90deg)";
                            ControlOptions.className = "OptionContainer OptionContainerActive";
                        } else {
                            ev.target.style["transform"] = "rotate(0deg)";
                            ControlOptions.className = "OptionContainer";
                        }
                    }

                }
            ]
        }));
        this.ModelObject = this.ModelObject ?? this.Config.Dataset[0];
        for (const prop in this.ModelObject) {
            const SelectData = WArrayF.GroupBy(this.Config.Dataset, prop).map(s => s[prop]);
            if (this.isDrawable(this.ModelObject, prop)) {
                if (this.ModelObject[prop].__proto__ == Object.prototype) {
                    const filterControl = await this.CreateModelControl(this.ModelObject, prop, this.ModelObject[prop].Dataset ?? SelectData);
                    if (filterControl != null) {
                        ControlOptions.append(WRender.Create({
                            className: this.ModelObject[prop].type.toUpperCase() == "DATE"
                                || this.ModelObject[prop].type.toUpperCase() == "NUMBER" ? "multi-control-container" : "",
                            children: [WOrtograficValidation.es(prop), filterControl]
                        }));
                        this.FilterControls.push(filterControl);
                    }
                } else {
                    const filterControl = await this.CreateWSelect(SelectData, prop);
                    ControlOptions.append(WRender.Create({ children: [WOrtograficValidation.es(prop), filterControl] }));
                    this.FilterControls.push(filterControl);
                }
            }
        }
        this.FilterContainer.append(WRender.createElement(ControlOptions));
    }
    /**
     * 
     * @param {Object} Model 
     * @param {String} prop 
     * @param {Array} Dataset 
     * @returns 
     */
    CreateModelControl = async (Model, prop, Dataset) => {
        const ModelProperty = Model[prop];
        switch (ModelProperty.type?.toUpperCase()) {
            case "TEXT": case "EMAIL": case "EMAIL": case "TEL": case "URL": case "TEXTAREA":
                return this.CreateTextControl(prop);
            case "TITLE": case "IMG": case "IMAGE": case "IMAGES":
                break;
            case "DATE": case "FECHA": case "HORA":
                /**TODO */
                return this.CreateDateControl(prop);
            case "NUMBER":
                return this.CreateNumberControl(prop);
            case "SELECT":
                return this.CreateSelectControl(prop, Dataset);
            case "WSELECT": case "MULTISELECT":
                return await this.CreateWSelect(ModelProperty, prop);
            case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW": case "TEXTAREA": case "PASSWORD":
                break;
            case "RADIO": case "CHECKBOX":
                /**TODO */
                break;
            case "CALENDAR":
                /**TODO */
                break;
            default:
                //return await this.CreateSelectControl(Dataset, prop);
                break;
        }
        return null
    }
    isDrawable(Model, prop) {
        if (Model[prop] == null || prop == "FilterData") {
            return false;
        }
        return (Model[prop].__proto__ = Object.prototype && Model[prop].type &&
            (!Model[prop].hidden && !Model[prop].hiddenFilter))
            && Model[prop].__proto__ != Function.prototype
            && Model[prop].__proto__.constructor.name != "AsyncFunction";
    }

    filterFunction = async () => {
        const Model = this.EntityModel ?? this.ModelObject;
        if (Model.Get || this.Config.AutoFilter == false) {
            this.ModelObject.FilterData = [];
            this.FilterControls.forEach(control => {
                if (this.ModelObject[control.id]) {
                    let values;
                    let filterType;
                    /**
                     * @type {ModelProperty}
                     */
                    const ModelProperty = this.ModelObject[control.id];
                    let propiertyName = control.id;
                    switch (ModelProperty.type?.toUpperCase()) {
                        case "TEXT": case "SELECT": case "EMAIL": case "EMAIL": case "TEL": case "URL": case "TEXTAREA":
                            if (control.value != null && control.value != undefined && control.value != "") {
                                filterType = "LIKE"
                                values = [control.value];
                            }
                            break;
                        case "TITLE": case "IMG": case "IMAGE": case "IMAGES":
                            break;
                        case "DATE": case "FECHA": case "HORA": case "NUMBER":
                            /**TODO */
                            filterType = "BETWEEN"
                            const inputs = control.querySelectorAll("input");

                            if (inputs[0].value != '' || inputs[1].value != '') {
                                values = []
                                if (inputs[0].value != '') {
                                    values.push(inputs[0].value)
                                } else {
                                    values.push(null)
                                }
                                if (inputs[1].value != '') {
                                    values.push(inputs[1].value)
                                }
                            }
                            break;
                        case "WSELECT": case "MULTISELECT":
                            if (control.selectedItems.length > 0 && ModelProperty.ModelObject != undefined) {
                                if (ModelProperty.ModelObject.__proto__ == Function.prototype) {
                                    ModelProperty.ModelObject = ModelProperty.ModelObject();
                                    console.log(ModelProperty.ModelObject);
                                }
                                //TODO REPARAR LO DE LAS FORANES EN MODELPROPIERTY
                                let foraingKeyName = null;
                                const foreynKeyExist = ModelProperty.ForeignKeyColumn && this.ModelObject.hasOwnProperty(ModelProperty.ForeignKeyColumn);
                                if (!foreynKeyExist) {
                                    for (const propiedad in ModelProperty.ModelObject) {
                                        const keyNameSames = ModelProperty.ModelObject[propiedad].primary
                                            && ModelProperty.ModelObject.hasOwnProperty(propiedad) 
                                            && this.ModelObject.hasOwnProperty(propiedad);
                                        if (keyNameSames) {
                                            foraingKeyName = propiedad;
                                        }
                                    }
                                } else {
                                    foraingKeyName = ModelProperty.ForeignKeyColumn;
                                }
                                if (foraingKeyName != null) {
                                    values = []
                                    filterType = "IN";
                                    propiertyName = foraingKeyName
                                    control.selectedItems?.forEach(element => {
                                        values.push(element[foraingKeyName].toString())
                                    });
                                }
                            }
                            break;
                        case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW": case "TEXTAREA": case "PASSWORD":
                            break;
                        case "RADIO": case "CHECKBOX":
                            /**TODO */
                            break;
                        case "CALENDAR":
                            /**TODO */
                            break;
                        default:
                            break;
                    }
                    /*console.log({
                        PropName: control.id,
                        FilterType: filterType,
                        Values: values
                    });*/
                    this.ModelObject.FilterData.push({
                        PropName: propiertyName,
                        FilterType: filterType,
                        Values: values
                    })
                }
            });
            if (this.Config.AutoFilter == false) {
                this.Config.FilterFunction(Model.FilterData);
                return;
            }
            this.Config.Dataset = await Model.Get();
        }

        const DFilt = this.Config.Dataset.filter(obj => {
            let flagObj = true;
            this.FilterControls.forEach(control => {
                if (this.ModelObject[control.id]?.__proto__ == Object.prototype) {
                    const ModelProperty = this.ModelObject[control.id];
                    switch (ModelProperty.type?.toUpperCase()) {
                        case "TEXT": case "SELECT": case "EMAIL": case "EMAIL": case "TEL": case "URL":
                            if (control.value != null && control.value != undefined && control.value != "") {
                                findByValue(control);
                            }
                            break;
                        case "TITLE": case "IMG": case "IMAGE": case "IMAGES": case "HORA": case "PASSWORD":
                            break;
                        case "DATE": case "FECHA": case "HORA": case "NUMBER":
                            /**TODO */
                            const inputs = control.querySelectorAll("input");
                            findElementByDate(inputs[0].value, inputs[1].value);
                            break;
                        case "WSELECT": case "MULTISELECT":
                            if (control.selectedItems.length > 0) {
                                findElement(control);
                            }
                            break;
                        case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW": case "TEXTAREA":
                            break;
                        case "RADIO": case "CHECKBOX":
                            /**TODO */
                            break;
                        case "CALENDAR":
                            /**TODO */
                            break;
                        default:
                            break;
                    }
                } else {
                    findElement(control);
                }
                /** @param { MultiSelect } multiSelect */
                function findElement(multiSelect) {
                    if (multiSelect.selectedItems.length > 0) {
                        let find;
                        //@ts-ignore  
                        const objectlement = obj[multiSelect.id];
                        if (objectlement?.__proto__ == Object.prototype)
                            find = multiSelect.selectedItems.find(x => WArrayF.evalValue(objectlement, x) != undefined);
                        else if (objectlement?.__proto__ == Array.prototype)
                            find = multiSelect.selectedItems.find(x => WArrayF.evalValue(objectlement, x) != undefined);
                        else
                            find = multiSelect.selectedItems.find(x => x == objectlement);
                        if (find == undefined) {
                            flagObj = false;
                        }
                    }
                }
                /** @param { HTMLInputElement } input */
                function findByValue(input) {
                    if (!flagObj) {
                        return;
                    }
                    if (obj[input.id] == null || obj[input.id] == undefined) {
                        flagObj = false;
                        return undefined;
                    }
                    if (obj[input.id] != null && WArrayF.evalValue(obj[input.id], input.value.toUpperCase()) == null) {
                        flagObj = false;
                        return undefined;
                    }
                    return obj[input.id]
                }

                function findElementByDate(firstDate, secondDate) {
                    if (firstDate != "" && new Date(obj[control.id]) < new Date(firstDate + "T00:00:00")) {
                        flagObj = false;
                        return undefined;
                    }

                    if (secondDate != "" && new Date(obj[control.id]) > new Date(secondDate + "T00:00:00")) {
                        flagObj = false;
                        return undefined;
                    }
                    return obj[control.id]
                }

            });
            return flagObj;
        });
        if (this.Config.FilterFunction != undefined) {
            this.Config.FilterFunction(DFilt);
        } else {
            console.log(DFilt);
        }
    }
    /** @param {String} value  */

    /**
     * @param {String} prop 
     * @param {Array} Dataset 
     * @returns 
     */
    CreateSelectControl(prop, Dataset) {
        const options = Dataset?.map(option => {
            const OValue = option;
            const ODisplay = option;
            const OptionObject = WRender.Create({
                tagName: "option", value: OValue, innerText: ODisplay
            });
            return OptionObject;
        })
        options.unshift(WRender.Create({ tagName: "option", value: "", innerText: "Seleccionar" }));
        let InputControl = WRender.Create({
            tagName: "select", className: prop, onchange: this.filterFunction, id: prop,
            children: options
        });

        return InputControl;
    }
    /**
     * @param {String} prop 
     * @returns 
     */
    CreateTextControl(prop) {
        let InputControl = WRender.Create({
            tagName: "input",
            type: "text",
            className: prop,
            id: prop,
            placeholder: WOrtograficValidation.es(prop),
            onchange: (ev) => { this.filterFunction() }
        });
        return InputControl;
    }
    /**
     * @param {String} prop 
     * @returns 
     */
    CreateDateControl(prop) {
        let InputControl = WRender.Create({
            id: prop,
            class: "multi-control", children: [
                {
                    tagName: "input",
                    type: "date",
                    className: prop + " firstDate",
                    id: prop + "first",
                    // @ts-ignore
                    value: this.Config.AutoSetDate == true ? new Date().subtractDays(30).toISO() : undefined,
                    placeholder: prop,
                    onchange: (ev) => { this.filterFunction() }
                }, {
                    tagName: "input",
                    type: "date",
                    className: prop + " secondDate",
                    // @ts-ignore
                    value: this.Config.AutoSetDate == true ? new Date().addDays(1).toISO() : undefined,
                    id: prop + "second",
                    placeholder: prop,
                    onchange: (ev) => { this.filterFunction() }
                }
            ]
        });
        return InputControl;
    }
    CreateNumberControl(prop) {
        let InputControl = WRender.Create({
            id: prop,
            class: "multi-control", children: [
                {
                    tagName: "input",
                    type: "number",
                    className: prop + " firstNumber",
                    id: prop + "first",
                    placeholder: WOrtograficValidation.es(prop),
                    onchange: (ev) => { this.filterFunction() }
                }, {
                    tagName: "input",
                    type: "number",
                    className: prop + " secondNumber",
                    id: prop + "second",
                    placeholder: WOrtograficValidation.es(prop),
                    onchange: (ev) => { this.filterFunction() }
                }
            ]
        });
        return InputControl;
    }
    async CreateWSelect(ModelProperty, prop) {
        const InputControl = new MultiSelect({
            //MultiSelect: false,
            Dataset: ModelProperty.Dataset,
            ModelObject: ModelProperty.ModelObject,
            id: prop,
            FullDetail: true,
            action: () => {
                this.filterFunction();
            }
        });
        InputControl.onclick = async () => {
            if (ModelProperty.ModelObject?.__proto__ == Function.prototype) {
                ModelProperty.ModelObject = await WArrayF.ModelFromFunction(ModelProperty);
                /**@type {EntityClass} */
                const entity = ModelProperty.EntityModel ?? ModelProperty.ModelObject;
                ModelProperty.Dataset = await entity.Get();
                InputControl.Dataset = ModelProperty.Dataset;
                InputControl.Draw();
            }
        }
        return InputControl;
    }

    styles = css`
        *{
            font-family: Verdana, Geneva, Tahoma, sans-serif;
        }
        .reportV {
            margin: 10px;
        }

        .filter-container {    
            margin-top:10px;        
            margin-bottom: 20px;
            padding: 5px 10px;
            display: flex;
            justify-content: center;
            flex-direction: column;
            border: 2px solid #e4e4e4;
            border-radius: 10px;
            container-type: inline-size;
        }

        .OptionContainer {
            display: grid;
            width: 100%;
            grid-template-columns: repeat(4,calc(25% - 12px));
            grid-gap: 15px;
            padding: 0px 5px;
            overflow: hidden;
            max-height: 0px;
            transition: all 0.3s;
        }

        .OptionContainerActive {
            overflow: inherit;
            max-height: inherit;
            padding: 5px;
            transition: all 0.3s;
        }

        .OptionContainer label {
            padding: 10px;
            display: block;
        }
        .options {
            font-size: 11px;
            display: flex;
            align-items: center;
        }

        .BtnDinamictT {
            justify-content: center;
            align-items: center;
            display: flex;
            font-weight: bold;
            border: none;
            padding: 0px;
            margin: 5px;
            outline: none;
            text-align: center;
            font-size: 11px;
            cursor: pointer;
            background-color: #4894aa;
            color: #fff;
            border-radius: 0.2cm;
            width: 15px;
            height: 15px;
            background-color:#4894aa;
            font-family: monospace;
        }

        .OptionContainer div {
            display: grid;
            grid-template-rows: 30px auto;
            font-size: 11px;
        }

        .OptionContainer input,
        .OptionContainer select {
            margin: 0px;
            padding: 5px 10px;
        }

        .multi-control-container {
            grid-column: span 2;
        }
        .multi-control {
            display: flex !important;
            gap: 15px;
        }

        .BtnSuccess {
            font-weight: bold;
            border: none;
            padding: 10px;
            text-align: center;
            display: inline-block;
            min-width: 100px;
            cursor: pointer;
            background-color: #09f;
            color: #fff;
            border-right: rgb(3, 106, 175) 5px solid;
        }

        input.firstDate,
        input.secondDate {
            padding-left: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        input.firstDate::before {
            content: "Desde: ";
        }
        input.secondDate::before {
            content: "Hasta: ";
        }
        .firstNumber,
        .secondNumber {
            padding-left: 10px;
        }
        .firstNumber::before {
            content: "Desde: ";
        }
        .secondNumber::before {
            content: "Hasta: ";
        }

        @media (max-width: 600px) {
            .OptionContainer {
                display: flex;
                flex-direction: column;
            }

            .OptionContainer div {
                display: grid;
                grid-template-rows: 30px 30px;
                grid-template-columns: auto;
                font-size: 11px;
            }
        }
        @container (max-width: 700px) {
            .OptionContainer {
                grid-template-columns: repeat(2,calc(50% - 12px));
            }
        }
    `
}
customElements.define("w-filter-option", WFilterOptions);
export { WFilterOptions }