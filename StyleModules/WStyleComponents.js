
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


const StylesControlsV2 = css`@import url(/WDevCore/StyleModules/css/variables.css);
  @import url(https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&amp;family=Montserrat:wght@400;500;600&amp;display=swap);
    .green { background-color:rgb(36, 165, 91) }
    .yellow { background-color:rgb(244, 194, 56) }
    .cyan { background-color:rgb(74, 178, 211) }
    .red { background-color:rgb(213, 77, 77) }
    .Btn-Mini, .Btn-Mini-Alert, .Btn-Mini-Success {
        background-color: #1c4786;
        border: none;
        outline: none;
        border-radius: 8px;
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
        display: inline-block;
        padding: 10px;
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
        border-radius: 8px;
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
        width: calc(100%);        
        box-sizing: border-box;
        padding: .47rem .75rem;
        font-size: .925rem;
        font-weight: 400;
        line-height: 1.5;
        color: #202020;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #d3d3d3;
        border-radius: 8px;
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
        color: #202020;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: #fff;
        background-image: var(--bs-form-select-bg-img),var(--bs-form-select-bg-icon,none);
        background-repeat: no-repeat;
        background-position: right .75rem center;
        background-size: 16px 12px;
        border-radius: 8px;
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
        color: #202020;
        background-color: #fff;
        border-color: #8face3;
        outline: 0;
        -webkit-box-shadow: 0 0 0 0 rgba(31, 88, 199, .25);
        box-shadow: 0 0 0 0 rgba(31, 88, 199, .25);
    }

    .btn-go {
        margin: 0px;
        display: flex;
        align-items: center;
        cursor: pointer;
    }
    .btn-go *{
        margin: 0px;
    }
    .btn-go::after {
        content: "";    
        transition: all 0.3s; /* Transición para el hover */
        clip-path: polygon(50% 50%, 100% 0%, 100% 50%, 50% 100%, 0% 50%, 0% 0%);
        background-color: #033da7;
        fill: #000;
        height: 10px;
        width: 15px;
        transform: rotate(-90deg);
        margin-left: 10px;
    } 
     /*BOTON ACORDEON HOTIZONTAL*/   
    .accordion-button::after {      
        width: 14px;
        height: 14px;
        margin-left: auto;
        content: "";
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23282c2f'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
        background-repeat: no-repeat;
        background-size: 14px;
        transition: all 0.5s;
        transform: rotate(-90deg);
    }    
    .accordion-button {
        cursor: pointer;
        position: relative;
        display: flex;
        align-items: center;
        padding: 10px 20px;
        font-size: .925rem;
        border-radius: 10px;
        color: #282c2f;
        text-align: left;
        border: 0;
        overflow-anchor: none;
        transition: color 0.15s ease-in-out;
        background-color: 0.15s ease-in-out;
        border-color: 0.15s ease-in-out;
        box-shadow: 0.15s ease-in-outp;
        justify-content: space-between;
        text-transform: uppercase;
        font-weight: 600;
        transition: all 0.5s;
        gap: 10px;
    }
    .active-btn {
        background-color: rgb(210, 222, 244);       
    }
    .accordion-button.active-btn::after {
        transform: rotate(0deg);
    }
    /*BOTON ACORDEON VERTICAL*/
    .btn-go:hover::after {
        margin-left: 15px; /* Desplaza la flecha 5px hacia la derecha en el hover */
    }
    .vertical-acordeon-btn {     
       display: flex;   
       gap: 10px;    
       font-size: .925rem;
       align-items: center;
       border: none;
       background-color: unset;
    }
    .vertical-acordeon-btn::after {
        display: block;
        content: " ";
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23282c2f'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
        transition: all 0.3s;
        height: 15px;
        width: 15px;
        background-repeat: no-repeat;
        background-size: 14px;
        background-position: 50% 50%;
        transition: all 0.5s;
        border-radius: 50%;
        padding: 10px;
        
    }
    .vertical-acordeon-btn.active-btn::after {
        transform: rotate(-90deg);
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