
import { Tbl_Profile } from '../../ModelProyect/ProyectDataBaseModel.js';
import { ChangePasswordModel } from './SecurityModel.js';
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WAppNavigator } from '../WComponents/WAppNavigator.js';
import { WDetailObject } from '../WComponents/WDetailObject.js';
import { ModalVericateAction, WForm } from "../WComponents/WForm.js";
import { WModalForm } from "../WComponents/WModalForm.js";
import { WTableComponent } from "../WComponents/WTableComponent.js";
import { ComponentsManager, WAjaxTools, WRender } from '../WModules/WComponentsTools.js';
import { WCssClass, WStyledRender } from '../WModules/WStyledRender.js';

const OnLoad = async () => {
    Aside.append(WRender.Create({ tagName: "h3", innerText: "Administración de perfiles" }));
    const AdminPerfil = new PerfilClass();
    Aside.append(AdminPerfil.MainNav);
    Main.appendChild(AdminPerfil);

}
window.onload = OnLoad;
class PerfilClass extends HTMLElement {
    constructor() {
        super();
        this.Id_Perfil = 1;
        this.id = "PerfilClass";
        this.className = "PerfilClass DivContainer";
        this.append(this.WStyle, StylesControlsV2.cloneNode(true));
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: "TabContainer" } });
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabActividades = this.MainNav;
        this.DrawComponent();
    }
    EditarPerfilNav = () => {
        return [{
            name: "Perfil", action: async (ev) => { this.EditProfile(); }
        }];
    }
    MainNav = new WAppNavigator({
        //NavStyle: "tab",
        Direction: "column",
        Inicialize: true,
        Elements: [
            {
                name: "Datos Generales",
                action: async (ev) => {
                    this.response = await WAjaxTools.PostRequest("../../api/Profile/TakeProfile",
                        { Id_Perfil: this.Id_Perfil }
                    );
                    this.TabManager.NavigateFunction("Tab-Generales",
                        new WDetailObject({ ObjectDetail: this.response, ModelObject: new Tbl_Profile(), ImageUrlPath: "" }));
                }
            }, {
                name: "Editar Perfil",
                action: async (ev) => {
                    this.response = await WAjaxTools.PostRequest("../../api/Profile/TakeProfile",
                        { Id_Perfil: this.Id_Perfil }
                    );
                    this.TabManager.NavigateFunction("Tab-Edit-Generales",
                        new WForm({
                            AutoSave: true,
                            EditObject: this.response,
                            ModelObject: new Tbl_Profile(),
                            ImageUrlPath: ""
                        }));
                }
            }, {
                name: "Editar Contraseña",
                action: async (ev) => {
                    this.append(new WModalForm({
                        title: "CAMBIO DE CONTRASEÑA",
                        EditObject: { Password: "" },
                        ModelObject: new ChangePasswordModel(),
                        StyleForm: "ColumnX1",
                        ObjectOptions: { Url: "../api/ApiEntitySECURITY/changePassword" }
                    }));
                }
            }
        ]
    });

    EditProfile = async () => {
        //const Id_Institucion = await WAjaxTools.PostRequest("../../api/PublicCat/GetInstitucion");
        // const Id_Paises = await WAjaxTools.PostRequest("../../api/PublicCat/GetPaises");
        const InvestigadorModel = new Tbl_Profile({
        });
        const EditForm = WRender.Create({
            className: "FormContainer", style: {
                padding: "10px",
                borderRadius: ".3cm",
                boxShadow: "0 0 4px 0 rgb(0 0 0 / 40%)",
                margin: "10px"
            }, children: [
                new WForm({
                    ModelObject: InvestigadorModel,
                    EditObject: this.response,
                    ImageUrlPath: "",
                    ObjectOptions: { Url: "../../api/Profile/SaveProfile" },
                })
            ]
        });
        this.TabManager.NavigateFunction("Tab-Editar", EditForm);
    }


    connectedCallback() { }
    DrawComponent = async () => {
        this.append(this.TabContainer);
    }
    WStyle = new WStyledRender({
        ClassList: [
            new WCssClass(`.PerfilClass`, {
            }), new WCssClass(`.OptionContainer`, {
                display: 'flex',
                "justify-content": "center",
            }), new WCssClass(`.OptionContainer img`, {
                "box-shadow": "0 0 4px rgb(0,0,0/50%)",
                height: 100,
                width: 100,
                margin: 10
            }), new WCssClass(`.TabContainer`, {
                overflow: "hidden",
                "overflow-y": "auto"
            }), new WCssClass(`.FormContainer`, {
                "background-color": '#fff',
            })
        ], MediaQuery: [{
            condicion: '(max-width: 600px)',
            ClassList: []
        }]
    });
    Icons = {
        New: "",
        View: "",
    }
}

customElements.define('w-perfil', PerfilClass);