import { WRender, html } from "./WComponentsTools.js";
import {WArrayF} from "./WArrayF";

class ControlBuilder {
  static BuildImage(value = "", urlPath) {
    let cadenaB64 = "";
    var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    if (base64regex.test(WArrayF.replacer("data:image/png;base64,", ""))) {
      cadenaB64 = !value.includes("data:image/png;base64,") ? "data:image/png;base64," : "";
    } else if (urlPath != undefined && urlPath != "") {
      cadenaB64 = urlPath + "/";
    }
    const image = WRender.createElement({
      type: "img",
      props: {
        src: cadenaB64 + value,
        class: "imgPhoto",
        height: 50,
        width: 50
      }
    });
    return image;
  }
  static BuildProgressBar(value = 0, total = 100, barColor = "#b7b7b7cc", progressColor = "#3576bb") {
    return new ProgessBar(value, total, barColor, progressColor);
  }
}
export { ControlBuilder }

class ProgessBar extends HTMLElement {
  constructor(value = 0, total = 100, barColor = "#b7b7b7cc", progressColor = "#3551bb") {
    super();
    this.attachShadow({ mode: 'open' });
    //this.shadowRoot?.append(this.CustomStyle);
    this.Draw(value, total, barColor, progressColor);
  }
  connectedCallback() { }

  update() {
    this.Draw();
  }
  Draw(value = 0, total = 100, barColor = "#b7b7b7cc", progressColor = "#3551bb") {
    this.shadowRoot.append(html`<div class="progressDivContainer">
        <div class="progressDiv">        
          <div class="progress" style="">
            <h3>${(value / (total > 0 ? total : 1) * 100).toFixed(2)}%</h3>     
          </div>
        </div>       
        <style>        
          .progressDivContainer{
            position: relative; width: 100%;  height: auto;  margin: 0px 0px; display: flex;
          }          
          .progressDivContainer > .progressDiv{
            width: 100%;  height: 20px;  background: ${barColor}; overflow: hidden; border-radius: 15px;
          }          
          .progressDivContainer > .progressDiv > .progress{
            height: 20px;  background: ${progressColor}; border-radius: 15px; text-align: center; animation: progress 1s forwards; width: 0px
          }          
          .progress  h3{
            margin: 4px 10px; font-size: 12px; font-family: sans-serif; color: #fff; position: absolute; top: 0
          }
          @keyframes progress {
            to {
              width:${(value / (total > 0 ? total : 1) * 100).toFixed(2)}%;
            }
          }
        </style>
      </div>`);
  }
}

customElements.define('w-progress-bar', ProgessBar);

export { ProgessBar }