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
 * @property {String} [PageType]
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
        this.Config.PageType = this.Config.PageType ?? "A4"

    }
    connectedCallback() {
        this.Draw();
    }
    Draw = async () => {
        if (!this.Config.Dataset) return;
        this.MainContainer.innerHTML = "";
        this.SetOption();
        this.Config.Dataset = this.Config.Dataset.map(d => this.replacer(d));
        /**@type {Object}*/const consolidado = WArrayF.Consolidado(this.Config.Dataset);
        console.log(consolidado);
        this.countProps = Object.keys(consolidado).length;
        this.DrawReportHeader();
        this.CreateTable(this.Config.Dataset, true);
        /*this.Pages.forEach(page => {
            this.MainContainer.appendChild(page);
        });*/
    }
    DrawReportHeader() {
        this.Header.style.gridColumn = `span ${this.countProps}`
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

    CreateTable(data, isPage = true) {

        let currentPage = this.createPage();
        if (isPage) {
            currentPage.append(this.Header.cloneNode(true))
        }
        this.Pages.push(currentPage);
        this.MainContainer.appendChild(currentPage);

         /**@type {Object}*/const consolidado = WArrayF.Consolidado(data, this.Config.ModelObject);

        //data = data.map(d => this.replacer(d));
        console.log(data);

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
            for (const prop in consolidado) {
                currentPage?.append(WRender.Create({
                    className: "row-title",
                    children: [prop]
                }));
            }
        }
        if (dato?.__proto__ == Object.prototype) {
            console.log(dato);
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
              
                if (currentPage != undefined && !this.elementFitsInPage(currentPage, div) && isPage) {
                    currentPage = this.createPage();
                    for (const prop in dato) {
                        currentPage.append(WRender.Create({
                            className: "row-title",
                            children: [prop]
                        }));
                    }
                    this.Pages.push(currentPage);
                    this.MainContainer.appendChild(currentPage);
                }
                currentPage?.append(div);
            }
        }

        // @ts-ignore
        if (index + 1 == data?.length) {
            for (const prop in consolidado) {
                const div = WRender.Create({
                    className: consolidado[prop].Suma != undefined ?
                        "row-number row-footer" : "row-footer",
                    children: [(consolidado[prop].Suma != undefined ?
                        "Total: " + consolidado[prop].Suma?.toFixed(2) : "-")]
                });
                // @ts-ignore
                if (!this.elementFitsInPage(currentPage, div) && isPage) {
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
            style: { gridTemplateColumns: `repeat(${this.countProps}, auto)` }
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
        //console.log(scrollHeight, pageHeight, scrollHeight <= pageHeight);

        const fits = scrollHeight <= pageHeight;
        page.removeChild(element);
        return fits;
    }
    isNotDrawable(prop, ModelObject, element) {
     
        /*if (ModelObject != undefined && ((ModelObject[prop]?.type == undefined
            //|| ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
            //|| ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
            || ModelObject[prop]?.primary == true
            || ModelObject[prop]?.hidden == true
           // || ModelObject[prop]?.hiddenInTable == true
        )
            || element[prop]?.__proto__ == Function.prototype
            || element[prop]?.__proto__.constructor.name == "AsyncFunction")) {
                console.log(ModelObject);
            return true;
        }*/
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
            element[prop].__proto__ == Function.prototype ||
            element[prop].__proto__.constructor.name == "AsyncFunction";
    }

    BuildRow(dato, prop) {
        if (dato[prop] == null || dato[prop] == undefined) {
            return WRender.Create({ className: "row-string", children: [""] });
        } else if (typeof dato[prop] == "string") {
            return WRender.Create({ className: "row-string", children: [dato[prop]] });
        } else if (typeof dato[prop] == "number") {
            return WRender.Create({ className: "row-number", innerHTML: dato[prop].toFixed(2) });
        } else if (dato[prop]?.__proto__ == Object.prototype) {
            return this.BuildRow(WArrayF.replacer((dato[prop])));
        } else if (dato[prop]?.__proto__ == Array.prototype) {
            /**@type {Object}*/const consolidadoProp = WArrayF.Consolidado(dato[prop]);
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
        this.OptionContainer.append(WRender.Create({
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
        }))
    }

    CustomStyle = css`
        *{
            -webkit-print-color-adjust: exact !important;
            border-collapse: collapse;
        }
        .MainContainer{
            background-color: #afabab;
            max-height: calc(100vh - 50px);
            border: solid 1px #313131;
            overflow-y: auto;
        }
        .A4, .A4-horizontal,  .carta, .oficio, .carta-horizontal,
        .oficio-horizontal {
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
            width: 14in;
            height: 8.5in;
        }

        .row-title, .row-number, .row-string, .report-title {
           display: flex;
           flex: 1;
           font-size: 10px;
           font-family: "Open Sans", sans-serif;                    
        }  
        .row-title, .row-footer, .row-number, .row-string {
            padding: 5px 10px;
            font-size: 12px;
        }       
        .row-title, .row-footer {
            padding: 5px 10px;
            color: #5D6975;
            border-bottom: 1px solid #C1CED9;
            white-space: nowrap;
            font-weight: normal;
            border-top: 1px solid #C1CED9;
            text-transform: uppercase;
        }     
        .row-footer {
            border-top: 1px solid #C1CED9;
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
            .A4{
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
                prop == "GetByProps" ||
                prop == "FindByProps" ||
                prop == "Save" ||
                prop == "Update" ||
                prop == "GetData" ||
                prop == "SaveData" ||
                value[prop] == null ||
                value[prop] == undefined ||
                value[prop].__proto__.constructor.name == "AsyncFunction" ||
                value[prop]?.__proto__ == Object.prototype ||
                value[prop]?.__proto__ == Function.prototype) {
                continue;
            }
            replacerElement[prop] = value[prop]

        }
        return replacerElement;
    }
}
customElements.define('w-component', WReportComponent);
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