import { html, WRender } from "./WModules/WComponentsTools.js";
import { css } from "./WModules/WStyledRender.js";

window.onload = async () => {    
    linksContainer.append(html`<h1>Analitic Components</h1>`);
    await buildLinks("AnaliticComponents/");
    linksContainer.append(html`<h1>Form Components</h1>`);
    await buildLinks("FormElements/");
}

async function buildLinks(path) {
    const route = "./WComponents/Examples/" + path;
    const dir = await fetch(route);
    const response = await dir.text();
    const container = WRender.Create({ innerHTML: response });
    const links = container.querySelectorAll("a.icon-html");   
    links.forEach(element => {
        const name = element.title.replace(".html", "")
            linksContainer.append(css`
            .site-header .a${name} {
                z-index :1;
            }
            .site-header .a${name}:hover ~ .${name} {
                opacity: 1;
                z-index :1;
            }
        `)
        linksContainer.append(WRender.Create({
            tagName: 'a', className: 'a'+name, innerText: name.replace("_",  " "), href: route + element.title
        }));
        linksContainer.append(html`<div class="preview ${name}" style='color: #000'>${name.replace("_",  " ")}</div>`)
       
    });
}
