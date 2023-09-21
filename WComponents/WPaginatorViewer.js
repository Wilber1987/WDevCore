import { StylesControlsV2, StylesControlsV3 } from "../StyleModules/WStyleComponents.js";
import { WRender, WArrayF, ComponentsManager, WAjaxTools } from "../WModules/WComponentsTools.js";
import { ControlBuilder } from "../WModules/WControlBuilder.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";
import { ModalVericateAction } from "./WForm.js";
import { WModalForm } from "./WModalForm.js";
import { WToolTip } from "./WMultiSelect.js";
class PaginatorConfig {
    Dataset = [];
    ModelObject = {};
    paginate = true;
    TypeMoney = "Dollar";
    selectedItems = [];
    DisplayData = [];
    maxElementByPage = 10;
    Options = {
        UserActions: [{
            name: "name",
            action: () => { }
        }]
    }
}
class WPaginatorViewer extends HTMLElement {
    constructor(Config = (new PaginatorConfig())) {
        super();
        this.Dataset = [];
        this.paginate = true;
        this.PaginatorConfig = Config ?? {};
        this.DrawPaginator();
        if (this.PaginatorConfig?.Options) {
            this.Options = this.PaginatorConfig?.Options;
        } else {
            this.Options = {
                Search: true,
                Add: true,
                Edit: true,
                Show: true,
            };
        }
    }
    connectedCallback() { }
    DrawPaginator = async () => {
        this.DarkMode = this.DarkMode ?? false;
        if (this.innerHTML != "") {
            return;
        }
        this.append(WRender.createElement(this.PaginateTOptionsStyle()), StylesControlsV2.cloneNode(true));
        this.append(WRender.createElement(this.PaginatorStyle()));
        this.container = WRender.Create({ class: "paginator-container", id: "MainBody" });
        this.append(WRender.createElement(this.DrawHeadOptions()))
        this.append(this.container);
        //PAGINACION         
        this.maxElementByPage = 10;
        this.SearchItemsFromApi = this.PaginatorConfig.SearchItemsFromApi;
        if (this.PaginatorConfig != undefined) {
            this.Dataset = this.PaginatorConfig.Dataset;
            if (this.Dataset == undefined) {
                this.Dataset = [{ Description: "No Data!!!" }];
            }
            this.Draw();
            return;
        } else {
            this.innerHTML = "Defina un Dataset en formato JSON";
            return;
        }
    }
    //BASIC TABLE-----------------------------------------------------------------------
    //#region tabla basica --------------------------------------------------------------
    Draw(Dataset = this.Dataset) {
        this.container.innerHTML = "";
        this.body = WRender.Create({ class: "paginator-pages-container", id: "MainBody" });
        const pages = this.DrawPages(Dataset);
        pages.forEach(page => {
            this.body.append(page);
        });
        this.container.append(this.body);
        this.container.append(this.DrawTFooter(pages));
    }
    DrawHeadOptions() {
        const trOptions = { type: "div", props: { class: "thOptions" }, children: [] }
        const InputOptions = {
            type: "input",
            props: {
                class: "txtControl",
                type: "text",
                placeholder: "Buscar...",
                onchange: async (ev) => {
                    this.SearchFunction(ev);
                }
            }
        }
        trOptions.children.push(InputOptions);
        return trOptions;
    }
    DrawPages = (Dataset = this.Dataset) => {
        let pages = [];
        this.numPage = Dataset.length / this.maxElementByPage;
        for (let index = 0; index < this.numPage; index++) {
            let tBodyStyle = "display:none";
            if (index == 0) {
                tBodyStyle = "display:contents";
            }
            pages.push(WRender.Create({ class: "pageChild", style: tBodyStyle }));
        }
        let page = 0;
        Dataset.forEach((element) => {
            pages[page].append(element);
            if (pages[page].childNodes.length == this.maxElementByPage) {
                page++;
            }

        });
        if (pages.length == 0) {
            pages.push(WRender.Create({ 
                type: "h5", style: { padding: "20px" },
                innerText: "No hay elementos que mostrar"
            }));
        }
        return pages;
    }

