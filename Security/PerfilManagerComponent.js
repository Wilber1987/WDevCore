
import { Cat_Dependencias, Tbl_Profile } from '../../ModelProyect/ProyectDataBaseModel.js';
import { StylesControlsV2, StylesControlsV3 } from "../StyleModules/WStyleComponents.js";
import { WFilterOptions } from '../WComponents/WFilterControls.js';
import { ModalMessege, ModalVericateAction } from "../WComponents/WForm.js";
import { WModalForm } from "../WComponents/WModalForm.js";
import { WTableComponent } from "../WComponents/WTableComponent.js";
import { ComponentsManager, WRender } from '../WModules/WComponentsTools.js';
import { css } from '../WModules/WStyledRender.js';

const OnLoad = async () => {
    Aside.append(WRender.Create({ tagName: "h3", innerText: "Administración de perfiles" }));
    const AdminPerfil = new PerfilManagerComponent();
    Aside.append(AdminPerfil.MainNav);
    Main.appendChild(AdminPerfil);
}
window.onload = OnLoad;
class PerfilManagerComponent extends HTMLElement {
    /**
        * 
        * @param {Array<Tbl_Profile>} Dataset 
        */
    constructor(Dataset) {
        super();
        Dataset.forEach(d => {
            d.CaseTable_Dependencias_Usuarios = d.CaseTable_Dependencias_Usuarios?.map(dp => dp.Cat_Dependencias);
        });
        this.Dataset = Dataset;
        console.log(this.Dataset);
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.append(this.WStyle, StylesControlsV2.cloneNode(true), StylesControlsV3.cloneNode(true));
        this.TabContainer = WRender.createElement({ type: 'div', props: { class: 'TabContainer', id: "TabContainer" } });
        this.TabManager = new ComponentsManager({ MainContainer: this.TabContainer });
        this.OptionContainer = WRender.Create({ className: "OptionContainer" });
        this.OptionContainer2 = WRender.Create({ className: "OptionContainer" });
        this.ModelObject = new Tbl_Profile({});
        this.Draw();
    }
    connectedCallback() { }
    Draw = async () => {
        this.OptionContainer.append(WRender.Create({ tagName: 'input', type: 'button', className: 'Block-Alert', value: 'Gestión de perfiles', onclick: this.perfilManagerComponent }))
        this.UserActions.forEach(element => {
            this.OptionContainer2.append(WRender.Create({
                tagName: 'input', type: 'button', className: 'Btn',
                value: element.name, onclick: element.action
            }))

        });
        this.shadowRoot.append(this.OptionContainer, this.TabContainer);
        this.perfilManagerComponent();
    }

    perfilManagerComponent = async () => {
        this.mainTable = new WTableComponent({
            Dataset: this.Dataset,
            AddItemsFromApi: false,
            AutoSave: true,
            ModelObject: this.ModelObject, userStyles: [StylesControlsV2],
            Options: {
                MultiSelect: true,
                Show: true,
                Edit: true
            }
        });
        this.FilterOptions = new WFilterOptions({
            Dataset: this.Dataset,
            ModelObject: this.ModelObject,
            FilterFunction: (DFilt) => {
                this.mainTable?.DrawTable(DFilt);
            }
        });
        this.TabManager.NavigateFunction("Tab-perfil-Manager",
            WRender.Create({
                className: "perfilView", children:
                    [this.FilterOptions, this.OptionContainer2, this.mainTable]
            }));
    }
    update = async () => {
        const Dataset = await new Tbl_Profile().Get();
        Dataset.forEach(d => {
            d.CaseTable_Dependencias_Usuarios = d.CaseTable_Dependencias_Usuarios?.map(dp => dp.Cat_Dependencias);
        });
        this.Dataset = Dataset;
        this.mainTable.selectedItems = [];
        this.mainTable?.DrawTable(this.Dataset);
    }
    UserActions = [{
        name: "Asignar a dependencia", action: async (/**@type {CaseTable_Case}*/element) => {
            if (this.mainTable.selectedItems.length <= 0) {
                this.shadowRoot.append(ModalMessege("Seleccione perfiles"));
                return;
            }
            const dependencias = await new Cat_Dependencias().Get();
            const modal = new WModalForm({
                ModelObject: new Tbl_Profile({
                    Nombres: {type: "text", hidden: true},
                    Apellidos: {type: "text", hidden: true},
                    FechaNac: {type: "text", hidden: true},
                    Sexo: {type: "text", hidden: true},
                    Foto: {type: "text", hidden: true},
                    DNI: {type: "text", hidden: true},
                    Correo_institucional: {type: "text", hidden: true},
                    Estado: {type: "text", hidden: true},
                    CaseTable_Dependencias_Usuarios: { type: 'Wselect', ModelObject: () => new Cat_Dependencias() }
                }), ObjectOptions: {
                    SaveFunction: async (profile) => {
                        this.shadowRoot.append(ModalVericateAction(async () => {
                            const response =
                                await new Tbl_Profile().AsignarDependencias(this.mainTable.selectedItems,
                                    profile.CaseTable_Dependencias_Usuarios, profile.CaseTable_Comments);
                            if (response.status == 200) {
                                this.shadowRoot.append(ModalMessege("Asignación Correcta"));
                                this.update();
                            } else {
                                this.shadowRoot.append(ModalMessege("Error"));
                            }
                            modal.close();
                        }, "Esta seguro que desea asignar a esta dependencia"))
                    }
                }
            });
            this.shadowRoot.append(modal);
        }
    }
    ]


    WStyle = css`
        .dashBoardView{
            display: grid;
            grid-template-columns: auto auto ;  
            grid-gap: 20px          
        }
        .OptionContainer {
            margin: 0 0 20px 0;
        }
        .dashBoardView w-colum-chart { 
            grid-column: span 2;
        }
        .actividad {
            border: 1px solid #d9d6d6;
            padding: 15px;
            margin-bottom: 10px;           
            color: #0a2542;
            border-radius: 15px;
        }
        .actividad h4 {
            margin: 5px 0px;
        }
        .actividad .propiedades {
            font-size: 14px;
            display: flex;
            gap: 20px;
        }
        .actividad .options {
            display: flex;
            justify-content: flex-end;            
        }
    `

    mapCaseToPaginatorElement(Dataset) {
        return Dataset.map(actividad => {
            actividad.Dependencia = actividad.Cat_Dependencias.Descripcion;
            //actividad.Progreso = actividad.CaseTable_Tareas?.filter(tarea => tarea.Estado?.includes("Finalizado")).length;
            return this.perfilElement(actividad);
        });
    }
}

customElements.define('w-perfil-manager-component', PerfilManagerComponent);
export { PerfilManagerComponent };


