//@ts-check
import { WRender, ComponentsManager, html } from "../WModules/WComponentsTools.js";
import { StylesControlsV2, StylesControlsV3, StyleScrolls } from "../StyleModules/WStyleComponents.js"
import { css } from "../WModules/WStyledRender.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { WPrintExportToolBar } from "./WPrintExportToolBar.mjs";
import "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"

/**
 * @typedef {Object} ReportConfig
 * @property {Array} [Dataset]
 * @property {Object} [ModelObject]
 * @property {String} [Header]
 * @property {String} [SubHeader]
 * @property {String} [Logo]
 * @property {String} [PageType]
 * @property {Function} [exportXlsAction]
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
        this.countProps = 0;
        this.Config.PageType = this.Config.PageType ?? "A4";
        this.exportXlsAction = Config.exportXlsAction;

    }
    connectedCallback() {
        this.Draw();
    }
    Draw = async () => {
        if (!this.Config.Dataset) return;
        this.MainContainer.innerHTML = "";
        this.SetOption();
        this.Config.Dataset = this.Config.Dataset.map(d => this.replacer(d));
        /**@type {Object}*/const consolidado = WArrayF.Consolidado(this.Config.Dataset, this.Config.ModelObject);
        console.log(consolidado);
        this.countProps = Object.keys(consolidado).length;
        this.DrawReportHeader();
        /*for (let index = 0; index < 500; index++) {
            this.Config.Dataset.push(this.Config.Dataset[0])
        }*/
        this.CreateTable(this.Config.Dataset, true);
        /*this.Pages.forEach(page => {
            this.MainContainer.appendChild(page);
        });*/
    }
    DrawReportHeader() {
        this.Header.style.gridColumn = `span ${this.countProps + 1}`
        if (this.Config.Logo) {
            this.Header.append(WRender.Create({
                tagName: "img", src: this.Config.Logo,
                className: "logo",
                style: "width: 80px; height: 80px; object-fit:cover"
            }));
        }
        if (this.Config.Header) {
            this.Header.append(WRender.Create({
                tagName: "h2",
                className: "header",
                innerText: this.Config.Header
            }));
        }
        if (this.Config.SubHeader) {
            this.Header.append(WRender.Create({
                tagName: "h3",
                className: "sub-header",
                innerText: this.Config.SubHeader
            }));
        }
    }

    CreateTable(data, isPage = true) {
        let currentPage = this.createPage();
        if (isPage) {
            currentPage.append(this.Header.cloneNode(true))
        }
        this.Pages.push(currentPage);
        this.MainContainer.appendChild(currentPage);
        /**@type {Object}*/const consolidado = WArrayF.Consolidado(data, this.Config.ModelObject);
        data.forEach((dato, index) => {
            currentPage = this.BuildContent(index, dato, currentPage, isPage, data, consolidado);
        });
        return currentPage;
    }
    /**
     * @param {number} [index]
     * @param {{ __proto__: Object; } | undefined} [dato]
     * @param {HTMLElement} [currentPage]
     * @param {boolean | undefined} [isPage]
     * @param { Array } [data]
     * @param {Object} [consolidado]
     * @return {HTMLElement}
     */
    BuildContent(index, dato, currentPage, isPage, data, consolidado) {
        if (index == 0) {
            currentPage?.append(WRender.Create({
                className: "row-title",
                children: ["№"]
            }));
            for (const prop in consolidado) {
                if (!consolidado[prop]) {
                    continue;
                }
                if (this.isNotDrawable(prop, this.Config.ModelObject, dato)) {
                    continue;
                }
                currentPage?.append(WRender.Create({
                    className: "row-title",
                    children: [WOrtograficValidation.es(prop)]
                }));
            }
        }
        const NumbeRow = WRender.Create({ className: "row-string", children: [(index ?? 0) + 1] });
        if (dato?.__proto__ == Object.prototype) {
            currentPage?.append(NumbeRow)

            const rowElements = [NumbeRow];
            for (const prop in consolidado) {
                if (!consolidado[prop]) {
                    continue;
                }
                let div = undefined; //this.CreateElement(dato)//WRender.Create({ className: "report-container" + (page ? " father" : " child") });
                if (dato[prop] == undefined && dato[prop] == null) {
                    dato[prop] = "";
                }
                if (this.isNotDrawable(prop, this.Config.ModelObject, dato)) {
                    //console.log(dato[prop], prop, false);
                    continue;
                }
                //console.log(prop, index);
                div = this.BuildRow(dato, prop);
                rowElements.push(div);

                if (isPage && currentPage != undefined && !this.elementFitsInPage(currentPage, div)) {
                    currentPage = this.createPage();
                    currentPage?.append(WRender.Create({
                        className: "row-title",
                        children: ["№"]
                    }));
                    for (const prop in dato) {
                        if (this.isNotDrawable(prop, this.Config.ModelObject, dato)) {
                            continue;
                        }
                        currentPage.append(WRender.Create({
                            className: "row-title",
                            children: [WOrtograficValidation.es(prop)]
                        }));
                    }
                    this.Pages.push(currentPage);
                    this.MainContainer.appendChild(currentPage);
                }
                currentPage?.append(div);
            }
            rowElements.forEach(div => {
                currentPage?.append(div);
            });
        }

        // @ts-ignore
        if (index + 1 == data?.length) {
            currentPage?.append(WRender.Create({
                className: "row-footer",
                children: ["-"]
            }));
            for (const prop in consolidado) {
                if (!consolidado[prop]) {
                    continue;
                }
                if (this.isNotDrawable(prop, this.Config.ModelObject, dato)) {
                    //console.log(dato[prop], prop, false);
                    continue;
                }
                const div = WRender.Create({
                    className: consolidado[prop].Suma != undefined ?
                        "row-number row-footer" : "row-footer",
                    children: [(consolidado[prop].Suma != undefined ?
                        "Total: " + consolidado[prop].Suma?.toFixed(2) : "-")]
                });
                // @ts-ignore
                if (isPage && !this.elementFitsInPage(currentPage, div)) {
                    currentPage = this.createPage();
                    this.Pages.push(currentPage);
                    this.MainContainer.appendChild(currentPage);
                }
                currentPage?.append(div);
            }
        }
        // @ts-ignore
        return currentPage;
    }
    /**
    * @returns {HTMLElement}
    */
    createPage() {
        // Create a new A4 page container
        return WRender.Create({
            className: `container ${this.Config.PageType}`,
            style: { gridTemplateColumns: `repeat(${this.countProps + 1}, auto)` }
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
        //console.log(element, computedStyle.paddingTop, computedStyle.paddingBottom, page.clientHeight);
        // console.log(page.scrollHeight <= page.clientHeight, page.scrollHeight, page.clientHeight, element.offsetHeight);
        const pageHeight = page.clientHeight
            - parseFloat(computedStyle.paddingTop == "" ? "0" : computedStyle.paddingTop)
            - parseFloat(computedStyle.paddingBottom == "" ? "0" : computedStyle.paddingBottom);
        // console.log(pageHeight, page.scrollHeight);
        const scrollHeight = page.scrollHeight
            - parseFloat(computedStyle.paddingTop == "" ? "0" : computedStyle.paddingTop)
            - parseFloat(computedStyle.paddingBottom == "" ? "0" : computedStyle.paddingBottom);
        //console.log(scrollHeight, pageHeight, scrollHeight <= pageHeight);

        const fits = scrollHeight <= pageHeight;
        page.removeChild(element);
        return fits;
    }
    isNotDrawable(prop, ModelObject, element) {

        if (ModelObject != undefined && ((ModelObject[prop]?.type == undefined
            //|| ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
            //|| ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
            || ModelObject[prop]?.primary == true
            || ModelObject[prop]?.hidden == true
            || ModelObject[prop]?.hiddenInTable == true
        )
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
            element[prop]?.__proto__ == Function.prototype ||
            element[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "OrderData";
    }

    BuildRow(dato, prop) {
        if (dato[prop] == null || dato[prop] == undefined) {
            return WRender.Create({ className: "row-string", children: [""] });
        } else if (typeof dato[prop] == "string") {
            return WRender.Create({ className: "row-string", children: [dato[prop]] });
        } else if (typeof dato[prop] == "number") {
            return WRender.Create({ className: "row-number", innerHTML: dato[prop].toFixed(2) });
        } else if (dato[prop]?.__proto__ == Object.prototype) {

            const div = WRender.Create({
                className: "container child-object",
                style: { gridTemplateColumns: `repeat(${Object.keys(dato[prop]).length},auto)` }
            });
            for (const key in dato[prop]) {
                div.append(html`<div>${key}: ${typeof dato[prop][key] === "number" ? dato[prop][key].toFixed(2) : dato[prop][key]}</div>`);
                //this.BuildContent(0, dato[prop], div, false, dato[prop], dato[prop]);
            }
            return div;
        } else if (dato[prop]?.__proto__ == Array.prototype) {
            /**@type {Object}*/const consolidadoProp = WArrayF.Consolidado(dato[prop],
            this.Config.ModelObject ? this.Config.ModelObject[prop]?.ModelObject : undefined);
            const div = WRender.Create({
                className: "container child",
                style: { gridTemplateColumns: `repeat(${Object.keys(consolidadoProp).length},auto)` }
            });
            dato[prop].forEach((element, index) => {
                this.BuildContent(index, element, div, false, dato[prop], consolidadoProp);
            });
            return div;
        } else {
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
        /*WRender.Create({
            tagName: 'button', className: 'Block-Primary', innerText: 'Imprimir',
            onclick: async () => {
                const ventimp = window.open(' ', 'popimpr');
                ventimp?.document.write(this.MainContainer.innerHTML
                    + `<style>${this.CustomStyle.innerHTML}</style>` ?? "no data");
                ventimp?.focus();
                setTimeout(() => {
                    ventimp?.print();
                    ventimp?.close();
                }, 100)
            }
        })*/
        this.OptionContainer.append(new WPrintExportToolBar({
            ExportXlsAction: (tool) => {
                // const base64 = "...."
                // Crear una instancia de JSZip
                // Crear una instancia de JSZip
                tool.exportToXls(this.Config.Dataset, this.Header, `report${Date.now}.xls`, this.exportXlsAction, this.Config.ModelObject)
            }, ExportPdfAction: async (/** @type {WPrintExportToolBar} */ tool) => {
                /*const body = html`<div class="" style="position:relative">                               
                    ${this.Pages.map(page => page.cloneNode(true))}
                    ${this.ExportStyle.cloneNode(true)}
                   
                </div>`*/
                //document.querySelector("")?.outerHTML

                const body = html`<html>
                    ${this.MainContainer.innerHTML}
                    ${this.CustomStyle.cloneNode(true)}
                    ${this.ExportStyle.cloneNode(true)}
                </html>`
                //console.log();
                tool.ExportPdfFromApi(
                    this.Config.Dataset ?? [],
                    this.Header,
                    this.Config.ModelObject,
                    "/api/ApiDocumentsData/GeneratePdf",
                    css`
                        * {
                           font-family: "IBM Plex Sans", sans-serif;
                        }
                        tr:nth-child(odd) {
                            background-color: var(--fourth-color);
                        }
                        .header-container {
                            display: grid;
                            grid-template-columns: 100px calc(100% - 120px);
                            gap: 15px 30px;
                            margin-bottom: 20px;
                        }                        
                        .header-container .logo {
                            height: 80px;
                            object-fit: cover;
                            float: left;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            page-break-inside: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        td, th {
                            word-wrap: break-word;
                            padding: 8px;
                        }
                    `,
                    this.Config.PageType
                );
                
                //tool.ExportPdf(body, this.Config.PageType);
            }
        }))
    }

    CustomStyle = css`
        *{
            -webkit-print-color-adjust: exact !important;
            border-collapse: collapse;
        }
        .MainContainer{
            background-color: #e6e6e6;
            border: solid 1px #bdbbbb;
            overflow-y: auto;
        }
        .A4, .A4-horizontal,  .carta, .oficio, .carta-horizontal,
        .oficio-horizontal {
            padding: 60px 60px;
            border: 1px solid #D2D2D2;
            background: #fff;
            box-shadow: 0 2px 5px 0px #D2D2D2;
            width: 210mm;
            height: 297mm;
            border: 1px solid #000;
            box-sizing: border-box;
            margin: 5mm auto;
            overflow: hidden;
            position: relative;
            page-break-after: always;
        }
        .A4-horizontal {
            width: 297mm;
            height: 210mm;
        }
        /* Tamaño carta (8.5in x 11in) */
        .carta {
            width: 8.5in;
            height: 11in;
        }

        /* Tamaño oficio (8.5in x 14in) */
        .oficio {
            width: 8.5in;
            height: 14in;
        }

        /* Tamaño carta horizontal (11in x 8.5in) */
        .carta-horizontal {
            width: 11in;
            height: 8.5in;
        }

        /* Tamaño oficio vertical (14in x 8.5in) */
        .oficio-horizontal {
            padding: 20mm; /* Ajusta el padding según lo necesario */
            border: 1px solid #D2D2D2;
            background: #fff;
            box-shadow: 0 2px 5px 0px #D2D2D2;
            width: 340mm; /* 14 pulgadas en mm */
            height: 200mm; /* 8.5 pulgadas en mm */
            border: 1px solid #000;
            box-sizing: border-box;
            margin: 5mm auto;
            overflow: hidden;
            position: relative;
            page-break-after: always;
        }

        .row-title, .row-number, .row-string, .report-title {
           display: flex;
           flex: 1;
           font-size: 12px;
           font-family: "Open Sans", sans-serif;                    
        }  
        .row-title, .row-footer, .row-number, .row-string {
            padding: 5px 10px;
            font-size: 12px;
            border: 1px solid #dadada;
        }       
        .row-title, .row-footer {
            padding: 5px 10px;
            color: #5D6975;
            background-color: #f1f1f1;
            white-space: nowrap;
            font-weight: normal;
            text-transform: uppercase;
            font-weight: bold;
        }   
        
        .row-number {
            justify-content: flex-end;
        }

        .container {
            flex: 8;
            display: grid;
            flex-direction: column;            
            border: 1px #cdcbcb solid;    
            grid-auto-rows: min-content;
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
            font-weight: bold;
            text-align: center;
        }
        .report-container {
            border-collapse: collapse;
            border: 1px solid #D2D2D2;
        }
        .child {
            border: none;
            padding: 0px;  
        }
        .child-object{
            display: flex;
            flex-direction: column;            
            gap: 10px;
            padding: 5px 10px;  
            font-size: 12px;
        }
        .report-container:first-child {
            border-left: 1px solid #D2D2D2;
        }
        @media print{
            .A4, .A4-horizontal,  .carta, .oficio, .carta-horizontal,
            .oficio-horizontal{
                border: none; /* Optional: Remove border for printing */
                margin: 0;
                padding: 0;
                box-shadow: none; /* Optional: Remove any shadow for printing */
                page-break-after: always; /* Ensure each .page-container starts on a new page */
            }
            
            .container-break-page {
                page-break-before:always;                
            }
            
        }      
    `
    ExportStyle = css`
         .A4, .A4-horizontal,  .carta, .oficio, .carta-horizontal,
        .oficio-horizontal{
            border: none; /* Optional: Remove border for printing */           
            padding: 0;
            margin: 5mm auto;
            width: auto;
            height: auto;
            box-shadow: none; /* Optional: Remove any shadow for printing */
            page-break-after: always; /* Ensure each .page-container starts on a new page */
        }
        .header, .sub-header {
            margin: 0px;
            margin-left: -70px;
            font-weight: bold;
            text-align: center;
        }
    `
    async obtainExportBody() {
        return html`<div>${this.MainContainer}</div>`;
        /* return html`<div class="" style="position:relative">                               
             ${this.Pages.map(page => page.outerHTML)}
             ${this.ExportStyle.outerHTML}
         </div>`;*/
    }

    replacer(value) {
        if (value == null) {
            return null;
        }
        const replacerElement = {};
        for (const prop in value) {
            if ((prop == "get" || prop == "set") ||
                prop == "ApiMethods" ||
                prop == "FilterData" ||
                prop == "Get" ||
                prop == "Find" ||
                prop == "GetByProps" ||
                prop == "FindByProps" ||
                prop == "Save" ||
                prop == "Update" ||
                prop == "GetData" ||
                prop == "SaveData" ||
                value[prop] == null ||
                value[prop] == undefined ||
                value[prop].__proto__.constructor.name == "AsyncFunction" ||
                // value[prop]?.__proto__ == Object.prototype ||
                value[prop]?.__proto__ == Function.prototype || prop == "OrderData") {
                continue;
            }
            replacerElement[prop] = value[prop]

        }
        return replacerElement;
    }
}
customElements.define('w-report', WReportComponent);
export { WReportComponent }

const PageType = {
    A4: "A4",
    A4_HORIZONTAL: "A4-horizontal",
    CARTA: "carta",
    CARTA_HORIZONTAL: "carta-horizontal",
    OFICIO: "oficio",
    OFICIO_HORIZONTAL: "oficio-horizontal"
}
export { PageType }