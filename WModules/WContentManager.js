
//@ts-check
import "../libs/mdToHtml.js";
import TurndownService from "../libs/htmlToMd.js";
import "../libs/prims.js";
import { html } from "./WComponentsTools.js";

const markdownSignals = [
    /^#{1,6}\s/m,          // Encabezados: # ## ###
    /\*\*(.+?)\*\*/,       // Negrita: **texto**
    /\*(.+?)\*/,           // Cursiva: *texto*
    /^[-*+]\s/m,           // Listas no ordenadas
    /^\d+\.\s/m,           // Listas ordenadas
    /`{1,3}[\s\S]*?`{1,3}/, // Código inline o bloque
    /\[.+?\]\(.+?\)/,      // Links: [texto](url)
    /^>/m,                 // Blockquotes
    /^---/m,               // Separadores
];

export class WContentManager {
    /**
     * Detecta si el contenido es Markdown y lo convierte a HTML.
     * Si ya es HTML o texto plano, lo devuelve sin modificar.
     * @param {string} content
     * @returns {string}
     */
    static ParseContentToString(content) {
        if (!content) return "";

        // Detectar si es HTML — si empieza con una etiqueta, no procesar
        const isHTML = /^\s*<[a-zA-Z]/.test(content.trim());
        if (isHTML) return content;

        const looksLikeMarkdown = markdownSignals.some(pattern => pattern.test(content));
        if (!looksLikeMarkdown) return content; // Texto plano, devolver tal cual

        // @ts-ignore
        return marked.parse(content);
    }

    /**
     * Detecta si el contenido es Markdown y lo convierte a HTML.
     * Si ya es HTML o texto plano, lo devuelve sin modificar.
     * @param {string|HTMLElement} content
     * @returns {Array<HTMLElement|string|ChildNode>}
     */
    static ParseContent(content) {
        if (!content) return [];

        // Detectar si es HTML — si empieza con una etiqueta, no procesar
        const isHTML = /^\s*<[a-zA-Z]/.test(content.trim());
        if (isHTML && typeof content === "string") return html`${content}`;
        else if (isHTML) return [content];
        // Detectar señales de Markdown      

        const looksLikeMarkdown = markdownSignals.some(pattern => pattern.test(content));
        if (!looksLikeMarkdown) return [content]; // Texto plano, devolver tal cual

        
        // @ts-ignore
        const htmlElement = html`<div>${marked.parse(content)}</div>`;
        // @ts-ignore
        return htmlElement.childNodes;
    }

    /**
     * Convierte HTML de vuelta a Markdown.
     * @param {string|HTMLElement} html
     * @returns {string}
     */
    static ToMarkdown(html) {
        if (!html) return "";
        if (typeof html === "string") {
            return html;
        }
        const turndown = new TurndownService({
            headingStyle: "atx",        // # Título en vez de subrayado
            codeBlockStyle: "fenced",   // ``` en vez de indentado
            bulletListMarker: "-"       // - item en vez de *
        });
        console.log(html.outerHTML);
        
        return turndown.turndown(html.outerHTML);
    }

}