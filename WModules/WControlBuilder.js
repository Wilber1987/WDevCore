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

}
export { ControlBuilder }