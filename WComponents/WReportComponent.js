//@ts-check
//@ts-check
import { WRender, ComponentsManager, WAjaxTools, WArrayF } from "../WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../StyleModules/WStyleComponents.js"
import { css } from "../WModules/WStyledRender.js";
/**
 * @typedef {Object} ReportConfig
 * @property {Array} [Dataset]
 * @property {Object} [ModelObject]
 */
class WReportComponent extends HTMLElement {
    /**
     * 
     * @param {ReportConfig} Config 
     */
    constructor(Config) {
        super();
        this.Config = Config
        this.attachShadow({ mode: 'open' });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.MainContainer = WRender.Create({ className: "MainContainer", id: 'Container' });
        this.Manager = new ComponentsManager({ MainContainer: this.MainContainer, SPAManage: false });
        this.shadowRoot?.append(this.CustomStyle);
        this.shadowRoot?.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.OptionContainer,
            this.MainContainer
        );
        this.Draw();
    }
    Draw = async () => {
        this.SetOption();
        this.MainContainer.append(this.CreateTable(this.Config.Dataset, true));
    }
    CreateTable(data, page) {
        const container = WRender.Create({ className: "container " + (page ? "pageA4" : "") });
        if (page) {
            container.append(this.CustomStyle)
        }
        const divHeader = WRender.Create({ className: "report-title" });
        const divFooter = WRender.Create({ className: "report-footer" });
        container.append(divHeader);
         /**@type {Object}*/const consolidado = WArrayF.Consolidado(data);
       
        data = data.map(d => WArrayF.replacer(d));
        data?.forEach((dato, index) => {
            const div = WRender.Create({ className: "report-container" });
            if (dato.__proto__ == Object.prototype) {
                for (const prop in dato) {
                    if ((prop == "get" || prop == "set") ||
                        prop == "ApiMethods" ||
                        prop == "FilterData" ||
                        prop == "Get" ||
                        prop == "GetByProps" ||
                        prop == "FindByProps" ||
                        prop == "Save" ||
                        prop == "Update" ||
                        prop == "GetData" ||
                        prop == "SaveData" ||
                        dato[prop] == null ||
                        dato[prop] == undefined ||
                        dato[prop].__proto__.constructor.name == "AsyncFunction") {
                        continue;
                    }
                    let header;
                    let footer;
                    if (index == 0) {
                        header = WRender.Create({
                            className: "row-title",
                            innerHTML: prop
                        })
                        divHeader.append(header);
                    }
                    if (index == data.length - 1) {
                        footer = WRender.Create({
                            className: consolidado[prop].Suma != undefined ?
                                "row-number row-title" : "row-title",
                            innerHTML: consolidado[prop].Suma != undefined ?
                                "Total: " + consolidado[prop].Suma?.toFixed(2) : ""
                        });
                    }
                    div.append(this.BuildRow(dato, prop, header, footer));
                    if (index == data.length - 1) {
                        divFooter.append(footer ?? "")
                    }

                }
            }
            else {
                div.append(this.BuildSimpleRow(dato));
            }
            container.append(div);
        });
        container.append(divFooter);
        return container;
    }

    BuildRow(dato, prop, titleHeader, footer) {
        if (typeof dato[prop] == "string") {
            return WRender.Create({ className: "row-string", innerHTML: dato[prop] });
        } else if (typeof dato[prop] == "number") {
            return WRender.Create({ className: "row-number", innerHTML: dato[prop].toFixed(2) });
        } else if (dato[prop]?.__proto__ == Object.prototype) {
            return this.BuildRow(WArrayF.replacer((dato[prop])));
        } else if (dato[prop]?.__proto__ == Array.prototype) {
            if (titleHeader != undefined) titleHeader.style.flex = 8;
            if (footer != undefined) footer.style.flex = 8;
            return this.CreateTable(dato[prop]);
        } else {
            //console.log(dato[prop]);
            return WRender.Create({ className: "row-string", innerHTML: dato[prop] });
        }
    }
    BuildSimpleRow(dato) {
        if (typeof dato == "string") {
            return WRender.Create({ className: "row-string", innerHTML: dato });
        } else if (typeof dato == "number") {
            return WRender.Create({ className: "row-number", innerHTML: dato.toFixed(2) });
        } else if (dato.__proto__ == Object.prototype) {
            return this.BuildRow(dato);
        } else if (dato.__proto__ == Array.prototype) {
            // if (titleHeader != undefined) titleHeader.style.flex = 6;
            // if (footer != undefined) footer.style.flex = 6;
            return this.CreateTable(dato);
        } else {
            //console.log(dato[prop]);
            return WRender.Create({ className: "row-string", innerHTML: dato });
        }
    }

    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Imprimir',
            onclick: async () => {
                const ventimp = window.open(' ', 'popimpr');
                ventimp?.document.write(this.MainContainer.querySelector(".pageA4")?.innerHTML ?? "no data");
                ventimp?.document.close();
                ventimp?.print();
                ventimp?.close();
            }
        }))
    }

    CustomStyle = css`
        *{
            -webkit-print-color-adjust: exact !important;
        }
        .MainContainer{
            background-color: #313131;
            max-height: calc(100vh - 50px);
            border: solid 1px #313131;
            overflow-y: auto;
        }
        .pageA4{
            width: 90%;
            min-width: 210mm;
            /* height: 297mm; */
            padding: 60px 60px;
            border: 1px solid #D2D2D2;
            background: #fff;
            margin:  10PX auto;
            box-shadow: 0 2px 5px 0px rgba(0,0,0,0.3);
        }
        .row-title, .row-number, .row-string, .report-container, .report-footer, .report-title {
           display: flex;
           flex: 1;
           padding: 5px;
           font-size: 10px;
           font-family: "Open Sans", sans-serif;
           border-right: 1px #cdcbcb solid;
        }  
        .row-title {
            color: #fff;
            text-transform: capitalize;
            background-color: #0d959a;
        }
        
        .row-number {
            justify-content: flex-end;
        }

        .container {
            flex: 8;
            display: flex;
            flex-direction: column;            
            border: 1px #cdcbcb solid;
            padding: 5px;
        }   
        @media print{
            .pageA4{
            width: 210mm;
            /* height: 297mm; */
            padding: 60px 60px;
            border: 1px solid #D2D2D2;
            background: #fff;
            margin:  10PX auto;
            box-shadow: 0 2px 5px 0px rgba(0,0,0,0.3);
        }
        }      
    `
}
customElements.define('w-component', WReportComponent);
export { WReportComponent }