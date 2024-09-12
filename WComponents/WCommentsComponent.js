//@ts-check
import { StylesControlsV2, StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WRichText } from "./WRichText.js";
import { WModalForm } from "./WModalForm.js";
import { MultiSelect } from "./WMultiSelect.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WAjaxTools } from "../WModules/WAjaxTools.js";

class WCommentsComponent extends HTMLElement {
    /**
     * @param {{ 
     * Dataset: any[]; 
     * ModelObject: Object;
     * User: any; 
     * UserIdProp?: string;
     * CommentsIdentify: Number; 
     * CommentsIdentifyName: string; 
     * UrlSearch: string; 
     * UrlAdd: string; 
     * AddObject: boolean;
     * UseDestinatarios?: boolean; 
     * UseAttach?: boolean;
     * }} props
     */
    constructor(props) {
        super();
        this.Dataset = props.Dataset ?? [];
        //this.Destinatarios = props.Destinatarios ?? [];
        this.ModelObject = props.ModelObject;
        this.AddObject = props.AddObject ?? false;
        this.UrlSearch = props.UrlSearch;
        this.UrlAdd = props.UrlAdd;
        this.UseDestinatarios = props.UseDestinatarios ?? true;
        this.UseAttach = props.UseAttach ?? true;
        this.User = props.User;
        this.CommentsIdentify = props.CommentsIdentify;
        this.CommentsIdentifyName = props.CommentsIdentifyName;
        this.attachShadow({ mode: 'open' });
        this.CommentsContainer = WRender.Create({ className: "CommentsContainer" })
        this.MessageInput = WRender.Create({ tagName: 'textarea' });
        this.autoScroll = true;

        //this.style.backgroundColor = "#fff";
        this.OptionContainer = WRender.Create({
            className: "OptionContainer", children: [
                this.MessageInput,
                {
                    tagName: 'input', type: "button", className: 'Btn-Mini',
                    value: 'Enviar', onclick: async () => {
                        this.saveComment();
                    }
                }
            ]
        })

        this.RitchInput = new WRichText({
            activeAttached: this.UseAttach
        });
        this.RitchOptionContainer = WRender.Create({
            className: "RichOptionContainer", style: { display: "none" }, children: [
                this.RitchInput,
                {
                    tagName: 'input', type: "button", className: 'Btn-Mini',
                    value: 'Enviar', onclick: async () => {
                        this.saveRitchComment();
                    }
                }
            ]
        })

        this.TypeTextContainer = WRender.Create({
            className: "textContainer", children: [
                {
                    tagName: 'label',
                    innerText: 'Texto normal', onclick: async () => {
                        this.CommentsContainer.style.height = "calc(100% - 150px)";
                        this.RitchOptionContainer.style.display = "none";
                        this.OptionContainer.style.display = "grid";
                    }
                }, {
                    tagName: 'label',
                    innerText: 'Texto enriquecido', onclick: async () => {
                        this.CommentsContainer.style.height = "calc(100% - 600px)";
                        this.RitchOptionContainer.style.display = "flex";
                        this.OptionContainer.style.display = "none";

                    }
                }
            ]
        })
        this.Mails = WArrayF.GroupBy(this.Dataset, "Mail").map(comment => comment.EvalProperty);
        this.SelectedMails = WArrayF.GroupBy(this.Dataset, "Mail").map(comment => comment.EvalProperty);




        this.shadowRoot?.append(
            StyleScrolls.cloneNode(true),
            StylesControlsV2.cloneNode(true),
            this.CustomStyle,
            this.CommentsContainer,
            this.TypeTextContainer)
        if (this.UseDestinatarios  == true) {
            this.MailsSelect = new MultiSelect({
                Dataset: this.Mails,
                selectedItems: this.SelectedMails,
                AddObject: this.AddObject,
                AddPatern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"//patron de correo
            });
            this.shadowRoot?.append(this.MailsSelect)
        }
        this.shadowRoot?.append(this.OptionContainer, this.RitchOptionContainer)
        

    }
    saveComment = async () => {
        // @ts-ignore
        if (this.MessageInput.value.length < 3) {
            return;
        }
        const Message = {
            // @ts-ignore
            Body: this.MessageInput.value,
            Id_User: this.User.UserId,
            Mails: this.UseDestinatarios == true ? this.MailsSelect?.selectedItems  : undefined
        }
        Message[this.CommentsIdentifyName] = this.CommentsIdentify
        const response = await WAjaxTools.PostRequest(this.UrlAdd, Message);
        // @ts-ignore
        this.MessageInput.value = "";
        this.update();
    }
    saveRitchComment = async () => {
        const Message = {
            // @ts-ignore
            Body: this.RitchInput.value,
            Attach_Files: this.RitchInput.Files,
            Id_User: this.User.UserI
        }
        Message[this.CommentsIdentifyName] = this.CommentsIdentify
        const response = await WAjaxTools.PostRequest(this.UrlAdd, Message);
        this.RitchInput.FunctionClear();
        this.update();
    }

