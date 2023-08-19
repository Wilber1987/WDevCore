import { WRender, WArrayF, ComponentsManager, WAjaxTools } from "../WModules/WComponentsTools.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";
//#region  GENERIC STYLESSS#####################################################################################
const StyleScrolls = css`
     *::-webkit-scrollbar {
        width: 20px;
        height: 20px;
        position: absolute;
        left: 0;
    }

    *::-webkit-scrollbar-track {
        background: transparent;
    }

    *::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,.2);
        border-radius: 20px;
        border: 6px solid transparent;
        background-clip: content-box;
    }

    *::-webkit-scrollbar-thumb:hover {
        background: #646464;
        background-clip: content-box;
    }
`;
const StylesControlsV1 = {
    type: 'w-style', props: {
        id: '', ClassList: [
            //BOTONES
            new WCssClass(`.BtnAlert,.BtnPrimary, .BtnSuccess,.BtnSecundary,.Btn`, {
                "font-weight": "bold",
                "border": "none",
                "padding": "10px",
                "text-align": "center",
                "display": "inline-block",
                "min-width": "100px",
                "cursor": "pointer",
                "background-color": "#09f",
                "font-size": "12px",
                "color": "#fff",
                //"border-right": "rgb(3, 106, 175) 5px solid",
                "border-radius": "0.2cm",
                "max-height": 40
            }), new WCssClass(`.BtnPrimary`, {
                "color": "#fff",
                "background-color": "#007bff",
                //"border-right": "rgb(3, 106, 175) 5px solid",
            }), new WCssClass(`.BtnAlert`, {
                "color": "#fff",
                "background-color": "#dc3545",
                //"border-right": "#7e1b25 5px solid",
            }), new WCssClass(`.BtnSuccess`, {
                "color": "#fff",
                "background-color": "#28a745",
                //"border-right": "#165c26 5px solid",
            }), new WCssClass(`.BtnSecundary`, {
                "color": "#fff",
                "background-color": "#17a2b8",
                //"border-right": "#0f5964 5px solid",
            }), new WCssClass(`.Btn[type=checkbox]`, {
                "height": "20px",
                "min-width": "20px",
                "margin": "5px",
            }),
            //INPUTS
            new WCssClass(`input[type=text], 
            input[type=string], 
            input[type=password], 
            input[type=number],
            input[type=color], input[type=email], 
            input[type=date],  input[type=time],select, textarea,
            input:-internal-autofill-selected`, {
                padding: 10,
                border: "none",
                border: "2px solid #dddada",
                width: "calc(100%)",
                //height: "100%",
                "font-size": "15px",
                "border-radius": "0.2cm",
                "box-sizing": "border-box",
                "border-radius": 10,
                cursor: "pointer"
            }), new WCssClass(`input[type=color]`, {
                padding: 5
            }), new WCssClass(`input:active, input:focus, select:active, select:focus`, {
                "border-bottom": "2px solid #0099cc",
                outline: "none",
            })
        ]
    }
}
const StylesControlsV2 = css`
    .Btn-Mini, .Btn-Mini-Alert, .Btn-Mini-Success {
        width: 100px;
        background-color: #1c4786;
        border: none;
        outline: none;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        margin: 0px 5px;
        cursor: pointer;
        transition: 0.5s;
        font-size: 11px;
        padding: 8px;
    }

    .BtnClose {
        appearance: none;
        display: flex;
        border: none;
        background: none;
        position: absolute;
        right: 20px;  
        top: 30px;    
        cursor:pointer;
    }

    .BtnClose::before {
        content: " ";
        margin-right: 8px;
        height: 15px;
        width: 15px;
        display: block;
        background-color: #202020;
        clip-path: polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%);
    }
    .Btn-Mini-Success {
        background-color: #28a745;
    }

    .Btn-Mini-Alert {
        background-color: #861c1c;
    }
    .BtnReturn{
        appearance: none;
        display: flex;        
    }

    .BtnReturn::before {
        content: " ";
        margin-right: 8px;
        height: 15px;
        width: 15px;
        display: block;
        background-color: #fdfcfc;
        clip-path: polygon(50% 0%, 100% 0%, 50% 50%, 100% 100%, 50% 100%, 0% 50%);
    }
    
    .BtnAlert,
    .BtnPrimary,
    .BtnSuccess,
    .BtnSecundary,
    .Btn {
        min-width: 150px;
        background-color: #5995fd;
        border: none;
        outline: none;
        height: 40px;
        border-radius: 49px;
        color: #fff;
        text-transform: uppercase;
        font-weight: 600;
        margin: 10px 5px;
        padding: 0 15px;
        cursor: pointer;
        transition: 0.5s;
        width: 100%;
        max-width: 250px;
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
    input[type=color],
    input[type=email],
    input[type=date],
    input[type=time],
    input[type=tel],
    input[type=url],
    .input,
    w-multi-select,
    select,
    textarea,
    input:-internal-autofill-selected {
        width: 100%;
        background-color: #f0f0f0 !important;
        border-radius: 55px;
        padding: 10px;
        outline: none;
        border: none;
        line-height: 1;
        font-weight: 600 !important;
        font-size: 12px !important;
        color: #333 !important;
        box-sizing: border-box;
        cursor: pointer;
        box-shadow: 0 0 5px #c1c1c1;
        display: block;
    }
    input[type=color] {
        padding: 5px;
    }
    input:disabled {
        background-color: #e3e3e3 !important;
        color: #6a6a6a !important;
        pointer-events: none;
    }
    w-multi-select{
        padding: 0px;
    }

    input:active,
    input:focus,
    select:active,
    select:focus,
    textarea:focus,
    textarea:focus {
        box-shadow: 0 0 5px #4894aa;
    }
`

const StylesControlsV3 = css`    
    .Block-Alert,
    .Block-Primary,
    .Block-Success,
    .Block-Secundary,
    .Block-Tertiary,
    .Block-Fourth,
    .Block-Fifth ,
    .Block-Basic  {
        min-width: 100px;
        background-color: #5995fd;
        border: none;
        outline: none;
        font-size: 11px;
        border-radius: 5px;
        color: #fff;
        text-transform: uppercase;
        font-weight: 600;
        margin: 5px;
        padding: 10px;
        cursor: pointer;
        transition: 0.5s;
        width: 100%;
        max-width: 250px;
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