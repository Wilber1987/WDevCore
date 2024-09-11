//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";

/**
 * @typedef {Object} Config 
    * @property {Function} [PrintAction]
    * @property {Function} [ExportPdfAction]
    * @property {Function} [ExportCvsAction]
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
            ${this.Confg.PrintAction ? html`<button class="toolbar-button green" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.PrintAction(this)
            }}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M6 2v6h12V2H6zm10 4H8V4h8v2zM4 8v8h16V8h2v12H2V8h2zm2 8h2v2H6v-2zm12-6v6H8v-6h10zm-8 4h6v-2H10v2zm6 6v-2h2v2h-2z"/>
                </svg>
                Imprimir
            </button>`: ""}
           
            ${this.Confg.ExportPdfAction ? html`<button class="toolbar-button yellow" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.ExportPdfAction(this)
            }}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 19V5h14v14H5zm4-6h6v2H9v-2zm0-4h6v2H9V9z"/>
                </svg>
                Exportar PDF
            </button>`: ""}
            ${this.Confg.ExportCvsAction ? html`<button class="toolbar-button cyan" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.ExportCvsAction(this)
            }}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 4a8 8 0 0 0 0 16 8 8 0 0 0 0-16zm1 13h-2v-2h2v2zm-1-4c-1.1 0-2-.9-2-2V7h2v4h2V7h2v4c0 1.1-.9 2-2 2z"/>
                </svg>
                Exportar CSV
            </button>`: ""}
            ${this.Confg.UploadAction ? html`<button class="toolbar-button red" onclick="${(ev) => {
                // @ts-ignore
                this.Confg.UploadAction(ev)
            }}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M16 10v4H8v-4H5l7-7 7 7h-3zM5 18v-2h14v2H5z"/>
                </svg>
                Subir a la Nube
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
     * @param {string} filename example: 
        const data = [
            [{value: "Nombre", style: "color:red"}, {value: "Edad"},{value: "Nac."}],
            [{value: "Juan"}, {value: 12}, {value: "Nic"}],
            [{value: "Ana"}, {value: 10}, {value: "Es"}]
        ];
        WPrintExportToolBarInstance.exportToCsv("filename", data);
     * @param {Array<Array<{value:string|number, style:string}>>} rows
     */
    exportToCsv(filename, rows) {

        const table = html`<table></table>`;
        rows.forEach(row => {
            console.log(row);
            
            table.append(WRender.Create({
                tagName: "tr",
                children: row.map(dato => WRender.Create({ tagName: "td", style: dato.style ?? "", innerHTML: dato.value?.toString() ?? "-" }))
            }));
        })
        console.log(table);
        console.log(table.outerHTML);


        const data = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:x="urn:schemas-microsoft-com:office:excel"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <style>
                    .table-container {
                        mso-number-format:"\@";
                    }
                </style>
            </head>
            <body>
                ${table.outerHTML}
            </body>
            </html>
        `;

        const blob = new Blob([data], {
            type: 'application/vnd.ms-excel'
        });

        // Crear un enlace para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tabla-exportada.xls';

        // Simular el clic para iniciar la descarga
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        /*const processRow = row => {
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
        link.remove();*/
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