//@ts-check
import { StylesControlsV2, StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { WAjaxTools, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WRichText } from "../WWComponentsPROTOS/WRichText.js";
import { WModalForm } from "./WModalForm.js";

class WCommentsComponent extends HTMLElement {
    constructor(props) {
        super();
        this.Dataset = props.Dataset ?? [];
        this.ModelObject = props.ModelObject;

        this.UrlSearch = props.UrlSearch;
        this.UrlAdd = props.UrlAdd;
        this.User = props.User;
        this.CommentsIdentify = props.CommentsIdentify;
        this.attachShadow({ mode: 'open' });
        this.CommentsContainer = WRender.Create({ className: "CommentsContainer" })
        this.MessageInput = WRender.Create({ tagName: 'textarea' });

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

        this.RitchInput = new WRichText();
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
                        this.CommentsContainer.style.height = "calc(100% - 100px)";
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
        this.shadowRoot?.append(StyleScrolls.cloneNode(true), StylesControlsV2.cloneNode(true),
            this.CustomStyle, this.CommentsContainer, this.TypeTextContainer,
            this.OptionContainer, this.RitchOptionContainer)
        this.DrawWCommentsComponent();
    }
    saveComment = async () => {
        const Message = {
            // @ts-ignore
            Body: this.MessageInput.value,
            Id_Case: this.CommentsIdentify,
            Id_User: this.User.UserId
        }
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
            Id_Case: this.CommentsIdentify,
            Id_User: this.User.UserI
        }
        const response = await WAjaxTools.PostRequest(this.UrlAdd, Message);
        this.RitchInput.FunctionClear();
        this.update();
    }
    update = async () => {
        const Message = {
            Id_Case: this.CommentsIdentify
        }
        const response = await WAjaxTools.PostRequest(this.UrlSearch, Message);
        //console.log(response);
        this.Dataset = response;
        this.DrawWCommentsComponent();
    }
    connectedCallback() {
        const scrollToBottom = () => {
            this.CommentsContainer.scrollTop = this.CommentsContainer.scrollHeight
                //- this.CommentsContainer.clientHeight;
        }
        scrollToBottom();
        this.Interval = setInterval(async () => {
            await this.update()
        }, 20000)
    }
    disconnectedCallback() {
        this.Interval = null;
    }
    DrawWCommentsComponent = async () => {
        this.CommentsContainer.innerHTML = "";
        //console.log(this.Dataset);
        this.Dataset.forEach(comment => {
            const attachs = WRender.Create({ className: "attachs" });
            comment.Attach_Files?.forEach(attach => {
                if (attach.Type.toUpperCase().includes("JPG")
                    || attach.Type.toUpperCase().includes("JPEG")
                    || attach.Type.toUpperCase().includes("PNG")) {
                    attachs.append(WRender.Create({ tagName: "img", src: attach.Value.replace("wwwroot", "") , onclick : ()=>{                        
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
                    }}));
                } else if (attach.Type.toUpperCase().includes("PDF")) {
                    attachs.append(WRender.Create({
                        tagName: "a", innerText: attach.Name , onclick: () => {
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
            this.CommentsContainer.insertBefore(WRender.Create({
                tagName: "div",
                className: comment.Id_User == this.User.UserId ? "commentSelf" : "comment",
                children: [
                    { tagName: "label", className: "nickname", innerHTML: comment.NickName },
                    { tagName: "p", innerHTML: comment.Body }, attachs,
                    { tagName: "label", innerHTML: comment.Fecha.toDateFormatEs() }
                ]
            }), this.CommentsContainer.firstChild);
        });
    }
    CustomStyle = css`    
        .CommentsContainer{
            display: flex;
            flex-direction: column;
            overflow: hidden;
            overflow-y: auto;  
            min-width: 380px;
            min-height: 350px;
            background-color: #e9e9e9;     
            height: calc(100%  - 100px);
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
            padding: 10px;
            display: grid;
            grid-template-columns: calc(100% - 120px) 80px;
            min-width: 400px;
        }
        .RichOptionContainer {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }
        .comment, .commentSelf {
            padding: 10px;
            margin: 5px;
            width: calc(100% - 80px);
            border-radius: 10px;
            font-size: 12px;
            height: fit-content;
        }
        .comment { 
            background-color: #cfcfcf;
            float: left
        }
        .commentSelf {
            background-color: #5995fd;
            color: #ffffff;
            float: right;
        }        
        .comment label, .commentSelf label {
            display: block;
            text-align: right;
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
        w-rich-text {
            width: 100%;
        }
       
    `
}
customElements.define('w-coment-component', WCommentsComponent);
export { WCommentsComponent }