    connectedCallback() {
        this.Interval = setInterval(async () => {
            await this.update();
            this.scrollToBottom();
        }, 10000)
        setTimeout(async () => { 
            await this.update(false)
            this.scrollToBottom() }, 100);
        let isLoading = false;

        // Definir la función de manejo de scroll por separado
        this.CommentsContainer.addEventListener('scroll', debounce(async () => {
            if (isLoading) {
                return;
            }

            const { scrollTop, clientHeight, scrollHeight } = this.CommentsContainer;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight;

            if (isAtBottom) {
                this.autoScroll = true;
            } else {
                this.autoScroll = false;
            }

            if (scrollTop === 0) {
                isLoading = true;
                this.actualPage++;
                await this.update(false, true);
                isLoading = false;
            }
        }, 100)); // Adjust the debounce delay as needed

        // Debouncing function
        function debounce(func, delay) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);

            };
        }
        
    }
    scrollToBottom = () => {
        if (this.autoScroll) {
            this.CommentsContainer.scrollTo({
                top: this.CommentsContainer.scrollHeight,
                behavior: 'smooth' // Desplazamiento suave
            });
        }
    }
    disconnectedCallback() {
        this.Interval = null;
    }
    GetDestinatarios() {
        // return this.Destinatarios;
    }
    DrawWCommentsComponent = async () => {
        // Variable para evitar múltiples solicitudes        
        //console.log(this.Dataset);
        this.Dataset.forEach(comment => {
            const idMessage = comment.Id_mensaje ?? comment.Id_Comentario;
            const date = new Date(comment.Created_at) ?? new Date(comment.Fecha);
            if (this.CommentsContainer.querySelector(`#MessageId${idMessage}`)) {
                return;
            }
            const attachs = WRender.Create({ className: "attachs" });
            comment.Attach_Files?.forEach(attach => {
                if (attach.Type.toUpperCase().includes("JPG")
                    || attach.Type.toUpperCase().includes("JPEG")
                    || attach.Type.toUpperCase().includes("PNG")) {
                    attachs.append(WRender.Create({
                        tagName: "img", src: attach.Value.replace("wwwroot", ""), onclick: () => {
                            this.shadowRoot?.append(new WModalForm({
                                ObjectModal: WRender.Create({
                                    tagName: "img", src: attach.Value.replace("wwwroot", ""), style: {
                                        width: "auto",
                                        objectFit: "cover",
                                        height: "calc(100% - 20px)",
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        borderRadius: "20px"
                                    }
                                })
                            }))
                        }
                    }));
                } else if (attach.Type.toUpperCase().includes("PDF")) {
                    attachs.append(WRender.Create({
                        tagName: "a", innerText: attach.Name, onclick: () => {
                            this.shadowRoot?.append(new WModalForm({
                                ObjectModal: WRender.Create({
                                    tagName: "iframe", src: attach.Value.replace("wwwroot", ""), style: {
                                        height: "600px",
                                        width: "100%"
                                    }
                                })
                            }))
                        }
                    }));
                }

            });
            const commentIdUser = comment.Id_User ?? comment.Usuario_id;
            const message = WRender.Create({
                tagName: "div",
                className: (commentIdUser == this.User.UserId ? "commentSelf" : "comment")
                    + (comment.Leido == true ? "leido" : ""),
                children: [
                    { tagName: "label", className: "nickname", innerHTML: comment.NickName ?? comment.Remitente },
                    { tagName: "p", innerHTML: comment.Body ?? comment.mensaje }, attachs,
                    { tagName: "label", className: "date",innerHTML: comment.Fecha?.toDateTimeFormatEs() ?? comment.Created_at?.toDateTimeFormatEs() }
                ]
            });
            const commentWrapper = html`<div id="MessageId${idMessage}"  class="message-wrapper ${commentIdUser == this.User.UserId ? "wraperSelf" : "wrapper"}">
               <img class="message-avatar" src="${comment.Foto ?? "/media/img/avatar.png"}"/> ${message} 
            </div>`;
            // @ts-ignore
            commentWrapper.comment = comment;
            const primerMensaje = this.CommentsContainer.firstChild;
            //const ultimoMensaje = this.CommentsContainer.lastChild;

            if (primerMensaje != null) {
                // @ts-ignore
                const fechaPrimerMensaje = new Date(primerMensaje.comment.Created_at ?? primerMensaje.comment.Fecha);
                // @ts-ignore
                if (fechaPrimerMensaje > date) {
                    this.CommentsContainer.insertBefore(commentWrapper, primerMensaje);
                } else {
                    this.CommentsContainer.appendChild(commentWrapper);
                }
            } else {
                this.CommentsContainer.appendChild(commentWrapper);
            }
        });
    }
    update = async (inicialize = false, isUpScrolling = false) => {
        const Message = {}
        Message[this.CommentsIdentifyName] = this.CommentsIdentify
        this.maxMessage = 30;
        this.actualPage = this.actualPage ?? 1;
        if (isUpScrolling) {
            Message.FilterData = [{
                FilterType: "PAGINATED",
                Values: [this.actualPage.toString(), this.maxMessage.toString()]
            }]
        } else {
            Message.FilterData = [{ FilterType: "PAGINATED", Values: ["1", "30"] }]
        }
        const response = await WAjaxTools.PostRequest(this.UrlSearch, Message);
        //console.log(response);
        this.Dataset = response;
        if (!inicialize) {
            await this.DrawWCommentsComponent();
            this.scrollToBottom();
        }
    }
    CustomStyle = css`    
        .CommentsContainer{
            display: flex;
            flex-direction: column;
            overflow: hidden;
            overflow-y: auto;  
            min-height: 280px;
            background-color: #fff;     
            height: calc(100%  - 150px);
            border-radius: 10px;
            padding: 10px;
            display: block;
            max-height: 70vh;
        }
        .textContainer {
            display: flex;
        }
        .textContainer label{
            padding: 5px;
            cursor: pointer;
            margin-right: 10px;
            font-weight: bold;
            font-size: 12px;
        }
        .OptionContainer {     
            margin: 10px 0px;       
            display: grid;
            grid-template-columns: calc(100% - 120px) 100px;
            gap: 20px;
            min-width: 400px;
        }
        .RichOptionContainer {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: flex-end;
            gap: 10px;
        }        
        p {
            margin: 5px 0px;
        }
        label.nickname {
            font-weight: bold;
            text-align: left;
        }
        .attachs {
            overflow: hidden;   
            display: flex;
            gap: 5px;
            flex-wrap: wrap;       
        }
        .attachs img {
            width: 100px;
            height: 100px;
            overflow: hidden;
            cursor: pointer;
            border-radius: 10px;
            object-fit: cover;
        }
        .attachs a {
            cursor: pointer;
            width: 100%;
            margin: 10px 0px;
            display: block;
            font-weight: bold;
            text-decoration: underline;
            color: #020c1f;
        }
        .message-wrapper {
            display: flex;
            gap: 10px;
        }
        .wraperSelf{
            flex-direction: row-reverse;
            justify-content: flex-start;
        }
        .wrapper{}
        .message-avatar {
            height: 40px;
            width: 40px;
            overflow: hidden;
            border-radius: 50%;
        }
        .comment, .commentSelf {
            padding: 10px;
            margin: 5px;
            width: calc(100% - 80px);
            border-radius: 10px;
            font-size: 12px;
            height: fit-content;
            max-width: 600px;
            text-align: left;
        }
        .comment { 
            background-color: #f2f5f8;
        }
        .commentSelf {
            background-color: #1f58c7;
            color: #ffffff;
        }        
        .comment label, .commentSelf label, .comment p, .commentSelf p {
            display: block;
            text-align: left;
        }
        .commentSelf p, .comment p {
            font-size: 14px;
        }
        .commentSelf p::first-letter, .comment p::first-letter {
            text-transform: uppercase;
        }
        label.date {
            font-size: 11px;
            text-align: end;
        }
        .Btn-Mini {
            width: 100px;
            justify-self: right;
        }
        w-rich-text {
            margin-top: 10px;
            width: calc(100% - 12px);
        }
       
    `
}
customElements.define('w-coment-component', WCommentsComponent);
export { WCommentsComponent }

class Destinatario {
    /**@type {Number} */
    Id_User;
    /**@type {String} */
    Correo;
    /**@type {String} */
    Nombre;
    /**@type {Boolean} */
    Enviado;
    /**@type {Boolean} */
    Leido;
}