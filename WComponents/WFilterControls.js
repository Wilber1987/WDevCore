//@ts-check
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WRender, WArrayF } from "../WModules/WComponentsTools.js";
import { WCssClass } from "../WModules/WStyledRender.js";
/**
 * @typedef {Object} FilterConfig 
 *  * @property {Array} Dataset    
    * @property {Function} FilterFunction
    *  @property {Object} [ModelObject]
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
        const ControlOptions = WRender.Create({ class: "OptionContainer" })
        const Model = this.ModelObject ?? this.Config.Dataset[0];
        for (const prop in Model) {
            const SelectData = WArrayF.GroupBy(this.Config.Dataset, prop).map(s => s[prop]);
            if (!this.isNotDrawable(Model, prop)) {
                if (Model[prop].__proto__ == Object.prototype) {
                    const filterControl = await this.CreateModelControl(Model, prop, SelectData);
                    if (filterControl != null) {
                        ControlOptions.append(WRender.Create({ children: [prop, filterControl]}));
                        this.FilterControls.push(filterControl);
                    }
                } else {
                    const filterControl = await this.CreateWSelect(SelectData, prop); 
                    ControlOptions.append(WRender.Create({ children: [prop, filterControl]}));
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
            case "TITLE": case "IMG": case "IMAGE": case "IMAGES":
                break;
            case "DATE": case "FECHA": case "HORA": case "PASSWORD":
                /**TODO */
                break;
            case "SELECT":
                return this.CreateSelect(prop, Dataset);
            case "WSELECT":    case "MULTISELECT":   case "EMAIL":  case "TEL":  case "URL":         
                return await this.CreateWSelect( Dataset, prop);   
            case "MASTERDETAIL": case "MODEL": case "FILE": case "DRAW":  case "TEXTAREA":
               break;
            case "RADIO": case "CHECKBOX":
                 /**TODO */
                break;   
            case "CALENDAR":
                /**TODO */
                break;
            default:
                return await this.CreateWSelect( Dataset, prop);  
        }
        return null
    }
    isNotDrawable(Model, prop) {
        if (Model[prop] == null) {
            return true;
        }
        return (Model[prop].__proto__ == Object.prototype &&
            (Model[prop].primary || Model[prop].hidden || !Model[prop].type))
            || Model[prop].__proto__ == Function.prototype
            || Model[prop].__proto__.constructor.name == "AsyncFunction";
    }
    filterFunction = (propierty) => {
        const isValuePresent= (object, value, flagObj)=>{
            if (value == "") {
                return
            }
            if (object[propierty] == value) {
                if (flagObj) {
                    flagObj = true;
                }
            } else {
                flagObj = false;
            }
        }
        const DFilt = this.Config.Dataset.filter(obj => {
            let flagObj = true;
            this.FilterControls.forEach(control => {
                if (this.ModelObject.__proto__ == Object.prototype) {

                } else {
                    isValuePresent(control.value);
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
    /**
     * 
     * @param {String} prop 
     * @param {Array} Dataset 
     * @returns 
     */
    CreateSelect(prop, Dataset) {
        let InputControl = WRender.Create({
            tagName: "select", className: prop, onchange: this.filterFunction, id: prop,
            children: Dataset?.map(option => {
                const OValue = option;
                const ODisplay = option;
                const OptionObject = WRender.Create({
                    tagName: "option", value: OValue, innerText: ODisplay
                });
                return OptionObject;
            })
        });
        return InputControl;
    }

    async CreateWSelect(Dataset, prop) {
        const { MultiSelect } = await import("./WMultiSelect.js");
        const InputControl = new MultiSelect({
            MultiSelect: false,
            Dataset: Dataset,
            id: prop,
            FullDetail: false,
            action: () => {
                this.filterFunction();
            }
        });
        return InputControl;
    }

    styles = {
        type: 'w-style', props: {
            id: '', ClassList: [
                new WCssClass(`.reportV`, {
                    margin: '10px',
                }), new WCssClass(`.OptionContainer`, {
                    display: "grid",
                    "grid-template-columns": "50% 50%",
                    "grid-gap": 10
                }), new WCssClass(`.OptionContainer label`, {
                    padding: 10,
                    display: "block"
                }), new WCssClass(`.OptionContainer div`, {
                    display: "grid",
                    "grid-template-rows": "30px 30px",
                    //margin: "5px",
                    "font-size": "12px",
                }), new WCssClass(`.OptionContainer input, .OptionContainer select`, {
                    "grid-row": "2/3",
                    margin: "0px",
                    padding: "5px 10px",
                    "border": "2px solid #e1d4d4"
                }), new WCssClass(`.BtnSuccess`, {
                    "font-weight": "bold",
                    "border": "none",
                    "padding": "10px",
                    "text-align": "center",
                    "display": "inline-block",
                    "min-width": "100px",
                    "cursor": "pointer",
                    "background-color": "#09f",
                    "color": "#fff",
                    "border-right": "rgb(3, 106, 175) 5px solid",
                }),
            ], MediaQuery: [{
                condicion: '(max-width: 600px)',
                ClassList: [new WCssClass(`.OptionContainer`, {
                    display: "flex",
                    "flex-direction": "column",
                }), new WCssClass(`.OptionContainer div`, {
                    display: "grid",
                    "grid-template-rows": "30px 30px",
                    "grid-template-columns": "auto",
                    //margin: "5px",
                    "font-size": "12px",
                }),]
            },
            ]
        }
    };
}
customElements.define("w-filter-option", WFilterOptions);
export { WFilterOptions }