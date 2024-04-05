import { ModelProperty } from "../../../WModules/CommonModel.js";
import { ComponentsManager, WRender } from "../../../WModules/WComponentsTools.js";
import { WAppNavigator } from "../../WAppNavigator.js";
import { WTableComponent } from "../../WTableComponent.js";
import { data } from "../data.js";
class ModelObject {
    /**@type {ModelProperty}*/ squadName = { type: 'text' };
    /**@type {ModelProperty}*/ homeTown = { type: 'text' };
    /**@type {ModelProperty}*/ year = { type: 'number' };
    /**@type {ModelProperty}*/ mes = { type: 'text' };
    /**@type {ModelProperty}*/ trimestre = { type: 'text' };
    /**@type {ModelProperty}*/ secretBase = { type: 'text', hiddenInTable: true };
    /**@type {ModelProperty}*/ active = { type: 'checkbox', hiddenInTable: true };
    /**@type {ModelProperty}*/ value = { type: 'number', hiddenInTable: true };
}
const tab = WRender.Create({ className: "tab" })
const navigator = new WAppNavigator({
    Direction: "column",
    Inicialize: true,
    Elements: [{
       id:"Tab-dasboard", name: "Tabla basica", action: async (ev) => {
            DOMManager.NavigateFunction("Tab-dasboard", new WTableComponent({
                Dataset: data
            }));
        }
    }, {
        id:"Tab-Generales", name: "Tabla con modelo",
        action: async (ev) => {
            DOMManager.NavigateFunction("Tab-Generales", new WTableComponent({
                Dataset: data,
                ModelObject: new ModelObject()
            }));
        }
    }, {
        id:"Tab-Options", name: "Tabla con modelo y opciones customizadas",
        action: async (ev) => {
            DOMManager.NavigateFunction("Tab-Options", new WTableComponent({
                Dataset: data,
                ModelObject: new ModelObject(),
                Options: {
                    Search: false,
                    Show: false,
                    Edit: false,
                    Filter: true,
                    MultiSelect: true,
                    Delete: true
                }
            }));
        }
    }, {
        id:"Tab-Options2", name: "Tabla con opciones y acciones customizadas",
        action: async (ev) => {
            DOMManager.NavigateFunction("Tab-Options2", new WTableComponent({
                Dataset: data,
                ModelObject: new ModelObject(),
                Options: {
                    Add: true, AddAction: (targetObject) => { alert("se agrego:" + JSON.stringify(targetObject)) },
                    Edit: true, EditAction: (targetObject) => { alert("se edito:" + JSON.stringify(targetObject)) },
                    MultiSelect: true, SelectAction: (targetObject) => { alert("se selecciono:" + JSON.stringify(targetObject)) },
                    Delete: true, DeleteAction: (targetObject) => { alert("se elimino:" + JSON.stringify(targetObject)) }
                }
            }));
        }
    }]
})
const DOMManager = new ComponentsManager({ MainContainer: tab, SPAManage: true, WNavigator: navigator });
document.querySelector("main").append(navigator)
document.querySelector("main").append(tab)


