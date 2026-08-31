//@ts-check
import {EntityClass} from "../../../WDevCore/WModules/EntityClass.js";
import { Cat_Dependencias, Cat_Dependencias_ModelComponent } from "./Cat_Dependencias.js";


class Tbl_Servicios_ModelComponent extends EntityClass {
    /**
     * @param {{ FilterData: { PropName: string; FilterType: string; Values: any; }[]; } | undefined} [props]
     */
    constructor(props) {
        super(props, 'Organization');
        Object.assign(this, props);
    }

    Id_Servicio = {type: 'number', primary: true};
    //Nombre_Proyecto = { type: 'text', label: "Nombre" };
    Descripcion_Servicio = {type: 'text'};
    //Visibilidad = { type: 'text' };
    Estado = {type: "Select", Dataset: ["Activo", "Inactivo"]};
    //Cat_Tipo_Servicio = { type: 'WSelect', hiddenFilter: true, ModelObject: () => new Cat_Tipo_Servicio() };
    Cat_Dependencias = {type: 'WSelect', hiddenFilter: true, ModelObject: () => new Cat_Dependencias_ModelComponent()}
    //Fecha_Inicio = { type: 'date' };
    //Fecha_Finalizacion = { type: 'date' };
    //Tbl_Case = { type: 'MasterDetail', ModelObject: () => new Tbl_Case() };
}

export {Tbl_Servicios_ModelComponent};

class Tbl_Servicios extends EntityClass {
    /** @param {Partial<Tbl_Servicios>} [props] */
    constructor(props) {
        super(props, 'Organization');
        Object.assign(this, props);
    }
    /**@type {Number?}*/ Id_Servicio = null;
    /**@type {String?}*/ Nombre_Servicio = null;
    /**@type {String?}*/ Descripcion_Servicio = null;
    /**@type {String?}*/ Visibilidad = null;
    /**@type {String?}*/ Estado = null;
    /**@type {Date?}*/ Fecha_Inicio = null;
    /**@type {Date?}*/ Fecha_Finalizacion = null;
    /**@type {Number?}*/ Id_Dependencia = null;
    //**@type {Cat_Tipo_Servicio} ManyToOne*/ Cat_Tipo_Servicio;
    /**@type {Cat_Dependencias?} ManyToOne*/ Cat_Dependencias = null;
    //**@type {Array<Tbl_Servicios_Profile>} OneToMany*/ Tbl_Servicios_Profile;
 }
 export { Tbl_Servicios }