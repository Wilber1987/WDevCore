import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WAppNavigator } from "../WComponents/WAppNavigator.js";
import { WFilterOptions } from "../WComponents/WFilterControls.js";
import { WModalForm } from "../WComponents/WModalForm.js";
import { WTableComponent } from "../WComponents/WTableComponent.js";
import { ComponentsManager, WAjaxTools, WRender } from '../WModules/WComponentsTools.js';
import { ChangePasswordModel, ChangeRolesModel, ChangeStateModel, Security_Permissions, Security_Roles, Security_Users } from "./SecurityModel.js";
window.addEventListener("load", async () => {
    const DOMManager = new ComponentsManager({ MainContainer: Main });
    const Roles = await WAjaxTools.PostRequest("../api/ApiEntitySECURITY/getSecurity_Roles", {});
    const Permisos = await WAjaxTools.PostRequest("../api/ApiEntitySECURITY/getSecurity_Permissions", {});
    Main.append(WRender.createElement(StylesControlsV2));
    Aside.append(WRender.Create({ tagName: "h3", innerText: "Mantenimiento de Usuarios" }));
    Aside.append(new WAppNavigator({
        DarkMode: false,
        Direction: "column",
        Elements: [
            ElementTab("Roles", DOMManager, new Security_Roles({
                Security_Permissions_Roles: { type: "multiselect", Dataset: Permisos }
            })),
            ElementTab("Permisos", DOMManager, new Security_Permissions()),
            ElementTab("Usuarios", DOMManager, new Security_Users({
                Security_Users_Roles: { type: "multiselect", Dataset: Roles }
            })),
        ]
    }));
});
function ElementTab(TabName = "Tab", DOMManager, Model) {
    return {
        name: TabName, url: "#",
        action: async (ev) => {
            let response = await WAjaxTools.PostRequest("../api/ApiEntitySECURITY/get" + Model.constructor.name, {});
            if (TabName == "Usuarios") {
                response = response.map(u => {
                    u.Security_Users_Roles = u.Security_Users_Roles?.map(r => r.Security_Role);
                    return u;
                })
            } else if (TabName == "Roles") {
                response = response.map(r => {
                    r.Security_Permissions_Roles = r.Security_Permissions_Roles?.map(p => p.Security_Permissions);
                    return r;
                })
            }
            const mainComponent = new WTableComponent({
                Dataset: response,
                ModelObject: Model,
                Options: {
                    Add: TabName != "Permisos", UrlAdd: "../api/ApiEntitySECURITY/save" + Model.constructor.name,
                    Edit: TabName != "Permisos" && TabName != "Usuarios", UrlUpdate: "../api/ApiEntitySECURITY/save" + Model.constructor.name,
                    Search: true, UrlSearch: "../api/ApiEntitySECURITY/get" + Model.constructor.name,
                    UserActions: [
                        TabName == "Usuarios" ? {
                            name: "Cambiar estado", action: (object) => {
                                Main.append(ChangeState(object));
                            }
                        } : null,
                        TabName == "Usuarios" ? {
                            name: "Editar contraseña", action: (object) => {
                                Main.append(ChangePassword(object));
                            }
                        } : null,
                        TabName == "Usuarios" ? {
                            name: "Editar roles", action: async (object) => {
                                Main.append(await ChangeRoles(object));
                            }
                        } : null
                    ]
                }
            });
            const filterOptions = new WFilterOptions({
                Dataset: response,
                ModelObject: Model,
                FilterFunction: (DFilt) => {
                    mainComponent.DrawTable(DFilt);
                }
            });
            WRender.SetStyle(filterOptions, { marginBottom: "20px", display: "block" })
            DOMManager.NavigateFunction(Model.constructor.name,
                WRender.Create({
                    className: "container", children:
                        [filterOptions, mainComponent]
                }));
        }
    };
}
const ChangeRoles = async (/**@type {Security_Users} */ object) => {
    const Roles = await WAjaxTools.PostRequest("../api/ApiEntitySECURITY/getSecurity_Roles", {});   
    return new WModalForm({
        title: "CAMBIO DE CONTRASEÑA",
        EditObject: { Id_User: object.Id_User, Security_Users_Roles: object.Security_Users_Roles },
        ModelObject: new ChangeRolesModel({
            Security_Users_Roles: {
                type: "multiselect", Dataset: Roles
            }
        }),
        StyleForm: "ColumnX1",
        ObjectOptions: { Url: "../api/ApiEntitySECURITY/saveSecurity_Users" }
    })
}
const ChangePassword = (/**@type {Security_Users} */ object) => {
    return new WModalForm({
        title: "CAMBIO DE CONTRASEÑA",
        EditObject: { Id_User: object.Id_User, Password: object.Password },
        ModelObject: new ChangePasswordModel(),
        StyleForm: "ColumnX1",
        ObjectOptions: { Url: "../api/ApiEntitySECURITY/saveSecurity_Users" }
    })
}
const ChangeState = (/**@type {Security_Users} */ object) => {
    return new WModalForm({
        title: "CAMBIO DE ESTADO",
        EditObject: { Id_User: object.Id_User, Estado: object.Estado },
        ModelObject: new ChangeStateModel(),
        StyleForm: "columnX1",
        ObjectOptions: { Url: "../api/ApiEntitySECURITY/saveSecurity_Users" }
    })
}

