import { WRender, WArrayF, ComponentsManager, WAjaxTools } from '../WModules/WComponentsTools.js';
import { css, WCssClass, WStyledRender } from '../WModules/WStyledRender.js';
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WModalForm, WSimpleModalForm } from './WModalForm.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { WIcons } from '../WModules/WIcons.js';
import { WTableComponent } from './WTableComponent.js';
import { WCalendar, WCalendarComponent } from './WCalendar.js';
let photoB64;
const ImageArray = [];
class FormConfig {
    ObjectDetail = undefined;
    EditObject = undefined;
    UserActions = undefined;
    ModelObject = {
        property: undefined,
        Operation: {
            type: "OPERATION", Function: (obj) => {
                return obj.value1 + obj.value2;
            }
        }
    };
    AddItemsFromApi = undefined;
    DarkMode = false;
    StyleForm = "columnX1";
    ValidateFunction = (Object) => { /* Validacion */ };
    SaveFunction = (Object) => { /* Guardado */ };
    Options = true;
    ObjectOptions = { AddObject: false, Url: undefined };
    DisplayData = ["prop"];
}
class WForm extends HTMLElement {
    constructor(Config = (new FormConfig())) {
        super();
        this.attachShadow({ mode: 'open' });
        WRender.SetStyle(this, {
            height: "90%",
            display: "block"
        })
        for (const p in Config) {
            this[p] = Config[p];
        }
        this.Config = Config;
        this.ImageUrlPath = Config.ImageUrlPath;
        this.Options = this.Options ?? true;
        this.DataRequire = this.DataRequire ?? true;
        if (this.StyleForm == "columnX1") {
            this.DivColumns = this.Config.DivColumns = "calc(100%)";
            this.limit = 1;
        } else if (this.StyleForm == "columnX3") {
            this.DivColumns = this.Config.DivColumns = "calc(33%) calc(33%) calc(33%)";
            this.limit = 3;
        } else {
            this.DivColumns = this.Config.DivColumns = "calc(50% - 10px) calc(50% - 10px)";
            this.limit = 2;
        }
        this.DivForm = WRender.Create({ class: "ContainerFormWModal" });
        this.shadowRoot.append(StyleScrolls.cloneNode(true));
        this.shadowRoot.append(StylesControlsV2.cloneNode(true));
        this.shadowRoot.append(WRender.createElement(this.FormStyle()));
        this.shadowRoot.append(this.DivForm);
        this.DrawComponent();
    }
    connectedCallback() {
    }
    DrawComponent = async () => {
        this.DarkMode = this.DarkMode ?? false;
        this.DivForm.innerHTML = "";
        if (this.ObjectDetail) { // MUESTRA EL DETALLE DE UN OBJETO EN UNA LISTA
            this.DivForm.append(this.ShowFormDetail());
            if (this.UserActions != undefined) {
                this.DivForm.append(this.SaveOptions());
            }
        } else { //AGREGA FORMULARIO CRUD A LA VISTA
            if (this.ObjectOptions == undefined) {
                this.ObjectOptions = {
                    AddObject: false,
                    Url: undefined
                };
            }
            this.FormObject = this.EditObject ?? {};
            const Model = this.ModelObject ?? this.EditObject;
            const ObjHandler = {
                get: function (target, property) {
                    return target[property];
                }, set: function (target, property, value, receiver) {
                    target[property] = value;
                    for (const prop in Model) {
                        if (Model[prop]?.__proto__ == Object.prototype) {
                            if (Model[prop].type?.toUpperCase() == "OPERATION") {
                                target[prop] = Model[prop].action(target);
                            }
                        }
                    }
                    return true;
                }
            };
            const ObjectProxy = new Proxy(this.FormObject, ObjHandler);
            this.DivForm.append(await this.CrudForm(ObjectProxy, this.ObjectOptions));
            if (this.Options == true) {
                this.DivForm.append(await this.SaveOptions(ObjectProxy));
            }
        }
    }
    checkDisplay(prop) {
        let flag = true
        if (this.DisplayData != undefined &&
            this.DisplayData.__proto__ == Array.prototype) {
            const findProp = this.DisplayData.find(x => x == prop);
            if (!findProp) {
                flag = false;
            }
        }
        return flag;
    }
    ShowFormDetail(ObjectF = this.ObjectDetail) {

    }
    CrudForm = async (ObjectF = {}, ObjectOptions) => {
        if (this.AddItemsFromApi != undefined) {
            var Config = {
                MasterDetailTable: true,
                SearchItemsFromApi: this.AddItemsFromApi,
                selectedItems: this.Dataset,
                Options: {
                    Search: true,
                    Select: true,
                }
            }
            return {
                type: "w-table",
                props: {
                    id: "SearchTable" + this.id,
                    TableConfig: Config
                }
            };
        }
        //verifica que el modelo exista,
        //sino es asi le asigna el valor de un objeto existente
        const Model = this.ModelObject ?? this.EditObject;
        const Form = WRender.Create({ className: 'divForm' });
        for (const prop in Model) {
            if (!WArrayF.checkDisplay(undefined, prop, Model)) {
                continue;
            }
            let val = ObjectF[prop] == undefined || ObjectF[prop] == null ? "" : ObjectF[prop];
            ObjectF[prop] = val;
            Model[prop] = Model[prop] != null ? Model[prop] : "";
            if (this.isNotDrawable(Model, prop)) {
                ObjectF[prop] = ObjectF[prop] ?? Model[prop]?.value ?? undefined;
            } else if (!prop.includes("_hidden")) {
                const ControlLabel = WRender.Create({
                    tagName: "label", class: "inputTitle label_" + prop,
                    innerText: WOrtograficValidation.es(prop)
                });
                const ControlContainer = WRender.Create({
                    class: "ModalElement", children: [ControlLabel]
                });
                let validateFunction = undefined;
                let InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "text" });
                if (Model[prop].__proto__ == Object.prototype) {
                    if (Model[prop].ModelObject?.__proto__ == Function.prototype && Model[prop].ModelObject()?.constructor?.name == this.Config.ParentModel?.constructor?.name) {
                        Model[prop] = undefined;
                        ObjectF[prop] = undefined;
                        continue;
                    }
                    validateFunction = Model[prop].validateFunction;
                    ControlLabel.innerHTML = Model[prop].label ?? WOrtograficValidation.es(prop)
                    InputControl = await this.CreateModelControl(Model, prop, InputControl, val, ControlContainer, ObjectF, ControlLabel);
                } else if (Model[prop] != null && Model[prop].__proto__ == Array.prototype) {
                    InputControl = this.CreateSelect(InputControl, Model[prop], prop, ObjectF);
                    ObjectF[prop] = InputControl.value
                } else {
                    if (typeof Model[prop] === "string" && Model[prop].length >= 50) {
                        InputControl = WRender.Create({ tagName: "textarea", className: prop });
                    } else if (parseFloat(Model[prop]).toString() != "NaN") {
                        InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "number", placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)) });
                    } else {
                        InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "text", placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)) });
                    }
                }
                InputControl.id = "ControlValue" + prop;
                InputControl.onchange = async (ev) => { //evento de actualizacion del componente
                    if (validateFunction) {
                        const result = validateFunction(ObjectF, ev.target.value);
                        if (!result.success) {
                            alert(result.message);
                            return;
                        }
                    }
                    const tool = ev.target.parentNode.querySelector(".ToolTip");
                    if (tool) tool.remove();
                    if (ev.currentTarget.tagName.toUpperCase().includes("W-CALENDAR-COMPONENT")) {
                    } else if (ev.target.type == "file") {
                        if (ev.target.multiple) {
                            await this.SelectedFile(ev.target.files, true);
                        } else {
                            let base64Type = "";
                            switch (ev.target.files[0].type.toUpperCase()) {
                                case "IMAGE/PNG": case "IMAGE/JPG": case "IMAGE/JPEG":
                                    base64Type = "data:image/png;base64,";
                                    break;
                                case "APPLICATION/PDF":
                                    base64Type = "data:application/pdf;base64,";
                                default:
                                    base64Type = "data:" + ev.target.files[0].type + ";base64,";
                                    break;
                            }
                            if (ev.target.parentNode.querySelector("#labelFile" + prop) != null) {
                                ev.target.parentNode.querySelector("#labelFile" + prop).innerText = ev.target.files[0].name;
                            }
                            await this.SelectedFile(ev.target.files[0]);
                            await setTimeout(() => {
                                ObjectF[prop] = base64Type + photoB64.toString();
                                console.log("#imgControl" + prop, this.shadowRoot.querySelector("#imgControl" + prop));
                                if (this.shadowRoot.querySelector("#imgControl" + prop) != null) {
                                    this.shadowRoot.querySelector("#imgControl" + prop).src = ObjectF[prop];
                                }
                            }, 1000);
                        }
                    } else if (ev.target.type == "radio" || ev.target.type == "checkbox") {
                        ObjectF[prop] = ev.target.checked;
                    } else {
                        ObjectF[prop] = ev.target.value;
                        if (ev.target.pattern) {
                            let regex = new RegExp(ev.target.pattern);
                            if (regex.test(ObjectF[prop])) {
                                WRender.SetStyle(ev.target, {
                                    boxShadow: "none"
                                });
                            } else {
                                let regex = new RegExp(ev.target.pattern);
                                if (!regex.test(ObjectF[prop])) {
                                    if (!ev.target.parentNode.querySelector(".ToolTip")) {
                                        ev.target.parentNode.append(WRender.Create({
                                            tagName: "span",
                                            innerHTML: `Ingresar formato correcto: ${ev.target.placeholder}`,
                                            className: "ToolTip"
                                        }));
                                    }
                                    WRender.SetStyle(ev.target, {
                                        boxShadow: "0 0 3px #ef4d00"
                                    });
                                }
                            }
                        }
                    }
                    if (Model[prop].fieldRequire) {
                        this.shadowRoot.querySelector(".label_" + Model[prop].fieldRequire).append("*")
                        Model[Model[prop].fieldRequire].require = true;
                    }
                };
                ControlContainer.append(InputControl);
                Form.append(ControlContainer);
            } else {
                if (ObjectOptions.AddObject == true) {
                    ObjectF[prop] = ObjectF[prop] ?? Model[prop];
                }
            }
        }
        return Form;
    }
    isNotDrawable(Model, prop) {
        return (Model[prop].__proto__ == Object.prototype &&
            (Model[prop].primary || Model[prop].hidden || !Model[prop].type))
            || Model[prop].__proto__ == Function.prototype
            || Model[prop].__proto__.constructor.name == "AsyncFunction";
    }

    async CreateModelControl(Model, prop, InputControl, val, ControlContainer, ObjectF, ControlLabel) {
        Model[prop].require = Model[prop].require ?? true;
        switch (Model[prop].type?.toUpperCase()) {
            case "TITLE":
                Model[prop].require = false;
                ObjectF[prop] = undefined;
                ControlLabel.className += " formHeader";
                ControlLabel.innerHTML = Model[prop].label;
                ControlContainer.classList.add("tableContainer");
                InputControl = WRender.CreateStringNode("<span/>");
                break;
            case "IMG": case "IMAGE": case "IMAGES":
                const Multiple = Model[prop].type.toUpperCase() == "IMAGES" ? true : false;
                InputControl = this.CreateImageControl(val, ControlContainer, prop, Multiple);
                if (Multiple) {
                    ObjectF[prop] = ImageArray;
                }
                ControlContainer.className += " imgPhoto";
                break;
            case "DATE": case "FECHA": case "HORA": case "PASSWORD":
                let type = "date";
                let date_val = val == "" ? (new Date()).toISO() : ObjectF[prop];
                if (Model[prop].type.toUpperCase() == "HORA") {
                    type = "time";
                    date_val = val ?? "08:00";
                } else if (Model[prop].type.toUpperCase() == "PASSWORD") {
                    type = "password";
                }
                InputControl = WRender.Create({
                    tagName: "input", className: prop, type: type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop))
                });
                ObjectF[prop] = InputControl.value = (new Date(date_val)).toISO();
                break;
            case "SELECT":
                InputControl = await this.CreateSelect(InputControl, Model[prop].Dataset, prop, ObjectF);
                ObjectF[prop] = InputControl.value;
                break;
            case "WSELECT":
                ObjectF[prop] = ObjectF[prop].__proto__ == Object.prototype ? ObjectF[prop] : null;
                if (Model[prop].ModelObject?.__proto__ == Function.prototype) {
                    Model[prop].ModelObject = Model[prop].ModelObject();
                    Model[prop].Dataset = await Model[prop].ModelObject.Get();
                    if (ObjectF[prop] == null && Model[prop].require != false && Model[prop].Dataset.length > 0) {
                        ObjectF[prop] = Model[prop].Dataset[0];
                    }
                }
                val = ObjectF[prop];
                const DataseFilter = this.CreateDatasetForMultiSelect(Model, prop);
                InputControl = await this.CreateWSelect(InputControl, DataseFilter, prop, ObjectF);
                this.FindObjectMultiselect(val, InputControl);
                break;
            case "MULTISELECT":
                if (Model[prop].ModelObject?.__proto__ == Function.prototype) {
                    Model[prop].ModelObject = Model[prop].ModelObject();
                    Model[prop].Dataset = await Model[prop].ModelObject.Get();
                }
                const { MultiSelect } = await import("./WMultiSelect.js");
                const Datasetilt = this.CreateDatasetForMultiSelect(Model, prop);
                InputControl = new MultiSelect({
                    action: (selecteds) => {
                        if (Model[prop].action) {
                            Model[prop].action(selecteds, ControlLabel, InputControl)
                        }
                    }, Dataset: Datasetilt, ModelObject: Model[prop].ModelObject
                });
                this.FindObjectMultiselect(val, InputControl);
                ObjectF[prop] = InputControl.selectedItems;
                break;
            case "EMAIL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: Model[prop].type,
                    placeholder: "Ejem.: me@email.com",
                    pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                });
                break;
            case "TEL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: Model[prop].type,
                    placeholder: "Ejem.: +54-88888888",
                    pattern: "[+]{1}[0-9]{2,3}[-]{1}[0-9]{3,4}[0-9]{4,5}"
                });
                break;
            case "URL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: Model[prop].type,
                    placeholder: "Ejem.: https://site.com",
                    pattern: "https?://.+"
                });
                break;
            case "MASTERDETAIL":
                ControlLabel.className += " formHeader";
                ControlContainer.classList.add("tableContainer");
                ObjectF[prop] = ObjectF[prop] != "" ? ObjectF[prop] : [];
                InputControl = new WTableComponent({
                    Dataset: ObjectF[prop],
                    ModelObject: await this.isModelFromFunction(Model, prop),
                    ParentModel: Model,
                    Options: {
                        Add: true, Edit: true, Delete: true, Search: true
                    }
                });
                break;
            case "MODEL":
                ControlLabel.className += " formHeader";
                ControlContainer.classList.add("tableContainer");
                ObjectF[prop] = ObjectF[prop] != "" ? ObjectF[prop] : {};
                InputControl = new WForm({
                    StyleForm: this.StyleForm,
                    EditObject: ObjectF[prop],
                    ModelObject: await this.isModelFromFunction(Model, prop),
                    Options: false
                });
                break;
            case "FILE":
                InputControl = WRender.Create({
                    tagName: "input", className: prop, value: val, type: Model[prop].type,
                    style: { display: "none" },
                    placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop))
                });
                const label = WRender.Create({ tagName: 'label', id: "labelFile" + prop, innerText: '' });
                const content = {
                    class: "contentLabelFile", children: [
                        {
                            tagName: "label",
                            class: "LabelFile",
                            innerText: "Seleccionar archivo",
                            htmlFor: "ControlValue" + prop, children: [
                                { tagName: 'img', src: WIcons.upload, class: 'labelIcon' }
                            ]
                        }, label
                    ]
                }
                ControlContainer.append(WRender.Create(content));
                ControlContainer.class += " file";
                if (Model[prop].fileType) InputControl.accept = Model[prop].fileType.map(x => "." + x).join(",")
                break;
            case "RADIO": case "CHECKBOX":
                ControlContainer.className += " radioCheckedControl";
                ControlLabel.htmlFor = "ControlValue" + prop;
                ControlLabel.className += " radioCheckedLabel";
                InputControl = WRender.Create({
                    tagName: "input",
                    id: "ControlValue" + prop,
                    className: prop,
                    value: val,
                    type: Model[prop].type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop))
                });
                break;
            case "DRAW":
                InputControl = this.createDrawComponent(InputControl, prop, ControlContainer, ObjectF); break;
            case "TEXTAREA":
                ControlContainer.classList.add("tableContainer");
                ControlContainer.style.height = "auto";
                InputControl = WRender.Create({
                    tagName: "textarea", style: { height: "100px", borderRadius: "10px" }, className: prop, value: val
                });
                break;
            case "CALENDAR":
                ObjectF[prop] = ObjectF[prop] != "" ? ObjectF[prop] : [];
                ControlContainer.classList.add("tableContainer");
                ControlContainer.style.height = "auto";
                InputControl = this.createDrawCalendar(InputControl, prop, ControlContainer, ObjectF, Model);
                break;
            default:
                val = ObjectF[prop] ?? Model[prop].defaultValue ?? "";
                const placeholder = Model[prop].placeholder ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
                InputControl = WRender.Create({
                    tagName: "input", className: prop, value: val,
                    type: Model[prop].type, placeholder: placeholder
                });
                break;
        }
        if (Model[prop].fieldRequire && val != undefined && val != "") {
            Model[Model[prop].fieldRequire].require = true;
        }
        if (Model[prop].pattern) InputControl.pattern = Model[prop].pattern;
        ControlLabel.innerHTML += Model[prop].require == true ? "*" : "";
        return InputControl;
    }

    isModelFromFunction(Model, prop) {
        return Model[prop].ModelObject.__proto__ == Function.prototype ? Model[prop].ModelObject() : Model[prop].ModelObject;
    }
    createDrawCalendar(InputControl, prop, ControlContainer, ObjectF, Model) {
        console.log(Model[prop]);
        InputControl = new WCalendarComponent({
            CalendarFunction: Model[prop].CalendarFunction,
            SelectedBlocks: ObjectF[prop]
        });
        //ObjectF[prop] = InputControl.SelectedBlocks;
        return InputControl;
    }
    createDrawComponent(InputControl, prop, ControlContainer, ObjectF) {
        InputControl = WRender.Create({
            tagName: "canvas",
            id: "ControlValue" + prop,
            className: prop + " draw-canvas"
        });
        var ctx = InputControl.getContext("2d");
        const baseData = InputControl.toDataURL();
        ControlContainer.className += " DrawControlContainer"
        ControlContainer.append(
            WRender.Create({
                className: "canvasOptions", children: [
                    {
                        tagName: 'input', type: 'button', className: 'Btn-Mini-Alert', value: 'Limpiar', onclick: async () => {
                            clearCanvas();
                            ObjectF[prop] = undefined;
                        }
                    }, {
                        tagName: 'input', type: 'button', className: 'Btn-Mini', value: 'Confirmar', onclick: async () => {
                            const tool = InputControl.parentNode.querySelector(".ToolTip");
                            if (tool) tool.remove();
                            const dataUrl = InputControl.toDataURL();
                            WRender.SetStyle(InputControl, {
                                boxShadow: "0 0 3px #ef4d00"
                            });
                            if (dataUrl == baseData) {
                                WRender.SetStyle(InputControl, {
                                    boxShadow: "0 0 3px #ef4d00"
                                });
                                const toolTip = WRender.Create({
                                    tagName: "span",
                                    innerHTML: WArrayF.Capitalize(WOrtograficValidation.es(prop)) + ` es requerido y debe ser confirmada`,
                                    className: "ToolTip"
                                })
                                InputControl.parentNode.append(toolTip);
                                InputControl.focus();
                            }
                            ObjectF[prop] = dataUrl;
                        }
                    }
                ]
            })
        );
        window.requestAnimFrame = (function (callback) {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimaitonFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
        var drawing = false;
        var mousePos = { x: 0, y: 0 };
        var lastPos = mousePos;
        InputControl.addEventListener("mousedown", function (e) {
            drawing = true;
            lastPos = getMousePos(InputControl, e);
        }, false);
        InputControl.addEventListener("mouseup", function (e) {
            drawing = false;
        }, false);
        InputControl.addEventListener("mousemove", function (e) {
            mousePos = getMousePos(InputControl, e);
        }, false);
        InputControl.addEventListener("touchstart", function (e) {
            mousePos = getTouchPos(InputControl, e);
            e.preventDefault();
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            InputControl.dispatchEvent(mouseEvent);
        }, false);
        InputControl.addEventListener("touchend", function (e) {
            e.preventDefault();
            var mouseEvent = new MouseEvent("mouseup", {});
            InputControl.dispatchEvent(mouseEvent);
        }, false);
        InputControl.addEventListener("touchleave", function (e) {
            e.preventDefault(); // Prevent scrolling when touching the InputControl
            var mouseEvent = new MouseEvent("mouseup", {});
            InputControl.dispatchEvent(mouseEvent);
        }, false);
        InputControl.addEventListener("touchmove", function (e) {
            e.preventDefault(); // Prevent scrolling when touching the InputControl
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            InputControl.dispatchEvent(mouseEvent);
        }, false);
        function getMousePos(canvasDom, mouseEvent) {
            var rect = canvasDom.getBoundingClientRect(); return {
                x: mouseEvent.clientX - rect.left,
                y: mouseEvent.clientY - rect.top
            };
        }
        function getTouchPos(canvasDom, touchEvent) {
            var rect = canvasDom.getBoundingClientRect();
            return {
                x: touchEvent.touches[0].clientX - rect.left,
                y: touchEvent.touches[0].clientY - rect.top
            };
        }
        function renderCanvas() {
            if (drawing) {
                ctx.strokeStyle = "#000";
                ctx.beginPath();
                ctx.moveTo(lastPos.x, lastPos.y);
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.closePath();
                lastPos = mousePos;
            }
        }
        function clearCanvas() {
            InputControl.width = InputControl.width;
        }
        (function drawLoop() {
            requestAnimFrame(drawLoop);
            renderCanvas();
        })();
        return InputControl;
    }

    CreateDatasetForMultiSelect(Model, prop) {
        return Model[prop].Dataset?.map(item => {
            const MapObject = {};
            for (const key in item) {
                const element = item[key];
                if (element != null && element != undefined) {
                    MapObject[key] = element;
                }
            }
            return MapObject;
        });
    }

    FindObjectMultiselect(val, InputControl) {
        if (val != null && val != undefined && val.__proto__ == Array.prototype) {
            val.forEach((item) => {
                const FindItem = InputControl.Dataset.find(i => WArrayF.compareObj(i, item));
                if (FindItem) {
                    InputControl.selectedItems.push(FindItem);
                }
            });
        } else if (val != null && val != undefined && WArrayF.replacer(val).__proto__ == Object.prototype) {
            const FindItem = InputControl.Dataset.find(i => WArrayF.compareObj(i, val));
            if (FindItem) {
                InputControl.selectedItems.push(FindItem);
            }
        } else if (val != null && val != undefined) {
            const FindItem = InputControl.Dataset.find(i => i.id == val || i.id_ == val || i[this.findKey(i)] == val);
            if (FindItem) {
                InputControl.selectedItems.push(FindItem);
            }
        }
    }

    async CreateWSelect(InputControl, Dataset, prop, ObjectF) {
        const { MultiSelect } = await import("./WMultiSelect.js");
        InputControl = new MultiSelect({
            MultiSelect: false,
            Dataset: Dataset,
            ModelObject: this.ModelObject[prop].ModelObject,
            action: (ItemSelects) => {
                ObjectF[prop] = ItemSelects[0].id ?? ItemSelects[0].id_
                    ?? ItemSelects[0][this.findKey(ItemSelects[0])] ?? ItemSelects[0];
            }
        });
        return InputControl;
    }

    findKey = (object) => {
        let keyF = undefined;
        for (const key in object) {
            if ((typeof object[key] === "string" || typeof object[key] === "number")
                && key.includes("id_")) {
                keyF = key;
                break;
            }
        }
        return keyF
    }
    async CreateSelect(InputControl, Dataset, prop, ObjectF) {
        InputControl = WRender.Create({
            tagName: "select", value: null, className: prop,
            children: Dataset.map(option => {
                let OValue, ODisplay;
                if (option.__proto__ == Object.prototype) {
                    OValue = option["id"];
                    ODisplay = option["desc"] ?? option["Descripcion"] ?? option["descripcion"];
                } else {
                    OValue = option;
                    ODisplay = option;
                }
                const OptionObject = { tagName: "option", value: OValue, innerText: ODisplay };
                if (ObjectF[prop] != undefined && ObjectF[prop].toString() == OValue.toString()) {
                    OptionObject.selected = "true";
                }
                return OptionObject;
            })
        });
        return InputControl;
    }
    CreateImageControl(InputValue, ControlContainer, prop, Multiple) {
        const InputControl = WRender.Create({
            tagName: "input", className: prop, multiple: Multiple, type: "file", style: {
                display: "none"
            }
        });
        if (Multiple) {
            const Div = WRender.Create({ class: "listImage" });
            ControlContainer.append(Div);
            InputControl.addEventListener("change", (ev) => {
                for (const file in ev.target.files) {
                    if (ev.target.files[file].__proto__ == File.prototype) {
                        Div.append(WRender.Create(ev.target.files[file].name))
                    }
                }
            });
        } else {
            let cadenaB64 = "";
            let base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
            if (InputValue == "") {
                InputValue = WIcons.UserIcon;
            }
            if (base64regex.test(InputValue.replace("data:image/png;base64,", "")) && !InputValue.includes("data:image/png;base64,")) {
                cadenaB64 = "data:image/png;base64,";
            } else if (this.ImageUrlPath != undefined && InputValue
                && InputValue.__proto__ != Object.prototype
                && this.ImageUrlPath.__proto__ == String.prototype
                && !base64regex.test(InputValue.replace("data:image/png;base64,", ""))) {
                cadenaB64 = this.ImageUrlPath + "/";
            }
            ControlContainer.append(WRender.Create({
                tagName: "img",
                src: cadenaB64 + InputValue,
                class: "imgPhotoWModal",
                id: "imgControl" + prop + this.id,
            }));
        }
        ControlContainer.append(WRender.Create({
            tagName: "label",
            class: "LabelFile",
            innerText: "Seleccionar archivo",
            htmlFor: "ControlValue" + prop
        }));
        ControlContainer.class += " imageGridForm";
        InputControl.accept = ".jpg, .jpeg, .png";
        return InputControl;
    }
    SaveOptions(ObjectF = {}) {
        ObjectF = this.ObjectProxy ?? ObjectF;
        const DivOptions = WRender.Create({ class: "DivSaveOptions" });
        if (this.ObjectOptions != undefined) {
            const InputSave = WRender.Create({
                tagName: 'button',
                class: 'Btn',
                type: "button",
                innerText: 'CONFIRMAR',
                onclick: async () => {
                    await this.Save(ObjectF);
                }
            });
            DivOptions.append(InputSave);
        }
        if (this.UserActions != undefined && this.UserActions != Array) {
            this.UserActions.forEach(Action => {
                DivOptions.append(WRender.Create({
                    tagName: "button",
                    class: "Btn",
                    type: "button",
                    innerText: Action.name,
                    onclick: async (ev) => {
                        Action.Function(ev.target);
                    }
                }));
            });
        }
        return DivOptions;
    }
    Save = async (ObjectF = this.FormObject) => {
        if (this.ValidateFunction != undefined &&
            this.ValidateFunction.__proto__ == Function.prototype) {
            const response = this.ValidateFunction(ObjectF);
            if (response.validate == false) {
                alert(response.message);
                return;
            }
        }
        if (!this.Validate(ObjectF)) {
            return;
        }
        if (this.ObjectOptions.Url != undefined || this.SaveFunction == undefined) {
            const ModalCheck = this.ModalCheck(ObjectF, this.SaveFunction == undefined);
            this.shadowRoot.append(ModalCheck)
        } else if (this.ModelObject?.SaveWithModel != undefined && this.AutoSave) {
            const ModalCheck = this.ModalCheck(ObjectF, true);
            this.shadowRoot.append(ModalCheck)
        } else {
            this.SaveFunction(ObjectF);
        }
    }
    Validate = (ObjectF) => {
        if (this.DataRequire == true) {
            for (const prop in ObjectF) {
                if (!prop.includes("_hidden") && this.ModelObject[prop]?.require) {
                    const control = this.shadowRoot.querySelector("#ControlValue" + prop);
                    if (this.ModelObject[prop]?.type == "MODEL") {
                        //console.log(control.Validate(control.FormObject));
                        if (!control.Validate(control.FormObject)) {
                            return false;
                        }
                    } else if (this.ModelObject[prop]?.type == "MASTERDETAIL") {
                        if (this.ModelObject[prop]?.MaxRequired
                            && ObjectF[prop].length > this.ModelObject[prop]?.MaxRequired) {
                            this.createAlertToolTip(control, `El máximo de registros permitidos es `
                                + this.ModelObject[prop]?.MaxRequired);
                            return false;
                        }
                        if (this.ModelObject[prop]?.MinimunRequired
                            || ObjectF[prop].length < this.ModelObject[prop]?.MinimunRequired) {
                            this.createAlertToolTip(control, `El mínimo de registros permitidos es `
                                + this.ModelObject[prop]?.MinimunRequired);
                            return false;
                        }

                    } else if ((ObjectF[prop] == null || ObjectF[prop] == "") && control != null) {
                        this.createAlertToolTip(control, WArrayF.Capitalize(WOrtograficValidation.es(prop)) + ` es requerido`);
                        return false;
                    } else if (control != null && control.pattern) {
                        let regex = new RegExp(control.pattern);
                        if (!regex.test(ObjectF[prop])) {
                            this.createAlertToolTip(control, `Ingresar formato correcto: ${control.placeholder}`);
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    createAlertToolTip(control, message) {
        if (!control.parentNode.querySelector(".ToolTip")) {
            const toolTip = WRender.Create({
                tagName: "span",
                innerHTML: message,
                className: "ToolTip"
            });
            control.parentNode.append(toolTip);
        }
        WRender.SetStyle(control, {
            boxShadow: "0 0 3px #ef4d00"
        });
        control.focus();
    }

    ModalCheck(ObjectF, withModel = false) {
        const ModalCheck = new WModalForm({
            ObjectModal: [
                WRender.Create({ tagName: "h3", innerText: "¿Esta seguro que desea guardar este registro?" }),
                WRender.Create({
                    style: { textAlign: "center" },
                    children: [
                        WRender.Create({
                            tagName: 'input', type: 'button', className: 'Btn', value: 'SI', onclick: async () => {
                                try {
                                    if (withModel) {
                                        const response = await this.ModelObject?.SaveWithModel(ObjectF);
                                    } else if (this.ObjectOptions.Url != undefined) {
                                        const response = await WAjaxTools.PostRequest(this.ObjectOptions.Url, ObjectF);
                                    }
                                    if (this.SaveFunction != undefined) {
                                        this.SaveFunction(ObjectF);
                                    } else if (this.ObjectOptions.SaveFunction != undefined) {
                                        this.ObjectOptions.SaveFunction(ObjectF);
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        }),
                        WRender.Create({
                            tagName: 'input', type: 'button', className: 'Btn', value: 'NO', onclick: async () => {
                                ModalCheck.close();
                            }
                        })
                    ]
                })
            ]
        });
        return ModalCheck;
    }
    async SelectedFile(value, multiple = false) {
        if (multiple) {
            for (const file in value) {
                if (value[file].__proto__ == File.prototype) {
                    const reader = new FileReader();
                    reader.onloadend = function (e) {
                        ImageArray.push(e.target.result.split("base64,")[1]);
                    }
                    await reader.readAsDataURL(value[file]);
                }
            }
        } else {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                photoB64 = e.target.result.split("base64,")[1];
            }
            reader.readAsDataURL(value);
        }
    }
    FormStyle = () => {
        const style = css`
            .ContainerFormWModal {
                font-family: 'Montserrat-Medium', sans-serif !important;
            }
            .divForm {
                display: grid;
                grid-template-rows: auto;
                height: calc(100% - 70px);
                gap: 20px;
                margin: 20px;
            }
            .divForm .imageGridForm {
                grid-row: span 3;
            }
            .divForm .imageGridForm,
            .divForm .tableContainer {
                grid-column: span  ${this.limit};
                grid-row: span 4;
            }
            input:-internal-autofill-selected {
                appearance: menulist-button;
                background-color: none !important;
                background-image: none !important;
                color: -internal-light-dark(black, white) !important;
            }
            .DivSaveOptions {
                margin-top: 10px;
                margin-bottom: 10px;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .imgPhoto {
                grid-row: 1/3;
                grid-column: span ${this.limit};
            }
            .DrawControlContainer{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                grid-column: span ${this.limit};
            }
            .imgPhotoWModal {
                max-height: 250px;
                max-width: 250px;
                min-height: 250px;
                display: block;
                margin: auto;
                width: 100%;
                object-fit: cover;
                box-shadow: 0 0px 2px 0px #000;
                object-position: top;
                border-radius: .5cm;
            }
            .LabelFile {
                padding: 5px;
                max-width: 250px;
                margin: auto;
                cursor: pointer;
                background-color: #4894aa;
                border-radius: 0.2cm;
                display: block;
                color: #fff;
                text-align: center;
            }

            .inputTitle {
                padding: 2px;
                display: block;
                text-align: left;
                font-weight: bold;
                margin: 0 0 15px 0;
            }
            .inputTitle::first-letter {
                text-transform: capitalize;
            }

            .formHeader{
                color: #1c4786;
                text-transform: uppercase;
                margin-top: 40px;
            }

            .radioCheckedControl{
                display: flex;
                align-items: center;
                justify-content: flex-end;
                flex-direction: row-reverse;
            }

            input[type=checkbox] {
                appearance: none;
                background-color: #fff;
                margin: 0;
                font: inherit;
                color: currentColor;
                width: 1.15em;
                height: 1.15em;
                border: 0.15em solid #999;
                border-radius: 0.15em;
                display: grid;
                place-content: center;
            }

            input[type=checkbox]::before {
                content: "";
                width: 0.65em;
                height: 0.65em;
                transform: scale(0);
                transition: 120ms transform ease-in-out;
                box-shadow: inset 1em 1em var(--form-control-color);
                transform-origin: bottom left;
                clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
            }

            input[type=checkbox]:checked::before {
                content: " ";
                background-color: cornflowerblue;
                transform: scale(1);
            }

            .radioCheckedLabel{
                cursor: pointer;
                margin: 15px 0px 15px 10px;
            }

            .ToolTip {
                position: absolute;
                padding: 5px 15px;
                border-radius: 0.3cm;
                left: 10px;
                bottom: -10px;
                font-size: 10px;
                font-weight: 500;
                color: rgb(227, 0, 0);
            }
            .ToolTip::first-letter{
                text-transform: capitalize;
            }
            .draw-canvas {
                border: 2px dotted #CCCCCC;
                border-radius: 5px;
                cursor: crosshair;
            }
            .ModalElement {
                padding: 10px 0px;
                border-radius: 5px;
                position: relative;
            }

            .ModalDetailElement {
                background-color: #4da6ff;
                padding: 10px;
                border-radius: 5px;
                overflow: hidden;
                overflow-y: auto;
                max-height: 300px;
                margin: 5px;
            }

            .BtnClose {
                font-size: 18pt;
                color: #b9b2b3;
                cursor: pointer;
                width: 30px;
                border-radius: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: none;
                background-color: rgba(0, 0, 0, 0.2);                
            }

            .HeaderIcon {
                height: 50px;
                width: 50px;
                position: relative;
                left: -10px;                
            }

            .ObjectModalContainer {
                overflow: hidden;
                overflow-y: auto;
                max-height: calc(100vh - 120px);
                margin: 10px;
            }

            .listImage label {
                font-size: 11px;
                padding: 5px;
                width: 100%;
                overflow: hidden;
                display: block;
            }
            .contentLabelFile {
                display: flex;
                width: 100%;
                justify-content: flex-start;
                align-items: center;
            }
            .contentLabelFile .LabelFile{
                margin: 0 20px 0 0;
                padding: 10px;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }
            .labelIcon{
                height: 16px;
                width: 16px;
                filter: invert(1);
                margin-left: 10px;
            }

            @media (max-width: 800px) {
                .divForm {
                    display: grid;
                    grid-gap: 1rem;
                    grid-template-columns: calc(100% - 20px) !important;
                    grid-template-rows: auto;
                    justify-content: center;
                }

                .ContainerFormWModal {
                    margin-top: 0px;
                    border-radius: 0cm;
                    padding-bottom: 0px;
                }

                .ObjectModalContainer {
                    max-height: calc(100% - 80px);
                }

                .imgPhoto {
                    grid-row: 1/3;
                    grid-column: 1/2;
                }
            }
        `;
        const wstyle = new WStyledRender({
            ClassList: [
                new WCssClass(`.divForm`, {
                    "grid-template-columns": this.DivColumns
                }), new WCssClass(` .divForm .imageGridForm,  .divForm .tableContainer, .imgPhoto`, {
                    "grid-column": `span  ${this.limit}`
                })
            ]
        })
        return WRender.createElement({ style: { display: "none" }, children: [style, wstyle] });
    }
}
const ModalVericateAction = (Action, title) => {
    const ModalCheck = new WSimpleModalForm({
        title: "AVISO",
        ObjectModal: [
            WRender.Create({ tagName: "h3", innerText: title ?? "¿Esta seguro que desea guardar este registro?" }),
            WRender.Create({
                style: { textAlign: "center" },
                children: [
                    WRender.Create({
                        tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async () => {
                            await Action();
                            ModalCheck.close();
                        }
                    })
                ]
            })
        ]
    });
    return ModalCheck;
}
const ModalMessege = (message, detail = "") => {
    const ModalCheck = new WSimpleModalForm({
        title: message,
        ObjectModal: [WRender.Create({ tagName: 'p', class: "modalP", innerText: detail }), WRender.Create({
            style: { textAlign: "center" },
            children: [WRender.Create({
                tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async () => {
                    ModalCheck.close();
                }
            }), css`
                .modalP{
                    text-align: center;
                }
            `]
        })]
    });
    return ModalCheck;
}
customElements.define('w-form', WForm);
export { WForm, ModalVericateAction, ModalMessege }