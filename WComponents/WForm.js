//@ts-check
import { WRender, WArrayF, ComponentsManager, WAjaxTools } from '../WModules/WComponentsTools.js';
import { css, WCssClass, WStyledRender } from '../WModules/WStyledRender.js';
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WModalForm, WSimpleModalForm } from './WModalForm.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { WIcons } from '../WModules/WIcons.js';
import { WTableComponent } from './WTableComponent.js';
import { WCalendar, WCalendarComponent } from './WCalendar.js';
import { WDetailObject } from './WDetailObject.js';
import { EntityClass } from '../WModules/EntityClass.js';
// @ts-ignore
import { FormConfig, ModelProperty } from '../WModules/CommonModel.js';
let photoB64;
const ImageArray = [];

class WForm extends HTMLElement {
    /**
     * @param {FormConfig} Config 
     */
    constructor(Config) {
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
        this.StyleForm = this.Config.StyleForm;
        this.limit = 2;
        this.DivColumns = this.Config.DivColumns ?? "calc(50% - 10px) calc(50% - 10px)";
        this.DivForm = WRender.Create({ class: "ContainerFormWModal" });
        this.shadowRoot?.append(StyleScrolls.cloneNode(true));
        this.shadowRoot?.append(StylesControlsV2.cloneNode(true));
        this.shadowRoot?.append(WRender.createElement(this.FormStyle()));
        if (this.Config.CustomStyle) {
            this.shadowRoot?.append(this.Config.CustomStyle);
        }
        this.shadowRoot?.append(this.DivForm);
        this.DrawComponent();
        this.ExistChange = false;
        this.ObjectProxy = this.ObjectProxy ?? undefined;
        this.CreateOriginalObject();
    }
    #OriginalObject = {};
    DrawComponent = async () => {
        this.DarkMode = this.DarkMode ?? false;
        if (this.Config.ObjectOptions == undefined) {
            this.Config.ObjectOptions = {
                AddObject: false,
                Url: undefined
            };
        }
        this.FormObject = this.FormObject ?? this.Config.EditObject ?? {};
        const Model = this.Config.ModelObject ?? this.Config.EditObject;
        const ObjectProxy = this.CreateProxy(Model);
        this.DivForm.innerHTML = ""; //AGREGA FORMULARIO CRUD A LA VISTA
        this.DivForm.append(await this.CrudForm(ObjectProxy, this.Config.ObjectOptions));
        if (this.Options == true) {
            this.DivForm.append(await this.SaveOptions(ObjectProxy));
        }
    }
    CreateProxy(Model, FormObject = this.FormObject) {
        const ObjHandler = {
            get: (target, property) => {
                return target[property];
            }, set: (target, property, value, receiver) => {
                this.ExistChange = true;
                target[property] = value;
                this.SetOperationValues(Model, target)
                const control = this.shadowRoot?.querySelector("#ControlValue" + property);
                if (control) {
                    control.value = target[property];
                }
                if (this.Config.ProxyAction != undefined) {
                    this.Config.ProxyAction(this)
                }
                return true;
            }
        };
        const ObjectProxy = new Proxy(FormObject, ObjHandler);
        return ObjectProxy;
    }
    SetOperationValues = (Model = this.Config.ModelObject, target = this.FormObject) => {
        for (const prop in Model) {
            if (Model[prop]?.__proto__ == Object.prototype) {
                if (Model[prop].type?.toUpperCase() == "OPERATION") {
                    target[prop] = Model[prop].action(this.FormObject, this);
                    const control = this.shadowRoot?.querySelector("#ControlValue" + prop);
                    if (control) {
                        control.innerHTML = target[prop];
                    }
                }
            }
        }
    }
    CreateOriginalObject = (OriginalObject = this.#OriginalObject, FormObject = this.FormObject) => {
        for (const prop in FormObject) {
            if (FormObject[prop]?.__proto__ == Object.prototype || FormObject[prop]?.__proto__ == EntityClass.prototype) {
                OriginalObject[prop] = this.CreateOriginalObject({}, FormObject[prop])
            } else {
                OriginalObject[prop] = FormObject[prop];
            }
        }
        return OriginalObject;
    }

