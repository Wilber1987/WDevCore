
import { css } from "../WModules/WStyledRender.js";
//#region  GENERIC STYLESSS#####################################################################################
const StyleScrolls = css`@import url(/WDevCore/StyleModules/css/scrolls.css);`;
const StylesControlsV1 = css`
    .BtnAlert,.BtnPrimary, .BtnSuccess,.BtnSecundary,.Btn {
        font-weight: bold;
        border: none;
        padding: 10px;
        text-align: center;
        display: inline-block;
        min-width: 100px;
        cursor: pointer;
        background-color: #09f;
        font-size: 12px;
        color: #fff;

        border-radius: 0.2cm;
        max-height: 4;
    }
    .BtnPrimary {
        color: #fff;
        background-color: #007bff;

    }
    .BtnAlert {
        color: #fff;
        background-color: #dc3545;

    }
    .BtnSuccess {
        color: #fff;
        background-color: #28a745;

    }
    .BtnSecundary {
        color: #fff;
        background-color: #17a2b8;

    }
    .Btn[type=checkbox] {
        height: 20px;
        min-width: 20px;
        margin: 5px;
    }
    input[type=text], 
    input[type=string], 
    input[type=password], 
    input[type=number],
    input[type=color], input[type=email], 
    input[type=date],  input[type=time],select, textarea,
    input:-internal-autofill-selected {
        padding: 10px;
        border: none;
        border: 2px solid #dddada;
        width: calc(100%);
        //height: 100%;
        font-size: 15px;
        border-radius: 0.2cm;
        box-sizing: border-box;
        border-radius: 10;
        cursor: pointer;
    }
    input[type=color] {
        padding: 5
    }
    input:active, input:focus, select:active, select:focus {
        border-bottom: 2px solid #0099cc;
        outline: none;
}`;


const StylesControlsV2 = css`@import url(/WDevCore/StyleModules/css/form.css);`

const StylesControlsV3 = css`    
    .Block-Alert,
    .Block-Primary,
    .Block-Success,
    .Block-Secundary,
    .Block-Tertiary,
    .Block-Fourth,
    .Block-Fifth ,
    .Block-Basic  {
        min-width: 80px;
        background-color: #5995fd;
        border: none;
        outline: none;
        font-size: 12px;
        border-radius: 5px;
        color: #fff;
        text-transform: uppercase;
        font-weight: 600;
        margin: 5px;
        padding: 10px;
        cursor: pointer;
        transition: 0.5s;
        width: 100%;
        max-width: 200px;
        text-align: left;
    }
    .Block-Success {
        color: #fff;
        background-color: #28a745;
    }

    .Block-Primary {
        color: #fff;
        background-color: #094d95;
    }

    .Block-Secundary {
        color: #fff;
        background-color: #17a2b8;
    }  

    .Block-Tertiary {
        color: #fff;
        background-color: rgb(156, 39, 176);
    } 

    .Block-Fourth {
        color: #fff;
        background-color: rgb(0, 191, 165);
    } 

    .Block-Fifth {
        color: #fff;
        background-color: rgb(249, 115, 22);
    } 

    .Block-Alert {
        color: #fff;
        background-color: #dc3545;
    }
`
const basicButtons = css`      
    .btn {
        padding: 8px;
        font-size: 12px;
        max-width: 120px;
        min-width: 80px;
        background-color: #335888;
        color: #fff;
        border: none;
        border-radius: 5px;
        margin-left: 10px;
        cursor:pointer;
    }
    .btn-alert {
        padding: 8px;
        font-size: 12px;
        max-width: 120px;
        min-width: 80px;
        background-color: #6e1515;
        color: #fff;
        border: none;
        border-radius: 5px;
        margin-left: 10px;
        cursor:pointer;
    }
    .btn-secundary {
        padding: 8px;
        font-size: 12px;
        max-width: 120px;
        min-width: 80px;
        background-color: #156e49;
        color: #fff;
        border: none;
        border-radius: 5px;
        margin-left: 10px;
        cursor:pointer;
    }
`
//#endregion  #################################################################################################

export { StyleScrolls, StylesControlsV1, StylesControlsV2, StylesControlsV3, basicButtons }