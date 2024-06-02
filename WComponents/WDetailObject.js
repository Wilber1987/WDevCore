
import { WRender, WArrayF, ComponentsManager, WAjaxTools, ConvertToMoneyString } from '../WModules/WComponentsTools.js';
import { css, WCssClass, WStyledRender } from '../WModules/WStyledRender.js';
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WModalForm, WSimpleModalForm } from './WModalForm.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { WIcons } from '../WModules/WIcons.js';
import { WTableComponent } from './WTableComponent.js';
import { WAppNavigator } from './WAppNavigator.js';
import { ControlBuilder } from '../WModules/WControlBuilder.js';
let photoB64;
class Config {
    DOMManager = undefined;
    EntityModel = undefined;
    ModelObject = undefined;
    ImageUrlPath = undefined;
    ObjectDetail = {};
}
class WDetailObject extends HTMLElement {
    constructor(Config = new Config()) {
        super();
        this.attachShadow({ mode: 'open' });
        this.id = "ProfileInvestigador";
        this.Config = Config;
        this.ObjectDetail = this.Config.ObjectDetail;
        this.ModelObject = this.Config.ModelObject ?? this.ObjectDetail;
        this.ProfileContainer = WRender.createElement({ type: 'div', props: { class: 'ProfileContainer' } });
        this.SetImage(this.ObjectDetail, this.ModelObject)
        this.ProfileContainer.append(new ProfileCard(this.Config));
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: "TabContainer" } });
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.shadowRoot.appendChild(StylesControlsV2.cloneNode(true));
        this.append(new WStyledRender({
            ClassList: [
                new WCssClass(`w-view-profile`, {
                    "background-color": '#fff',
                    margin: 10,
                    display: "block",
                    "box-shadow": "0 0 4px 0 rgb(0,0,0,40%)",
                    "border-radius": "0.3cm"
                }), new WCssClass(`.ResumenContainer`, {
                    //"background-color": '#fff',
                    "border-radius": "0.2cm",
                    padding: 20,
                    //"box-shadow": "0 0 4px 0 rgb(0,0,0,40%)",
                    display: "flex",
                    "flex-direction": "column"
                }), new WCssClass(`.ResumenContainer label`, {
                    "background-color": '#eee',
                    padding: 10,
                    margin: 5,
                    "border-radius": "0.3cm"
                })]
        }))
        this.ComponentTab = new WAppNavigator({
            NavStyle: "tab", id: "GuidesNav", title: "Menu", Inicialize: true, Elements: this.TabElements(this.ObjectDetail, this.ModelObject)
        });
        // const BtnReturn = WRender.Create({
        //     className: "GroupConfig", children: [{
        //         tagName: 'input', type: 'button', className: 'BtnSuccess BtnReturn', value: 'Regresar', onclick: async () => {
        //             this.Config.DOMManager.Back();
        //         }
        //     }]
        // })
        this.shadowRoot.append(WRender.createElement(this.styleComponent), this.ProfileContainer, this.ComponentTab, this.TabContainer);
    }
    SetImage = (ObjectDetail, Model) => {
        let isImg = false;
        const ImageCards = WRender.createElement({ type: 'div', props: { class: 'ImageCards' } });
        for (const prop in Model) {
            if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
                switch (Model[prop].type.toUpperCase()) {
                    case "IMG":
                        isImg = true;
                        if (ObjectDetail[prop] != undefined && ObjectDetail[prop] != null) {
                            ImageCards.append(ControlBuilder.BuildImage(ObjectDetail[prop], this.Config.ImageUrlPath))
                        }

                        break;
                    default:
                        break;
                }
            }
        }
        if (isImg) {
            this.ProfileContainer.append(ImageCards);
        }
    }
    TabElements = (ObjectDetail, Model) => {
        const tabElements = [];
        for (const prop in Model) {
            if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
                switch (Model[prop].type.toUpperCase()) {
                    case "MASTERDETAIL":
                        tabElements.push({
                            name: Model[prop].label ?? WOrtograficValidation.es(prop), url: "#",
                            action: async (ev) => {
                                ObjectDetail[prop] = ObjectDetail[prop] != "" && ObjectDetail[prop] != undefined && ObjectDetail[prop] != null && ObjectDetail[prop].__proto__ == Array.prototype ?
                                    ObjectDetail[prop] : [];
                                this.TabManager.NavigateFunction(prop, new WTableComponent({
                                    Options: { Search: true, Show: true },
                                    ImageUrlPath: this.Config.ImageUrlPath,
                                    AddItemsFromApi: false,
                                    EntityModel: this.Config.EntityModel,
                                    ModelObject: Model[prop].ModelObject.__proto__ == Function.prototype ? Model[prop].ModelObject() : Model[prop].ModelObject,
                                    Dataset: ObjectDetail[prop] ?? []
                                }));
                            }
                        });
                        break;
                    case "MODEL":
                        tabElements.push({
                            name: Model[prop].label ?? WOrtograficValidation.es(prop), url: "#",
                            action: async (ev) => {
                                this.TabManager.NavigateFunction(prop, new ProfileCard({
                                    ModelObject: Model[prop].ModelObject.__proto__ == Function.prototype ? Model[prop].ModelObject() : Model[prop].ModelObject,
                                    ObjectDetail: ObjectDetail[prop]

                                }));
                            }
                        });
                        break;
                    default:
                        break;
                }
            }
        }
        return tabElements;
    }
    styleComponent = css`
        .ProfileContainer {
            display: flex;
            grid-template-columns: auto auto;
            border-bottom: solid 2px #bbbec1;
            padding-bottom: 10px;
            margin-bottom: 20px;
            overflow-y: auto;
        }       

        h3 {
            margin: 5px 10px;
            color: #09315f;
        }


        .divIdiomas {
            display: flex;
            flex-wrap: wrap;
        }

        .divIdiomas label {
            padding: 8px;
            margin: 5px 2px;
            background-color: #5964a7;
            color: #fff;
            font-weight: bold;
            border-radius: 0.4cm;
            font-size: 12px;
        }

        .divRedes img {
            height: 35px;
            width: 35px;
            margin-right: 10px;
        }

        .divRedes div {
            display: flex;
            align-items: center;
            justify-content: left;
            margin: 5px;
        }

        .divRedes a {
            text-decoration: none;
            font-weight: bold;
            color: #09f;
        }
        .ImageCards {
            max-width: 300px;
        }

        .ImageCards img {
            width: 90%;
            max-width: 300px;
            height: auto;
            margin: auto;
            justify-self: center;
            display: block;
            object-fit: cover;
            color: #09f;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 5px 0 #999;
            margin-bottom: 30px;
        }

        .DataContainer label:first-letter {
            text-transform: uppercase;
        }
        .TextArea {
            grid-column: span 4;
            font-size: 11px !important;
            text-align: justify;
            max-height: 300px;
            overflow-y: auto;
        }
       
        w-detail-card {
            width: 100%;
        }

        .cont {
            font-size: 12px;
            display: grid;
            grid-template-columns: 24.5%  24.5% 24.5% 24.5%;         
            overflow-x: hidden;
            border-radius: 20px;            
            padding: 10px;
            gap:10px;
            margin: 10px 0px;
        }    
        .cont h3 {
            grid-column: span 4;
            width: 100%;
        }  
        .DataContainer label {
            font-size:12px;
        }
        .cont .label-value {          
            width: 100%;
            font-size:15px;
            font-weight: bold;
        }

        .DataContainer {
            display: flex;
            text-align: left;
            justify-content: space-between;
            flex-wrap: wrap;
            min-height: 36px;
            overflow: hidden;
            border-right: 1px solid #d9d9d9;
            border-radius: 0 8px 8px 0;
            transition: all .5s;
        }
        .DataContainer:hover {           
            border-right: 1px solid #575757;
        }

        @media (max-width: 800px) {
            .cont {               
                grid-template-columns: 100%;     
            }    
            .cont h3, .TextArea  {
                grid-column: span 1;
                width: 100%;
            }  
            .ImageCards {
                max-width: 300px;
                height: auto;
                margin: auto;
            }
            .ProfileContainer {
                text-align: center;
                display: grid;
                grid-template-columns: 100%;
            }
        }
    `
}