    SearchFunction = async (ev) => {
        const Dataset = this.Dataset.filter((element) => {
            if (element.object == null || element.object == undefined) return;
            for (const prop in element.object) {
                try {
                    if (element.object[prop] != null) {
                        if (element.object[prop].toString().toUpperCase().includes(ev.target.value.toUpperCase())) {
                            return element;
                        }
                    }
                } catch (error) {
                    console.log(element.object);
                }
            }
        })
        this.Draw(Dataset);
    }

    isSorteable(element, prop) {
        return element[prop] != null &&
            parseFloat(element[prop].toString().replaceAll("%", "").replaceAll(Money[this.TypeMoney], "")).toString() != "NaN";
    }

    DrawTFooter(pages = []) {
        let tfooter = WRender.Create({ className: "tfooter" });
        this.ActualPage = 0;
        const SelectPage = (index) => {
            pages.forEach((body, indexBody) => {
                if (indexBody == index) {
                    body.style.display = "flex";
                    body.style.display = "contents";
                } else {
                    body.style.display = "none";
                }
            });
            let buttons = this.tfooterNumbers.querySelectorAll("a");
            this.ActualPage = index;
            buttons.forEach((button, indexBtn) => {
                if (indexBtn == index) {
                    button.className = "paginateBTN paginateBTNActive";
                } else if (index > 8 && indexBtn < (index - 7)) {
                    button.className = "paginateBTN paginateBTNHidden";
                } else {
                    button.className = "paginateBTN";
                }
            });
        }

        this.tfooterNumbers = WRender.Create({ class: 'tfooterNumbers' })
        pages.forEach((page, index) => {
            let btnClass = "paginateBTN";
            if (index == 0) btnClass = "paginateBTN paginateBTNActive";
            else if ((index) > 20) btnClass = "paginateBTN paginateBTNHidden";
            else btnClass = "paginateBTN";

            this.tfooterNumbers.append(WRender.Create({
                tagName: "a", className: btnClass, innerText: index + 1,
                onclick: () => { SelectPage(index) }
            }))
        });

        tfooter.append(WRender.Create({
            tagName: "label", innerText: "<<", class: "pagBTN",
            onclick: () => {
                this.ActualPage = this.ActualPage < 0 ? pages.length - 1 : this.ActualPage - 1;
                SelectPage(this.ActualPage);
            }
        }))
        tfooter.append(this.tfooterNumbers)
        tfooter.append(WRender.Create({
            tagName: "label", innerText: ">>", class: "pagBTN",
            onclick: () => {
                this.ActualPage = this.ActualPage > pages.length - 1 ? 0 : this.ActualPage + 1;
                SelectPage(this.ActualPage);
            }
        }))
        return tfooter;
    }
    //#endregion fin tabla basica
    //#region ESTILOS-------------------------------------------------------------------------------------------
    MediaStyleResponsive() {
        if (this.querySelector("MediaStyleResponsive" + this.id)) {
            this.removeChild(this.querySelector("MediaStyleResponsive" + this.id));
        }
        const ClassList = [];
        let index = 1;
        for (const prop in this.ModelObject) {
            const flag = WArrayF.checkDisplay(this.DisplayData, prop);
            if (flag) {
                if (!prop.includes("Photo") &&
                    !prop.includes("img") &&
                    !prop.includes("image") &&
                    !prop.includes("Image") &&
                    !prop.includes("Pict") &&
                    !prop.includes("_hidden")) {
                    ClassList.push(new WCssClass(`td:nth-of-type(${index}):before`, {
                        content: `"${prop}:"`,
                        "margin-right": "10px"
                    }))
                }
                index++;
            }
        }
        if (this.PaginatorConfig.StyleType != undefined
            && this.PaginatorConfig.StyleType.includes("Cards")) {
            return {
                type: "w-style",
                props: { ClassList: ClassList }
            }
        }
        return {
            type: "w-style",
            props: {
                id: "MediaStyleResponsive" + this.id,
                MediaQuery: [{
                    condicion: "(max-width: 600px)",
                    ClassList: ClassList
                }]
            }
        }
    }
    PaginatorStyle() {
        const style = this.querySelector("#TableStyle" + this.id);
        if (style) {
            style.parentNode.removeChild(style);
        }
        const WTableStyle = css`
            .tableContainer {
                overflow: auto;
            }

            .WTable {
                font-family: Verdana, sans-serif;
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                border: 1px rgba(10, 10, 10, 0.2) solid;
            }

            .WTable th {
                text-align: left;
            }

            .WTable th label::first-letter{
                text-transform: uppercase;
            }

            .WTable td {
                padding: 0.8rem;
                text-align: left;
                vertical-align: top;
            }

            .WTable .tdAction {
                text-align: center;
                width: 120px;
            }

            .WTable tbody tr:nth-child(odd) {
                background-color: rgba(0, 0, 0, 0.05);
            }

            .icon {
                height: 16px;
                width: 16px;
                filter: invert(1);
            }

            .orderBtn {
                height: 14px;
                max-width: 14px;
                width: 10%;
                cursor: pointer;
                margin: 2px;
            }

            th label {
                padding: 5px;
                width: calc(70% - 10px);
                display: inline-block;
                text-align: center;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            .tdAcordeon{
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                overflow: hidden;
                align-items: center;
                justify-content: flex-start;
            }
            .thOptions {
                display: flex;
                overflow: hidden;
                padding: 10px 0px;
                justify-content: space-between;
            }

            input[type=text],
            input[type=string],
            input[type=number],
            input[type=date] {
                padding: 10px;
                border: 2px solid rgba(0, 0, 0, 0.2);
                width: 300px;
                font-size: 15px;
                border-radius: 10px;
            }

            input:active,
            input:focus {
                outline: none;
            }

            input[type=button] {
                cursor: pointer;
                width: calc(100% - 0px);
            }

            @media (max-width: 600px) {
                divForm div {
                    width: calc(100% - 10px);
                    margin: 5px;
                }

                .WTable {
                    display: block;
                }

                .WTable tbody {
                    display: block;
                }

                .WTable thead {
                    display: none;
                }

                .WTable tr {
                    display: block;
                    margin: 10px;
                    border-radius: 0.3cm;
                    overflow: hidden;
                    box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.5);
                }

                .WTable td {
                    display: flex;
                    border-bottom: 1px rgba(10, 10, 10, 0.3) solid;
                    padding: 10px;
                }

                .WTable .tdAction {
                    display: block;
                    justify-content: center;
                    align-items: center;
                    width: auto;
                    padding: 10px;
                }

                input[type=text],
                input[type=string],
                input[type=number],
                input[type=date] {
                    padding: 5px 10px;
                    width: calc(100% - 20px);
                }
            }
        `;
        return WTableStyle;
    }
    PaginateTOptionsStyle() {
        const style = this.querySelector("#PaginateTOptionsStyle" + this.id);
        if (style) {
            style.parentNode.removeChild(style);
        }
        const WTableStyle = css`
            .paginateBTN {
                display: inline-block;
                padding: 5px;
                color: #888888;
                margin: 5px;
                cursor: pointer;
                border-radius: 0.2cm;
                transition: all 0.6s;
            }

            .paginateBTNHidden {
                display: none;
            }

            .paginateBTNActive {
                font-weight: bold;
                color: #444444;
            }

            .pagBTN {
                display: inline-block;
                padding: 5px;
                color: #888888;
                margin: 5px;
                cursor: pointer;
                border-radius: 0.2cm;
                font-weight: bold;
                transition: all 0.6s;
                text-align: center;
            }

            .tfooter {
                display: flex;
                border: 1px rgba(10, 10, 10, 0.2) solid;
                justify-content: flex-end;
                padding-left: 20px;
                padding-right: 20px;
            }

            .tfooterNumbers {
                overflow: hidden;
                max-width: 390px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .labelMultiselect {
                padding: 5px 10px;
                border-radius: 0.3cm;
                background-color: #009f97;
                color: #fff;
                font-size: 9px;
                overflow: hidden;
                margin: 5px;
                width: 100%
            }

            .BtnTable,.BtnTableA,.BtnTableS,.BtnTableSR {
                font-weight: bold;
                border: none;
                padding: 5px;
                margin: 2px;
                text-align: center;
                display: inline-block;
                min-width: 30px;
                font-size: 12px;
                cursor: pointer;
                background-color: #4894aa;
                color: #fff;
                border-radius: 0.2cm;
            }

            .Btn {
                width: 120px;
            }

            .BtnTableS {
                background-color: #5fb454;
            }

            .BtnTableA {
                background-color: #d24545;
            }

            .BtnTableSR {
                background-color: #4894aa;
                width: inherit;
                min-width: 100px;
            }

            .Btn[type=checkbox] {
                height: 20px;
                min-width: 20px;
                margin: 5px;
            }

            .imgPhoto {
                width: 80px;
                border-radius: 50%;
                height: 80px;
                size: 100%;
                display: block;
                margin: auto;
                object-fit: cover;
                box-shadow: 0 2px 5px 0 rgb(0 0 0 / 30%);
                margin: 10px;
            }

            *::-webkit-scrollbar-thumb {
                background: #ccc;
                border-radius: 4px;
            }

            *::-webkit-scrollbar-thumb:hover {
                background: #b3b3b3;
                box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.2);
            }

            *::-webkit-scrollbar-thumb:active {
                background-color: #999999;
            }

            *::-webkit-scrollbar {
                width: 8px;
                height: 10px;
                margin: 10px;
            }

            *::-webkit-scrollbar-track {
                background: #e1e1e1;
                border-radius: 4px;
            }

            *::-webkit-scrollbar-track:active,
            *::-webkit-scrollbar-track:hover {
                background: #d4d4d4;
            }
        `;
        return WTableStyle;

    }
    //#endregion FIN ESTILOS-----------------------------------------------------------------------------------
}
const WIcons = {
    UpRow: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjU2IDI1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwb2x5Z29uIHBvaW50cz0iMTI4LDQ4LjkwNyAwLDE3Ni45MDcgMzAuMTg3LDIwNy4wOTMgMTI4LDEwOS4yOCAyMjUuODEzLDIwNy4wOTMgMjU2LDE3Ni45MDcgCQkiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
    DownRow: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjU2IDI1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxwb2x5Z29uIHBvaW50cz0iMjI1LjgxMyw0OC45MDcgMTI4LDE0Ni43MiAzMC4xODcsNDguOTA3IDAsNzkuMDkzIDEyOCwyMDcuMDkzIDI1Niw3OS4wOTMgCQkiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
    show2: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgNDg4Ljg1IDQ4OC44NSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDg4Ljg1IDQ4OC44NTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGQ9Ik0yNDQuNDI1LDk4LjcyNWMtOTMuNCwwLTE3OC4xLDUxLjEtMjQwLjYsMTM0LjFjLTUuMSw2LjgtNS4xLDE2LjMsMCwyMy4xYzYyLjUsODMuMSwxNDcuMiwxMzQuMiwyNDAuNiwxMzQuMgoJCXMxNzguMS01MS4xLDI0MC42LTEzNC4xYzUuMS02LjgsNS4xLTE2LjMsMC0yMy4xQzQyMi41MjUsMTQ5LjgyNSwzMzcuODI1LDk4LjcyNSwyNDQuNDI1LDk4LjcyNXogTTI1MS4xMjUsMzQ3LjAyNQoJCWMtNjIsMy45LTExMy4yLTQ3LjItMTA5LjMtMTA5LjNjMy4yLTUxLjIsNDQuNy05Mi43LDk1LjktOTUuOWM2Mi0zLjksMTEzLjIsNDcuMiwxMDkuMywxMDkuMwoJCUMzNDMuNzI1LDMwMi4yMjUsMzAyLjIyNSwzNDMuNzI1LDI1MS4xMjUsMzQ3LjAyNXogTTI0OC4wMjUsMjk5LjYyNWMtMzMuNCwyLjEtNjEtMjUuNC01OC44LTU4LjhjMS43LTI3LjYsMjQuMS00OS45LDUxLjctNTEuNwoJCWMzMy40LTIuMSw2MSwyNS40LDU4LjgsNTguOEMyOTcuOTI1LDI3NS42MjUsMjc1LjUyNSwyOTcuOTI1LDI0OC4wMjUsMjk5LjYyNXoiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K",
    delete: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTEyIDUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnPjxwYXRoIGQ9Im00MjQgNjRoLTg4di0xNmMwLTI2LjQ2Ny0yMS41MzMtNDgtNDgtNDhoLTY0Yy0yNi40NjcgMC00OCAyMS41MzMtNDggNDh2MTZoLTg4Yy0yMi4wNTYgMC00MCAxNy45NDQtNDAgNDB2NTZjMCA4LjgzNiA3LjE2NCAxNiAxNiAxNmg4Ljc0NGwxMy44MjMgMjkwLjI4M2MxLjIyMSAyNS42MzYgMjIuMjgxIDQ1LjcxNyA0Ny45NDUgNDUuNzE3aDI0Mi45NzZjMjUuNjY1IDAgNDYuNzI1LTIwLjA4MSA0Ny45NDUtNDUuNzE3bDEzLjgyMy0yOTAuMjgzaDguNzQ0YzguODM2IDAgMTYtNy4xNjQgMTYtMTZ2LTU2YzAtMjIuMDU2LTE3Ljk0NC00MC00MC00MHptLTIxNi0xNmMwLTguODIyIDcuMTc4LTE2IDE2LTE2aDY0YzguODIyIDAgMTYgNy4xNzggMTYgMTZ2MTZoLTk2em0tMTI4IDU2YzAtNC40MTEgMy41ODktOCA4LThoMzM2YzQuNDExIDAgOCAzLjU4OSA4IDh2NDBjLTQuOTMxIDAtMzMxLjU2NyAwLTM1MiAwem0zMTMuNDY5IDM2MC43NjFjLS40MDcgOC41NDUtNy40MjcgMTUuMjM5LTE1Ljk4MSAxNS4yMzloLTI0Mi45NzZjLTguNTU1IDAtMTUuNTc1LTYuNjk0LTE1Ljk4MS0xNS4yMzlsLTEzLjc1MS0yODguNzYxaDMwMi40NHoiLz48cGF0aCBkPSJtMjU2IDQ0OGM4LjgzNiAwIDE2LTcuMTY0IDE2LTE2di0yMDhjMC04LjgzNi03LjE2NC0xNi0xNi0xNnMtMTYgNy4xNjQtMTYgMTZ2MjA4YzAgOC44MzYgNy4xNjMgMTYgMTYgMTZ6Ii8+PHBhdGggZD0ibTMzNiA0NDhjOC44MzYgMCAxNi03LjE2NCAxNi0xNnYtMjA4YzAtOC44MzYtNy4xNjQtMTYtMTYtMTZzLTE2IDcuMTY0LTE2IDE2djIwOGMwIDguODM2IDcuMTYzIDE2IDE2IDE2eiIvPjxwYXRoIGQ9Im0xNzYgNDQ4YzguODM2IDAgMTYtNy4xNjQgMTYtMTZ2LTIwOGMwLTguODM2LTcuMTY0LTE2LTE2LTE2cy0xNiA3LjE2NC0xNiAxNnYyMDhjMCA4LjgzNiA3LjE2MyAxNiAxNiAxNnoiLz48L2c+PC9zdmc+",
    edit: "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjUxMnB0IiB2aWV3Qm94PSIwIDAgNTEyIDUxMSIgd2lkdGg9IjUxMnB0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im00MDUuMzMyMDMxIDI1Ni40ODQzNzVjLTExLjc5Njg3NSAwLTIxLjMzMjAzMSA5LjU1ODU5NC0yMS4zMzIwMzEgMjEuMzMyMDMxdjE3MC42Njc5NjljMCAxMS43NTM5MDYtOS41NTg1OTQgMjEuMzMyMDMxLTIxLjMzMjAzMSAyMS4zMzIwMzFoLTI5OC42Njc5NjljLTExLjc3NzM0NCAwLTIxLjMzMjAzMS05LjU3ODEyNS0yMS4zMzIwMzEtMjEuMzMyMDMxdi0yOTguNjY3OTY5YzAtMTEuNzUzOTA2IDkuNTU0Njg3LTIxLjMzMjAzMSAyMS4zMzIwMzEtMjEuMzMyMDMxaDE3MC42Njc5NjljMTEuNzk2ODc1IDAgMjEuMzMyMDMxLTkuNTU4NTk0IDIxLjMzMjAzMS0yMS4zMzIwMzEgMC0xMS43NzczNDQtOS41MzUxNTYtMjEuMzM1OTM4LTIxLjMzMjAzMS0yMS4zMzU5MzhoLTE3MC42Njc5NjljLTM1LjI4NTE1NiAwLTY0IDI4LjcxNDg0NC02NCA2NHYyOTguNjY3OTY5YzAgMzUuMjg1MTU2IDI4LjcxNDg0NCA2NCA2NCA2NGgyOTguNjY3OTY5YzM1LjI4NTE1NiAwIDY0LTI4LjcxNDg0NCA2NC02NHYtMTcwLjY2Nzk2OWMwLTExLjc5Njg3NS05LjUzOTA2My0yMS4zMzIwMzEtMjEuMzM1OTM4LTIxLjMzMjAzMXptMCAwIi8+PHBhdGggZD0ibTIwMC4wMTk1MzEgMjM3LjA1MDc4MWMtMS40OTIxODcgMS40OTIxODgtMi40OTYwOTMgMy4zOTA2MjUtMi45MjE4NzUgNS40Mzc1bC0xNS4wODIwMzEgNzUuNDM3NWMtLjcwMzEyNSAzLjQ5NjA5NC40MDYyNSA3LjEwMTU2MyAyLjkyMTg3NSA5LjY0MDYyNSAyLjAyNzM0NCAyLjAyNzM0NCA0Ljc1NzgxMiAzLjExMzI4MiA3LjU1NDY4OCAzLjExMzI4Mi42Nzk2ODcgMCAxLjM4NjcxOC0uMDYyNSAyLjA4OTg0My0uMjEwOTM4bDc1LjQxNDA2My0xNS4wODIwMzFjMi4wODk4NDQtLjQyOTY4OCAzLjk4ODI4MS0xLjQyOTY4OCA1LjQ2MDkzNy0yLjkyNTc4MWwxNjguNzg5MDYzLTE2OC43ODkwNjMtNzUuNDE0MDYzLTc1LjQxMDE1NnptMCAwIi8+PHBhdGggZD0ibTQ5Ni4zODI4MTIgMTYuMTAxNTYyYy0yMC43OTY4NzQtMjAuODAwNzgxLTU0LjYzMjgxMi0yMC44MDA3ODEtNzUuNDE0MDYyIDBsLTI5LjUyMzQzOCAyOS41MjM0MzggNzUuNDE0MDYzIDc1LjQxNDA2MiAyOS41MjM0MzctMjkuNTI3MzQzYzEwLjA3MDMxMy0xMC4wNDY4NzUgMTUuNjE3MTg4LTIzLjQ0NTMxMyAxNS42MTcxODgtMzcuNjk1MzEzcy01LjU0Njg3NS0yNy42NDg0MzctMTUuNjE3MTg4LTM3LjcxNDg0NHptMCAwIi8+PC9zdmc+"
}
const Money = { Euro: "€", Dollar: "$", Cordoba: "C$" }
customElements.define("w-paginator", WPaginatorViewer);
export { WPaginatorViewer }