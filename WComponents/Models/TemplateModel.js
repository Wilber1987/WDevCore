//@ts-check

import { Tbl_Profiles_Model_ModelComponent } from "../../../Admin/Security/Model/Tbl_Profile_Model.js";
// @ts-ignore
import { ModelProperty } from "../../WModules/CommonModel.js";
import { EntityClass } from "../../WModules/EntityClass.js";
import { DateTime } from "../../WModules/Types/DateTime.js";

//#region DEFINICION DE TIPOS
export class TemplateData extends EntityClass {
    /** @param {Partial<TemplateData>} [props] */
    constructor(props) {
        super(props, 'DocumentsData');
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {Number?} */ Id_Template = null;
    /**@type {String?} */ Descripcion = null;
    /**@type {DateTime?} */ Fecha = null;
    /**@type {DateTime?} */ UpdateDate = null;
    /**@type {String?} */ Token = null;
    /**@type {Array<Section>} */ Sections = [];
    /**@type {Array<Section>} */ EditorDataList = [];
}

export class Section {
    /** @param {Partial<Section>} [props] */
    constructor(props) {
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {string?} */ Id_Section = null;
    /**@type {Object?} */ Data = null;
    /**@type {any} */ Body;
}

export class TemplateData_ModelComponent extends EntityClass {
    /** @param {Partial<TemplateData_ModelComponent>} [props] */
    constructor(props) {
        super(props, 'DocumentsData');
        // @ts-ignore
        Object.assign(this, props);
    }
    /**@type {ModelProperty} */ Tbl_Profile = { type: "MODEL", ModelObject: () => new Tbl_Profiles_Model_ModelComponent() };

    /**@type {ModelProperty} */ Id_Template = { type: "NUMBER", primary: true };
    /**@type {ModelProperty} */ Descripcion = { type: "TEXT" };
    /**@type {ModelProperty} */ Fecha = { type: "DATETIME" };
    //**@type {ModelProperty} */ Sections =  { type: "NUMBER", primary: true};
}

export class Section_ModelComponent {
    /**@type {ModelProperty} */ Body = { type: "RICHTEXT" }
}