class ProfileCard extends HTMLElement {
    constructor(Config = new Config()) {
        super();
        this.Config = Config;
        this.ObjectDetail = this.Config.ObjectDetail;
        this.ModelObject = this.Config.ModelObject ?? this.ObjectDetail;
        this.container = WRender.Create({ className: "cont" });
        this.DraProfileCard(this.ObjectDetail, this.ModelObject);
        this.append(this.container);
    }
    connectedCallback() { }
    DraProfileCard = async (ObjectDetail, Model) => {
        this.container.innerHTML = "";
        this.container.append(WRender.CreateStringNode("<h3>Datos Generales</h3>"));
        for (const prop in Model) {
            try {
                if (ObjectDetail[prop] == undefined || ObjectDetail[prop] == null || this.isNotDrawable(Model, prop)) {
                    continue;
                }
                this.createPropDetail(ObjectDetail, prop, Model);
            } catch (error) {
                console.log(error);
                console.log(prop);
                console.log(ObjectDetail[prop]);
            }
        }
    }
    isNotDrawable(Model, prop) {
        return (Model[prop]?.__proto__ == Object.prototype &&
            (Model[prop]?.primary || Model[prop]?.hidden || !Model[prop]?.type))
            || Model[prop]?.__proto__ == Function.prototype
            || Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "FilterData";
    }

