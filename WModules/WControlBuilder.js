import { WRender } from "./WComponentsTools.js";

class ControlBuilder {
    static BuildImage(value = "", urlPath) {
        let cadenaB64 = "";
        var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
        if (base64regex.test(value.replace("data:image/png;base64,", ""))) {
            cadenaB64 = !value.includes("data:image/png;base64,") ? "data:image/png;base64," : "";
        } else if (urlPath != undefined) {
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
    static BuildProgressBar(value = 0, total = 100, barColor = "#34495ecc", progressColor = "#2c3e50") {
        return WRender.CreateStringNode(`<div class="progressDivContainer">        
        <div class="progressDiv">
          <div class="progress"></div>
        </div>
        <h3>${value / total * 100}%</h3>
        <style>
          .progressDivContainer{
            position: relative; width: 100%;  height: auto;  margin: 10px 0px;
          }          
          .progressDivContainer > .progressDiv{
            width: 100%;  height: 30px;  background: ${barColor};
          }          
          .progressDivContainer > .progressDiv > .progress{
            width: ${value / total * 100}%; height: 30px;  background: ${progressColor};
          }          
          .progressDivContainer > h3{
            margin-top: 10px; font-family: sans-serif; color: #2c3e50;
          }
        </style>
      </div>`);
    }
}
export { ControlBuilder }