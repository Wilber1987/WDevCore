//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";

/**
 * @typedef {Object} Config 
    * @property {Function} [PrintAction]
    * @property {Function} [ExportPdfAction]
    * @property {Function} [ExportCvsAction]
    * @property {Function} [ExportXlsAction]
    * @property {Function} [UploadAction]
**/

class WPrintExportToolBar extends HTMLElement {
    /**
    * @param {Config} Config 
    */
    constructor(Config) {
        super();
        this.Confg = Config ?? {};
        this.attachShadow({ mode: 'open' });
        this.shadowRoot?.append(this.CustomStyle, StylesControlsV2.cloneNode(true));
        this.Draw();
    }
    connectedCallback() { }
    Draw = async () => {
        this.shadowRoot?.append(html`<div class="toolbar">
            ${this.Confg.PrintAction ? html`<button class="toolbar-button cyan" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.PrintAction(this)
            }}">
                <svg fill="#000000" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 232 232" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 232 232" width="24px" height="24px"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <rect width="132" x="50" y="0.5" height="33"></rect> <path d="m232,49.5h-232v132h33v-49h165v49h34v-132zm-17,33h-16v-16h16v16z"></path> <rect width="132" x="50" y="148.5" height="83"></rect> </g> </g></svg>
                Imprimir
            </button>`: ""}
           
            ${this.Confg.ExportPdfAction ? html`<button class="toolbar-button red" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.ExportPdfAction(this)
            }}">
               <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 40 40">
                <path fill="#e53935" d="M38,42H10c-2.209,0-4-1.791-4-4V10c0-2.209,1.791-4,4-4h28c2.209,0,4,1.791,4,4v28	C42,40.209,40.209,42,38,42z"></path><path fill="#fff" d="M34.841,26.799c-1.692-1.757-6.314-1.041-7.42-0.911c-1.627-1.562-2.734-3.45-3.124-4.101 c0.586-1.757,0.976-3.515,1.041-5.402c0-1.627-0.651-3.385-2.473-3.385c-0.651,0-1.237,0.391-1.562,0.911 c-0.781,1.367-0.456,4.101,0.781,6.899c-0.716,2.018-1.367,3.97-3.189,7.42c-1.888,0.781-5.858,2.604-6.183,4.556 c-0.13,0.586,0.065,1.172,0.521,1.627C13.688,34.805,14.273,35,14.859,35c2.408,0,4.751-3.32,6.379-6.118 c1.367-0.456,3.515-1.107,5.663-1.497c2.538,2.213,4.751,2.538,5.923,2.538c1.562,0,2.148-0.651,2.343-1.237 C35.492,28.036,35.297,27.32,34.841,26.799z M33.214,27.905c-0.065,0.456-0.651,0.911-1.692,0.651 c-1.237-0.325-2.343-0.911-3.32-1.692c0.846-0.13,2.734-0.325,4.101-0.065C32.824,26.929,33.344,27.254,33.214,27.905z M22.344,14.497c0.13-0.195,0.325-0.325,0.521-0.325c0.586,0,0.716,0.716,0.716,1.302c-0.065,1.367-0.325,2.734-0.781,4.036 C21.824,16.905,22.019,15.083,22.344,14.497z M22.214,27.124c0.521-1.041,1.237-2.864,1.497-3.645 c0.586,0.976,1.562,2.148,2.083,2.669C25.794,26.213,23.776,26.604,22.214,27.124z M18.374,29.728 c-1.497,2.473-3.059,4.036-3.905,4.036c-0.13,0-0.26-0.065-0.391-0.13c-0.195-0.13-0.26-0.325-0.195-0.586 C14.078,32.136,15.77,30.899,18.374,29.728z"></path>
                </svg>
                PDF
            </button>`: ""}
            ${this.Confg.ExportCvsAction ? html`<button class="toolbar-button cyan" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.ExportCvsAction(this)
            }}">
               <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" height="24px" viewBox="0 0 40 40" width="24px">
                    <path fill="#c1f5ea" d="M29,6H15.744C14.781,6,14,6.781,14,7.744v7.259h15V6z"></path><path fill="#7decd6" d="M14,15.003h15v9.002H14V15.003z"></path><path fill="#3ddab4" d="M14,24.005h15v9.05H14V24.005z"></path><path fill="#c1f5ea" d="M42.256,6H29v9.003h15V7.744C44,6.781,43.219,6,42.256,6z"></path><path fill="#7decd6" d="M29,15.003h15v9.002H29V15.003z"></path><path fill="#3ddab4" d="M29,24.005h15v9.05H29V24.005z"></path><path fill="#7decd6" d="M6.513,15H14v18H6.513C5.678,33,5,32.322,5,31.487V16.513C5,15.678,5.678,15,6.513,15z"></path><path fill="#00b569" d="M14,33v7.256C14,41.219,14.781,42,15.743,42H29h13.257C43.219,42,44,41.219,44,40.257V33H14z"></path><path fill="#00b569" d="M14,24v9h7.487C22.322,33,23,32.322,23,31.487V24H14z"></path><path fill="#3ddab4" d="M14,24v-9h7.487C22.322,15,23,15.678,23,16.513V24H14z"></path><path fill="#fff" d="M9.807,19h2.386l1.936,3.754L16.175,19h2.229l-3.071,5l3.141,5h-2.351l-2.11-3.93L11.912,29H9.526 l3.193-5.018L9.807,19z"></path>
                </svg>
                CVS
            </button>`: ""}
            ${this.Confg.ExportXlsAction ? html`<button class="toolbar-button green" onclick="${(ev) => {
              // @ts-ignore
              this.Confg.ExportXlsAction(this)
            }}">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="24px"  viewBox="0 0 40 40">
                    <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path><path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path><path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path><path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
                </svg>
                XLS
            </button>`: ""}
            ${this.Confg.UploadAction ? html`<button class="toolbar-button red" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.UploadAction(ev)
            }}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M16 10v4H8v-4H5l7-7 7 7h-3zM5 18v-2h14v2H5z"/>
                </svg>
                Subir
            </button>`: ""}
        </div>`)
    }
    update() {
        this.Draw();
    }
    /**
     * @param {HTMLElement} body
     */
    ExportPdf(body) {
        const options = {
            margin: 0,
            filename: `filename_${new Date()}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: {
                scrollX: 0,
                scrollY: 0, scale: 4, logging: true, dpi: 192, letterRendering: true
            },
            jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
        };
        // @ts-ignore
        html2pdf().set(options).from(body).save();
    }
    /**
     * @param {HTMLElement} body
     */
    Print(body) {
        //this.append(body); return;
        const ventimp = window.open(' ', 'popimpr');
        ventimp?.document.write(body.innerHTML);
        ventimp?.focus();
        setTimeout(() => {
            ventimp?.print();
            ventimp?.close();
        }, 100)
    }
    /**
     * @param {Array<Array<{value:string|number, style:string}>>} rows
     * @param {string} filename example: 
        const data = [
            [{value: "Nombre", style: "color:red"}, {value: "Edad"},{value: "Nac."}],
            [{value: "Juan"}, {value: 12}, {value: "Nic"}],
            [{value: "Ana"}, {value: 10}, {value: "Es"}]
        ];
        WPrintExportToolBarInstance.exportToCsv("filename", data);
     
     */
    exportToCsv(rows, filename) {
        const processRow = row => {
            return row.join(',');
        };

        const csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(processRow).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename + ".csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        link.remove();
    }
    /**
     * @param {Array<Array<{value:string|number, style:string}>>} rows
     * @param {HTMLElement} header      
     * @param {string} filename example: 
        const data = [
            [{value: "Nombre", style: "color:red"}, {value: "Edad"},{value: "Nac."}],
            [{value: "Juan"}, {value: 12}, {value: "Nic"}],
            [{value: "Ana"}, {value: 10}, {value: "Es"}]
        ];
        WPrintExportToolBarInstance.exportToCsv("filename", data);
     
     */
    exportToXls(rows, header, filename) {

        const table = html`<table></table>`;
        if (header) {
            table.append(WRender.Create({
                tagName: "tr", children: [WRender.Create({ tagName: "td", children: [header] })]
            }));
        }
        rows.forEach(row => {
            table.append(WRender.Create({
                tagName: "tr",
                children: row.map(dato => WRender.Create({ tagName: "td", style: dato.style ?? "", innerHTML: dato.value?.toString() ?? "-" }))
            }));
        })
        const data = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel"  
            xmlns="http://www.w3.org/TR/REC-html40">
            <head> <meta charset="utf-8">
                <style>.table-container {  mso-number-format:"\@"; } </style>
            </head>
            <body> ${table.outerHTML} </body>
            </html>
        `;
        const blob = new Blob([data], {
            type: 'application/vnd.ms-excel'
        });
        // Crear un enlace para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename ? `${filename}.xls` : 'tabla-exportada.xls';
        // Simular el clic para iniciar la descarga
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    CustomStyle = css`
        .toolbar {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            padding: 10px;
        }
        .toolbar-button {
            background-color: #e7e7e7;
            border: none;
            border-radius: 4px;
            padding: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #ffffff;
            transition: background-color 0.3s ease;
            font-weight: bold;
            min-width: 100px;
            justify-content: center;
        }
        .toolbar-button svg {
            fill: #ffffff;
            transition: fill 0.3s ease;
        }
        .toolbar-button:hover {
            background-color: #434343;
            filter: saturate(1);
        }
        .toolbar-button:hover svg {
            fill: #ffffff;
        }          
     `
}
customElements.define('w-tool-bar', WPrintExportToolBar);
export { WPrintExportToolBar }