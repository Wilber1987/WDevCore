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
    static BuildProgressBar(value = 0, total = 100, barColor = "#737b83cc", progressColor = "#2c3e50") {
        return WRender.CreateStringNode(`<div class="progressDivContainer">   
        <h3>${(value / (total > 0 ? total : 1) * 100).toFixed(2)}%</h3>     
        <div class="progressDiv">        
          <div class="progress" style="width:${(value / (total > 0 ? total : 1) * 100).toFixed(2)}%;"></div>
        </div>       
        <style>        
          .progressDivContainer{
            position: relative; width: 100%;  height: auto;  margin: 10px 0px; display: flex;
          }          
          .progressDivContainer > .progressDiv{
            width: 100%;  height: 20px;  background: ${barColor}; overflow: hidden; border-radius: 15px;
          }          
          .progressDivContainer > .progressDiv > .progress{
            height: 20px;  background: ${progressColor}; border-radius: 15px;
          }          
          .progressDivContainer > h3{
            margin: 2px 10px; font-size: 16px; font-family: sans-serif; color: #fff; position: absolute; top: 0
          }
        </style>
      </div>`);
    }
}
export { ControlBuilder }