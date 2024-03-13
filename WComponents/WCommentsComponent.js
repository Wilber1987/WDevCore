//@ts-check
import { StylesControlsV2, StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { WAjaxTools, WArrayF, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WRichText } from "./WRichText.js";
import { WModalForm } from "./WModalForm.js";
import { MultiSelect } from "./WMultiSelect.js";

class WCommentsComponent extends HTMLElement {
    constructor(props) {
        super();
        this.Dataset = props.Dataset ?? [];
        this.ModelObject = props.ModelObject;
        this.AddObject = props.AddObject;
        this.UrlSearch = props.UrlSearch;
        this.UrlAdd = props.UrlAdd;
        this.User = props.User;
        this.CommentsIdentify = props.CommentsIdentify;
        this.CommentsIdentifyName = props.CommentsIdentifyName;
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
        this.Mails = WArrayF.GroupBy(this.Dataset, "Mail").map(comment => comment.Mail);
        this.SelectedMails = WArrayF.GroupBy(this.Dataset, "Mail").map(comment => comment.Mail);


        this.MailsSelect = new MultiSelect({
            Dataset: this.Mails,
            selectedItems: this.SelectedMails,
            AddObject: this.AddObject, 
            AddPatern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"//patron de correo
        });
        this.shadowRoot?.append(StyleScrolls.cloneNode(true), StylesControlsV2.cloneNode(true),
            this.CustomStyle, this.CommentsContainer, this.TypeTextContainer, this.MailsSelect,
            this.OptionContainer, this.RitchOptionContainer)
        this.DrawWCommentsComponent();

    }
    saveComment = async () => {
        const Message = {
            // @ts-ignore
            Body: this.MessageInput.value,
            Id_User: this.User.UserId,
            Mails: this.MailsSelect.selectedItems
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
    update = async () => {
        const Message = {}
        Message[this.CommentsIdentifyName] = this.CommentsIdentify
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
            grid-template-columns: calc(100% - 70px) 60px;
            gap: 10px;
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
        .comment label, .commentSelf label, .comment p, .commentSelf p {
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
            margin-top: 10px;
            width: calc(100% - 12px);
        }
       
    `
}
customElements.define('w-coment-component', WCommentsComponent);
export { WCommentsComponent }