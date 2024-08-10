//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { WSecurity } from "../Security/WSecurity.js";
import { css, WCssClass } from "../WModules/WStyledRender.js";

const OnLoad = async () => {
    const UserData = {
        mail: "",
        password: ""
    }
    // @ts-ignore

    setTimeout(() => {
        const LoginForm = GetLoginLayout(WRender.Create({
            className: "sign-in-form",
            children: [
                WRender.Create({
                    tagName: "style",
                    innerHTML: '@import url(/css/variables.css);'
                }),
                {
                    class: "text-center mt-2",
                    children: [{
                        tagName: 'h3',
                        innerText: "Inicio de sesión"
                    }]
                }, {
                    class: "mb-3",
                    children: [{
                        class: 'position-relative input-custom-icon',
                        children: [
                            html `<span class="bx bx-user"></span>`,
                            {
                                id: 'username',
                                tagName: 'input',
                                type: 'text',
                                placeholder: 'Usuario',
                                className: 'form-control',
                                onchange: (ev) => {
                                    UserData.mail = ev.target.value;
                                }
                            }
                        ]
                    }]
                }, {
                    class: "mb-3",
                    children: [{
                        class: "position-relative auth-pass-inputgroup input-custom-icon",
                        children: [
                            html `<span class="bx bx-lock-alt"></span>`, {
                                tagName: 'input',
                                id: "password-input",
                                type: 'password',
                                placeholder: 'Contraseña',
                                className: 'form-control',
                                onchange: (ev) => {
                                    UserData.password = ev.target.value;
                                },
                                children: [{
                                    id: "password-addon",
                                    tagName: 'button',
                                    type: 'button',
                                    className: 'btn btn-link position-absolute h-100 end-0 top-0',
                                    children: [
                                        html `<i class="mdi mdi-eye-outline font-size-18 text-muted"></i>`
                                    ]
                                }]
                            }
                        ]
                    }]
                }, {
                    class: 'mt-3',
                    children: [{
                        tagName: 'input',
                        type: 'button',
                        className: 'btn btn-primary w-100 waves-effect waves-light',
                        value: 'Iniciar Sesión',
                        onclick: async () => WSecurity.Login(UserData)
                    }]
                }, {
                    class: 'mt-4 text-center',
                    children: [{
                        className: 'text-decoration-underline',
                        tagName: 'a',
                        innerText: 'Olvidaste tu contraseña?',
                        href: "/Security/RecoveryPassword"
                    }]
                }
            ]
        }), html `<form></form>`)
        // @ts-ignore
        App.appendChild(LoginForm);
        LoginForm.append(WRender.Create({
            children: [
                MasterStyle
            ]
        }));
    }, 300);
}
/**
* @param {HTMLElement} loginForm 
* @param {HTMLElement} registerForm 
* @returns {HTMLElement}
*/
const GetLoginLayout = (loginForm, registerForm) => {
    const loginLayout = html`<div class="authentication-bg min-vh-100">
        <!-- <div class="bg-overlay bg-light"></div> -->
        <div class="col-md-5 svg-background">
            <div class="d-flex flex-column min-vh-100">
                
            </div>
        </div>  
        <div class="col-md-7 container">
            <div class="d-flex flex-column min-vh-100 px-3">
                <div class="row justify-content-center my-auto">
                    <div class="col-md-8 col-lg-8 col-xl-6">

                        <div class="mb-4 pb-2">
                            <a href="javascript:void(0)" class="d-block auth-logo">
                                <img src="/Media/img/logotipoCCA.png" alt="" height="250" class="auth-logo-dark me-start">
                                <img src="/Media/img/logotipoCCA.png" alt="" height="250" class="auth-logo-light me-start">
                            </a>
                        </div>

                        <div class="card">
                            <div class="card-body p-4"> 
                                <div class="text-center mt-2">
                                    <h3>${localStorage.getItem("TITULO")}</h3>
                                    <p>${localStorage.getItem("SUB_TITULO")}</p>
                                </div>
                                <div class="p-2 mt-4" id="container">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div><!-- end container -->
    </div>`;    
    loginLayout.querySelector("#container")?.append(loginForm);
    return loginLayout;

}

const MasterStyle = css`
    .svg-background {
        background-image: url('/Media/img/calendar-img.png');
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        background-color: var(--primary-color);
        display: table;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .svg-background {
            display: none;
        }
    }
`

window.onload = OnLoad;