//@ts-check
import { OrderData } from "../WModules/CommonModel.js";
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { generateGUID, html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WChatStyle } from "./ComponentsStyles/WChatStyle.js";
import { WForm } from "./WForm.js";

class WebApiResponse {
    /**@type {Boolean?} */ WithAgentResponse
    /**@type {String} */ Reply
    /**@type {Number} */ Id_Case
}
class WChatComponent extends HTMLElement {
    /**
     * @param {{ 
        * Url?: String,
        *UrlGetConfigData?:String,
        *UrlSearch?:String,
        *UrlAdd?:String,
        *UserIdProp?:String,
        *CommentsIdentify?:String,
        *CommentsIdentifyName?:String,
        *AddObject?:Boolean
    * }} Config
     * 
     */
    constructor(Config) {
        super();
        //this.attachShadow({ mode: 'open' });
        this.Container = html`<div class="container"></div>`
        WRender.SetStyle(this, {
            display: "block"
        });
        this.append(html`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">`)
        this.appendChild(html`<div class="header">
            <h2>${localStorage.getItem("TITULO") ?? "CHATBOT"}</h2>
       </div>`);
        this.append(WChatStyle.cloneNode(true), this.Container);
        this.Config = Config;
        this.identity = {
            Tipo: undefined,
            Value: localStorage.getItem("identity"),
            Session: sessionStorage.getItem("Session") ?? generateGUID()
        };
        this.chatContainer = html`<div class="chat-container"></div>`;
        this.WithAgent = sessionStorage.getItem("WithAgent") == "true" ? true : false;
        // @ts-ignore
        this.Id_Case = sessionStorage.getItem("Id_Case") ? parseInt(sessionStorage.getItem("Id_Case")) : undefined;
        this.ActiveInterval();
        this.Draw();

    }
    connectedCallback() { }
    Draw = async () => {
        if (!this.identity.Value) {
            const header = html`<h1>Ingrese su identificación</h1>`
            const form = new WForm({
                ModelObject: {
                    Tipo: {
                        type: "radio", Dataset: ["Correo electrónico", "No Teléfono"],
                        DefaultValue: "Correo electrónico",
                        action: (editingObject, /**@type {WForm} */ form) => {
                            if (editingObject.Tipo == "No Teléfono") {
                                form.ModelObject.Telefono.hidden = false
                                form.ModelObject.Correo.hidden = true
                            } else {
                                form.ModelObject.Telefono.hidden = true
                                form.ModelObject.Correo.hidden = false
                            }
                            form.DrawComponent();
                        }
                    },
                    Telefono: { type: "tel", hidden: true },
                    Correo: { type: "email" },
                },
                SaveFunction: (editingObject) => {
                    if (editingObject.Tipo == "No Teléfono") {
                        this.identity.Tipo = editingObject.Tipo
                        this.identity.Value = editingObject.Telefono
                    } else {
                        this.identity.Tipo = editingObject.Tipo
                        this.identity.Value = editingObject.Correo
                    }
                    // @ts-ignore
                    localStorage.setItem("identity", this.identity.Value)
                    form.remove();
                    header.remove();
                    this.chatContainer.querySelector(".default-text")?.remove();
                    this.Draw();
                    this.update()
                }
            })
            this.append(html`<div class="default-text">
                ${header}
                ${form}
            </div>`);
            return;
        }
        /**@type {HTMLInputElement} */
        // @ts-ignore
        const chatInput = html`<textarea id="chat-input" spellcheck="false" placeholder="Enter a prompt here" required></textarea>`
        const sendButton = html`<span id="send-btn" class="material-symbols-rounded">send</span>`

        const themeButton = html`<span id="theme-btn" class="material-symbols-rounded">light_mode</span>`;
        const deleteButton = html`<span id="delete-btn" class="material-symbols-rounded">delete</span>`;

        this.Container.appendChild(this.chatContainer);
        this.Container.appendChild(html`<div class="typing-container">
            <div class="typing-content">
                <div class="typing-textarea">
                    ${chatInput}
                    ${sendButton}
                </div>
                <div class="typing-controls">
                    ${themeButton}
                    ${deleteButton}
                </div>
            </div>
        </div>`)
        let userText = null;
        userText = this.InicialiceComponent(themeButton, userText, chatInput, deleteButton, sendButton);


    }

