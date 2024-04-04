import { WTableComponent } from "../../WTableComponent.js";
import { data } from "../data.js";

document.querySelector("main").append(
    new WTableComponent({      
        Dataset: data
    })
) 