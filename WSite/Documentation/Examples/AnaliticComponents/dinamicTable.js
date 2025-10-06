import { ComponentsManager, WRender } from "../../../../../WDevCore/WModules/WComponentsTools.js";
import { WAppNavigator } from "../../../../../WDevCore/WComponents/WAppNavigator.js";
import { WTableDynamicComp } from "../../../../../WDevCore/WComponents/WTableDynamic.js";
import { data, ModelObject } from "../data.js";

const tab = WRender.Create({ className: "tab" })
const navigator = new WAppNavigator({
    Direction: "column",
    Inicialize: true,
    Elements: [{
        id: "Tab-dasboard", name: "Tabla con parametros de evaluación definidos", action: async (ev) => {
            const TableConfigG = {
                Dataset: data,
                EvalValue: "value",
                AttNameEval: "homeTown",
                groupParams: ["year"],
                AddChart: true,
                ModelObject : new ModelObject()
            };
            const WTableReport = new WTableDynamicComp(TableConfigG);
            DOMManager.NavigateFunction("Tab-dasboard", WTableReport);
        }
    },{
        id: "Tab-dasboard2", name: "Tabla sin parametros de evaluación definidos", action: async (ev) => {
            const TableConfigG = {
                Dataset: data,
                AddChart: true,
                ModelObject: new ModelObject(),
            };
            const WTableReport = new WTableDynamicComp(TableConfigG);
            DOMManager.NavigateFunction("Tab-dasboard2", WTableReport);
        }
    }, {
        id: "Tab-dasboard3", name: "Tabla estatica con parametros de evaluación definidos", action: async (ev) => {
            const TableConfigG = {
                Dataset: data,
                AddChart: true,
                EvalValue: "value",
                AttNameEval: "homeTown",
                ModelObject: new ModelObject(),
                groupParams: ["year", "mes"],
                DisplayOptions: false
            };
            const WTableReport = new WTableDynamicComp(TableConfigG);
            DOMManager.NavigateFunction("Tab-dasboard3", WTableReport);
        }
    }, {
        id: "Tab-dasboard4", name: "Tabla con parametros sin gráfico", action: async (ev) => {
            const TableConfigG = {
                Dataset: data,
                EvalValue: "value",
                AttNameEval: "homeTown",
                groupParams: ["year", "mes"],
                ModelObject: new ModelObject(),
                AddChart: false
            };
            const WTableReport = new WTableDynamicComp(TableConfigG);
            DOMManager.NavigateFunction("Tab-dasboard4", WTableReport);
        }
    },]
})
const DOMManager = new ComponentsManager({ MainContainer: tab, SPAManage: true, WNavigator: navigator });
document.querySelector("main").append(navigator)
document.querySelector("main").append(tab)