    InicialiceComponent(themeButton, userText, chatInput, deleteButton, sendButton) {
        const loadDataFromLocalstorage = () => {
            // Load saved chats and theme from local storage and apply/add on the page
            const themeColor = localStorage.getItem("themeColor");

            document.body.classList.toggle("light-mode", themeColor === "light_mode");
            themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

            const defaultText = `<div class="default-text">
                <h1>${localStorage.getItem("TITULO") ?? "CHATBOT"}</h1>
                <p>${localStorage.getItem("SUB_TITULO") ?? "Start"}</p>
            </div>`;

            this.chatContainer.innerHTML = localStorage.getItem("all-chats") ?? defaultText;
            if (this.chatContainer.querySelector(".default-text")) {
                this.chatContainer.querySelector(".default-text")?.remove();
            }
            this.chatContainer?.scrollTo(0, this.chatContainer.scrollHeight); // Scroll to bottom of the chat container
        };
        const createChatElement = (content, className) => {
            return html`<div class="chat ${className}">${content}</div>`;
        };

        const getChatResponse = async (incomingChatDiv) => {
            const pElement = document.createElement("p");
            // Send POST request to API, get response and set the reponse as paragraph element text
            try {
                const model = {
                    SessionId: this.identity.Session,
                    Text: userText,
                    Source: "webapi",
                    Id: "1",
                    UserId: this.identity.Value,
                    Timestamp: new Date()
                };
                /**@type {WebApiResponse} */
                const response = await this.SendMessage(model);
                pElement.textContent = response.Reply;
                if (this.WithAgent != true) {
                    // Remove the typing animation, append the paragraph element and save the chats to local storage                   
                    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
                } else {
                    incomingChatDiv.remove();
                }
                this.WithAgent = response.WithAgentResponse ?? false;
                sessionStorage.setItem("WithAgent", this.WithAgent == true ? "true" : "false");
                this.Id_Case = response.Id_Case;
                sessionStorage.setItem("Id_Case", this.Id_Case.toString());
                this.ActiveInterval();
            } catch (error) { // Add error class to the paragraph element and set error text
                pElement.classList.add("error");
                pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
            }
            incomingChatDiv.querySelector(".typing-animation").remove();
            localStorage.setItem("all-chats", this.chatContainer.innerHTML);
            this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
        };

        const copyResponse = (copyBtn) => {
            // Copy the text content of the response to the clipboard
            const reponseTextElement = copyBtn.parentElement.querySelector("p");
            navigator.clipboard.writeText(reponseTextElement.textContent);
            copyBtn.textContent = "done";
            setTimeout(() => copyBtn.textContent = "content_copy", 1000);
        };
        const showTypingAnimation = () => {
            // Display the typing animation and call the getChatResponse function
            const html = `<div class="chat-content">
                    <div class="chat-details">
                        <svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enable-background="new 0 0 76.00 76.00" xml:space="preserve" fill="#47d1ff" stroke="#47d1ff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#6bc7e6" fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 38,23C 44.382,23 49.8331,26.9856 52,32.6036L 52,43.3964C 49.8331,49.0144 44.382,53 38,53C 36.9694,53 35.9631,52.8961 34.991,52.6981C 34.835,50.0773 32.6601,48 30,48C 29.0779,48 28.214,48.2496 27.4724,48.685C 25.9673,47.202 24.7741,45.4033 24,43.3964L 24,32.6036C 26.1669,26.9856 31.618,23 38,23 Z M 23,33.5L 23,42.5L 22.8835,43.2565C 23.792,45.8695 25.3589,48.1744 27.3856,49.9725C 28.0868,49.3665 29.0006,49 30,49C 32.2091,49 34,50.7909 34,53C 34,55.2091 32.2091,57 30,57C 27.7909,57 26,55.2091 26,53L 26.0084,52.7385C 23.508,50.7017 21.5357,48.0412 20.3287,44.9942C 19.0279,44.9062 18,43.8232 18,42.5L 18,33.5C 18,32.1769 19.0279,31.0938 20.3287,31.0058C 23.1144,23.9735 29.9764,19 38,19C 46.0236,19 52.8856,23.9735 55.6713,31.0058C 56.9721,31.0938 58,32.1769 58,33.5L 58,42.5C 58,43.8807 56.8807,45 55.5,45C 54.1193,45 53,43.8807 53,42.5L 53,33.5L 53.1165,32.7435C 50.9419,26.4891 44.9952,22 38,22C 31.0048,22 25.0581,26.4891 22.8835,32.7435L 23,33.5 Z "></path> </g></svg>
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
            // Create an incoming chat div with typing animation and append it to chat container
            const incomingChatDiv = createChatElement(html, "incoming");
            this.chatContainer.appendChild(incomingChatDiv);
            this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
            getChatResponse(incomingChatDiv);
        };

        const handleOutgoingChat = () => {
            userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
            if (!userText) return; // If chatInput is empty return from here


            // Clear the input field and reset its height
            chatInput.value = "";
            chatInput.style.height = `${initialInputHeight}px`;

            const html = `<div class="chat-content">
                    <div class="chat-details">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="12" cy="6" r="4" fill="#77cef3"></circle> <path opacity="0.5" d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z" fill="#77cef3"></path> </g></svg>
                        <p>${userText}</p>
                    </div>
                </div>`;

            // Create an outgoing chat div with user's message and append it to chat container
            const outgoingChatDiv = createChatElement(html, "outgoing");
            this.chatContainer.querySelector(".default-text")?.remove();
            this.chatContainer.appendChild(outgoingChatDiv);
            this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
            setTimeout(showTypingAnimation, 500);
        };

        deleteButton.addEventListener("click", () => {
            // Remove the chats from local storage and call loadDataFromLocalstorage function
            if (confirm("Are you sure you want to delete all the chats?")) {
                localStorage.removeItem("all-chats");
                loadDataFromLocalstorage();
            }
        });

        themeButton.addEventListener("click", () => {
            // Toggle body's class for the theme mode and save the updated theme to the local storage 
            document.body.classList.toggle("light-mode");
            localStorage.setItem("themeColor", themeButton.innerText);
            themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
        });

        const initialInputHeight = chatInput.scrollHeight;

        chatInput.addEventListener("input", () => {
            // Adjust the height of the input field dynamically based on its content
            chatInput.style.height = `${initialInputHeight}px`;
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        });

        chatInput.addEventListener("keydown", (e) => {
            // If the Enter key is pressed without Shift and the window width is larger 
            // than 800 pixels, handle the outgoing chat
            if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
                e.preventDefault();
                handleOutgoingChat();
            }
        });


        loadDataFromLocalstorage();
        sendButton.addEventListener("click", handleOutgoingChat);
        return userText;
    }

    ActiveInterval() {
        if (this.WithAgent == true) {
            this.Interval = setInterval(async () => {
                if (this.updating == true) {
                    console.log(this.updating, " - block updating...");
                    return;
                }
                this.updating = true;
                await this.update();
                this.updating = false;
            }, 5000);
        }
    }

    async SendMessage(model) {
        return await WAjaxTools.PostRequest(this.Config.Url ?? "", model, {
            headers: [{ name: "X-Platform", value: "webapi" }],
            WithoutLoading: true
        });
    }

    async update() {
        if (this.WithAgent == true) {
            const Message = {}
            Message["Id_Case"] = this.Id_Case
            this.maxMessage = 30;
            this.actualPage = this.actualPage ?? 1;
            Message.FilterData = [{ FilterType: "limit", Values: ["30"] }]
            Message.OrderData = [OrderData.Asc("Fecha")]


            // @ts-ignore
            const response = await WAjaxTools.PostRequest(this.Config.UrlSearch, Message, { WithoutLoading: true });
            //console.log(response);
            //this.Dataset = response;         
            this.chatContainer.querySelector(".default-text")?.remove();
            
            response.forEach(comment => {
                if (this.chatContainer.querySelector("#Comment" + comment.Id_Comentario)) {
                    return;
                }
                // Create an incoming chat div with typing animation and append it to chat container
                const incomingChatDiv = html`<div class="chat incoming" id="Comment${comment.Id_Comentario}"><div class="chat-content">
                    <div class="chat-details">
                        <svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enable-background="new 0 0 76.00 76.00" xml:space="preserve" fill="#47d1ff" stroke="#47d1ff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#6bc7e6" fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 38,23C 44.382,23 49.8331,26.9856 52,32.6036L 52,43.3964C 49.8331,49.0144 44.382,53 38,53C 36.9694,53 35.9631,52.8961 34.991,52.6981C 34.835,50.0773 32.6601,48 30,48C 29.0779,48 28.214,48.2496 27.4724,48.685C 25.9673,47.202 24.7741,45.4033 24,43.3964L 24,32.6036C 26.1669,26.9856 31.618,23 38,23 Z M 23,33.5L 23,42.5L 22.8835,43.2565C 23.792,45.8695 25.3589,48.1744 27.3856,49.9725C 28.0868,49.3665 29.0006,49 30,49C 32.2091,49 34,50.7909 34,53C 34,55.2091 32.2091,57 30,57C 27.7909,57 26,55.2091 26,53L 26.0084,52.7385C 23.508,50.7017 21.5357,48.0412 20.3287,44.9942C 19.0279,44.9062 18,43.8232 18,42.5L 18,33.5C 18,32.1769 19.0279,31.0938 20.3287,31.0058C 23.1144,23.9735 29.9764,19 38,19C 46.0236,19 52.8856,23.9735 55.6713,31.0058C 56.9721,31.0938 58,32.1769 58,33.5L 58,42.5C 58,43.8807 56.8807,45 55.5,45C 54.1193,45 53,43.8807 53,42.5L 53,33.5L 53.1165,32.7435C 50.9419,26.4891 44.9952,22 38,22C 31.0048,22 25.0581,26.4891 22.8835,32.7435L 23,33.5 Z "></path> </g></svg>
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>
            </div>`;
                this.chatContainer.appendChild(incomingChatDiv);
                const pElement = document.createElement("p");
                // Send POST request to API, get response and set the reponse as paragraph element text
                try {

                    pElement.textContent = comment.Body ?? comment.mensaje;
                    incomingChatDiv.querySelector(".chat-details")?.appendChild(pElement);
                } catch (error) { // Add error class to the paragraph element and set error text
                    pElement.classList.add("error");
                    pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
                }
                incomingChatDiv.querySelector(".typing-animation")?.remove();
                localStorage.setItem("all-chats", this.chatContainer.innerHTML);
                this.chatContainer.scrollTo(0, this.chatContainer.scrollHeight);
            });

        }
    }
}
customElements.define('w-chat-component', WChatComponent);
export { WChatComponent }