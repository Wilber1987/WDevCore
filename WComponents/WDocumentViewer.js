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
        this.append(this.MainNav, this.TabContainer)
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

    `
}
customElements.define('w-document-viewer', DocumentViewer);
export { DocumentViewer };
