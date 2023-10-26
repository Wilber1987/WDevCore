//@ts-check
//@ts-check
import { WRender, ComponentsManager, WAjaxTools, WArrayF } from "../WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../StyleModules/WStyleComponents.js"
import { css } from "../WModules/WStyledRender.js";
/**
 * @typedef {Object} ReportConfig
 * * @property {Array} [Dataset]
 */
class WReportComponent extends HTMLElement {
    /**
     * 
     * @param {ReportConfig} config 
     */
    constructor(config) {
        super();
        this.config = config
        this.attachShadow({ mode: 'open' });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.shadowRoot?.append(this.CustomStyle);
        this.shadowRoot?.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.TabContainer
        );
        this.Draw();
    }
    Draw = async () => {
        this.SetOption();
        this.shadowRoot?.append(this.CreateTable(this.config.Dataset));
    }
    CreateTable(data) {
        const container = WRender.Create({ className: "container"});
        data.forEach(dato => {       
            const div = WRender.Create({ className: "report-container" });    
            if (dato.__proto__ == Object.prototype) {                
                for (const prop in dato) {
                    div.append(WRender.Create({ className: "row-title", innerHTML: prop }));
                    div.append(this.BuildRow(dato, prop));
                }
            }
            else { 
                console.log(dato);
                div.append( WRender.Create({ className: "row-string", innerHTML: dato }));
            }
            container.append(div);
        });
        return container;
    }

    BuildRow(dato, prop) {
        if (typeof dato[prop] == "string") {
            return WRender.Create({ className: "row-string", innerHTML: dato[prop] });
        } else if (typeof dato[prop] == "number") {
            return WRender.Create({ className: "row-number", innerHTML: dato[prop].toFixed(2) });
        } else if (dato[prop].__proto__ == Object.prototype) {
            return this.BuildRow(dato[prop]);
        } else if (dato[prop].__proto__ == Array.prototype) {
            return this.CreateTable(dato[prop]);
        } else {
            console.log(dato[prop]);
            return WRender.Create({ className: "row-string", innerHTML: dato[prop] });
        }
    }

    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Datos contrato',
            onclick: async () => this.Manager.NavigateFunction("id", WRender.Create({ className: "component" }))
        }))
    }

    CustomStyle = css`
        .row-number, .row-string, .report-container {
           display: flex;
           gap: 20px;
           border: 1px #999 solid;
        }  
        .container {
            display: flex;
            flex-direction: column;
        }         
    `
}
customElements.define('w-component', WReportComponent);
export { WReportComponent }