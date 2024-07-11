//@ts-check
import { WRender, ComponentsManager, WAjaxTools, WArrayF } from "../WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../StyleModules/WStyleComponents.js"
import { css } from "../WModules/WStyledRender.js";
/**
 * @typedef {Object} ReportConfig
 * @property {Array} [Dataset]
 * @property {Object} [ModelObject]
 * @property {String} [Header]
 * @property {String} [SubHeader]
 * @property {String} [Logo]
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
        this.Header = WRender.Create({ className: "header-container" });
        this.shadowRoot?.append(
            StylesControlsV2.cloneNode(true),
            StyleScrolls.cloneNode(true),
            StylesControlsV3.cloneNode(true),
            this.CustomStyle,
            this.OptionContainer,
            this.MainContainer
        );
        this.Pages = [];

    }
    connectedCallback() {
        this.Draw();

    }
    Draw = async () => {
        this.SetOption();
        this.DrawReportHeader();
        this.CreateTable(this.Config.Dataset, true);
        /*this.Pages.forEach(page => {
            this.MainContainer.appendChild(page);
        });*/
    }
    DrawReportHeader() {
        if (this.Config.Logo) {
            this.Header.append(WRender.Create({
                tagName: "img", src: this.Config.Logo,
                className: "logo"
            }));
        }
        if (this.Config.Header) {
            this.Header.append(WRender.Create({
                tagName: "h1",
                className: "header",
                innerText: this.Config.Header
            }));
        }
        if (this.Config.SubHeader) {
            this.Header.append(WRender.Create({
                tagName: "p",
                className: "sub-header",
                innerText: this.Config.SubHeader
            }));
        }
    }

    CreateTable(data, page = false) {
        if (!this.Config.Dataset) return;
        this.MainContainer.innerHTML = "";


        let currentPage = this.createPage();
        //const divHeader = WRender.Create({ className: "report-title" });
        //const divFooter = WRender.Create({ className: "report-footer" });

        //currentPage.append(this.Header, divHeader)
        this.Pages.push(currentPage);
        this.MainContainer.appendChild(currentPage);

        //container.append(divHeader);

         /**@type {Object}*/const consolidado = WArrayF.Consolidado(data);

        //data = data.map(d => WArrayF.replacer(d));


        //this.Page.push(currentPage);

        data.forEach((dato, index) => {
            if (index == 0) {
                for (const prop in dato) {
                    currentPage.append( WRender.Create({
                        className: "row-title",
                        children: [prop]
                    }))                   
                }
            }
            if (dato.__proto__ == Object.prototype) {
                for (const prop in dato) {
                    let div = undefined;//this.CreateElement(dato)//WRender.Create({ className: "report-container" + (page ? " father" : " child") });
                    if (this.isNotDrawable(prop, this.Config.ModelObject, dato)) {
                        continue;
                    }
                    //console.log(prop);
                    div = this.BuildRow(dato, prop);
                    if (!this.elementFitsInPage(currentPage, div)) {
                        currentPage = this.createPage();
                        for (const prop in dato) {
                            currentPage.append( WRender.Create({
                                className: "row-title",
                                children: [prop]
                            }))                   
                        }
                        this.Pages.push(currentPage);
                        this.MainContainer.appendChild(currentPage)
                    }
                    currentPage.append(div);
                }
            }
            else {
                //div = this.BuildSimpleRow(dato);
            }
        });
        //currentPage.append(divFooter);
        return currentPage;
    }
    /**
     * @param {{ [x: string]: { __proto__: any[]; }; }} dato
     * @param {number} index
     * @param {HTMLElement} divHeader
     * @param {number} length
     * @param {{ [x: string]: { Suma: number; }; }} consolidado
     * @param {HTMLElement} div
     * @param {HTMLElement} divFooter
     */
    CreateElement(dato) {
        for (const prop in dato) {
            if (this.isNotDrawable(prop, this.Config.ModelObject, dato)) {
                continue;
            }
            // let header;
            // let footer;
            // if (index == 0) {
            //     header = WRender.Create({
            //         className: "row-title",
            //         children: [prop]
            //     });
            //     //divHeader.append(header);
            // }
            // if (index == length) {
            //     //console.log(prop, consolidado[prop], consolidado, dato);
            //     footer = WRender.Create({
            //         className: consolidado[prop].Suma != undefined ?
            //             "row-number row-title" : "row-title",
            //         children: [(consolidado[prop].Suma != undefined ?
            //             "Total: " + consolidado[prop].Suma?.toFixed(2) : "-")]
            //     });
            // }
            // /*if (dato[prop].__proto__ == Object.prototype) {
            //     const findArray = Object.keys(data[prop])
            //         .find(prop => data[prop](prop).__proto__ == Array.prototype);
            //     if (findArray != null) {
            //         div.className = div.className + (page && index > 0 ? " container-break-page" : "");
            //     }
            // } else if (dato[prop].__proto__ == Array.prototype) {
            //     div.className = div.className + (page && index > 0 ? " container-break-page" : "");
            // }*/
            // //div.append(this.BuildRow(dato, prop, header, footer, consolidado));
            // if (index == length) {
            //     //divFooter.append(footer ?? "");
            // }
            console.log(prop);
            return this.BuildRow(dato, prop)
        }
    }

    createPage() {
        // Create a new A4 page container
        return WRender.Create({
            className: "container pageA4",
            style: { gridTemplateColumns: "repeat(8, auto)" }
        });
    }

    /**
    * @param {HTMLElement} page 
    * @param {HTMLElement} element 
    * @returns {Boolean}
    */
    elementFitsInPage(page, element) {
        page.appendChild(element);
        const computedStyle = getComputedStyle(page);
        // console.log(parseFloat(computedStyle.paddingTop), computedStyle.paddingTop, computedStyle.paddingBottom, page.clientHeight);
        // console.log(page.scrollHeight <= page.clientHeight, page.scrollHeight, page.clientHeight, element.offsetHeight);
        const pageHeight = page.clientHeight
            - parseFloat(computedStyle.paddingTop)
            - parseFloat(computedStyle.paddingBottom);
        // console.log(pageHeight, page.scrollHeight);
        const scrollHeight = page.scrollHeight
            - parseFloat(computedStyle.paddingTop)
            - parseFloat(computedStyle.paddingBottom);
        console.log(scrollHeight, pageHeight, scrollHeight <= pageHeight);

        const fits = scrollHeight <= pageHeight;
        page.removeChild(element);
        return fits;
    }
    isNotDrawable(prop, ModelObject, element) {
        if (ModelObject != undefined && ((ModelObject[prop]?.type == undefined
            || ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
            || ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
            || ModelObject[prop]?.primary == true
            || ModelObject[prop]?.hidden == true
            || ModelObject[prop]?.hiddenInTable == true)
            || element[prop]?.__proto__ == Function.prototype
            || element[prop]?.__proto__.constructor.name == "AsyncFunction")) {
            return true;
        }
        return (prop == "get" || prop == "set") ||
            prop == "ApiMethods" ||
            prop == "FilterData" ||
            prop == "Get" ||
            prop == "GetByProps" ||
            prop == "FindByProps" ||
            prop == "Save" ||
            prop == "Update" ||
            prop == "GetData" ||
            prop == "SaveData" ||
            element[prop] == null ||
            element[prop] == undefined ||
            element[prop].__proto__.constructor.name == "AsyncFunction";
    }

    BuildRow(dato, prop, page = false) {
        //console.log("object", prop,dato[prop].__proto__ == Object.prototype);
        //console.log("array", prop,dato[prop].__proto__ == Array.prototype);
        //console.log(prop, dato[prop], dato[prop]?.__proto__ == Array.prototype);
        if (typeof dato[prop] == "string") {
            return WRender.Create({ className: "row-string", children: [dato[prop]] });
        } else if (typeof dato[prop] == "number") {
            return WRender.Create({ className: "row-number", innerHTML: dato[prop].toFixed(2) });
        } else if (dato[prop]?.__proto__ == Object.prototype) {
            return this.BuildRow(WArrayF.replacer((dato[prop])));
        } else if (dato[prop]?.__proto__ == Array.prototype) {
            //if (titleHeader != undefined) titleHeader.style.flex = 8;
            //if (footer != undefined) footer.style.flex = 8;
            /**@type {Object}*/const consolidadoProp = WArrayF.Consolidado(dato[prop]);
            //console.log(consolidadoProp);
            const div = WRender.Create({ className: "container child" });
            const divHeader = WRender.Create({ className: "report-title" });
            const divFooter = WRender.Create({ className: "report-footer" });
            //div.appendChild(divHeader);
            dato[prop].forEach((element, datoIndex) => {
                const divContainer = WRender.Create({ className: "report-container" + (page ? " father" : " child") });
                this.CreateElement(
                    element,
                    //datoIndex, 
                    //divHeader,
                    ///dato[prop].length - 1,
                    //consolidadoProp,
                    //divContainer,
                    //divFooter
                );
                div.appendChild(this.CreateElement(
                    element,
                    //datoIndex, 
                    //divHeader,
                    ///dato[prop].length - 1,
                    //consolidadoProp,
                    //divContainer,
                    //divFooter
                ))
            });
            //div.appendChild(divFooter)
            return div;
        } else {
            //console.log(dato[prop]);
            return WRender.Create({ className: "row-string", children: [dato[prop].toString()] });
        }
    }
    BuildSimpleRow(dato) {
        if (typeof dato == "string") {
            return WRender.Create({ className: "row-string", children: [dato] });
        } else if (typeof dato == "number") {
            return WRender.Create({ className: "row-number", children: [dato.toFixed(2)] });
        } else if (dato.__proto__ == Object.prototype) {
            return this.BuildRow(dato);
        } else if (dato.__proto__ == Array.prototype) {
            // if (titleHeader != undefined) titleHeader.style.flex = 6;
            // if (footer != undefined) footer.style.flex = 6;
            return this.CreateTable(dato);
        } else {
            return WRender.Create({ className: "row-string", children: [dato] });
        }
    }

    SetOption() {
        this.OptionContainer.append(WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Imprimir',
            onclick: async () => {
                const ventimp = window.open(' ', 'popimpr');
                ventimp?.document.write(this.MainContainer.querySelector(".pageA4")?.innerHTML ?? "no data");
                ventimp?.focus();
                setTimeout(() => {
                    ventimp?.print();
                    ventimp?.close();
                }, 100)

            }
        }))
    }

    CustomStyle = css`
        *{
            -webkit-print-color-adjust: exact !important;
            border-collapse: collapse;
        }
        .MainContainer{
            background-color: #313131;
            max-height: calc(100vh - 50px);
            border: solid 1px #313131;
            overflow-y: auto;
        }
        .pageA4{
            padding: 60px 60px;
            border: 1px solid #D2D2D2;
            background: #fff;
            box-shadow: 0 2px 5px 0px rgba(0,0,0,0.3);
            width: 210mm;
            height: 297mm;
            border: 1px solid #000;
            box-sizing: border-box;
            margin: 5mm auto;
            overflow: hidden;
            position: relative;
        }
        .row-title, .row-number, .row-string, 
        .report-container, .report-footer, .report-title {
           display: flex;
           flex: 1;
           font-size: 10px;
           font-family: "Open Sans", sans-serif;
           border-right: 1px #cdcbcb solid;
           border-bottom: 1px #cdcbcb solid;          
        }  
        .row-title, .row-number, .row-string {
            padding: 5px 10px;
        }
        .report-footer, .report-title {
            max-height: 30px;
        }

        /* .row-title:last-child,
        .row-number:last-child,
        .row-string:last-child,
        .report-footer:last-child,
        .report-title  {       
           border-right: none;
           border-bottom:none;
        }   */
        .row-title {
            color: #fff;
            text-transform: capitalize;
            background-color: #0d959a;
        }
        
        .row-number {
            justify-content: flex-end;
            align-items: center;
        }

        .container {
            flex: 8;
            display: grid;
            flex-direction: column;            
            border: 1px #cdcbcb solid;
            
        }   
        .container label { padding: 5px; }      
        .header-container {
            display: grid;
            grid-template-columns: 100px calc(100% - 120px);
            gap: 15px 30px;
            margin-bottom: 20px;
        } 
        .header-container .logo {
            grid-row: span 3;
            width: 100%;
        }
        .header, .sub-header {
            margin: 0px;
        }
        .report-container {
            border-collapse: collapse;
            border: 1px solid #D2D2D2;
        }
        .child {
            border: none;
        }
        .report-container:first-child {
            border-left: 1px solid #D2D2D2;
        }
        @media print{
            .pageA4{
                width: 210mm;
                /* height: 297mm; */
                padding: 60px 60px;
                background: #fff;
                margin:  10PX auto;
                box-shadow: 0 2px 5px 0px rgba(0,0,0,0.3);
            }
            
            .container-break-page {
                page-break-before:always;                
            }
            
        }      
    `
}
customElements.define('w-component', WReportComponent);
export { WReportComponent }