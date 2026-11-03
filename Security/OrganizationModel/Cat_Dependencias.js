//@ts-check
import { EntityClass } from "../../../WDevCore/WModules/EntityClass.js";
import { Tbl_Profile } from "./Tbl_Profile.js";
import { Tbl_Servicios } from "./Tbl_Servicios.js";

class Cat_Dependencias_ModelComponent extends EntityClass {
    /**
     * @param {undefined} [props]
     */
    constructor(props) {
        super(props, 'Organization');
        this.NCasos = undefined;
        this.NCasosFinalizados = undefined;
        Object.assign(this, props);
    }

    Id_Dependencia = { type: 'number', primary: true, hiddenFilter: true };
    Descripcion = { type: 'text' };
    Username = { type: 'email' };
    Password = { type: 'text', hiddenInTable: true, require: false, hiddenFilter: true };
    Host = { type: 'text' };
    HostService = { type: 'select', Dataset: ["OUTLOOK", 'GMAIL'], hiddenInTable: true, require: false };
    AutenticationType = {
        type: 'select',
        Dataset: ["AUTH2", "BASIC"],
        hiddenInTable: true,
        require: false,
        hiddenFilter: true
    };
    TENAT = { type: 'text', hiddenInTable: true, require: false, hiddenFilter: true };
    CLIENT = { type: 'text', hiddenInTable: true, require: false, hiddenFilter: true };
    OBJECTID = { type: 'text', hiddenInTable: true, require: false, hiddenFilter: true };
    CLIENT_SECRET = { type: 'text', hiddenInTable: true, require: false, hiddenFilter: true };
    SMTPHOST = { type: 'text', hiddenInTable: true, require: false, hiddenFilter: true };

    //Cat_Dependencia = { type: 'WSelect', hiddenFilter: true, ModelObject: () => new Cat_Dependencias(), require: false };
    Cat_Dependencias_Hijas = {
        type: 'Multiselect',
        hiddenFilter: true,
        ModelObject: () => new Cat_Dependencias_ModelComponent(),
        require: false
    };
    Tbl_Dependencias_Usuarios = {
        type: 'MasterDetail',
        ModelObject: () => new Tbl_Dependencias_Usuarios(),
        require: false
    };
    /** @returns {Promise<Array<Cat_Dependencias>>} */

    GetOwDependencies = async () => {
        return await this.GetData("Proyect/GetOwDependencies");
    }
}

export { Cat_Dependencias_ModelComponent };

class Cat_Dependencias extends EntityClass {
    /** @param {Partial<Cat_Dependencias>} [props] */
    constructor(props) {
        super(props, 'Organization');
        this.NCasos = undefined;
        this.NCasosFinalizados = undefined;
        Object.assign(this, props);
    }
    /**@type {Number?}*/ Id_Dependencia = null;
    /**@type {String?}*/ Descripcion = null;
    /**@type {String?}*/ Username = null;
    /**@type {String?}*/ Password = null;
    /**@type {String?}*/ Host = null;
    /**@type {String?}*/ AutenticationType = null;
    /**@type {String?}*/ TENAT = null;
    /**@type {String?}*/ CLIENT = null;
    /**@type {String?}*/ OBJECTID = null;
    /**@type {String?}*/ CLIENT_SECRET = null;
    /**@type {String?}*/ HostService = null;
    /**@type {String?}*/ SMTPHOST = null;
    /**@type {Boolean?}*/ Default = null;
    /**@type {Array<Cat_Dependencias>} OneToMany*/ Cat_Dependencias = [];
    /**@type {Array<Tbl_Dependencias_Usuarios>} OneToMany*/ Tbl_Dependencias_Usuarios= [];
    /**@type {Array<Tbl_Servicios>} OneToMany*/ Tbl_Servicios= []; 
}
export { Cat_Dependencias }

class Tbl_Dependencias_Usuarios extends EntityClass {
    
    /**
     * @param {Partial<Tbl_Dependencias_Usuarios>} [props]
     */
    constructor(props) {
        super(props, 'Organization');
        Object.assign(this, props);
    }
    Tbl_Profile = { type: 'WSelect', hiddenFilter: true, ModelObject: () => new Tbl_Profile() }
    Cat_Cargos_Dependencias = { type: 'WSelect', hiddenFilter: true, ModelObject: () => new Cat_Cargos_Dependencias_ModelComponent() }
}
export { Tbl_Dependencias_Usuarios }

class Cat_Cargos_Dependencias_ModelComponent extends EntityClass {
     /**
     * @param {Partial<Cat_Cargos_Dependencias_ModelComponent>} [props]
     */
    constructor(props) {
        super(props, 'Organization');
        Object.assign(this, props);
    }
    IdCargo = {type: 'number', primary: true};
    Descripcion = {type: 'text'};
}

export {Cat_Cargos_Dependencias_ModelComponent};