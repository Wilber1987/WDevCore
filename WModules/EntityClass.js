import { WAjaxTools } from "./WComponentsTools.js";

class EntityClass {
    constructor(props, Namespace) {
        for (const prop in props) {
            this[prop] = props[prop];
        }
        this.ApiMethods = {
            ApiRoute: window.origin + "/api/",
            Get: Namespace + "/get" + this.__proto__.constructor.name,
            Set: Namespace + "/get" + "/save" + this.__proto__.constructor.name,
            Update: Namespace + "/get" + "/update" + this.__proto__.constructor.name,
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
        const Dataset = WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path)
        // let Dataset = await fetch(this.ApiMethods.ApiRoute + this.constructor.name + '.json');
        //Dataset = await Dataset.json()
        return Dataset;
    }

    SaveData = async (Path, Data) => {
        return await WAjaxTools.PostRequest(this.ApiMethods.ApiRoute + Path, Data)
    }
    replacer(key, value) {
        // Filtrando propiedades 
        if (value.get && value.set) {
            return undefined;
        }
        return value;
    }
}
export { EntityClass }