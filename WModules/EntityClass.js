import { WAjaxTools } from "./WComponentsTools.js";

class EntityClass {
    constructor(props, Namespace) {
        this.ApiMethods = {
            ApiRoute: window.origin + "/api/",
            Get: "Api" + Namespace + "/get" + this.__proto__.constructor.name,
            Set: "Api" + Namespace + "/save" + this.__proto__.constructor.name,
            Update: "Api" + Namespace + "/update" + this.__proto__.constructor.name,
            Delete: "Api" + Namespace + "/delete" + this.__proto__.constructor.name
        }
    }
    /**@type {Array<FilterData>} */
    FilterData = []
    /**
     * @param {String} Param 
     * @returns {Array}
     */
    Get = async (Param = "") => {
        let Data = await this.GetData(this.ApiMethods.Get);
        return Data;
    }
    /**
    * @param {String} paramName 
    * @param {String} paramValue 
    * @returns {Array}
    */
    GetByProps = async (paramName, paramValue) => {
        let Data = await this.GetData();
        Data = Data.filter(ent => ent[paramName].toString().includes(paramValue.toString()));
        return Data.map(ent => new this.constructor(ent));
    }
    /**
   * 
   * @param {String} paramName 
   * @param {String} paramValue 
   * @returns {Array}
   */
    FindByProps = async (paramName, paramValue) => {
        let Data = await this.GetData();
        const FindObject = Data.find(ent => ent[paramName].toString().includes(paramValue.toString()));
        if (FindObject) {
            return (new this.constructor(FindObject));
        }
    }
    /**
     * 
     * @returns {Object}
     */
    Save = async () => {
        return await this.SaveData(this.ApiMethods.Set, this);
    }
    /**
     * @returns {ResponseServices}
     */
    Update = async () => {
        return await this.SaveData(this.ApiMethods.Update, this);
        
    }
     /**
     * @param {String} Param 
     * @returns {Array}
     */
    Delete = async (Param = "") => {
        let Data = await this.GetData(this.ApiMethods.Delete);
        return Data;
    }
    /** CORE ########################################################## */
    /**
   * 
   * @param {String} Path 
   * @returns {Array}
   */
    GetData = async (Path) => {
        const Dataset = await WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, this.replacer(this))
        // let Dataset = await fetch(this.ApiMethods.ApiRoute + this.constructor.name + '.json');
        //Dataset = await Dataset.json()
        if (Dataset.__proto__ == Object.prototype) {
            return Dataset;
        }
        return Dataset.map(ent => new this.constructor(ent));;
    }
    SaveWithModel = async (Object, Edit = false) => {
        if (Edit == false) {
            await this.SaveData(this.ApiMethods.Set, Object);
        } else {
            await this.SaveData(this.ApiMethods.Update, Object);
        }
        return true;
    }
    SaveData = async (Path, Data) => {
        return await WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, Data)
    }
    replacer(value) {
        const replacerElement = {};
        for (const prop in value) {
            if ((prop == "get" && prop == "set") ||
                prop == "ApiMethods" ||
                prop == "Get" ||
                prop == "GetByProps" ||
                prop == "FindByProps" ||
                prop == "Save" ||
                prop == "Update" ||
                prop == "GetData" ||
                prop == "SaveData" ||
                value[prop] == null ||
                value[prop] == undefined ||
                (value[prop]?.__proto__ == Object.prototype && value[prop].type)) {
                continue;
            }
            replacerElement[prop] = value[prop]
        }
        return replacerElement;
    }
}
export { EntityClass }