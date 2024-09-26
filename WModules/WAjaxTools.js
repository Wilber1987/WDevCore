//@ts-check
import { LoadinModal } from "../WComponents/LoadinModal.js";
import { ModalMessege } from "../WComponents/WForm.js";


class PostConfig {
    /**
    * @param {Partial<PostConfig>} [props] 
    */
    constructor(props) {
        for (const prop in props) {
            this[prop] = props[prop];
        }
    }
    /**  @type {String} */ RequestType = "POST";
    /**  @type {String} */ HeaderType = "json";
    /**  @type {String} */ CSRFToken = "";
}
class WAjaxTools {
    /**
    * @param {String} Url
    * @param {Object} [Data]
    * @param {PostConfig} [PostConfig]
    * @returns {Promise<any>}
    */
    static Request = async (Url, Data = {}, PostConfig) => {
        const loadinModal = new LoadinModal();
        try {
            const config = WAjaxTools.BuildConfigRequest(PostConfig, Data);
            document.body.appendChild(loadinModal);
            let response = await fetch(Url, config);
            const ProcessRequest = await WAjaxTools.ProcessRequest(response, Url);
            loadinModal.close();
            return ProcessRequest;
        } catch (error) {
            loadinModal.close();
            if (error == "TypeError: Failed to fetch") {
                //return WAjaxTools.LocalData(Url);
            }
        }
    }
    /**
    * @param {String} Url
    * @param {Object} Data
    * @param {PostConfig} postConfig 
    * @returns {Promise<any>}
    */
    static PostRequest = async (Url, Data = {}, postConfig = new PostConfig()) => {
        try {
            return await WAjaxTools.Request(Url, Data, postConfig);
        } catch (error) {
            console.log(error);
            throw error;
            //if (error == "TypeError: Failed to fetch" ) {
            // return this.LocalData(Url);
            //}
        }
    }
    static GetRequest = async (Url) => {
        try {
            return await WAjaxTools.Request(Url);
        } catch (error) {
            console.log(error)
            if (error == "TypeError: Failed to fetch") {
                return this.LocalData(Url);
            }
        }
    }
    static ProcessRequest = async (response, Url) => {
        if (response.status == 400 || response.status == 403 || response.status == 404 || response.status == 500) {
            const messageError = await response.text();
            var lineas = messageError.split(/\r?\n/);
            console.log(lineas);            
            document.body.appendChild(ModalMessege(lineas[0]));      
            throw new Error(this.ProcessError(lineas[0])).message;            
        } else {
            try {
                response = await response.json(response);
                localStorage.setItem(Url, JSON.stringify(response));
                return response;
            } catch (error) {
                console.log(error);
                console.log(response);
                console.log(`ocurrio un error al procesar los datos de la respuesta - ${Url}`);
                return response;
            }
        }
    }

    static BuildConfigRequest(postConfig = new PostConfig(), Data) {
        let ContentType = "application/json; charset=utf-8";
        let Accept = "*/*";
        if (postConfig.HeaderType == HeaderType.FORM) {
            ContentType = "application/x-www-form-urlencoded; charset=UTF-8";
            Accept = "*/*";
        }
        let dataRequest = {
            method: postConfig.RequestType,
            headers: {
                'Content-Type': ContentType,
                'Accept': Accept,
                dataType: 'json',
            }
        };
        if (postConfig.RequestType == RequestType.POST) {
            dataRequest.body = JSON.stringify(Data ?? {});
        }
        if (postConfig.CSRFToken != undefined && postConfig.CSRFToken != "") {
            dataRequest.headers['X-CSRF-TOKEN'] = postConfig.CSRFToken;
        }
        return dataRequest;
    }

    static ProcessError(/**@type {String}*/string) {
        return string.toUpperCase().replace("SYSTEM.EXCEPTION", "ERROR");
    }

    static LocalData = (Url) => {
        let responseLocal = localStorage.getItem(Url);
        if (responseLocal != null) {
            return JSON.parse(responseLocal);
        }
        return {};
    }
}

export { WAjaxTools };

const RequestType = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE"
}
const HeaderType = {
    JSON: "json",
    FORM: "form"
}