class WAjaxTools {
    static Request = async (Url, typeRequest, Data = {}, typeHeader) => {
        try {
            let ContentType = "application/json; charset=utf-8";
            let Accept = "*/*";
            if (typeHeader == "form") {
                ContentType = "application/x-www-form-urlencoded; charset=UTF-8";
                Accept = "*/*";
            }
            let dataRequest = {
                method: typeRequest,
                headers: {
                    'Content-Type': ContentType,
                    'Accept': Accept,
                    dataType: 'json',
                }
            }
            if (Data != {}) {
                dataRequest.body = JSON.stringify(Data);
            }
            let response = await fetch(Url,);
            const ProcessRequest = await this.ProcessRequest(response, Url);
            return ProcessRequest;
        } catch (error) {
            if (error == "TypeError: Failed to fetch") {
                return this.LocalData(Url);
            }
        }
    }
    static PostRequest = async (Url, Data = {}, PostConfig = {}) => {
        try {
            let ContentType = "application/json; charset=utf-8";
            let Accept = "*/*";
            if (PostConfig.typeHeader != undefined && PostConfig.typeHeader == "form") {
                ContentType = "application/x-www-form-urlencoded; charset=UTF-8";
                Accept = "*/*";
            }
            const ConfigRequest = {
                method: 'POST',
                //credentials: "same-origin",
                cache: "force-cache",
                headers: {
                    'Content-Type': ContentType,
                    'Accept': Accept,
                    //"X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify(Data)
            }
            if (PostConfig.token != undefined && PostConfig.token != "") {
                ConfigRequest.headers['X-CSRF-TOKEN'] = PostConfig.token
            }
            let response = await fetch(Url, ConfigRequest);
            const ProcessRequest = await this.ProcessRequest(response, Url);
            return ProcessRequest;
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
            let response = await fetch(Url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const ProcessRequest = await this.ProcessRequest(response, Url);
            return ProcessRequest;
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
            var lineas = messageError.split('\n');
            alert(messageError)
            throw new Error(this.ProcessError(lineas[0])).message;
            if (typeof response !== "undefined" && typeof response !== "null" && response != "") {
                return this.LocalData(Url);
            } else {
                return [];
            }
        } else {
            try {
                response = await response.json(response);
                localStorage.setItem(Url, JSON.stringify(response));
                return response;
            } catch (error) {
                console.log(error);
                console.log("ocurrio un error al procesar los datos de la respuesta");
                return response;
            }
        }
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

export {WAjaxTools};