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
        this.shadowRoot?.append(StyleScrolls.cloneNode(true));
        this.shadowRoot?.append(StylesControlsV2.cloneNode(true));
        this.shadowRoot?.append(WRender.createElement(this.style));
        this.shadowRoot?.append(this.FilterContainer);
        this.attachShadow({ mode: "open" });
        this.DrawFilter();
    }
    connectedCallback() {
    }
    DrawFilter = async ()=> {
        this.FilterContainer.innerHTML = "";
        const ControlOptions = WRender.Create({ class: "OptionContainer" })
        const Model = this.ModelObject ?? this.Config.Dataset[0];
        for (const prop in Model) {
            if (!this.isNotDrawable(Model, prop)) {
                if (Model[prop].__proto__ == Object.prototype) {
                    if (Model[prop].ModelObject?.__proto__ == Function.prototype ) {
                        Model[prop] = undefined;
                        continue;
                    }
                    const filterControl = await this.CreateModelControl(Model, prop, );
                    ControlOptions.append(filterControl);
                    this.FilterControls.push(filterControl);
                } else {
                    
                }
            } 
            if ((typeof this.Config.Dataset[0][prop] != "number"
                && !prop.toUpperCase().includes("FECHA")
                && !prop.toUpperCase().includes("DATE"))
                || prop.toUpperCase().includes("AÑO")
                || prop.toUpperCase().includes("YEAR")) {
                const select = {
                    type: 'select', props: { id: prop }, children: [
                        { type: 'option', props: { innerText: 'Seleccione', value: '' } }
                    ]
                }
                const SelectData = WArrayF.GroupBy(this.Config.Dataset, prop);
                SelectData.forEach(data => {
                    if (data[prop] != "" && data[prop] != null) {
                        select.children.push({
                            type: 'option', props: { innerText: data[prop], value: data[prop] }
                        });
                    }
                });
                select.props.onchange = async (ev) => {

                }
                ControlOptions.children.push([WArrayF.Capitalize(prop.replace("_", " ")), select]);
            }
        }
        this.FilterContainer.append(WRender.createElement(ControlOptions));

    }
    isNotDrawable(Model, prop) {
        return (Model[prop].__proto__ == Object.prototype &&
            (Model[prop].primary || Model[prop].hidden || !Model[prop].type))
            || Model[prop].__proto__ == Function.prototype
            || Model[prop].__proto__.constructor.name == "AsyncFunction";
    }
    filterFunction = (value) => {
        // let SelectFlag = false;
        // this.shadowRoot?.querySelectorAll("#optionsContainter select").forEach(select => {
        //     if (select.id != ev.target.id) {
        //         if (select.value != "") {
        //             SelectFlag = true;
        //         }
        //     }
        // });
        const DFilt = this.Config.Dataset.filter(obj => {
            let flagObj = true;
            this.FilterControls.forEach(select => {
                if (select.value == "") {
                    return
                }
                if (obj[select.propierty] == select.value) {
                    if (flagObj) {
                        flagObj = true;
                    }
                } else {
                    flagObj = false;
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

    style = {
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