    createPropDetail(ObjectDetail, prop, Model) {
        ObjectDetail[prop] = ObjectDetail[prop] == null || ObjectDetail[prop] == undefined ? "" : ObjectDetail[prop];
        if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
            switch (Model[prop].type.toUpperCase()) {
                case "TEXT":
                    this.container.append(WRender.Create({
                        tagName: 'div', class: 'DataContainer', children: [
                            (Model[prop].label ?? WOrtograficValidation.es(prop)) + ": ",
                            { tagName: 'label', className: "label-value", innerText: WOrtograficValidation.es(ObjectDetail[prop] ?? "") }
                        ]
                    }));
                    break;
                case "NUMBER": case "MONEY": case "PERCENTAGE":
                    let text;
                    this.container.append(WRender.Create({
                        tagName: 'div', class: 'DataContainer', children: [
                            (Model[prop].label ?? WOrtograficValidation.es(prop)) + ": ",
                            {
                                tagName: 'label', className: "label-value", innerText:
                                    (typeof ObjectDetail[prop] === "number" && Model[prop].type.toUpperCase() == "MONEY"
                                        ? ConvertToMoneyString(ObjectDetail[prop]) :
                                        typeof ObjectDetail[prop] === "number" && Model[prop].type.toUpperCase() == "PERCENTAGE"
                                            ? `${ObjectDetail[prop]} %` : ObjectDetail[prop])
                            }
                        ]
                    }));
                    break;
                case "DATE": case "FECHA":
                    this.container.append(WRender.Create({
                        tagName: 'div', class: 'DataContainer', children: [
                            (Model[prop].label ?? WOrtograficValidation.es(prop)) + ": ",
                            { tagName: 'label', className: "label-value", innerText: ObjectDetail[prop]?.toDateFormatEs() ?? "" }
                        ]
                    }));
                    break;
                case "TEXTAREA":
                    this.container.append(WRender.Create({
                        tagName: 'div', class: 'DataContainer TextArea', children: [
                            (Model[prop].label ?? WOrtograficValidation.es(prop)) + ": ",
                            { tagName: 'label', className: "label-value", innerHTML: ObjectDetail[prop] ?? "" }
                        ]
                    }));
                    break;
                default:
                    break;
            }
        }
    }
}
customElements.define('w-detail-card', ProfileCard);
customElements.define('w-view-detail', WDetailObject);
export { WDetailObject, ProfileCard }