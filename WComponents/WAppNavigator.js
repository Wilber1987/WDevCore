//@ts-check
import { ComponentsManager, WRender } from "../WModules/WComponentsTools.js";
import { WIcons } from "../WModules/WIcons.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";


/**
 * @typedef {Object} NavConfig 
 *  * @property {Boolean} [Inicialize] 
    * @property {String} [NavTitle] flex-end
    * @property {String} [alignItems] flex-end
    * @property {String} [DisplayMode] right
    * @property {Array} [Elements]
    * @property {Boolean} [DarkMode]
    * @property {Boolean} [isMediaQuery]
    * @property {String} [Direction] row | column
    * @property {String} [NavStyle] nav | tab
**/
class WAppNavigator extends HTMLElement {
    /**
     * 
     * @param {NavConfig} Config 
     */
    constructor(Config) {
        super();
        this.attachShadow({ mode: "open" });
        this.Config = Config;
        this.Inicialize = Config.Inicialize;
        this.alignItems = Config.alignItems;
        this.DisplayMode = Config.DisplayMode;
        this.Elements = Config.Elements;
        this.DarkMode = Config.DarkMode;
        this.Direction = Config.Direction;
        this.NavStyle = Config.NavStyle;
        this.NavTitle = Config.NavTitle;
        this.DrawAppNavigator();
        this.Elements = this.Elements ?? [];
    }
    attributeChangedCallBack() {
        this.DrawAppNavigator();
    }
    connectedCallback() {
        if (this.Inicialize == true && this.InitialNav != undefined) {
            //console.log(true);
            this.InitialNav();
        }
    }
    ActiveMenu = (ev) => {
        var navs = this.parentNode?.querySelectorAll("w-app-navigator");
        navs?.forEach(nav => {
            nav.shadowRoot?.querySelectorAll(".elementNavActive").forEach(elementNavActive => {
                elementNavActive.className = "elementNav";
            });
        });
        if (ev) {
            ev.className = "elementNavActive";
            if (this.NavStyle != "tab") {
                // @ts-ignore
                this.shadowRoot.querySelector("#MainNav").className = "navInactive";
            }
        }
    }
    async DrawAppNavigator() {
        // @ts-ignore
        this.shadowRoot.innerHTML = "";
        if (this.id == undefined) {
            const Rand = Math.random();
            this.id = "Menu" + Rand;
        }

        this.DarkMode = this.DarkMode ?? false;
        this.DisplayMode = this.DisplayMode ?? "left";
        this.shadowRoot?.append(WRender.createElement(this.Style()));
        if (this.NavStyle == undefined) {
            this.NavStyle = "nav";
        }
        const Nav = WRender.Create({ tagName: "nav", id: "MainNav", className: this.NavStyle });
        this.shadowRoot?.append(Nav)
        if (this.Config.isMediaQuery == true) {
            this.shadowRoot?.append(this.MediaStyle());
        }
        
        if (this.NavStyle == "nav") {
            const header = {
                type: "header", props: {
                    onclick: () => {
                        const nav = this.shadowRoot?.querySelector("#MainNav");
                        if (nav?.className == "navActive") {
                            nav.className = "navInactive";
                        } else {
                            // @ts-ignore
                            nav.className = "navActive";
                        }
                    }
                }, children: [{
                    type: "img", props: {
                        src: WIcons.Menu,
                        class: "DisplayBtn",
                    }
                }]
            }
            if (typeof this.NavTitle === "string") {
                header.children.push({
                    // @ts-ignore
                    type: "label", props: { class: "NavTitle", innerText: this.NavTitle }
                });
            }
            this.shadowRoot?.appendChild(WRender.createElement(header));
        } else {
            this.CreateTabControllers();
        }

        this.Elements.forEach((element, Index) => {
            const elementNav = WRender.createElement({
                type: "a",
                props: { id: "element" + (element.id ?? Index), class: "elementNav" }
            });

            elementNav.append(element.name)
            if (element.icon) {
                elementNav.append(WRender.createElement({
                    type: 'img', props: {
                        src: element.icon, class: 'IconNav'
                    }
                }));
            }
            if (element.url != undefined && element.url != "#") {
                elementNav.href = element.url
            }


            Nav.appendChild(elementNav);
            if (element.SubNav != undefined) {
                this.AddSubNav(Index, element, elementNav, Nav);
            } else {
                if (elementNav.url == undefined) {
                    elementNav.url = "#" + this.id;
                }
                elementNav.onclick = async (ev) => {
                    this.ActiveMenu(elementNav);
                    //console.log(this.Manager);

                    if (this.NavStyle == "tab") {
                        const object = await element.action();
                        this.Manager?.NavigateFunction("element" + Index, object);
                    } else {
                        if (element.action != undefined) {
                            element.action();
                        }
                    }
                }

            }
            if (Index == 0 && element.SubNav == undefined) {
                this.InitialNav = () => {
                    elementNav.onclick();
                }
            }
        });
    }
    CreateTabControllers = () => {
        this.TabContainer = WRender.Create({ className: "TabContainer", id: 'TabContainer' });
        this.Manager = new ComponentsManager({ MainContainer: this.TabContainer, SPAManage: false });
        this.shadowRoot?.append(this.TabContainer);
    }
    AddSubNav(Index, element, elementNav, Nav) {
        const SubMenuId = "SubMenu" + Index + this.id;
        const SubNav = WRender.Create({
            tagName: "section",
            id: SubMenuId, href: element.url, className: "UnDisplayMenu"
        });
        if (element.SubNav.Elements != undefined) {
            element.SubNav.Elements.forEach(SubElement => {
                SubNav.append(WRender.Create({
                    tagName: "a",
                    innerText: SubElement.name,
                    onclick: async (ev) => {
                        if (SubElement.action != undefined) {
                            SubElement.action(ev);
                        }
                    }

                }));
            });
            elementNav.onclick = (ev) => {
                this.ActiveMenu(ev);
                const MenuSelected = this.shadowRoot?.querySelector("#" + SubMenuId);
                if (MenuSelected?.className.includes("UnDisplayMenu")) {
                    //console.log(this.NavStyle == "tab", this.NavStyle == "tab" ? "DisplayMenu tabSubMenu" : "DisplayMenu");
                    MenuSelected.className = this.Direction != "column" ? "DisplayMenu AbsoluteDisplay" : "DisplayMenu";
                } else {
                    // @ts-ignore
                    MenuSelected.className = this.Direction != "column" ? "UnDisplayMenu AbsoluteDisplay" : "UnDisplayMenu";
                }
            };
            Nav.children.push(SubNav);
        }
    }

