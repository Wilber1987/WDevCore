//@ts-check
import { StylesControlsV2, StyleScrolls } from "../StyleModules/WStyleComponents.js";
import { WAjaxTools, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";

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
        this.OptionContainer = WRender.Create({
            className: "OptionContainer", children: [
                this.MessageInput,
                {
                    tagName: 'input', type: 'button', className: 'Btn-Mini',
                    value: 'Send', onclick: async () => {
                        this.saveComment();
                    }
                }
            ]
        })
        this.shadowRoot?.append(StyleScrolls.cloneNode(true), StylesControlsV2.cloneNode(true),
            this.CustomStyle, this.CommentsContainer, this.OptionContainer)
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
    update = async () => {
        const Message = {
            Id_User: this.User.UserId
        }
        const response = await WAjaxTools.PostRequest(this.UrlSearch, Message);
        this.Dataset = response;
        this.DrawWCommentsComponent();
    }
    connectedCallback() {
        const scrollToBottom = ()=> {
            this.CommentsContainer.scrollTop = this.CommentsContainer.scrollHeight
                - this.CommentsContainer.clientHeight;
        }
        scrollToBottom();
    }
    DrawWCommentsComponent = async () => {
        this.CommentsContainer.innerHTML = "";
        console.log(this.Dataset);
        this.Dataset.forEach(comment => {
            this.CommentsContainer.insertBefore(WRender.Create({
                tagName: "div",
                className: comment.Id_User == this.User.UserId ? "commentSelf" : "comment",
                children: [
                    { tagName: "label", className: "nickname", innerHTML: comment.NickName },
                    { tagName: "p", innerHTML: comment.Body },
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
            min-height: 400px;
            background-color: #e9e9e9;     
            height: calc(100%  - 100px);
            border-radius: 10px;
            padding: 10px;
            display: block;
            max-height: 70vh;
        }
        .OptionContainer {
            padding: 10px;
            display: grid;
            grid-template-columns: calc(100% - 120px) 80px;
            min-width: 400px;
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
       
    `
}
customElements.define('w-coment-component', WCommentsComponent);
export { WCommentsComponent }