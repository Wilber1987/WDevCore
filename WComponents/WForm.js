//@ts-check
import { WRender, ComponentsManager } from '../WModules/WComponentsTools.js';
import { css, WCssClass, WStyledRender } from '../WModules/WStyledRender.js';
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { WSimpleModalForm } from "./WSimpleModalForm.js";

import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { WIcons } from '../WModules/WIcons.js';
import { EntityClass } from '../WModules/EntityClass.js';
// @ts-ignore
import { FormConfig, ModelFiles, ModelProperty } from '../WModules/CommonModel.js';
import {WArrayF} from "../WModules/WArrayF.js";
import {WAjaxTools} from "../WModules/WAjaxTools.js";
import { WFormStyle } from './ComponentsStyles/WFormStyle.mjs';


let fileBase64;
const ImageArray = [];

class WForm extends HTMLElement {
    /**
     * @param {FormConfig} Config 
     */
    constructor(Config) {
        super();
        this.attachShadow({ mode: 'open' });
        WRender.SetStyle(this, {
            //height: "90%",
            display: "block"
        })
        for (const p in Config) {
            this[p] = Config[p];
        }
        this.Config = Config;
        this.ModelObject = this.Config.ModelObject;
        this.ImageUrlPath = Config.ImageUrlPath;
        this.Options = this.Options ?? true;
        this.DataRequire = this.DataRequire ?? true;
        this.StyleForm = this.Config.StyleForm;
        this.limit = this.Config.limit ?? 2;
        this.DivColumns = this.Config.DivColumns ?? "calc(50% - 10px)  calc(50% - 10px)";
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
    connectedCallback() {
        this.DivForm.addEventListener("click", (e) => this.undisplayMultiSelects(e));
        this.DivForm.addEventListener("scroll", (e) => this.undisplayMultiSelects(e));//TODO VER SCROLL
    }
    undisplayMultiSelects = (e) => {
        // @ts-ignore
        if (!e.target.tagName.includes("W-MULTI-SELECT")) {
            this.shadowRoot?.querySelectorAll("w-multi-select").forEach(m => {
                // @ts-ignore
                if (m.tool) {
                    // @ts-ignore
                    m.tool.className = "toolInactive";
                }
            })
        }
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
        //console.log(this.FormObject);
        this.FormObject = this.FormObject ?? this.Config.EditObject ?? {};
        const Model = this.Config.ModelObject ?? this.Config.EditObject;
        const ObjectProxy = this.CreateProxy(Model);
        this.DivForm.innerHTML = ""; //AGREGA FORMULARIO CRUD A LA VISTA
        await this.CrudForm(ObjectProxy, this.Config.ObjectOptions, this.DivForm);
        if (this.Options == true) {
            this.DivForm.appendChild(await this.SaveOptions(ObjectProxy));
        }
    }
    CreateProxy(Model, FormObject = this.FormObject) {
        const ObjHandler = {
            get: (target, property) => {
                return target[property];
            }, set: (target, property, value, receiver) => {
                this.ExistChange = true;
                target[property] = value;
                //console.log(value);   
                //console.log(property, Model[property]);
                if (!["IMG", "FILE","DATE", "DATETIME"].includes(Model[property]?.type?.toUpperCase())) {
                    const control = this.shadowRoot?.querySelector("#ControlValue" + property);
                    if (control) {
                        // @ts-ignore
                        control.value = target[property];
                    }
                }
                if (this.Config.ProxyAction != undefined) {
                    this.Config.ProxyAction(this)
                }
                this.SetOperationValues(Model, target)
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
                    //if (Model[prop].type?.toUpperCase() == "OPERATION") {
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
    * @param {import('../WModules/CommonModel.js').ObjectOptions} ObjectOptions 
    * @param {HTMLElement} DivForm
    */
    CrudForm = async (ObjectF = {}, ObjectOptions, DivForm) => {
        //verifica que el modelo existe,
        //sino es asi le asigna el valor de un objeto existente
        const Model = this.Config.ModelObject ?? this.Config.EditObject;
        const Form = WRender.Create({ className: 'divForm' });
        const ModelComplexElements = Object.keys(this.Config.ModelObject).filter(o => this.Config.ModelObject[o]?.type?.toUpperCase() == "MASTERDETAIL" 
        || this.Config.ModelObject[o]?.type?.toUpperCase() == "CALENDAR")
        
        const ComplexForm = WRender.Create({ className: 'divComplexForm', style: ModelComplexElements.length <= 1 ? "grid-template-columns: unset": "" });
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
                    const onChangeEvent = async (ev) => {
                        //console.log(ev);
                        /**
                         * @type {HTMLInputElement}
                         */
                        const targetControl = ev.target
                        /**
                        * @type {HTMLInputElement}
                        */
                        const currentTarget = ev.currentTarget

                        await this.onChange(targetControl, currentTarget, ObjectF, prop, Model);
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
                    if (Model[prop] != undefined && Model[prop].__proto__ == Object.prototype) {
                        //todo revisar
                        /*if (Model[prop] != undefined && Model[prop].ModelObject?.__proto__ == Function.prototype
                             && Model[prop].ModelObject()?.constructor?.name == this.Config.ParentModel?.constructor?.name) {
                             //Model[prop] = undefined;
                             ObjectF[prop] = undefined;
                             continue;
                         }*/
                        ControlLabel.innerHTML = Model[prop].label ?? WOrtograficValidation.es(prop)
                        let InputControl = await this.CreateModelControl(Model, prop, val, ControlContainer, ObjectF, ControlLabel, onChangeEvent, Form, ComplexForm);
                        ControlContainer.append(InputControl);
                    } else if (Model[prop] != null && Model[prop].__proto__ == Array.prototype) {
                        let InputControl = this.CreateSelect(Model[prop], prop, ObjectF, onChangeEvent);
                        ObjectF[prop] = InputControl.value;
                        ControlContainer.append(InputControl);
                        Form.appendChild(ControlContainer);
                    } else {
                        let InputControl = WRender.Create({ tagName: "input", id: "ControlValue" + prop, className: prop, value: val, type: "text", onchange: onChangeEvent });
                        if (typeof Model[prop] === "string" && Model[prop].length >= 50) {
                            InputControl = WRender.Create({ tagName: "textarea", className: prop });
                        } else if (parseFloat(Model[prop]).toString() != "NaN") {
                            InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "number", onchange: onChangeEvent, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)) });
                        } else {
                            InputControl = WRender.Create({ tagName: "input", className: prop, value: val, type: "text", onchange: onChangeEvent, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)) });
                        }
                        ControlContainer.append(InputControl);
                        Form.appendChild(ControlContainer);
                    }

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
        //console.log(DivForm);
        DivForm.append(Form, ComplexForm);
    }
    isNotDrawable(Model, prop) {
        if (Model[prop] == undefined) {
            return true;
        }
        return (Model[prop]?.__proto__ == Object.prototype &&
            (Model[prop]?.primary || Model[prop]?.hidden || !Model[prop]?.type))
            || Model[prop]?.__proto__ == Function.prototype
            || Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "FilterData" || prop == "OrderData";
    }
    isMethod(Model, prop) {
        return Model[prop]?.__proto__ == Function.prototype
            || Model[prop]?.__proto__.constructor.name == "AsyncFunction" || prop == "ApiMethods" || prop == "FilterData" || prop == "OrderData";
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
                        //console.log(fileBase64, base64Type);
                        ObjectF[prop] = fileBase64.toString();
                        //console.log("#imgControl" + prop, this.shadowRoot?.querySelector("#imgControl" + prop));                        
                        if (this.shadowRoot?.querySelector("#imgControl" + prop) != null) {
                            // @ts-ignore
                            this.shadowRoot.querySelector("#imgControl" + prop).src = base64Type + fileBase64.toString();
                        } 

                        if (Model[prop].type.toUpperCase() == "FILE") {
                            // @ts-ignore
                            const fileClass = new ModelFiles(targetControl?.files[0]?.name, fileBase64, base64Type);                            
                            ObjectF[prop] = [fileClass]
                        }
                    }, 1000);
                }
            }
        } else if (targetControl?.type == "checkbox") {
            ObjectF[prop] = targetControl?.checked;
        } else if (targetControl?.type == "radio") {
            ObjectF[prop] = targetControl?.value;
        } else {
            //console.log(targetControl?.min, targetControl?.max);
            //console.log(ObjectF[prop], targetControl?.value, targetControl);
            if (parseFloat(targetControl?.value) < parseFloat(targetControl?.min)) {
                //targetControl.value = targetControl?.min;
                this.createInfoToolTip(targetControl, `El valor mínimo permitido es: ${targetControl?.min}`);
            }
            if (parseFloat(targetControl?.value) > parseFloat(targetControl?.max)) {
                //targetControl.value = targetControl?.max;
                this.createInfoToolTip(targetControl, `El valor máximo permitido es: ${targetControl?.max}`);
            }
            ObjectF[prop] = targetControl?.value;
            //console.log(ObjectF[prop]);
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
     * @param {HTMLElement} Form
     * @param {HTMLElement} ComplexForm
     */
    async CreateModelControl(Model, prop, val, ControlContainer, ObjectF, ControlLabel, onChangeEvent, Form, ComplexForm) {
        /**
         * @type {ModelProperty}
         */
        const ModelProperty = Model[prop];
        let InputControl;
        ModelProperty.require = ModelProperty.require ?? true;
        /**@type {Boolean} */
        // @ts-ignore
        let { require, disabled } = await this.buildDataForm(ModelProperty, ObjectF);
        const actionFunction = ModelProperty.action ?? null;
        ObjectF[prop] = ObjectF[prop] ?? ModelProperty.defaultValue;
        switch (ModelProperty.type?.toUpperCase()) {
            case "TITLE":
                require = false;
                ModelProperty.require = false;
                ObjectF[prop] = undefined;
                ControlLabel.className += " formHeader";
                ControlLabel.innerHTML = ModelProperty.label ?? "";
                ControlContainer.classList.add("titleContainer");
                InputControl = WRender.CreateStringNode("<span/>");
                Form.appendChild(ControlContainer);
                break;
            case "IMG": case "IMAGE": case "IMAGES":
                const Multiple = ModelProperty.type.toUpperCase() == "IMAGES" ? true : false;
                InputControl = this.CreateImageControl(val, ControlContainer, prop, Multiple, onChangeEvent);
                if (disabled) {
                    InputControl.style.pointerEvents = "none";
                }
                if (Multiple) {
                    ObjectF[prop] = ImageArray;
                }
                ControlContainer.className += " imgPhoto";
                Form.appendChild(ControlContainer);
                break;
            case "IMAGECAPTURE":
                const { WImageCapture } = await import('./WImageCapture.js');
                InputControl = new WImageCapture({
                    value: ObjectF[prop],
                    action: (image) => {
                        console.log(image);
                        ObjectF[prop] = image;
                    }
                });
                if (disabled) {
                    InputControl.style.pointerEvents = "none";
                }
                ControlContainer.className += " imgPhoto";
                Form.appendChild(ControlContainer);
                break;
            case "DATE": case "FECHA": case "DATETIME":
                let type = "date";
                let date_val = val == "" ? //@ts-ignore 
                    (ModelProperty.type.toUpperCase() == "DATETIME" ? new Date().toISOString() : new Date().toISO())
                    : ObjectF[prop];
                let defaulMin = '1900-01-01';
                let defaulMax = '3000-01-01';
                if (ModelProperty.type.toUpperCase() == "DATETIME") {
                    type = "datetime-local";
                    defaulMin = '1900-01-01T00:00';
                    defaulMax = '3000-01-01T23:59';
                }
                //console.log(date_val);
                InputControl = WRender.Create({
                    tagName: "input",
                    //id: "ControlValue" + prop,
                    className: prop, type: type,
                    placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    disabled: disabled,
                    //min: ModelProperty.min ?? defaulMin,
                    //max: ModelProperty.max ?? defaulMax,
                    onchange: onChangeEvent
                });

                if (ModelProperty.type.toUpperCase() == "DATETIME") {
                    ObjectF[prop] = date_val.length > 16 ? date_val.slice(0, -8) : date_val
                    // @ts-ignore
                    InputControl.value = ObjectF[prop];

                } else {
                    //@ts-ignore
                    InputControl.value = ObjectF[prop] = (new Date(date_val)).toISO();
                }
                Form.appendChild(ControlContainer);
                break;
            case "HORA":
                //@ts-ignore
                let time_val = val == "" ? "08:00" : ObjectF[prop];
                InputControl = WRender.Create({
                    tagName: "input", className: prop, type: "time",
                    placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    disabled: disabled,
                    min: ModelProperty.min,
                    max: ModelProperty.max,
                    onchange: onChangeEvent
                });
                //@ts-ignore
                ObjectF[prop] = InputControl.value = time_val;
                Form.appendChild(ControlContainer);
                break;
            case "SELECT":
                InputControl = this.CreateSelect(prop, ObjectF, ModelProperty.Dataset, onChangeEvent);
                InputControl.disabled = disabled ?? false;
                ObjectF[prop] = InputControl.value;

                Form.appendChild(ControlContainer);
                break;
            case "OPERATION":
                val = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
                InputControl = WRender.Create({
                    tagName: "label",
                    className: prop + " input",
                    innerText: val
                });
                Form.appendChild(ControlContainer);
                break;
            case "WSELECT": case "WRADIO":
                ObjectF[prop] = ObjectF[prop]?.__proto__ == Object.prototype ? ObjectF[prop] : null;
                if (ModelProperty.ModelObject?.__proto__ == Function.prototype) {
                    ModelProperty.ModelObject = await WArrayF.isModelFromFunction(Model, prop);
                    /**@type {EntityClass} */
                    const entity = ModelProperty.EntityModel ?? ModelProperty.ModelObject;
                    if (ModelProperty.Dataset == undefined) {
                        if (this.Config.ParentEntity != undefined && ModelProperty.SelfChargeDataset) {
                            ModelProperty.Dataset = this.Config.ParentEntity[ModelProperty.SelfChargeDataset] ?? [];
                        } else {
                            ModelProperty.Dataset = await entity.Get();
                        }
                    }

                }
                if ((ObjectF[prop] == null || ObjectF[prop] == undefined) && require != false &&
                    ModelProperty.Dataset &&
                    ModelProperty.Dataset?.length > 0) {
                    ObjectF[prop] = ModelProperty?.Dataset[0];
                }
                val = ObjectF[prop];
                const DataseFilter = this.CreateDatasetForMultiSelect(Model, prop);
                InputControl = await this.CreateWSelect(InputControl, DataseFilter, prop, ObjectF, Model);
                if (disabled) {
                    InputControl.style.pointerEvents = "none";
                }
                this.FindObjectMultiselect(val, InputControl);
                Form.appendChild(ControlContainer);
                break;
            case "MULTISELECT": case "WCHECKBOX":
                if (ModelProperty.ModelObject?.__proto__ == Function.prototype) {
                    ModelProperty.ModelObject = await WArrayF.isModelFromFunction(Model, prop);
                    ModelProperty.Dataset = await ModelProperty.ModelObject.Get();
                }
                const { MultiSelect } = await import("./WMultiSelect.js");
                const Datasetilt = this.CreateDatasetForMultiSelect(Model, prop);
                InputControl = new MultiSelect({
                    AddObject: ModelProperty.type?.toUpperCase() != "WCHECKBOX" && this.Config.WSelectAddObject,
                    Mode: ModelProperty.type?.toUpperCase() == "WCHECKBOX" ? "SELECT_BOX" : "SELECT",
                    FullDetail: ModelProperty.type?.toUpperCase() != "WCHECKBOX",
                    action: (selecteds) => {
                        if (ModelProperty.action) {
                            ModelProperty.action(ObjectF, this, InputControl, prop)
                        }
                    }, Dataset: Datasetilt, ModelObject: ModelProperty.ModelObject
                });
                if (disabled) {
                    InputControl.style.pointerEvents = "none";
                }
                this.FindObjectMultiselect(val, InputControl);
                ObjectF[prop] = InputControl.selectedItems;
                Form.appendChild(ControlContainer);
                break;
            case "EMAIL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: ModelProperty.type,
                    placeholder: "Ejem.: me@email.com",
                    pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$",
                    onchange: disabled ? undefined : onChangeEvent,
                    disabled: disabled
                });
                Form.appendChild(ControlContainer);
                break;
            case "TEL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: ModelProperty.type,
                    placeholder: "Ejem.: 88888888",
                    //pattern: "[+]{1}[0-9]{2,3}[-]{1}[0-9]{3,4}[0-9]{4,5}",
                    pattern: "[0-9]{4}[0-9]{4}",
                    onchange: disabled ? undefined : onChangeEvent,
                    disabled: disabled
                });
                Form.appendChild(ControlContainer);
                break;
            case "URL":
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop, value: val, type: ModelProperty.type,
                    placeholder: "Ejem.: https://site.com",
                    pattern: "https?://.+",
                    onchange: disabled ? undefined : onChangeEvent,
                    disabled: disabled
                });
                Form.appendChild(ControlContainer);
                break;
            case "MASTERDETAIL":
                const masterDetailModel = await WArrayF.isModelFromFunction(Model, prop);
                const { WTableComponent } = await import('./WTableComponent.js');
                ControlLabel.className += " formHeader";
                ControlContainer.classList.add("tableContainer");
                ObjectF[prop] = ObjectF[prop] != "" && ObjectF[prop] != undefined && ObjectF[prop] != null && ObjectF[prop].__proto__ == Array.prototype ?
                    ObjectF[prop] :// this.CreateProxy(Model, ObjectF[prop]) :
                    [];// this.CreateProxy(Model, []);
                InputControl = new WTableComponent({
                    Dataset: ObjectF[prop],
                    AddItemsFromApi: false,
                    ModelObject: masterDetailModel,
                    //ParentModel: Model,
                    ParentEntity: ObjectF,
                    ImageUrlPath: this.Config.ImageUrlPath,
                    Options: {
                        Add: ModelProperty.Options?.Add ?? true,
                        Edit: ModelProperty.Options?.Edit ?? true,
                        Delete: ModelProperty.Options?.Delete ?? true,
                        Search: ModelProperty.Options?.Search ?? true,
                        AddAction: () => {
                            if (ModelProperty.action) {
                                ModelProperty.action(ObjectF, this, InputControl, prop)
                            }
                            this.SetOperationValues(Model)
                        },
                        EditAction: () => {
                            if (ModelProperty.action) {
                                ModelProperty.action(ObjectF, this, InputControl, prop)
                            }
                            this.SetOperationValues(Model)
                        },
                        DeleteAction: () => {
                            if (ModelProperty.action) {
                                ModelProperty.action(ObjectF, this, InputControl, prop)
                            }
                            this.SetOperationValues(Model)
                        },
                        SelectAction: () => {
                            if (ModelProperty.action) {
                                ModelProperty.action(ObjectF, this, InputControl, prop)
                            }
                            this.SetOperationValues(Model)
                        }
                    }
                });
                if (disabled) {
                    InputControl.style.pointerEvents = "none";
                }
                ComplexForm.appendChild(ControlContainer);
                break;
            case "MODEL":
                ControlLabel.className += " formHeader";
                ControlContainer.classList.add("tableContainer");
                ObjectF[prop] = ObjectF[prop] == ""
                    || ObjectF[prop] == undefined
                    || ObjectF[prop] == null
                    ? {} : ObjectF[prop];
                InputControl = new WForm({
                    StyleForm: this.StyleForm,
                    EditObject: ObjectF[prop],
                    limit: this.limit,
                    DivColumns: this.DivColumns,
                    ModelObject: await WArrayF.isModelFromFunction(Model, prop),
                    Options: false
                });
                if (disabled) {
                    InputControl.style.pointerEvents = "none";
                }
                Form.appendChild(ControlContainer);
                break;
            case "FILE":
                InputControl = WRender.Create({
                    tagName: "input", className: prop, value: val, type: ModelProperty.type,
                    style: { display: "none" },
                    placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    onchange: disabled ? undefined : onChangeEvent,
                    disabled: disabled
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
                            disabled: disabled
                        }), label
                    ]
                })
                ControlContainer.append(content);
                ControlContainer.className += " file";
                // @ts-ignore
                if (ModelProperty.fileType) InputControl.accept = ModelProperty.fileType.map(x => "." + x).join(",")
                Form.appendChild(ControlContainer);
                break;
            case "RADIO":
                //ControlContainer.className += " radioCheckedControl";
                ControlLabel.htmlFor = "ControlValue" + prop;
                ControlLabel.className += " radioCheckedLabel";
                InputControl = WRender.Create({
                    className: "radio-group-container",
                    id: "ControlValue" + prop,
                    children: ModelProperty.Dataset?.map((radioElement, index) => {
                        if ((val == null || val == "" || val == undefined) && index == 0) {
                            val = radioElement;
                            ObjectF[prop] = val;
                        }
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
                                    onchange: disabled ? undefined : onChangeEvent,
                                    type: ModelProperty.type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                                    disabled: disabled
                                }
                            ]
                        })
                    })
                });
                Form.appendChild(ControlContainer);
                break;
            case "CHECKBOX":
                //val = val == "" &&  ModelProperty.defaultValue != undefined ? ModelProperty.defaultValue : val;
                ObjectF[prop] = typeof val === "boolean" ? val : false;
                ControlContainer.className += " radioCheckedControl";
                ControlLabel.htmlFor = "ControlValue" + prop;
                ControlLabel.className += " radioCheckedLabel";
                InputControl = WRender.Create({
                    tagName: "input",
                    id: "ControlValue" + prop,
                    className: prop,
                    value: ObjectF[prop],
                    // @ts-ignore
                    checked: typeof val === "boolean" ? val : false,
                    onchange: disabled ? undefined : onChangeEvent,
                    type: ModelProperty.type, placeholder: WArrayF.Capitalize(WOrtograficValidation.es(prop)),
                    disabled: disabled
                });
                Form.appendChild(ControlContainer);
                break;
            case "DRAW":
                InputControl = this.createDrawComponent(InputControl, prop, ControlContainer, ObjectF); Form.appendChild(ControlContainer);
                break;
            case "TEXTAREA":
                ControlContainer.classList.add("textAreaContainer");
                ControlContainer.style.height = "auto";
                InputControl = WRender.Create({
                    tagName: "textarea", style: { height: "calc(100% - 12px)", borderRadius: "10px" },
                    className: prop, value: val, onchange: disabled ? undefined : onChangeEvent,
                    disabled: disabled
                });
                Form.appendChild(ControlContainer);
                break;
            case "RICHTEXT":
                const { WRichText } = await import('./WRichText.js');
                ControlContainer.classList.add("textAreaContainer");
                ControlContainer.style.height = "auto";
                InputControl = new WRichText({
                    value: val,
                    activeAttached: false,
                    action: (value) => {
                        ObjectF[prop] = value;
                        console.log(ObjectF[prop]);
                    }
                });
                //console.log(InputControl.value.length);
                ObjectF[prop] = InputControl.value;
                Form.appendChild(ControlContainer);
                break;
            case "CALENDAR":
                ObjectF[prop] = ObjectF[prop]?.__proto__ == Array.prototype ? ObjectF[prop] : [];
                ControlContainer.classList.add("tableContainer");
                ControlContainer.style.height = "auto";
                InputControl = await this.createDrawCalendar(InputControl, prop, ControlContainer, ObjectF, Model);
                ComplexForm.appendChild(ControlContainer);
                break;
            case "PASSWORD":
                ControlContainer.classList.add("tableContainer");
                val = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
                const placeholderp = ModelProperty.placeholder ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
                const pass = WRender.Create({
                    tagName: "input", id: "ControlPass1" + prop, className: prop, value: val, disabled: disabled,
                    type: ModelProperty.type, placeholder: placeholderp, onchange: onChangeEvent
                })
                const pass2 = WRender.Create({
                    tagName: "input", id: "ControlPass2" + prop, className: prop, value: val, disabled: disabled,
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
                Form.appendChild(ControlContainer);
                break;
            default:
                val = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
                const placeholder = ModelProperty.placeholder ?? WArrayF.Capitalize(WOrtograficValidation.es(prop));
                InputControl = WRender.Create({
                    tagName: "input",
                    className: prop,
                    value: val,
                    type: ModelProperty.type.toUpperCase() == "MONEY" || ModelProperty.type.toUpperCase() == "PERCENTAGE" ? "number" : ModelProperty.type,
                    min: ModelProperty.min,
                    max: ModelProperty.max,
                    placeholder: placeholder,
                    onchange: disabled ? undefined : onChangeEvent,
                    disabled: disabled
                });
                Form.appendChild(ControlContainer);
                break;
        }
        if (ModelProperty.fieldRequire && val != undefined && val != "") {
            Model[ModelProperty.fieldRequire].require = true;
        }
        if (ModelProperty.pattern) InputControl.pattern = ModelProperty.pattern;
        ControlLabel.innerHTML += require == true ? "*" : "";
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

        InputControl.addEventListener("change", async (ev) => {
            if (!disabled) {
                await onChangeEvent(ev)
                if (actionFunction != null) {
                    actionFunction(ObjectF, this, InputControl, prop)
                }
            }
        });

        return InputControl;
    }
    async buildDataForm(ModelProperty, ObjectF) {
        let require = ModelProperty.require?.__proto__ == Function.prototype
            // @ts-ignore
            || ModelProperty.require?.__proto__.constructor.name == 'AsyncFunction'
            // @ts-ignore
            ? await ModelProperty.require(ObjectF, this)
            : ModelProperty.require;
        /**@type {Boolean} */
        // @ts-ignore
        let disabled = ModelProperty.disabled?.__proto__ == Function.prototype
            // @ts-ignore
            || ModelProperty.disabled?.__proto__.constructor.name == 'AsyncFunction'
            // @ts-ignore
            ? await ModelProperty.disabled(ObjectF, this)
            : ModelProperty.disabled;
        return { require, disabled };
    }

    async createDrawCalendar(InputControl, prop, ControlContainer, ObjectF, Model) {
        const { WCalendarComponent } = await import('./WCalendar.js');
        InputControl = new WCalendarComponent({
            CalendarFunction: Model[prop].CalendarFunction,
            SelectedBlocks: ObjectF[prop],
        });
        return InputControl;
    }
    createDrawComponent(InputControl, prop, ControlContainer, ObjectF) {
        ObjectF[prop]
        var imgBase64 = ObjectF[prop];
        InputControl = WRender.Create({
            tagName: "canvas",
            id: "ControlValue" + prop,
            className: prop + " draw-canvas"
        });
        var img = new Image();
        var ctx = InputControl.getContext("2d");
        if (ObjectF[prop] = !undefined && ObjectF[prop] != null) {
            img.src = imgBase64;
            img.onload = function () {
                // Dibuja la imagen en el canvas
                ctx.drawImage(img, 0, 0);
            };
        }
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
        } else if (val != null && val != undefined && WArrayF.replacer(val)?.__proto__ == Object.prototype) {
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
        const ModelProperty = Model[prop];
        const { MultiSelect } = await import("./WMultiSelect.js");
        InputControl = new MultiSelect({
            MultiSelect: false,
            Mode: ModelProperty.type?.toUpperCase() == "WRADIO" ? "SELECT_BOX" : "SELECT",
            FullDetail: ModelProperty.type?.toUpperCase() != "WRADIO",
            Dataset: Dataset,
            AddObject: ModelProperty.type?.toUpperCase() != "WRADIO" && this.Config.WSelectAddObject,
            ModelObject: this.Config.ModelObject[prop].ModelObject,
            action: (ItemSelects) => {
                ObjectF[prop] = ItemSelects[0].id ?? ItemSelects[0].id_
                    ?? ItemSelects[0];
                /**
                * @type {ModelProperty}
                */
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
     * @param {Function} onChange
     */
    CreateImageControl(InputValue, ControlContainer, prop, Multiple, onChange) {
        const InputControl = WRender.Create({
            tagName: "input", className: prop, onchange: onChange, multiple: Multiple, type: "file", style: {
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
                && typeof this.ImageUrlPath === "string" && this.ImageUrlPath != ""
                && !base64regex.test(InputValue.replace("data:image/png;base64,", ""))) {
                cadenaB64 = this.ImageUrlPath + "/";
            }
            ControlContainer.append(WRender.Create({
                tagName: "img",
                src: cadenaB64 + InputValue,
                class: "imgPhotoWModal",
                id: "imgControl" + prop,
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
                onclick: async (ev) => {
                    try {
                        ev.target.enabled = false
                        await this.Save(ObjectF);
                    } catch (error) {
                        ev.target.enabled = true
                    }
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
                        try {
                            ev.target.enabled = false
                            Action.action(ev.target);
                        } catch (error) {
                            ev.target.enabled = true
                        }
                    }
                }));
            });
        }
        return DivOptions;
    }
    Save = async (ObjectF = this.FormObject) => {
        //console.log(ObjectF);
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
            const ModalCheck = await this.ModalCheck(ObjectF, this.Config.SaveFunction == undefined);
            this.shadowRoot?.append(ModalCheck)
        } else if (this.Config.ModelObject?.SaveWithModel != undefined && this.Config.AutoSave == true) {
            const ModalCheck = await this.ModalCheck(ObjectF, true);
            this.shadowRoot?.append(ModalCheck)
        } else {
            const { LoadinModal } = await import("./LoadinModal.js");
            const loadinModal = new LoadinModal();
            this.shadowRoot?.append(loadinModal);
            await this.Config.SaveFunction(ObjectF);
            loadinModal.close();
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

                    } else if (this.Config.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
                        || this.Config.ModelObject[prop]?.type.toUpperCase() == "CALENDAR") {
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
                    } else if (control != null && control.type?.toString().toUpperCase() == "DATE") {
                        if (new Date(control.value) < new Date(control.min)) {
                            this.createAlertToolTip(control, `El valor mínimo permitido es: ${control.min}`);
                            return false;
                        }
                        if (new Date(control.value) > new Date(control.max)) {
                            this.createAlertToolTip(control, `El valor máximo permitido es: ${control.max}`);
                            return false;
                        }
                    }
                }
            }
        }
        //console.log(JSON.stringify(this.#OriginalObject), JSON.stringify(ObjectF));
        //if (JSON.stringify(this.#OriginalObject) == JSON.stringify(ObjectF)) {
        //this.shadowRoot?.append(ModalMessege("No se han detectado cambios."));
        //return false;
        //}
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
    createInfoToolTip(control, message) {
        if (!control.parentNode.querySelector(".ToolTip")) {
            const toolTip = WRender.Create({
                tagName: "span",
                innerHTML: message,
                className: "ToolTip ToolInfo"
            });
            control.parentNode.append(toolTip);
        }
        WRender.SetStyle(control, {
            boxShadow: "0 0 3px #ef4d00"
        });
        control.focus();
    }

    async ModalCheck(ObjectF, withModel = false) {
        const { LoadinModal } = await import("./LoadinModal.js");
        const modalCheckFunction = async (loadinModal) => {
            try {
                this.shadowRoot?.append(loadinModal);
                if (withModel) {
                    const response = await this.Config.ModelObject?.SaveWithModel(ObjectF, this.Config.EditObject != undefined);
                    await this.ExecuteSaveFunction(ObjectF, response);
                } else if (this.Config.ObjectOptions?.Url != undefined) {
                    const response = await WAjaxTools.PostRequest(this.Config.ObjectOptions?.Url, ObjectF);
                    await this.ExecuteSaveFunction(ObjectF, response);
                }
                loadinModal.close();
                ModalCheck.close();
                // if (this.Config.SaveFunction != undefined) {
                //     console.log("HEARE");
                //     this.Config.SaveFunction(ObjectF);
                // } else if (this.Config.ObjectOptions?.SaveFunction != undefined) {
                //     this.Config.ObjectOptions?.SaveFunction(ObjectF);
                // }
            } catch (error) {
                loadinModal.close();
                ModalCheck.close();
                console.log(error);
                this.shadowRoot?.append(ModalMessege(error));
            }
        }
        const { WModalForm } = await import('./WModalForm.js');
        const ModalCheck = new WModalForm({
            ObjectModal: WRender.Create({
                tagName: "div", children: [
                    { tagName: "h3", innerText: "¿Esta seguro que desea guardar este registro?" },
                    {
                        style: { textAlign: "center" },
                        children: [{
                            tagName: 'input', type: 'button', className: 'Btn', value: 'SI', onclick: async (ev) => {
                                ev.target.enabled = false;
                                const loadinModal = new LoadinModal();
                                ModalCheck.shadowRoot?.append(loadinModal);
                                modalCheckFunction(loadinModal);
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
    async ExecuteSaveFunction(ObjectF, response) {
        if (this.Config.SaveFunction != undefined) {
            await this.Config.SaveFunction(ObjectF, response);
        } else if (this.Config.ObjectOptions?.SaveFunction != undefined) {
            await this.Config.ObjectOptions?.SaveFunction(ObjectF, response);
        }
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
                fileBase64 = e.target?.result?.split("base64,")[1];
            }
            reader.readAsDataURL(value);
        }
    }
    FormStyle = () => {
        let style = WFormStyle.cloneNode(true);
        const wstyle = new WStyledRender({
            ClassList: [
                new WCssClass(`.divForm`, {
                    "grid-template-columns": this.DivColumns
                }), new WCssClass(` .divForm .imageGridForm, .divForm .tableContainer,
                 .divForm .textAreaContainer, .divForm .titleContainer, .imgPhoto`, {
                    "grid-column": `span  ${this.limit}`,
                    "padding-bottom": 10
                })
            ]
        })
        return WRender.Create({ style: { display: "none" }, children: [style, wstyle] });
    }
}
const ModalVericateAction = (Action, title, withClose = true) => {
    const ModalCheck = new WSimpleModalForm({
        title: "AVISO",
        CloseOption: false,
        ObjectModal: [
            WRender.Create({ tagName: "h3", innerText: title ?? "¿Esta seguro que desea guardar este registro?" }),
            WRender.Create({
                style: { justifyContent: "center", display: "flex" },
                children: [
                    WRender.Create({
                        tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async () => {
                            await Action();
                            ModalCheck.close();
                        }
                    }), withClose ? WRender.Create({
                        tagName: 'input', type: 'button', className: 'Btn', value: 'CANCELAR', onclick: async () => {
                            ModalCheck.close();
                        }
                    }) : ""
                ]
            })
        ]
    });
    return ModalCheck;
}
const ModalMessege = (message, detail = "", reload = false) => {
    const ModalCheck = new WSimpleModalForm({
        title: message,
        CloseOption: false,
        ObjectModal: [WRender.Create({ tagName: 'p', class: "modalP", innerText: detail }), WRender.Create({
            style: { textAlign: "center" },
            children: [WRender.Create({
                tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async () => {
                    ModalCheck.close();
                    if (reload == true) {
                        window.location.reload();
                    }
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