//@ts-check
import { StyleScrolls, StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { EntityClass } from '../WModules/EntityClass.js';
import { html, WRender } from '../WModules/WComponentsTools.js';
import { WOrtograficValidation } from '../WModules/WOrtograficValidation.js';
import { css } from '../WModules/WStyledRender.js';
import { ModelPropertyFormBuilder } from '../ComponentsBuilders/ModelPropertyFormBuilder.js';
// @ts-ignore
import { ModelProperty } from '../WModules/CommonModel.js';
import { WAjaxTools } from "../WModules/WAjaxTools.js";
import { WArrayF } from "../WModules/WArrayF.js";
import { WFormStyle } from './ComponentsStyles/WFormStyle.mjs';
import { GroupComponent } from './FormComponents/GroupComponent.js';
import { ModalMessage } from './ModalMessage.js';
import { ModalVericateAction } from './ModalVericateAction.js';
import { WAlertMessage } from "./WAlertMessage.js";

/**
 * @typedef {Object} FormConfig 
	* @property {Object} [EditObject] obejto que se esta editando en caso de ser null crea un objeto interno al que le agrega las propiedades
	* @property {Array<{Name:string, WithAcordeon?: Boolean, Propertys:string[]}>} [Groups] arreglo de objetos que contienen el nombre del grupo y las propiedades que contiene esto es para separar las propiedades en contenedores separados
	* @property {Object} [ParentModel] objejeto que contiene al objeto modelo del padre del que se esta editando
	* @property {Object} [ParentEntity] objeto que contiene al objeto padre del que se esta editando
	* @property {Array<{ name:string, action: (EditingObject)=> {}}>} [UserActions] acciones personalizadas que se pueden agregar al formulario, estas se representan como botones adicionales
	* @property {Object} [ModelObject] objeto que contiene las propiedades del modelo que se va a editar
	* @property {Object} [EntityModel] objeto que contiene el modelo de la entidad que se esta editando
	* @property {Boolean} [AutoSave] indica si el formulario se guarda automaticamente y debe hacer una peticion ajax a los metodos entity del modelo ejemplo Save o Update
	* @property {Boolean} [WSelectAddObject] indica si el formulario permitira que un control wselect podra agregar un objeto nuevo
	* @property {Boolean} [DataRequire]  indica si los datos son requeridos   
	* @property {String} [Title]  titulo del formulario
	* @property {String} [StyleForm] - columnX1 | columnX3 | columnX3   
	* @property {String} [DivColumns] - columnX1 | columnX3 | columnX3 
	* @property {Number} [limit]  limite de columnas que se mostraran en el formulario
	* @property {Boolean} [Options] indica si se muestran las opciones de guardar
	* @property {import('../WModules/CommonModel.js').ObjectOptions} [ObjectOptions]
	* @property {String} [ImageUrlPath] ruta base de las imagenes, esto en caso que las propiedades marcadas como imagenes no poseen el http o https cuando no son base64
	* @property {Function} [SaveFunction] funcion que se ejecuta al guardar el formulario, esta es independiente del autosave y se ejecuta de forma posterior recuperando el response
	* @property {Function} [ValidateFunction] funcion de validacion del formulario, esta funcion debe retornar un objeto con la propiedad validate y un mensaje de error
	* @property {Function} [ProxyAction] funcion que se ejecuta al cambiar un valor en el formulario
	* @property {HTMLStyleElement} [CustomStyle] estilo personalizado que se agregara al formulario, dado que este componente posee un shadowRoot se puede agregar estilos personalizados 
**/
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
		this.Config = Config;
		this.Controls = {};

		this.DivForm = WRender.Create({ class: "ContainerFormWModal" });
		this.DivFormOptions = WRender.Create({ class: "ContainerFormWModal" });
		this.shadowRoot?.append(StyleScrolls.cloneNode(true));
		this.shadowRoot?.append(StylesControlsV2.cloneNode(true));

		this.InizializeConfig(this.Config);
		this.shadowRoot?.append(WRender.createElement(this.FormStyle()));
		if (this.Config.CustomStyle) {
			this.shadowRoot?.append(this.Config.CustomStyle);
		}
		this.shadowRoot?.append(this.DivForm, this.DivFormOptions);
		//**@type {Array<GroupComponent>} */
		//GroupsForm = [];

		this.ExistChange = false;
		this.ObjectProxy = this.ObjectProxy ?? undefined;
		this.OptionsActive = false;
		this.DrawComponent();
	}
	InizializeConfig(Config) {
		if (this.IsInizialized == true) {
			return;
		}
		for (const p in Config) {
			this[p] = Config[p];
		}

		this.ModelObject = this.Config.ModelObject;
		this.ImageUrlPath = Config.ImageUrlPath;
		this.Options = this.Options ?? true;
		this.DataRequire = this.DataRequire ?? true;
		this.StyleForm = this.Config.StyleForm;
		if (!this.limit && !this.DivColumns) {
			const props = Object.keys(this.ModelObject).filter(prop => !this.isNotDrawable(this.ModelObject, prop));
			if (props.length < 5) {
				this.limit = 1;
				this.DivColumns = "calc(100% - 20px)";
			} else {
				this.limit = this.Config.limit ?? 2;
				this.DivColumns = "calc(50% - 10px)  calc(50% - 10px)";
			}
		} else if (this.limit && !this.DivColumns) {
			this.limit = this.Config.limit ?? 2;
			this.DivColumns = `repeat(${this.limit}, 1fr)`;
		} else if (!this.limit && this.DivColumns) {
			this.limit = 2;
			this.DivColumns = this.Config.DivColumns;
		}
		this.DarkMode = this.DarkMode ?? false;
		if (this.Config.ObjectOptions == undefined) {
			this.Config.ObjectOptions = {
				AddObject: false,
				Url: undefined
			};
		}

		this.FormObject = this.FormObject ?? this.Config.EditObject ?? {};
		if (Config == undefined || Config == null || Object.keys(Config).length == 0) {
			this.IsInizialized = true;
		}
	}

	connectedCallback() {
		//this.InizializeConfig(this.Config);
		if (this.IsInizialized == true) {
			//this.DrawComponent();
		}
		this.CreateOriginalObject();
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
		const Model = this.Config.ModelObject ?? this.Config.EditObject;
		const ObjectProxy = this.CreateProxy(Model);
		this.DivForm.innerHTML = ""; //AGREGA FORMULARIO CRUD A LA VISTA
		await this.CrudForm(ObjectProxy);
		if (this.Options == true && !this.OptionsActive) {
			this.OptionsActive = true;
			this.DivFormOptions.appendChild(await this.SaveOptions(ObjectProxy));

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
				if (!["IMG", "FILE", "DATE", "DATETIME"].includes(Model[property]?.type?.toUpperCase())) {
					const control = this.shadowRoot?.querySelector("#ControlValue" + property);
					if (control) {
						// @ts-ignore
						control.value = target[property];
						/**@type {ModelProperty} */ const modelProperty = Model[property];
						if (modelProperty) {
							// @ts-ignore
							control.max = modelProperty.max ?? control.max;
							// @ts-ignore
							control.min = modelProperty.min ?? control.min;
						}
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
	*/
	CrudForm = async (ObjectF = {}) => {
		//GroupsForm.length = 0;
		//verifica que el modelo existe,
		//sino es asi le asigna el valor de un objeto existente
		const Model = this.Config.ModelObject ?? this.Config.EditObject;
		const Form = new GroupComponent({ Name: this.Config.Title ?? undefined });
		const GroupsForm = [Form];
		this.Config.Groups?.forEach(group => {
			// Crear el contenedor principal del grupo
			const groupContainer = new GroupComponent(group);
			// Agregar el grupo al arreglo GroupsForm
			GroupsForm?.push(groupContainer);
		});
		GroupsForm.forEach(DivForm => {
			this.DivForm?.append(DivForm);
		});
		//const ModelComplexElements = Object.keys(this.Config.ModelObject).filter(o => this.Config.ModelObject[o]?.type?.toUpperCase() == "MASTERDETAIL"
		//	|| this.Config.ModelObject[o]?.type?.toUpperCase() == "CALENDAR")

		//const ComplexForm = WRender.Create({ className: 'divComplexForm', style: ModelComplexElements.length <= 1 ? "grid-template-columns: unset" : "" });

		for (const prop in Model) {
			const DivForm = this.DefineContainer(prop, GroupsForm);
			try {
				Model[prop] = Model[prop] != null ? Model[prop] : undefined;
				if (this.isNotDrawable(Model, prop)) {
					if (!this.isMethod(Model, prop)) {
						ObjectF[prop] = ObjectF[prop] ?? Model[prop]?.value ?? undefined;
					}
				} else {
					//ObjectF[prop] = val;
					const onChangeEvent = async (ev) => {
						//console.log(ev);
						/**
						 * @type {HTMLInputElement}
						 */
						const targetControl = ev?.target
						/**
						* @type {HTMLInputElement}
						*/
						const currentTarget = ev?.currentTarget

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
					const ControlContainer = WRender.Create({ class: "ModalElement" });
					if (Model[prop] != undefined && Model[prop].__proto__ == Object.prototype) {
						ControlLabel.innerHTML = Model[prop].label ?? WOrtograficValidation.es(prop) + (Model[prop].require == false ? "" : "*");
						await this.CreateModelControl(Model, prop, ControlContainer, ObjectF, ControlLabel, onChangeEvent, DivForm);
						//console.trace();
						//console.log(DivForm.nodesList);
						//ControlContainer.append(InputControl);
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
	}

	/**
	 * @param {string} prop
	*  @param {Array<GroupComponent>} GroupsForm
	 * @returns {GroupComponent}
	 */
	DefineContainer(prop, GroupsForm) {
		/** @type {GroupComponent} */
		let div = GroupsForm[0];
		// Buscar si la propiedad está en algún grupo
		for (const group of /** @type {Array<{Name: string, Propertys: string[]}>} */ (this.Config.Groups ?? [])) {
			if (group.Propertys.includes(prop)) {
				div = /** @type {GroupComponent} */ (GroupsForm?.find(d => d.className?.includes(group.Name?.replaceAll(" ", ""))));
				break;
			}
		}
		return div;
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
	 * @param {Object} Model
	 * @param {String} prop
	 * @param {HTMLElement} ControlContainer
	 * @param {Object} ObjectF
	 * @param {HTMLLabelElement} ControlLabel
	 * @param {Function} onChangeEvent
	 * @param {GroupComponent} Form
	 */
	async CreateModelControl(Model, prop, ControlContainer, ObjectF, ControlLabel, onChangeEvent, Form) {
		/**
		 * @type {ModelProperty}
		 */
		const ModelProperty = Model[prop];
		const actionFunction = ModelProperty.action ?? null;
		ObjectF[prop] = ObjectF[prop];
		let addLabel = true;

		const onchangeListener = async (ev) => {
			// @ts-ignore
			if (!ModelProperty.disabled) {
				if (ev) {
					await onChangeEvent(ev)
				}
				if (actionFunction != null) {
					actionFunction(ObjectF, this, this.Controls[prop], prop)
				}
				//console.log(ObjectF);
			}
		}
		switch (ModelProperty.type?.toUpperCase()) {
			case "TITLE":
				addLabel = false;
				this.Controls[prop] = html`<h3>${ModelProperty.label ?? WOrtograficValidation.es(prop)}</h3>`;
				break;
			case "IMG": case "IMAGES": case "IMAGE": case "FILE": case "FILES":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateFileInput(ModelProperty,
					ObjectF, prop, onchangeListener);
				break;
			case "SELECT":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateSelect(ModelProperty,
					ObjectF, prop, onchangeListener);
				break;
			case "MASTERDETAIL":  case "WGRIDSELECT":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateTable(ModelProperty,
					ObjectF, prop, this.Config?.ImageUrlPath ?? "", onchangeListener);
				break;
			case "MULTISELECT": case "WCHECKBOX": case "WSELECT": 
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateWSelect(ModelProperty,
					ObjectF, prop, onchangeListener);
				break;
			case "TEXTAREA":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateTextArea(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "RICHTEXT":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateRichText(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "CHECKBOX":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateCheckBox(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "RADIO":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateRadioGroups(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "DRAW":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateDraw(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "PASSWORD":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreatePassword(
					ModelProperty, ObjectF, prop, onchangeListener, this.createAlertToolTip)
				break;
			case "CALENDAR":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateCalendar(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
			case "OPERATION":
				ObjectF[prop] = ObjectF[prop] ?? ModelProperty.defaultValue ?? "";
				this.Controls[prop] = WRender.Create({
					tagName: "label",
					className: prop + " input",
					innerText: ObjectF[prop]
				});
				break;
			case "MODEL":
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateModel(
					ModelProperty, ObjectF, prop, this)
				break;
			default:
				this.Controls[prop] = await ModelPropertyFormBuilder.CreateInput(
					ModelProperty, ObjectF, prop, onchangeListener)
				break;
		}
		ControlContainer.classList.add(ModelProperty.type?.toUpperCase())
		if (addLabel) {
			ControlContainer.append(ControlLabel);
		}
		ControlContainer.append(this.Controls[prop])
		Form.Add(ControlContainer);
	}

	SaveOptions(ObjectF = {}) {
		ObjectF = this.ObjectProxy ?? ObjectF;
		const DivOptions = WRender.Create({ class: "DivSaveOptions" });
		if (this.Config.ObjectOptions != undefined) {
			const InputSave = WRender.Create({
				tagName: 'button',
				class: 'Btn',
				type: "button",
				innerText: 'GUARDAR',
				onclick: async (ev) => {
					try {
						ev.target.enabled = false
						const response = await this.Save(ObjectF);
						
					} catch (error) {
						ev.target.enabled = true
					}
				}
			});
			DivOptions.append(InputSave);
		}

		this.Config.UserActions?.forEach((Action) => {
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

		return DivOptions;
	}
	Save = async (ObjectF = this.FormObject) => {
		try {
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
		} catch (error) {
			console.log(error);

		}

	}
	Validate = (ObjectF = this.FormObject) => {
		if (this.DataRequire == true) {
			for (const prop in ObjectF) {
				if (!prop.includes("_hidden") && this.Config.ModelObject[prop]?.require
					&& this.Config.ModelObject[prop]?.hidden != true) {
					/**
					 * @type {?HTMLInputElement | undefined | any}
					 */
					const control = this.Controls[prop];
					//const control = this.DivForm?.querySelector("#ControlValue" + prop);
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
							this.Config.ModelObject[prop].min = this.Config.ModelObject[prop]?.min ?? 1;
						}
						if (this.Config.ModelObject[prop]?.max
							&& ObjectF[prop].length > this.Config.ModelObject[prop]?.max) {
							this.createAlertToolTip(control, `El máximo de registros permitidos es `
								+ this.Config.ModelObject[prop]?.max);
							return false;
						}
						if (this.Config.ModelObject[prop]?.min
							&& ObjectF[prop].length < this.Config.ModelObject[prop]?.min) {
							this.createAlertToolTip(control, `El mínimo de registros permitidos es `
								+ this.Config.ModelObject[prop]?.min);
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
		return true;
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
		await ModelPropertyFormBuilder.OnChange(targetControl, currentTarget, ObjectF, prop, Model);
		if (Model[prop].fieldRequire) {
			this.shadowRoot?.querySelector(".label_" + Model[prop].fieldRequire)?.append("*")
			Model[Model[prop].fieldRequire].require = true;
		}
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
		ModelPropertyFormBuilder.CreateInfoToolTip(control, message);
	}

	async ModalCheck(ObjectF, withModel = false) {
		const { LoadinModal } = await import("./LoadinModal.js");
		const modalCheckFunction = async (loadinModal) => {
			try {
				this.shadowRoot?.append(loadinModal);
				if (withModel) {
					const response = await this.Config.ModelObject?.SaveWithModel(ObjectF, this.Config.EditObject != undefined);
					if (response.status != 200 && response.message) {
						loadinModal.close();
						ModalCheck.close();
						WAlertMessage.Danger(response.message)
						return;
					} if (response.status == 200 && response.message) {
						WAlertMessage.Success(response.message)
					}
					await this.ExecuteSaveFunction(ObjectF, response);
				} else if (this.Config.ObjectOptions?.Url != undefined) {
					const response = await WAjaxTools.PostRequest(this.Config.ObjectOptions?.Url, ObjectF);
					if (response.status == 500 && response.message) {
						loadinModal.close();
						ModalCheck.close();
						this.shadowRoot?.append(ModalMessage(response.message))
						return;
					}
					if (response.status == 200 && response.message) {						
						this.shadowRoot?.append(ModalMessage(response.message))
					}
					await this.ExecuteSaveFunction(ObjectF, response);
				}
				loadinModal.close();
				ModalCheck.close();
			} catch (error) {
				loadinModal.close();
				ModalCheck.close();
				console.log(error);
				this.shadowRoot?.append(ModalMessage(error));
			}
		}
		const ModalCheck = ModalVericateAction(async (ev) => {
			ev.target.enabled = false;
			const loadinModal = new LoadinModal();
			ModalCheck.shadowRoot?.append(loadinModal);
			modalCheckFunction(loadinModal);
		}, "¿Esta seguro que desea guardar este registro?")

		return ModalCheck;
	}
	async ExecuteSaveFunction(ObjectF, response) {
		if (this.Config.SaveFunction != undefined) {
			await this.Config.SaveFunction(ObjectF, response, this);
		}
	}

	FormStyle = () => {
		let style = WFormStyle.cloneNode(true);

		const wstyle = css`
			.divForm, .group-container {
				grid-template-columns: ${this.DivColumns};
			}
			.IMG,
			.IMAGES,
			.IMAGE,
			.FILE,
			.FILES,
			.MASTERDETAIL,			
			.RICHTEXT,
			.DRAW,
			.CALENDAR, .WGRIDSELECT {
				grid-column: span  ${this.limit};
				padding-bottom: 10px;
			}
			.TEXTAREA, .PASSWORD, .MODEL {
				grid-column: span  ${(this.limit ?? 1) > 1 ? this.limit : 1};
			}
		`;
		return WRender.Create({ style: { display: "none" }, children: [style, wstyle] });
	}
}
customElements.define('w-form', WForm);
export { WForm };