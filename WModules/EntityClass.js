import { WAjaxTools } from "./WComponentsTools.js";

class EntityClass {
    constructor(props, Namespace) {       
        this.ApiMethods = {
            ApiRoute: window.origin + "/api/",
            Get: "Api" + Namespace + "/get" + this.__proto__.constructor.name,
            Set: "Api" + Namespace + "/save" + this.__proto__.constructor.name,
            Update: "Api" + Namespace + "/update" + this.__proto__.constructor.name,
        }
    }   
    Get = async (Param = "") => {
        let Data = await this.GetData(this.ApiMethods.Get);
        return Data.map(ent => new this.constructor(ent));
    }
    GetByProps = async (paramName, paramValue) => {
        let Data = await this.GetData();
        Data = Data.filter(ent => ent[paramName].toString().includes(paramValue.toString()));
        return Data.map(ent => new this.constructor(ent));
    }
    FindByProps = async (paramName, paramValue) => {
        let Data = await this.GetData();
        const FindObject = Data.find(ent => ent[paramName].toString().includes(paramValue.toString()));
        if (FindObject) {
            return (new this.constructor(FindObject));
        }
    }
    Save = async () => {
        await this.SaveData(this.ApiMethods.Set, this);
        return true;
    }
    Update = async () => {
        await this.SaveData(this.ApiMethods.Update, this);
        return true;
    }
    /** CORE ########################################################## */
    GetData = async (Path) => {
        const Dataset = WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, this.replacer(this))
        // let Dataset = await fetch(this.ApiMethods.ApiRoute + this.constructor.name + '.json');
        //Dataset = await Dataset.json()
        return Dataset;
    }
    SaveWithModel = async (Object) => {
        await this.SaveData(this.ApiMethods.Set, Object);
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
                (value[prop]?.__proto__ == Object.prototype && value[prop].type) ) {
                continue;
            }
            replacerElement[prop] = value[prop]
        }
        return replacerElement;
    }
}
export { EntityClass }