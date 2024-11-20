//@ts-check
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { html, WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WChatStyle } from "./ComponentsStyles/WChatStyle.js";

class WebApiResponse {
    /**@type {Boolean?} */ WithAgentResponse
    /**@type {String} */ Reply
}
class WChatComponent extends HTMLElement {
    /**
     * @param {{ Url?: String }} Config
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
            <p>${localStorage.getItem("SUB_TITULO") ?? "Start"}</p>
       </div>`);
        this.append(WChatStyle.cloneNode(true), this.Container);
        this.Config = Config;
        this.Draw();
       
    }
    connectedCallback() { }
    Draw = async () => {
        /**@type {HTMLInputElement} */
        // @ts-ignore
        const chatInput = html`<textarea id="chat-input" spellcheck="false" placeholder="Enter a prompt here" required></textarea>`
        const sendButton = html`<span id="send-btn" class="material-symbols-rounded">send</span>`
        const chatContainer = html`<div class="chat-container"></div>`;
        const themeButton = html`<span id="theme-btn" class="material-symbols-rounded">light_mode</span>`;
        const deleteButton = html`<span id="delete-btn" class="material-symbols-rounded">delete</span>`;
      
        this.Container.appendChild(chatContainer);
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
        userText = this.InicialiceComponent(themeButton, chatContainer, userText, chatInput, deleteButton, sendButton);


    }

    InicialiceComponent(themeButton, chatContainer, userText, chatInput, deleteButton, sendButton) {
        const loadDataFromLocalstorage = () => {
            // Load saved chats and theme from local storage and apply/add on the page
            const themeColor = localStorage.getItem("themeColor");

            document.body.classList.toggle("light-mode", themeColor === "light_mode");
            themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

            const defaultText = `<div class="default-text">
                <h1>${localStorage.getItem("TITULO") ?? "CHATBOT"}</h1>
                <p>${localStorage.getItem("SUB_TITULO") ?? "Start"}</p>
            </div>`;

            chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
            chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
        };
        const createChatElement = (content, className) => {
            return html`<div class="chat ${className}">${content}</div>`;
        };

        const getChatResponse = async (incomingChatDiv) => {
            const pElement = document.createElement("p");
            // Send POST request to API, get response and set the reponse as paragraph element text
            try {
                const model = {
                    SessionId: "12345",
                    Text: userText,
                    Source: "webapi",
                    Id: "1",
                    UserId: "+50588078386",
                    Timestamp: new Date()
                };
                /**@type {WebApiResponse} */
                const response = await WAjaxTools.PostRequest(this.Config.Url ?? "", model, {
                   headers : [{name : "X-Platform", value: "webapi"}]
                });
                pElement.textContent = response.Reply;
                this.WithAgent = response.WithAgentResponse;
            } catch (error) { // Add error class to the paragraph element and set error text
                pElement.classList.add("error");
                pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
            }

            // Remove the typing animation, append the paragraph element and save the chats to local storage
            incomingChatDiv.querySelector(".typing-animation").remove();
            incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
            localStorage.setItem("all-chats", chatContainer.innerHTML);
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
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
            chatContainer.appendChild(incomingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
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
            chatContainer.querySelector(".default-text")?.remove();
            chatContainer.appendChild(outgoingChatDiv);
            chatContainer.scrollTo(0, chatContainer.scrollHeight);
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

    update() {
        this.Container.innerHTML = "";
        this.Draw();
    }
}
customElements.define('w-chat-component', WChatComponent);
export { WChatComponent }