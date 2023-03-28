import { ComponentsManager, WRender } from '../WModules/WComponentsTools.js';
import { ControlBuilder } from '../WModules/WControlBuilder.js';
import { css } from '../WModules/WStyledRender.js';
import { WAppNavigator } from './WAppNavigator.js';
class DocumentModel {
    TypeDocuement = ["PDF", "IMG"];
    Description = "";
    Document = "";
}
class DocumentConfig {
    Dataset = []
}
class DocumentViewer extends HTMLElement {
    /**
     * 
     * @param {DocumentConfig} Config 
     */
    constructor(Config) {
        super();
        for (const p in Config) {
            this[p] = Config[p];
        }
        this.attachShadow({ mode: 'open' });
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: "TabContainer" } });
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.DrawDocumentViewer();
    }
    MainNav = new WAppNavigator({
        Direction: "column",
        Inicialize: true,
        Elements: []
    });
    connectedCallback() { }
    DrawDocumentViewer = async () => {
        this.Dataset.forEach((element, index) => {
            this.MainNav.Elements.push({
                name: element.Description,
                action: () => {
                    this.TabManager.NavigateFunction("element" +
                        index, this.CreateDocument(element));
                }
            });
        });
        this.shadowRoot.append(this.CompStyle,WRender.Create({ className: "document-viewer", children: [this.MainNav, this.TabContainer]}))
    }
    CreateDocument = (element) => {
        if (element.TypeDocuement == "IMG") {
            return ControlBuilder.BuildImage(element.Document)
        } else if (element.TypeDocuement == "IMG") {
            return WRender.Create({ tagName: "iframe", src: element.Document, class: "Document" })
        } else {
            return "Docuemento no valido."
        }
    }
    CompStyle = css`
    .document-viewer {
        display: grid;
        grid-template-columns: 200px calc(100% - 200px)
    }
    iframe, img {
        width: calc(100% - 20px);
        border-radius: 20px;
        min-height: 500px;
        overflow: hidden;
        box-shadow: 0 0 5px 0 #444;
        margin: 0px 10px;
    }
    `
}
customElements.define('w-document-viewer', DocumentViewer);
export { DocumentViewer };