    /**
     * 
     * @param {Object} ObjectF 
     * @returns {HTMLElement}
     */
    ShowFormDetail(ObjectF = this.Config.ObjectDetail) {
        return new WDetailObject({ ObjectDetail: ObjectF });
    }
    /**
    * 
    * @param {Object} ObjectF 
    * @param {import('../WModules/CommonModel.js').ObjectOptions} ObjectOptions 
    * @returns {Promise<HTMLElement>}
    */
    CrudForm = async (ObjectF = {}, ObjectOptions) => {
        //verifica que el modelo existe,
        //sino es asi le asigna el valor de un objeto existente
        const Model = this.Config.ModelObject ?? this.Config.EditObject;
        const Form = WRender.Create({ className: 'divForm' });
        for (const prop in Model) {
            try {
                Model[prop] = Model[prop] != null ? Model[prop] : undefined;
                if (this.isNotDrawable(Model, prop)) {
                    if (!this.isMethod(Model, prop)) {
                        ObjectF[prop] = ObjectF[prop] ?? Model[prop]?.value ?? undefined;
                    }
                } else {
                    let val = ObjectF[prop] == undefined || ObjectF[prop] == null ? "" : ObjectF[prop];
                    //ObjectF[prop] = val;
                    const onChangeEvent = (ev) => {
                        /**
                         * @type {HTMLInputElement}
                         */
                        const targetControl = ev.target
                        /**
                        * @type {HTMLInputElement}
                        */
                        const currentTarget = ev.currentTarget

                        this.onChange(targetControl, currentTarget, ObjectF, prop, Model);
                    }
                    /**
                     * @type {HTMLLabelElement}
                     */
                    // @ts-ignore
                    const ControlLabel = WRender.Create({
                        tagName: "label", class: "inputTitle label_" + prop,
                        innerText: WOrtograficValidation.es(prop)
                    });
                    const ControlContainer = WRender.Create({
                        class: "ModalElement", children: [ControlLabel]
                    });
                    if (Model[prop].__proto__ == Object.prototype) {
                        if (Model[prop].ModelObject?.__proto__ == Function.prototype
                            && Model[prop].ModelObject()?.constructor?.name == this.Config.ParentModel?.constructor?.name) {
                            //Model[prop] = undefined;
                            ObjectF[prop] = undefined;
                            continue;
                        }
                        ControlLabel.innerHTML = Model[prop].label ?? WOrtograficValidation.es(prop)
                        let InputControl = await this.CreateModelControl(Model, prop, val, ControlContainer, ObjectF, ControlLabel, onChangeEvent);
                        ControlContainer.append(InputControl);
                    } else if (Model[prop] != null && Model[prop].__proto__ == Array.prototype) {
                        let InputControl = this.CreateSelect(Model[prop], prop, ObjectF, onChangeEvent);
                        ObjectF[prop] = InputControl.value;
                        ControlContainer.append(InputControl);
                    } else {
                        let InputControl = WRender.Create({ tagName: "input", id: "ControlValue" + prop, className: prop, value: val, type: "text", onchange: onChangeEvent });
                        if (typeof Model[prop] === "string" && Model[prop].length >= 50) {
                            InputControl = WRender.Create({ tagName: "textarea", className: prop });
                        } else if (parseFloat(Model[prop]).toString() != "NaN") {
                            InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "number", placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)) });
                        } else {
                            InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "text", placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)) });
                        }
                        ControlContainer.append(InputControl);
                    }
                    Form.append(ControlContainer);
                }

            } catch (error) {
                console.log(Model);
                console.log(Model[prop]);
                console.log(prop);
                console.log(ObjectF[prop]);
                console.log(error);
                throw "Error in create CrudForm";
            }

        }

        return Form;
    }
    isNotDrawable(Model, prop) {
        return (Model[prop]?.__proto__ == Object.prototype &&
            (Model[prop]?.primary || Model[prop]?.hidden || !Model[prop]?.type))
            || Model[prop]?.__proto__ == Function.prototype
            || Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "FilterData";
    }
    isMethod(Model, prop) {
        return Model[prop]?.__proto__ == Function.prototype
            || Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "ApiMethods" || prop == "FilterData";
    }
    /**
    * 
    * @param { HTMLInputElement } targetControl 
    * @param { HTMLInputElement | HTMLSelectElement | HTMLElement } currentTarget 
    * @param { Object } ObjectF 
    * @param { String } prop 
    * @param { Object } Model 
    * @returns 
    */
    onChange = async (targetControl, currentTarget, ObjectF, prop, Model) => { //evento de actualizacion del componente
        if (Model[prop].validateFunction) {
            const result = Model[prop].validateFunction(ObjectF, targetControl?.value);
            if (!result.success) {
                alert(result.message);
                return;
            }
        }
        const tool = targetControl?.parentNode?.querySelector(".ToolTip");
        if (tool) tool.remove();
        if (currentTarget?.tagName?.toUpperCase().includes("W-CALENDAR-COMPONENT")) {
        } else if (targetControl?.type == "file") {
            if (targetControl?.multiple) {
                await this.SelectedFile(targetControl?.files, true);
            } else {
                let base64Type = "";
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
                    if (targetControl.parentNode?.querySelector("#labelFile" + prop) != null) {
                        // @ts-ignore
                        targetControl.parentNode.querySelector("#labelFile" + prop).innerText
                            = targetControl.files[0].name;
                    }
                    await this.SelectedFile(targetControl?.files[0]);
                    setTimeout(() => {
                        ObjectF[prop] = base64Type + photoB64.toString();
                        console.log("#imgControl" + prop, this.shadowRoot?.querySelector("#imgControl" + prop));
                        if (this.shadowRoot?.querySelector("#imgControl" + prop) != null) {
                            // @ts-ignore
                            this.shadowRoot.querySelector("#imgControl" + prop).src = ObjectF[prop];
                        }
                    }, 1000);
                }
            }
        } else if (targetControl?.type == "checkbox" || targetControl?.type == "radio") {
            ObjectF[prop] = targetControl?.value;
        } else {
            ObjectF[prop] = targetControl?.value;
            if (targetControl?.pattern) {
                let regex = new RegExp(targetControl?.pattern);
                if (regex.test(ObjectF[prop])) {
                    WRender.SetStyle(targetControl, {
                        boxShadow: "none"
                    });
                } else {
                    let regex = new RegExp(targetControl.pattern);
                    if (!regex.test(ObjectF[prop])) {
                        if (!targetControl.parentNode?.querySelector(".ToolTip")) {
                            targetControl.parentNode?.append(WRender.Create({
                                tagName: "span",
                                innerHTML: `Ingresar formato correcto: ${targetControl.placeholder}`,
                                className: "ToolTip"
                            }));
                        }
                        WRender.SetStyle(targetControl, {
                            boxShadow: "0 0 3px #ef4d00"
                        });
                    }
                }
            }
        }
        if (Model[prop].fieldRequire) {
            this.shadowRoot?.querySelector(".label_" + Model[prop].fieldRequire)?.append("*")
            Model[Model[prop].fieldRequire].require = true;
        }
    }

    /**
     * @param {Object} Model
     * @param {String} prop
     * @param {String | undefined} val
     * @param {HTMLElement} ControlContainer
     * @param {Object} ObjectF     
     * @param {HTMLLabelElement} ControlLabel
     * @param {Function} onChangeEvent
     */
    async CreateModelControl(Model, prop, val, ControlContainer, ObjectF, ControlLabel, onChangeEvent) {
        /**
         * @type {ModelProperty}
         */
        const ModelProperty = Model[prop];
        let InputControl;
        ModelProperty.require = ModelProperty.require ?? true;
        const actionFunction = ModelProperty.action ?? null;
        ObjectF[prop] = ObjectF[prop] ?? ModelProperty.defaultValue;
        switch (ModelProperty.type?.toUpperCase()) {
            case "TITLE":
                ModelProperty.require = false;
                ObjectF[prop] = undefined;
                ControlLabel.className += " formHeader";
                ControlLabel.innerHTML = ModelProperty.label ?? "";
                ControlContainer.classList.add("tableContainer");
                InputControl = WRender.CreateStringNode("<span/>");
                break;
            case "IMG": case "IMAGE": case "IMAGES":
                const Multiple = ModelProperty.type.toUpperCase() == "IMAGES" ? true : false;
                InputControl = this.CreateImageControl(val, ControlContainer, prop, Multiple);
                if (Multiple) {
                    ObjectF[prop] = ImageArray;
                }
                ControlContainer.className += " imgPhoto";
                break;
            case "DATE": case "FECHA": case "HORA":
                let type = "date";
                //@ts-ignore
                let date_val = val == "" ? (new Date()).toISO() : ObjectF[prop];
                if (ModelProperty.type.toUpperCase() == "HORA") {
                    type = "time";
                    date_val = val ?? "08:00";
                }
                InputControl = WRender.Create({
                    tagName: "input", className: prop, type: type,
                    placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    disabled: ModelProperty.disabled,
                    min: ModelProperty.min,
                    max: ModelProperty.max,
                });
                //@ts-ignore
                ObjectF[prop] = InputControl.value = (new Date(date_val)).toISO();
                break;
            case "SELECT":
                InputControl = this.CreateSelect(prop, ObjectF, ModelProperty.Dataset, onChangeEvent);
                ObjectF[prop] = InputControl.value;
                break;
            case "OPERATION":
                val = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
                InputControl = WRender.Create({
                    tagName: "label",
                    className: prop + " input",
                    innerText: val
                });
                break;
            case "WSELECT":
                ObjectF[prop] = ObjectF[prop]?.__proto__ == Object.prototype ? ObjectF[prop] : null;
                if (ModelProperty.ModelObject?.__proto__ == Function.prototype) {
                    ModelProperty.ModelObject = await WArrayF.isModelFromFunction(Model, prop);
                    /**@type {EntityClass} */
                    const entity = ModelProperty.EntityModel ?? ModelProperty.ModelObject;
                    if (this.Config.ParentEntity != undefined && ModelProperty.SelfChargeDataset) {
                        ModelProperty.Dataset = this.Config.ParentEntity[ModelProperty.SelfChargeDataset] ?? [];
                    } else {
                        ModelProperty.Dataset = await entity.Get();
                    }
                }
                if (ObjectF[prop] == null && ModelProperty.require != false &&
                    ModelProperty.Dataset &&
                    ModelProperty.Dataset?.length > 0) {
                    ObjectF[prop] = ModelProperty?.Dataset[0];
                }
                val = ObjectF[prop];
                const DataseFilter = this.CreateDatasetForMultiSelect(Model, prop);
                InputControl = await this.CreateWSelect(InputControl, DataseFilter, prop, ObjectF, Model);
                this.FindObjectMultiselect(val, InputControl);
                break;
            case "MULTISELECT":
                if (ModelProperty.ModelObject?.__proto__ == Function.prototype) {
                    ModelProperty.ModelObject = await WArrayF.isModelFromFunction(Model, prop);
                    ModelProperty.Dataset = await ModelProperty.ModelObject.Get();
                }
                const { MultiSelect } = await import("./WMultiSelect.js");
                const Datasetilt = this.CreateDatasetForMultiSelect(Model, prop);
                InputControl = new MultiSelect({
                    action: (selecteds) => {
                        if (ModelProperty.action) {
                            ModelProperty.action(ObjectF, this, InputControl, prop)
                        }
                    }, Dataset: Datasetilt, ModelObject: ModelProperty.ModelObject
                });
                this.FindObjectMultiselect(val, InputControl);
                ObjectF[prop] = InputControl.selectedItems;
                break;
            case "EMAIL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: ModelProperty.type,
                    placeholder: "Ejem.: me@email.com",
                    pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$",
                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    disabled: ModelProperty.disabled
                });
                break;
            case "TEL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: ModelProperty.type,
                    placeholder: "Ejem.: 88888888",
                    //pattern: "[+]{1}[0-9]{2,3}[-]{1}[0-9]{3,4}[0-9]{4,5}",
                    pattern: "[0-9]{4}[0-9]{4}",
                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    disabled: ModelProperty.disabled
                });
                break;
            case "URL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: ModelProperty.type,
                    placeholder: "Ejem.: https://site.com",
                    pattern: "https?://.+",
                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    disabled: ModelProperty.disabled
                });
                break;
            case "MASTERDETAIL":
                const masterDetailModel = await WArrayF.isModelFromFunction(Model, prop);
                ControlLabel.className += " formHeader";
                ControlContainer.classList.add("tableContainer");
                ObjectF[prop] = ObjectF[prop] != "" && ObjectF[prop] != undefined ?
                    this.CreateProxy(Model, ObjectF[prop]) :
                    this.CreateProxy(Model, []);
                InputControl = new WTableComponent({
                    Dataset: ObjectF[prop],
                    AddItemsFromApi: false,
                    ModelObject: masterDetailModel,
                    ParentModel: Model,
                    ParentEntity: ObjectF,
                    ImageUrlPath: this.Config.ImageUrlPath,
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
                    ModelObject: await WArrayF.isModelFromFunction(Model, prop),
                    Options: false
                });
                break;
            case "FILE":
                InputControl = WRender.Create({
                    tagName: "input", className: prop, value: val, type: ModelProperty.type,
                    style: { display: "none" },
                    placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    disabled: ModelProperty.disabled
                });
                const label = WRender.Create({ tagName: 'label', id: "labelFile" + prop, innerText: '' });
                const content = WRender.Create({
                    class: "contentLabelFile", children: [
                        WRender.Create({
                            tagName: "label",
                            class: "LabelFile",
                            innerText: "Seleccionar archivo",
                            htmlFor: "ControlValue" + prop, children: [
                                WRender.Create({ tagName: 'img', src: WIcons.upload, class: 'labelIcon' })
                            ],
                            disabled: ModelProperty.disabled
                        }), label
                    ]
                })
                ControlContainer.append(content);
                ControlContainer.className += " file";
                // @ts-ignore
                if (ModelProperty.fileType) InputControl.accept = ModelProperty.fileType.map(x => "." + x).join(",")
                break;
            case "RADIO":
                //ControlContainer.className += " radioCheckedControl";
                ControlLabel.htmlFor = "ControlValue" + prop;
                ControlLabel.className += " radioCheckedLabel";
                InputControl = WRender.Create({
                    className: "radio-group-container",
                    id: "ControlValue" + prop,
                    children: ModelProperty.Dataset?.map(radioElement => {
                        return WRender.Create({
                            className: "radio-element", children: [
                                {
                                    tagName: 'label', htmlFor: radioElement + "Radio" + prop, innerText: radioElement
                                }, {
                                    tagName: "input",
                                    id: radioElement + "Radio" + prop,
                                    className: prop,
                                    name: prop,
                                    checked: val == radioElement,
                                    value: radioElement,
                                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                                    type: ModelProperty.type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                                    disabled: ModelProperty.disabled
                                }
                            ]
                        })
                    })
                });
                break;
            case "CHECKBOX":
                ControlContainer.className += " radioCheckedControl";
                ControlLabel.htmlFor = "ControlValue" + prop;
                ControlLabel.className += " radioCheckedLabel";
                InputControl = WRender.Create({
                    tagName: "input",
                    id: "ControlValue" + prop,
                    className: prop,
                    value: val,
                    checked: val != null || val != undefined,
                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    type: ModelProperty.type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    disabled: ModelProperty.disabled
                });
                break;
            case "DRAW":
                InputControl = this.createDrawComponent(InputControl, prop, ControlContainer, ObjectF); break;
            case "TEXTAREA":
                ControlContainer.classList.add("textAreaContainer");
                ControlContainer.style.height = "auto";
                InputControl = WRender.Create({
                    tagName: "textarea", style: { height: "calc(100% - 12px)", borderRadius: "10px" },
                    className: prop, value: val, onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    disabled: ModelProperty.disabled
                });
                break;
            case "CALENDAR":
                ObjectF[prop] = ObjectF[prop]?.__proto__ == Array.prototype ? ObjectF[prop] : [];
                ControlContainer.classList.add("tableContainer");
                ControlContainer.style.height = "auto";
                InputControl = this.createDrawCalendar(InputControl, prop, ControlContainer, ObjectF, Model);
                break;
            case "PASSWORD":
                ControlContainer.classList.add("tableContainer");
                val = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
                const placeholderp = ModelProperty.placeholder ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
                const pass = WRender.Create({
                    tagName: "input", id: "ControlPass1" + prop, className: prop, value: val,
                    type: ModelProperty.type, placeholder: placeholderp, onchange: onChangeEvent
                })
                const pass2 = WRender.Create({
                    tagName: "input", id: "ControlPass2" + prop, className: prop, value: val,
                    type: ModelProperty.type, placeholder: placeholderp, onchange: () => {
                        // @ts-ignore
                        if (pass.value != pass2.value) {
                            this.createAlertToolTip(pass2, `contraseñas no coinciden`);
                        }
                    }
                })

                InputControl = WRender.Create({
                    class: "password-container",
                    children: [
                        WRender.Create({
                            class: "ModalElement", children: ["Contraseña", pass]
                        }), WRender.Create({
                            class: "ModalElement", children: ["Repetir contraseña", pass2]
                        })
                    ]
                });
                break;
            default:
                val = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
                const placeholder = ModelProperty.placeholder ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop,
                    value: val,
                    type: ModelProperty.type,
                    min: ModelProperty.min,
                    max: ModelProperty.max,
                    placeholder: placeholder,
                    onchange: ModelProperty.disabled ? undefined : onChangeEvent,
                    disabled: ModelProperty.disabled
                });
                break;
        }
        if (ModelProperty.fieldRequire && val != undefined && val != "") {
            Model[ModelProperty.fieldRequire].require = true;
        }
        if (ModelProperty.pattern) InputControl.pattern = ModelProperty.pattern;
        ControlLabel.innerHTML += ModelProperty.require == true ? "*" : "";
        if (ModelProperty.ControlAction != undefined) {
            ModelProperty.ControlAction.forEach(action => {
                ControlContainer.append(WRender.Create({
                    tagName: "label",
                    class: "propAction",
                    style: {
                        position: ModelProperty.type.toUpperCase() != "MODEL" ? "absolute" : "initial",
                        bottom: "10px",
                        marginLeft: "30px"
                    },
                    innerText: action.name,
                    onclick: async () => {
                        action.action(ObjectF, this, InputControl, prop);
                    }
                }))
            });
        }
        InputControl.id = "ControlValue" + prop;
        if (actionFunction != null) {
            InputControl.addEventListener("change", () => { actionFunction(ObjectF, this, InputControl, prop) });
        }

        return InputControl;
    }
    createDrawCalendar(InputControl, prop, ControlContainer, ObjectF, Model) {
        InputControl = new WCalendarComponent({
            CalendarFunction: Model[prop].CalendarFunction,
            SelectedBlocks: ObjectF[prop],
        });
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
        window.requestAnimationFrame = (function (callback) {
            return window.requestAnimationFrame ||
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
            requestAnimationFrame(drawLoop);
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

    async CreateWSelect(InputControl, Dataset, prop, ObjectF, Model) {
        const { MultiSelect } = await import("./WMultiSelect.js");
        InputControl = new MultiSelect({
            MultiSelect: false,
            Dataset: Dataset,
            ModelObject: this.Config.ModelObject[prop].ModelObject,
            action: (ItemSelects) => {
                ObjectF[prop] = ItemSelects[0].id ?? ItemSelects[0].id_
                    ?? ItemSelects[0];
                /**
                * @type {ModelProperty}
                */
                const ModelProperty = Model[prop];
                if (ModelProperty.action) {
                    ModelProperty.action(ObjectF, this, InputControl, prop)
                }
            }
        });
        return InputControl;
    }
    /**
     * 
     * @param {Object} object 
     * @returns {String}
     */
    findKey = (object) => {
        let keyF = "";
        for (const key in object) {
            if ((typeof object[key] === "string" || typeof object[key] === "number")
                && key.includes("id_")) {
                keyF = key;
                break;
            }
        }
        return keyF
    }
    /**
     * @param {Array} [Dataset] 
     * @param {String} prop
     * @param {Object} ObjectF
     * @param {Function} [onChangeEvent]
     * @returns {HTMLSelectElement}
     */
    CreateSelect(prop, ObjectF, Dataset, onChangeEvent) {
        /**
         * @type {HTMLSelectElement}
         */
        // @ts-ignore
        let InputControl = WRender.Create({
            tagName: "select", className: prop, onchange: onChangeEvent, id: "ControlValue" + prop,
            children: Dataset?.map(option => {
                let OValue, ODisplay;
                if (option.__proto__ == Object.prototype) {
                    OValue = option["id"];
                    ODisplay = option["desc"] ?? option["Descripcion"] ?? option["descripcion"];
                } else {
                    OValue = option;
                    ODisplay = option;
                }
                const OptionObject = WRender.Create({
                    tagName: "option", value: OValue, innerText: ODisplay,
                    selected: (ObjectF[prop] != undefined && ObjectF[prop].toString() == OValue.toString()) ? true : false
                });
                return OptionObject;
            })
        });
        return InputControl;
    }
    /**
     * @param {any} InputValue
     * @param {HTMLElement} ControlContainer
     * @param {string} prop
     * @param {boolean} Multiple
     */
    CreateImageControl(InputValue, ControlContainer, prop, Multiple) {
        const InputControl = WRender.Create({
            tagName: "input", className: prop, multiple: Multiple, type: "file", style: {
                display: "none"
            }
        });
        if (Multiple) {
            const Div = WRender.Create({ class: "listImage" });
            ControlContainer.append(Div);
            /**
             * @param {Event & { target: HTMLInputElement }} ev
             */
            InputControl.addEventListener("change", (ev) => {
                // @ts-ignore
                const files = ev.target?.files
                for (const file in files) {
                    if (files[file]?.__proto__ == File.prototype) {
                        Div.append(WRender.Create(files[file]?.name))
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
                && typeof this.ImageUrlPath === "string"
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
        ControlContainer.className += " imageGridForm";

        // @ts-ignore
        InputControl.accept = ".jpg, .jpeg, .png";
        return InputControl;
    }
    SaveOptions(ObjectF = {}) {
        ObjectF = this.ObjectProxy ?? ObjectF;
        const DivOptions = WRender.Create({ class: "DivSaveOptions" });
        if (this.Config.ObjectOptions != undefined) {
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
        if (this.Config.UserActions != undefined && this.Config.UserActions != Array) {
            this.Config.UserActions.forEach((Action) => {
                DivOptions.append(WRender.Create({
                    tagName: "button",
                    class: "Btn",
                    type: "button",
                    innerText: Action.name,
                    onclick: async (ev) => {
                        Action.action(ev.target);
                    }
                }));
            });
        }
        return DivOptions;
    }
    Save = async (ObjectF = this.FormObject) => {
        if (this.Config.ValidateFunction != undefined &&
            typeof this.Config.ValidateFunction === "function") {
            const response = this.Config.ValidateFunction(ObjectF);
            if (response.validate == false) {
                alert(response.message);
                return;
            }
        }
        if (!this.Validate(ObjectF)) {
            return;
        }
        if (this.Config.ObjectOptions?.Url != undefined || this.Config.SaveFunction == undefined) {
            const ModalCheck = this.ModalCheck(ObjectF, this.Config.SaveFunction == undefined);
            this.shadowRoot?.append(ModalCheck)
        } else if (this.Config.ModelObject?.SaveWithModel != undefined && this.Config.AutoSave == true) {
            const ModalCheck = this.ModalCheck(ObjectF, true);
            this.shadowRoot?.append(ModalCheck)
        } else {
            this.Config.SaveFunction(ObjectF);
        }
    }
    Validate = (ObjectF = this.FormObject) => {
        if (this.DataRequire == true) {
            for (const prop in ObjectF) {
                if (!prop.includes("_hidden") && this.Config.ModelObject[prop]?.require) {
                    /**
                     * @type {?HTMLInputElement | undefined | any}
                     */
                    const control = this.shadowRoot?.querySelector("#ControlValue" + prop);
                    if (this.Config.ModelObject[prop]?.type.toUpperCase() == "MODEL") {
                        if (control?.Validate != undefined && !control.Validate(control.FormObject)) {
                            return false;
                        }
                    } else if (this.Config.ModelObject[prop]?.type.toUpperCase() == "PASSWORD") {
                        const passwords = control.querySelectorAll("input");
                        if (passwords[0].value == null || passwords[0].value == "") {
                            this.createAlertToolTip(passwords[0], WArrayF.Capitalize(WOrtograficValidation.es(prop)) + ` es requerido`);
                            return false;
                        }
                        if (passwords[0].value != passwords[1].value) {
                            this.createAlertToolTip(passwords[0], `Las contraseñas deben ser iguales`);
                            return false;
                        }

                    } else if (this.Config.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL") {
                        if (this.Config.ModelObject[prop].require == true) {
                            this.Config.ModelObject[prop].MinimunRequired = this.Config.ModelObject[prop]?.MinimunRequired ?? 1;
                        }
                        if (this.Config.ModelObject[prop]?.MaxRequired
                            && ObjectF[prop].length > this.Config.ModelObject[prop]?.MaxRequired) {
                            this.createAlertToolTip(control, `El máximo de registros permitidos es `
                                + this.Config.ModelObject[prop]?.MaxRequired);
                            return false;
                        }

                        if (this.Config.ModelObject[prop]?.MinimunRequired
                            && ObjectF[prop].length < this.Config.ModelObject[prop]?.MinimunRequired) {
                            this.createAlertToolTip(control, `El mínimo de registros permitidos es `
                                + this.Config.ModelObject[prop]?.MinimunRequired);
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
                    } else if (control != null && control.type?.toString().toUpperCase() == "NUMBER") {
                        if (parseFloat(control.value) < parseFloat(control.min)) {
                            this.createAlertToolTip(control, `El valor mínimo permitido es: ${control.min}`);
                            return false;
                        }
                        if (parseFloat(control.value) > parseFloat(control.max)) {
                            this.createAlertToolTip(control, `El valor máximo permitido es: ${control.max}`);
                            return false;
                        }
                    }
                }
            }
        }
        //console.log(JSON.stringify(this.#OriginalObject), JSON.stringify(ObjectF));
        if (JSON.stringify(this.#OriginalObject) == JSON.stringify(ObjectF)) {
           //this.shadowRoot?.append(ModalMessege("No se han detectado cambios."));
            //return false;
        }
        return true;
    }

    RollBack() {
        for (const prop in this.#OriginalObject) {
            this.FormObject[prop] = this.#OriginalObject[prop];
        }
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
        const modalCheckFunction = async () => {
            try {
                if (withModel) {
                    const response = await this.Config.ModelObject?.SaveWithModel(ObjectF, this.Config.EditObject != undefined);
                } else if (this.Config.ObjectOptions?.Url != undefined) {
                    const response = await WAjaxTools.PostRequest(this.Config.ObjectOptions?.Url, ObjectF);
                }
                if (this.Config.SaveFunction != undefined) {
                    this.Config.SaveFunction(ObjectF);
                } else if (this.Config.ObjectOptions?.SaveFunction != undefined) {
                    this.Config.ObjectOptions?.SaveFunction(ObjectF);
                } 
                ModalCheck.close();                
            } catch (error) {
                ModalCheck.close();
                console.log(error);
                this.shadowRoot?.append(ModalMessege(error));
            }
        }
        const ModalCheck = new WModalForm({
            ObjectModal: WRender.Create({
                tagName: "div", children: [
                    { tagName: "h3", innerText: "¿Esta seguro que desea guardar este registro?" },
                    {
                        style: { textAlign: "center" },
                        children: [{
                            tagName: 'input', type: 'button', className: 'Btn', value: 'SI', onclick: async () => {
                                modalCheckFunction();
                            }
                        }, {
                            tagName: 'input', type: 'button', className: 'Btn', value: 'NO', onclick: async () => {
                                ModalCheck.close();
                            }
                        }]
                    }
                ]
            })
        });
        return ModalCheck;
    }
    async SelectedFile(value, multiple = false) {
        if (multiple) {
            for (const file in value) {
                if (value[file].__proto__ == File.prototype) {
                    const reader = new FileReader();
                    reader.onloadend = function (e) {
                        // @ts-ignore
                        ImageArray.push(e.target?.result?.split("base64,")[1]);
                    }
                    await reader.readAsDataURL(value[file]);
                }
            }
        } else {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                // @ts-ignore
                photoB64 = e.target?.result?.split("base64,")[1];
            }
            reader.readAsDataURL(value);
        }
    }
    FormStyle = () => {
        const style = css`.ContainerFormWModal {
                font-family: 'Montserrat-Medium', sans-serif !important;
            }
            .divForm {
                display: grid;
                grid-template-rows: auto;
                height: calc(100% - 70px);
                gap: 20px;
            }
            .divForm .imageGridForm {
                grid-row: span 3;
            }
            .divForm .imageGridForm,
            .divForm .tableContainer {
                grid-row: span 4;
            }
            .divForm .textAreaContainer {
                grid-row: span 2;

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
                grid-row-start: 1 !important;
            }
            .DrawControlContainer{
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
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

            .inputTitle, .password-container label {
                padding: 2px;
                display: block;
                text-align: left;
                font-weight: bold;
                margin: 0 0 10px 0;
                font-size: 12px;
            }
            .password-container { 
                display: grid;
                gap: 20px;
                grid-template-columns: calc(50% - 10px) calc(50% - 10px);
                grid-column: span 2;
            }
            
            .inputTitle::first-letter, .password-container label {
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
                padding: 0px;
                border-radius: 5px;
                position: relative;
            }

            .ModalDetailElement {
                background-color: #4da6ff;
                padding: 10px;
                border-radius: 5px;
                overflow: hidden;
                overflow-y: auto; overflow-y: overlay;
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
                overflow-y: auto; overflow-y: overlay;
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

            .radio-group-container {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }


            .radio-group-container label {
                cursor: pointer;
            }

            .radio-element {
                display: flex;
                flex-direction: row-reverse;
                margin: 5px;
                align-items: center;
            }
            .radio-element input {
                margin: 0px;
                margin-right: 10px;
            }

            input[type=radio] {
                cursor: pointer;
                appearance: none;
                background-color: #fff;
                border-radius: 50%;
                font: inherit;
                color: currentColor;
                width: 1.15em;
                height: 1.15em;
                border: 0.15em solid #999;
                display: grid;
                place-content: center;
            }

            input[type=radio]::before {
                content: "";
                width: 0.65em;
                height: 0.65em;
                transform: scale(0);
                box-shadow: inset 1em 1em var(--form-control-color);
                transform-origin: bottom left;
                clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
            }

            input[type=radio]:checked::before {
                content: " ";
                background-color: cornflowerblue;
                transform: scale(1);
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
            }`;
        const wstyle = new WStyledRender({
            ClassList: [
                new WCssClass(`.divForm`, {
                    "grid-template-columns": this.DivColumns
                }), new WCssClass(` .divForm .imageGridForm, .divForm .tableContainer,
                 .divForm .textAreaContainer, .imgPhoto`, {
                    "grid-column": `span  ${this.limit}`,
                    "padding-bottom": 10
                })
            ]
        })
        return WRender.Create({ style: { display: "none" }, children: [style, wstyle] });
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