//@ts-check
import { WRender } from "../WModules/WComponentsTools.js"
import {  css } from "../WModules/WStyledRender.js"
class ModelFiles {
    constructor(name, value, type) {
        this.Name = name;
        this.Type = type;
        this.Value = value;
    }
    Name = "";
    Value = "";
    Type = "";
}
class WRichText extends HTMLElement {
    constructor() {
        super();
        this.value = "";
        /**
         * @type {Array<ModelFiles>}
         */
        this.Files = [];
        this.style.backgroundColor = "#fff";
        this.style.padding= "5px";
        this.style.border= "1px solid rgb(222 222 222)"
        this.DrawComponent();
    }
    connectedCallback() {
    }
    DrawComponent = async () => {
        this.innerHTML != "";
        this.append(WRichTextStyle.cloneNode(true))
        this.DrawOptions();
        this.Divinput = WRender.Create({
            // @ts-ignore
            contentEditable: true,
            class: "WREditor",
            oninput: () => {
                // @ts-ignore
                this.value = this.querySelector(".WREditor").innerHTML;
            }
        })
        this.append(this.Divinput);
        this.DrawAttached();
    }
    DrawOptions() {
        const OptionsSection = WRender.Create({
            tagName: "section", class: "WOptionsSection"
        })
        this.Commands.forEach(command => {
            let CommandBtn = WRender.Create({
                tagName: "input",
                className: "ROption tooltip " + command.class,
                type: command.type,
                id: "ROption" + command.commandName,
                // @ts-ignore
                title: command.commandName,
                value: command.label
            });
            CommandBtn[command.event] = () => {
                const ROption = this.querySelector("#ROption" + command.commandName);
                //console.log( ROption.value );   
                // @ts-ignore
                document.execCommand(command.commandName, false, ROption.value);
            }
            OptionsSection.append(WRender.Create({
                class: "tooltip",
                children: [CommandBtn, { tagName: "span", class: "tooltiptext", children: [command.commandName] }]
            }))
        });

        this.append(OptionsSection);

    }

    DrawAttached() {
        this.AttachedSection = WRender.Create({
            tagName: "section", class: "InputFileSection", children: []
        })
        this.ButtonSection = WRender.Create({
            tagName: "section", class: "AddInputFileSection", children: [
                WRender.Create({
                    tagName: "label", htmlFor: "attachInput", class: "button", innerHTML: "Agregar Adjunto"
                }),
            ]
        })
        this.ButtonSection.append(WRender.Create({
            tagName: "input", id: "attachInput", type: "file", class: "inputfile",
            onchange: (ev) => {
                const targetControl = ev.target
                let base64Type = "";
                let fileB64;
                const file = targetControl?.files[0];
                if (targetControl?.files != null) {
                    switch (targetControl?.files[0]?.type.toUpperCase()) {
                        case "IMAGE/PNG": case "IMAGE/JPG": case "IMAGE/JPEG":
                            base64Type = "data:image/png;base64,";
                            break;
                        case "APPLICATION/PDF":
                            base64Type = "data:application/pdf;base64,";
                        default:
                            base64Type = "data:" + targetControl?.files[0]?.type + ";base64,";
                            break;
                    }
                }
                var reader = new FileReader();
                reader.onloadend = (e) => {
                    //@ts-ignore
                    fileB64 = e.target?.result?.split("base64,")[1];
                    const fileClass = new ModelFiles(file.name, fileB64, base64Type);
                    this.Files.push(fileClass);
                    //@ts-ignore
                    this.AttachedSection.innerHTML = "";
                    this.Files.forEach(file => {
                        const AttachBtn = WRender.Create({
                            className: "AttachBtn", innerHTML: "X", onclick: () => {
                                this.Files.splice(this.Files.indexOf(file), 1);
                                AttachBtn.parentNode?.parentNode?.removeChild(AttachBtn.parentNode);
                            }
                        })
                        //@ts-ignore
                        this.AttachedSection.append(WRender.Create({ class: "AttachItem", children: [file.Name, AttachBtn] }))
                    });

                };
                reader.readAsDataURL(file);
            },

            onclick: (ev) => {
                let file = '';
                if (ev.target?.value) {
                    file = ev.target?.value;
                    const search = "C:\\fakepath\\";
                    const files = file.replace(search, "");
                    this.Files.filter(obj => obj.Name !== files);
                    ev.target.value = "";
                }
            },
        }))       
        this.append(this.ButtonSection, this.AttachedSection);
    }

