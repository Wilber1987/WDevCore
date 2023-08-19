//@ts-check
import { WRender } from "./WComponentsTools.js";
class WCssClass {
    /**
     * 
     * @param {String} ClassName 
     * @param {any} PropsList 
     */
    constructor(ClassName, PropsList) {
        this.Name = ClassName;
        this.CSSProps = PropsList;
    }
}
/**
 * @typedef {Object} MediaQuery 
 * @property {String} condicion
 * @property {Array<WCssClass>} ClassList
 * **/
/**
 * @typedef {Object} KeyFrame 
 * @property {String} animate
 * @property {Array<WCssClass>} ClassList
 * **/

/**
 * @typedef {Object} StyleConfig 
 * @property {Array<WCssClass>} ClassList
 * @property {Array<MediaQuery>} [action]
 * **/

class WStyledRender extends HTMLElement {
    constructor(Config) {
        super();
        for (const p in Config) {
            this[p] = Config[p];
        }
    }
    /**@type {Array} */
    ClassList = new Array();
    /**@type {Array<MediaQuery>} */
    MediaQuery = [];
    /**@type {Array<KeyFrame>} */
    KeyFrame = [];
    attributeChangedCallBack() {
        this.DrawStyle();
    }
    connectedCallback() {
        if (this.innerHTML != "") {
            return;
        }
        this.DrawStyle();
        this.style.display = "none";
    }
    DrawStyle() {
        let styleFrag = {
            type: "style",
            props: {
                innerHTML: "",
            }
        }
        styleFrag.props.innerHTML = styleFrag.props.innerHTML + " " + this.DrawClassList(this.ClassList);

        this.MediaQuery.forEach(MediaQ => {
            let MediaQuery = `@media ${MediaQ.condicion}{
                    ${this.DrawClassList(MediaQ.ClassList)}
                }`;
            styleFrag.props.innerHTML = styleFrag.props.innerHTML + " " + MediaQuery;
        });
        this.KeyFrame.forEach(KeyF => {
            let KeyFrame = `@keyframes ${KeyF.animate} {
                    ${this.DrawClassList(KeyF.ClassList)}
                }`;
            styleFrag.props.innerHTML = styleFrag.props.innerHTML + " " + KeyFrame;
        });

        this.append(WRender.createElement(styleFrag));
    }
    DrawClassList(ClassList) {
        let bodyStyle = "";
        ClassList.forEach(Class => {
            let bodyClass = "";
            if (Class.__proto__ == WCssClass.prototype) {
                for (const prop in Class.CSSProps) {
                    let PropValue = Class.CSSProps[prop];
                    if (typeof PropValue === "number") {
                        PropValue = PropValue + "px"
                    }
                    bodyClass = bodyClass + `${prop}: ${PropValue};`;
                }
                bodyClass = `${Class.Name} {${bodyClass}}`;
                bodyStyle = bodyStyle + bodyClass;
            }
        });
        return bodyStyle;
    }
}
/**
 * 
 * @param {TemplateStringsArray} body 
 * @returns {HTMLStyleElement}
 */
function css(body) {
    // @ts-ignore
    return WRender.Create({ tagName: "style", innerHTML: body.toString() });
}
/**
 * 
 * @param {TemplateStringsArray} body 
 * @returns {HTMLElement}
 */
function html(body) {
    // @ts-ignore
    return WRender.CreateStringNode(body.toString());
}
customElements.define("w-style", WStyledRender);
export { WCssClass, WStyledRender, css };

class CSSProps {
    "align-content";
    "align-items";
    "align-self";
    "all";
    "animation";
    "animation-delay";
    "animation-direction";
    "animation-duration";
    "animation-fill-mode";
    "animation-iteration-count";
    "animation-name";
    "animation-play-state";
    "animation-timing-function";
    "caption-side";
    "caret-color";
    //"@charset";
    "clear";
    "clip";
    "color";
    "column-count";
    "column-fill";
    "column-gap";
    "column-rule";
    "column-rule-color";
    "column-rule-style";
    "column-rule-width";
    "column-span";
    "column-width";
    "columns";
    "content";
    "counter-increment";
    "counter-reset";
    "cursor";
    "direction";
    "display";
    "empty-cells";
    "filter";
    "flex";
    "flex-basis";
    "flex-direction";
    "flex-flow";
    "flex-grow";
    "flex-shrink";
    "flex-wrap";
    "float" = "left" || "right" || "commit";
    "font" = typeof "string";
    //"@font-face";
    "font-family";
    "font-feature-settings";
    //"@font-feature-values";
    "font-kerning";
    "font-language-override";
    "font-size";
    "font-size-adjust";
    "font-stretch";
    "font-style";
    "font-synthesis";
    "font-variant";
    "font-variant-alternates";
    "font-variant-caps";
    "font-variant-east-asian";
    "font-variant-ligatures";
    "font-variant-numeric";
    "font-variant-position";
    "font-weight";
    "grid";
    "grid-area";
    "grid-auto-columns";
    "grid-auto-flow";
    "grid-auto-rows";
    "grid-column";
    "grid-column-end";
    "grid-column-gap";
    "grid-column-start";
    "grid-gap";
    "grid-row";
    "grid-row-end";
    "grid-row-gap";
    "grid-row-start";
    "grid-template";
    "grid-template-areas";
    "grid-template-columns";
    "grid-template-rows";
    "hanging-punctuation";
    "height";
    "hyphens";
    "image-rendering";
    //"@import";
    "isolation";
    "justify-content";
    //"@keyframes";
    "left";
    "letter-spacing";
    "line-break";
    "line-height";
    "list-style";
    "list-style-image";
    "list-style-position";
    "list-style-type";
    "margin";
    "margin-bottom";
    "margin-left";
    "margin-right";
    "margin-top";
    "max-height";
    "max-width";
    //"@media";
    "min-height";
    "min-width";
    "mix-blend-mode";
    "object-fit";
    "object-position";
    "opacity";
    "order";
    "orphans";
    "outline";
    "outline-color";
    "outline-offset";
    "outline-style";
    "outline-width";
    "overflow";
    "overflow-wrap";
    "overflow-x";
    "overflow-y";
    "padding";
    "padding-bottom";
    "padding-left";
    "padding-right";
    "padding-top";
    "page-break-after";
    "page-break-before";
    "page-break-inside";
    "perspective";
    "perspective-origin";
    "pointer-events";
    "position";
    "quotes";
    "resize";
    "right";
    "scroll-behavior";
    "tab-size";
    "table-layout";
    "text-align";
    "text-align-last";
    "text-combine-upright";
    "text-decoration";
    "text-decoration-color";
    "text-decoration-line";
    "text-decoration-style";
    "text-indent";
    "text-justify";
    "text-orientation";
    "text-overflow";
    "text-shadow";
    "text-transform";
    "text-underline-position";
    "top";
    "transform";
    "transform-origin";
    "transform-style";
    "transition";
    "transition-delay";
    "transition-duration";
    "transition-property";
    "transition-timing-function";
    "unicode-bidi";
    "user-select";
    "vertical-align";
    "visibility";
    "white-space";
    "widows";
    "width";
    "word-break";
    "word-spacing";
    "word-wrap";
    "writing-mode";
    "z-index";
    "background";
    "background-color";
    "background-image";
    "border";
    "border-radius";
    "border-top";
    "border-right";
    "border-left";
    "border-bottom";
    "box-shadow" = "";
}