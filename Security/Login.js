//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { WSecurity } from "../Security/WSecurity.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";

const OnLoad = async () => {
    const UserData = {
        user: "",
        password: ""
    }
    // @ts-ignore

    setTimeout(() => {
        const LoginForm = GetLoginLayout(WRender.Create({
            className: "sign-in-form", children: [
                { tagName: 'h3', innerText: "Inicio de sesión", class: 'title' },
                {
                    class: "mb-3", children: [
                        html`<img src="/WDevCore/Security/Styles/img/user.png" class="form-control" alt="" />`, {
                            tagName: 'input', type: 'text', placeholder: 'Correo', onchange: (ev) => {                                UserData.user = ev.target.value;
                            }
                        }]
                }, {
                    class: "mb-3", children: [
                        html`<label class="form-label" for="username">Password</label>`,{
                            class: "position-relative input-custom-icon", children: [
                                {
                                    tagName: 'input', type: 'password', placeholder: 'Contraseña', className: 'form-control', onchange: (ev) => {
                                    UserData.password = ev.target.value;
                                }
                            }]
                        }    
                    ]
                }, {

                    tagName: 'input', type: 'button', className: 'btn btn-primary', value: 'Ok',
                    onclick: async () => WSecurity.Login(UserData)

                }, {
                    children: [{
                        tagName: 'a', innerText: 'Recuperar contraseña', href: "/Security/RecoveryPassword"
                    }]
                }
            ]
        }), html`<form></form>`)
        // @ts-ignore
        App.appendChild(LoginForm);
    }, 300);


}
/**
* @param {HTMLElement} loginForm 
* @param {HTMLElement} registerForm 
* @returns {HTMLElement}
*/
const GetLoginLayout = (loginForm, registerForm) => {
    const loginLayout = html`<div class="container">        
        <div class="forms-container">
            <div class="signin-signup" id="container">                
                    
            </div>
        </div>

        <!-- <div class="panels-container">
            <div class="panel left-panel">
                <div class="content">
                    <img class="logo" src="/Media/img/logotipoCCA.png"/>
                    <h3>${localStorage.getItem("TITULO")}</h3>
                    <p>
                        ${localStorage.getItem("SUB_TITULO")}
                    </p>
                    <button class="btn transparent" id="sign-up-btn">
                        Sign up
                    </button>
                </div>
                <img src="/WDevCore/Security/Styles/img/log.svg" class="image" alt="" />
            </div>
            <div class="panel right-panel">
                <div class="content">
                    <h3>One of us ?</h3>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
                        laboriosam ad deleniti.
                    </p>
                    <button class="btn transparent" id="sign-in-btn">
                        Sign in
                    </button>
                </div>
                <img src="/WDevCore/Security/Styles/img/register.svg" class="image" alt="" />
            </div>
        </div> -->
    </div>`;
    loginLayout.querySelector("#container")?.append(loginForm);
    return loginLayout;

}
const MasterStyle = css`
       /* body {
            font-family: "Poppins", sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 90vh;
        }

        .LoginForm {
            width: 450px;
            overflow: hidden;
            padding: 30px;
            box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
            border-radius: 30px;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
        }

        .LoginForm div {
            width: 100%;
            text-align: center;
            margin-bottom: 10px;
            margin-top: 10px;
        }

        img {
            display: block;
            width: 50%;
        }

        @media (max-width: 800px) {
            .LoginForm {
                box-shadow: none;
            }
        }*/
        `;
window.onload = OnLoad;