    Style() {
        const style = this.querySelector("#NavStyle" + this.id);
        if (style) {
            style?.parentNode?.removeChild(style);
        }
        let navDirection = "row";
        if (this.Direction == "column") {
            navDirection = "column";
        }
        return css` .nav,
            .navInactive,
            .navActive {
                display: flex;
                font-family: Verdana, Geneva, Tahoma, sans-serif;
                flex-direction: ${navDirection};
                padding: 0px 10px;
                transition: all 1s;
                justify-content: ${this.alignItems};
                flex-wrap: wrap;
                position: relative;
            }
        
            .tab {
                display: flex;
                flex-direction: ${navDirection};
                transition: all ease 1s;
                justify-content: flex-start;
                gap: 5px;
            }
        
            .tab .elementNavActive {
                border-top: solid 1px rgba(0, 0, 0, 0);
                border-left: solid 1px rgba(0, 0, 0, 0);
                border-right: solid 1px rgba(0, 0, 0, 0);
                border-radius: 0.3cm;
                color: ${this.DarkMode ? "#4da6ff" : "#ffffff"};
                background-color: #1f58c7;
            }
        
            a {
                text-decoration: none;
                cursor: pointer;
            }
        
            .elementNav {
                text-decoration: none;
                color: ${this.DarkMode ? "#d3d3d3" : "#444444"};
                padding: 8px;
                border: solid 1px rgb(0, 0, 0, 0);
                border-bottom: solid 2px rgba(0, 0, 0, 0);
                transition: all 0.1s;
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 12px;
                position: relative;
                border-radius: 0.3cm;
            }
        
            .elementNavActive {
                text-decoration: none;
                color: ${this.DarkMode ? "#4da6ff" : "#444444"};
                padding: 8px;
                font-size: 12px;
                border: solid 1px rgb(0, 0, 0, 0);
                border-bottom: solid 2px #4da6ff;
                transition: all 0.6s;
                display: flex;
                align-items: center;
            }
        
            h4.elementNavActive {
                display: none;
            }
            .TabContainer {
                padding: 20px 0px;
            }
        
            .elementNav:hover {
              /*   background-color:#dcdcdc; */
                color: ${this.DarkMode ? "#4da6ff" : "#444444"};
            }
        
            header {
                display: flex;
                align-items: center;
                justify-content: ${this.alignItems};
                box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
            }
        
            .IconNav {
                height: 20px;
                width: 20px;
                margin: 5px;
            }
        
            .tab .elementNavActive,
            .tab .elementNav {
                display: flex;
                flex-direction: column;
                min-width: 100px;
            }
        
            .tab .IconNav {
                height: 40px;
                width: 40px;
            }
        
            .NavTitle {
                font-size: 1.1rem;
                padding: 10px;
                color: #888888;
                cursor: pointer;
            }
        
            .DisplayMenu {
                overflow: hidden;
                padding-left: 10px;
                max-height: 1000px;
                display: flex;
                flex-direction: column;
                margin: 10px 0px;
            }
        
            .AbsoluteDisplay {
                position: absolute;
                top: +40px;
                left: 0px;
                background-color: #fff;
                padding: 12px;
                box-shadow: 0 0 5px 0 #888;
                border-radius: 15px;
            }
        
            .UnDisplayMenu {
                overflow: hidden;
                max-height: 0px;
                padding: 0px;
                box-shadow: none;
            }
        
            .DisplayMenu a {
                text-decoration: none;
                color: ${this.DarkMode ? "#d3d3d3" : "#444444"};
                padding: 10px;
                font-size: 12px;
                margin-bottom: 10px;
                border-radius: 5px;
                background-color: ${this.DarkMode ? "rgb(0,0,0,50%)" : "rgb(0,0,0,10%)"};
            }
        
            .DisplayBtn {
                margin: 10px;
                display: none;
                height: 15px;
                width: 15px;
                cursor: pointer;
                filter: ${this.DarkMode ? "invert(90%)" : "invert(0%)"};
            }
        
            .navActive {
                overflow: hidden;
                max-height: 5000px;
            }`;
    }
    MediaStyle() {
        const style = this.querySelector("#NavMediaStyle" + this.id);
        if (style) {
            style?.parentNode?.removeChild(style);
        }
        let navDirection = "row";
        if (this.Direction == "column") {
            navDirection = "column";
        }
        return css` @media (max-width: 1200px) {}
        
            @media (max-width: 800px) {
                .DisplayBtn {
                    display: initial;
                    height: 25px;
                    width: 25px;
                }
        
                .nav {
                    flex-direction: column;
                    overflow: hidden;
                    max-height: 0px;
                }
        
                .navActive,
                .navInactive,
                .nav {
                    overflow: hidden;
                    max-height: 5000px;
                    transition: all 0.6s;
                    position: fixed;
                    z-index: 999;
                    background-color: #fff;
                    color: #fff;
                    width: 80%;
                    height: 100vh;
                    top: 0px;
                    box-shadow: 0 5px 5px 3px rgba(0, 0, 0, 0.3);
                    flex-direction: column;
                    justify-content: initial;
                    padding-top: 20px;
                    right: inherit;
                }
        
                .navInactive,
                .nav {
                    opacity: 0;
                    pointer-events: none;
                    transform: translateX(-100%);
                }
        
                header {
                    display: flex;
                    align-items: center;
                    justify-content:  ${this.alignItems};
                    box-shadow: none;
                }
        }`;
    }
}
customElements.define("w-app-navigator", WAppNavigator);
export { WAppNavigator };
