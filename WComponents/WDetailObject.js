
import { WRender, WArrayF, ComponentsManager, WAjaxTools } from '../WModules/WComponentsTools.js';
import { css, WCssClass, WStyledRender } from '../WModules/WStyledRender.js';
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WModalForm, WSimpleModalForm } from './WModalForm.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { WIcons } from '../WModules/WIcons.js';
import { WTableComponent } from './WTableComponent.js';
import { WAppNavigator } from './WAppNavigator.js';
import { ControlBuilder } from '../WModules/WControlBuilder.js';
let photoB64;
class Config { DOMManager = undefined; ModelObject = undefined; ImageUrlPath = undefined; ObjectDetail = {}; }
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
        const BtnReturn = WRender.Create({
            className: "GroupConfig", children: [{
                tagName: 'input', type: 'button', className: 'BtnSuccess BtnReturn', value: 'Regresar', onclick: async () => {
                    this.Config.DOMManager.Back();
                }
            }]
        })
        this.shadowRoot.append(BtnReturn, WRender.createElement(this.styleComponent), this.ProfileContainer, this.ComponentTab, this.TabContainer);
    }
    SetImage = (ObjectDetail, Model) => {
        const ImageCards = WRender.createElement({ type: 'div', props: { class: 'ImageCards' } });
        for (const prop in Model) {
            if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
                switch (Model[prop].type.toUpperCase()) {
                    case "IMG":
                        ImageCards.append(ControlBuilder.BuildImage(ObjectDetail[prop], this.Config.ImageUrlPath))
                        break;
                    default:
                        break;
                }
            }
        }
        this.ProfileContainer.append(ImageCards);
    }
    TabElements = (ObjectDetail, Model) => {
        const tabElements = [];
        for (const prop in Model) {
            if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
                switch (Model[prop].type.toUpperCase()) {
                    case "MASTERDETAIL":
                        tabElements.push({
                            name: WOrtograficValidation.es(prop), url: "#",
                            action: async (ev) => {
                                this.TabManager.NavigateFunction(prop, new WTableComponent({
                                    Options: { Search: true },
                                    ModelObject: Model[prop].ModelObject.__proto__ == Function.prototype ? Model[prop].ModelObject() : Model[prop].ModelObject,
                                    Dataset: ObjectDetail[prop] ?? []
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
    styleComponent = {
        type: 'w-style', props: {
            ClassList: [
                new WCssClass(`.ProfileContainer`, {
                    display: 'grid',
                    "grid-template-columns": "270px auto",
                    "border-bottom": "solid 2px #bbbec1",
                    "padding-bottom": 10,
                    "margin-bottom": 20,
                }), new WCssClass(`.DataContainer`, {
                    display: 'flex',
                    "flex-direction": "column",
                    padding: "5px"
                }), new WCssClass(` h3`, {
                    margin: "5px 10px",
                    color: "#09315f"
                }), new WCssClass(`.DataContainer label`, {
                    margin: "5px 10px",
                }), new WCssClass(`.divIdiomas`, {
                    display: 'flex',
                    "flex-wrap": "wrap"
                }), new WCssClass(`.divIdiomas label`, {
                    padding: 8,
                    margin: "5px 2px",
                    "background-color": "#5964a7",
                    color: "#fff",
                    "font-weight": "bold",
                    "border-radius": "0.4cm",
                    "font-size": 12
                }), new WCssClass(`.divRedes img`, {
                    height: 35,
                    width: 35,
                    "margin-right": 10
                }), new WCssClass(`.divRedes div`, {
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "left",
                    margin: 5
                }), new WCssClass(`.divRedes a`, {
                    "text-decoration": "none",
                    "font-weight": "bold",
                    color: "#09f"
                }), new WCssClass(`.ImageCards img`, {
                    width: "90%",
                    height: "auto",
                    margin: "auto",
                    "justify-self": "center",
                    display: "block",
                    "object-fit": "cover",
                    color: "#09f",
                    "border-radius": 10,
                    overflow: "hidden",
                    "box-shadow": "0 0 5px 0 #999"
                })
            ], MediaQuery: [{
                condicion: "(max-width: 800px)",
                ClassList: [
                    new WCssClass(`.ProfileContainer`, {
                        display: 'grid',
                        "grid-template-columns": "100%"
                    })
                ]
            }]
        }
    };
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
            if (Model != undefined && Model[prop] != undefined && Model[prop].__proto__ == Object.prototype && Model[prop].type) {
                switch (Model[prop].type.toUpperCase()) {
                    case "TEXT": "NUMBER"
                        this.container.append(WRender.Create({
                            tagName: 'div', class: 'DataContainer', children: [
                                prop + ": " + ObjectDetail[prop],
                            ]
                        }));
                        break;
                    case "DATE": "FECHA"
                        this.container.append(WRender.Create({
                            tagName: 'div', class: 'DataContainer', children: [
                                prop + ": " + ObjectDetail[prop].toDateFormatEs(),
                            ]
                        }));
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
customElements.define('w-detail-card', ProfileCard);
customElements.define('w-view-detail', WDetailObject);
export { WDetailObject, ProfileCard }