    FunctionClear() {
        // @ts-ignore
        this.value = this.Divinput.innerHTML = "";
        // @ts-ignore
        this.AttachedSection.innerHTML = "";        
        this.Files = [];
    }
    Commands = [
        //{ commandName: "backColor", icon: "", type: "color", commandOptions: null, state: 1, event: "onchange" },
        { commandName: "bold", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "bold", label: "B" },
        { commandName: "italic", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "italic", label: "I" },
        { commandName: "underline", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "underline", label: "U" },
        { commandName: "insertUnorderedList", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "list", label: "" },
        { commandName: "createLink", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "link", label: "" },
        //{ commandName: "uppercase", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "bold", label: "A" },
        //{ commandName: "insertOrderedList", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "list", label: "" },
        //{ commandName: "copy", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "cut", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "defaultParagraphSeparator", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "delete", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "fontName", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "foreColor", icon: "", type: "color", commandOptions: null, state: 1, event: "onchange" },
        //{ commandName: "formatBlock", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "forwardDelete", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertHorizontalRule", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertHTML", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertImage", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertLineBreak", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertParagraph", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "insertText", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        { commandName: "justifyLeft", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "left", label: "" },
        { commandName: "justifyCenter", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "center", label: "" },
        { commandName: "justifyRight", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick", class: "right", label: "" },
        //{ commandName: "justifyFull", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "outdent", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "paste", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "redo", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "selectAll", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "strikethrough", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "styleWithCss", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "subscript", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "superscript", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "undo", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
        //{ commandName: "unlink", icon: "", type: "button", commandOptions: null, state: 1, event: "onclick" },
    ];
}

const WRichTextStyle = css` 
    w-rich-text .WREditor {
        height: 200px;
        border: solid 1px #c5c5c5;
        display: block;
        margin: 0px;
        margin-top: 10px;
        padding: 10px;
        border-radius: 6px;
    }

    w-rich-text .WOptionsSection {
        border: solid 1px #c5c5c5;
        margin: 0px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
    }

    w-rich-text .InputFileSection {
        margin: 0px;
        border-radius: 4px;
        padding: 5px;
        border: solid 1px #c5c5c5;
        display: grid;
        justify-content: left
    }

    w-rich-text .AddInputFileSection {
        border: none;
        display: block;
        margin: 0px;
        border-radius: 4px;
        padding: 5px;
        text-align: right;
    }

    .AttachBtn {
        padding: 5px;
        cursor: pointer;
        color: #fff;
        background-color: #994914;
        border-radius: 5px;
        display: flex;
        text-align: center;
        align-items: center;
    }
    .AttachItem {
        font-size: 11px;
        padding: 5px;
        background-color: #f3f3f3;
        border-radius: 5px;
        display: flex;
        gap: 5px;
        align-items: center;
        justify-content: space-between;
    }

    w-rich-text .SendSection {
        border: none;
        margin: 10px;    
        border-radius: 4px;
        padding: 5px;
        display: flex;
        justify-content: center;
    }

    w-rich-text .ROption {
        border: solid 1px #c5c5c5;
        border: none;
        padding: 5px;
        margin: 0px;
        display: grid;
        place-items: center;

    }

    .tooltip {
        position: relative;
        display: inline-block;
        padding: 0px;
        margin: 5px;
    }

    .tooltiptext {
        visibility: hidden;
        min-width: 120px;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px;
        position: absolute;
        z-index: 1;
        bottom: 150%;
        left: 50%;
        margin-left: -60px;
    }

    .tooltiptext::after {
        content: "";
        position: absolute;
        bottom: -100;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: black transparent transparent transparent;
    }

    .tooltip:hover .tooltiptext {
        visibility: visible;
    } 

    input {
        cursor: pointer;
        width: 50px;
        padding: 10px 20px;
        border: none;
        background-color: #f5f5f5;
        color: #000;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }
    
      input[type="file"]::file-selector-button {
        border-radius: 4px;
        padding: 0 16px;
        height: 40px;
        cursor: pointer;
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.16);
        box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.05);
        margin-right: 16px;
        transition: background-color 200ms;
      }
      
      input[type="file"]::file-selector-button:hover {
        background-color: #f3f4f6;
      }
      
      input[type="file"]::file-selector-button:active {
        background-color: #e5e7eb;
      } 
      
    .inputfile {
        cursor: pointer;
        display: none;
        width: 400px;
        padding: 10px 20px;
        border: none;
        background-color: #f5f5f5;
        color: #000;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }

    .button {
        font-family: "Times New Roman";
        cursor: pointer;
        width: 130px;
        padding: 10px 20px;
        margin: 5px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
        transition: transform .2s ease-out;
        background-color: #fff;
        color: #000;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
    }

    .list {
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px;
        background-image: url("/WDevCore/Icons/list.png");
    }

    .link {
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px;
        background-image: url("/WDevCore/Icons/globe.png");
    }

    .center {
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px;
        background-image: url("/WDevCore/Icons/align-center.png");
    }

    .right {
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px;
        background-image: url("/WDevCore/Icons/symbol.png");
    }

    .left {
        border: none;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 16px;
        background-image: url("/WDevCore/Icons/align-left.png");
    }

    .bold {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    }
    .italic {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        font-style: italic;
        font-size: 16px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    }
    .underline {
        border: none;
        font-family: "Times New Roman";
        font-weight: bold;
        text-decoration: underline;
        font-size: 16px;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
    }
    `

customElements.define("w-rich-text", WRichText);
export { WRichText }