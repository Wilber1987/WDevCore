
import { css } from "../WModules/WStyledRender.js";
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

const StylesControlsV2 = css`
    @import url(/css/variables.css);
    .Btn-Mini, .Btn-Mini-Alert, .Btn-Mini-Success {
        background-color: #1c4786;
        border: none;
        outline: none;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        margin: 0px;
        margin-right: 5px;
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
        content: "" ;
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
        content:  "";
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
    .btn-secondary,
    .btn-success,
    .btn-danger,
    .btn-info,
    .Btn {       
        --bs-btn-padding-x: 0.75rem;
        --bs-btn-padding-y: 0.47rem;
        --bs-btn-font-size: 0.925rem;
        --bs-btn-font-weight: 400;
        --bs-btn-line-height: 1.5;
        --bs-btn-color: var(--bs-body-color);
        --bs-btn-bg: transparent;
        --bs-btn-border-width: var(--bs-border-width);
        --bs-btn-border-color: transparent;
        --bs-btn-border-radius: var(--bs-border-radius);
        --bs-btn-hover-border-color: transparent;
        --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075);
        --bs-btn-disabled-opacity: 0.65;
        --bs-btn-focus-box-shadow: 0 0 0 0 rgba(var(--bs-btn-focus-shadow-rgb), .5);
        display: inline-block;
        padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
        font-family: var(--bs-btn-font-family);
        font-size: var(--bs-btn-font-size);
        font-weight: var(--bs-btn-font-weight);
        line-height: var(--bs-btn-line-height);
        color: var(--bs-btn-color);
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
        border-radius: var(--bs-btn-border-radius);
        background-color: var(--bs-btn-bg);
        -webkit-transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, -webkit-box-shadow .15s ease-in-out;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, -webkit-box-shadow .15s ease-in-out;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out, -webkit-box-shadow .15s ease-in-out;
        color: #fff;
        background-color: #1f58c7;
        border-color: transparent;
    }
    .Btn:active, .Btn:focus, .Btn:hover {
        color: #fff;
        background-color: #1c4fb3 !important;
        border-color: transparent !important;
    }   

   
    .btn-secondary, .BtnSecundary {
        color: #fff;
        background-color: #a4a9b4;
        border-color: transparent;
    }
    .BtnSecundary:active, .BtnSecundary:focus, .BtnSecundary:hover,
    .btn-secondary:active, .btn-secondary:focus, .btn-secondary:hover {
        color: #fff;
        background-color: #9498a2 !important;
        border-color: transparent !important;
    }

    .btn-success,  .BtnSuccess  {
        color: #fff;
        background-color: #28b765;
        border-color: transparent;
    }
    .BtnSuccess:active, .BtnSuccess:focus, .BtnSuccess:hover ,
    .btn-success:active, .btn-success:focus, .btn-success:hover {
        color: #fff;
        background-color: #24a55b !important;
        border-color: transparent !important;
    }
    .btn-danger, .BtnAlert {
        color: #fff;
        background-color: #ed5555;
        border-color: transparent;
    }
    .BtnAlert:active, .BtnAlert:focus, .BtnAlert:hover,
    .btn-danger:active, .btn-danger:focus, .btn-danger:hover {
        color: #fff;
        background-color: #d54d4d !important;
        border-color: transparent !important;
    }

    .btn-info {
        color: #fff;
        background-color: #52c6ea;
        border-color: transparent;
    }
    .btn-info:active, .btn-info:focus, .btn-info:hover {
        color: #fff;
        background-color: #4ab2d3 !important;
        border-color: transparent !important;
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
    input[type=datetime-local],
    .input,
    w-multi-select,
    select,
    textarea{
        display: block;
        width: calc(100% - 1.40rem) ;
        padding: .47rem .75rem;
        font-size: .925rem;
        font-weight: 400;
        line-height: 1.5;
        color: var(--bs-body-color);
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: var(--bs-secondary-bg);
        background-clip: padding-box;
        border: var(--bs-border-width) solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);
        -webkit-transition: border-color .15s ease-in-out, -webkit-box-shadow .15s ease-in-out;
        transition: border-color .15s ease-in-out, -webkit-box-shadow .15s ease-in-out;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out, -webkit-box-shadow .15s ease-in-out;
    }    
    select {
        --bs-form-select-bg-img: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%231f2224' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
        display: block;
        width: 100%;
        padding: .47rem 1.75rem .47rem .75rem;
        font-size: .925rem;
        font-weight: 400;
        line-height: 1.5;
        color: var(--bs-body-color);
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: var(--bs-secondary-bg);
        background-image: var(--bs-form-select-bg-img),var(--bs-form-select-bg-icon,none);
        background-repeat: no-repeat;
        background-position: right .75rem center;
        background-size: 16px 12px;
        border: var(--bs-border-width) solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);
        -webkit-transition: border-color .15s ease-in-out,-webkit-box-shadow .15s ease-in-out;
        transition: border-color .15s ease-in-out,-webkit-box-shadow .15s ease-in-out;
        transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out,-webkit-box-shadow .15s ease-in-out;
    }
    

    input[type=color] {
        padding: 5px;
    }
    input:disabled {
        background-color: #e3e3e3 !important;
        color: #6a6a6a !important;
        pointer-events: none;
    }
    

    input:active,
    input:focus,
    select:active,
    select:focus,
    textarea:focus,
    textarea:focus {
        color: var(--bs-body-color);
        background-color: var(--bs-secondary-bg);
        border-color: #8face3;
        outline: 0;
        -webkit-box-shadow: 0 0 0 0 rgba(31, 88, 199, .25);
        box-shadow: 0 0 0 0 rgba(31, 88, 199, .25);
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