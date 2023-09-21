import { WAppNavigator } from "../WComponents/WAppNavigator.js";
import { ElementStyle, WNode } from "./CommonModel.js";
import { EntityClass } from "./EntityClass.js";

function type(value) {
    var r;
    if (typeof value === 'object') {
        if (value === null) {
            return 'null';
        }
        if (typeof value.constructor === 'function' &&
            (r = value.constructor.name) !== 'Object') {
            if (r === '' || r === undefined) {
                return Function.prototype.toString.call(value.constructor)
                    .match(/^\n?(function|class)(\w?)/)[2] || 'anonymous';
            }
            return r;
        }
        return Object.prototype.toString.call(value).match(/\s(.*)\]/)[1];
    } else if (typeof value === 'number') {
        return isNaN(value) ? 'NaN' : 'number';
    }
    return typeof value;
}
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
                throw "ocurrio un error al procesar los datos de la respuesta";
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
/**
 * 
 * @param {TemplateStringsArray} body 
 * @returns {HTMLElement}
 */
function html(body) {
    // @ts-ignore
    return WRender.CreateStringNode(body);
}
export { html }
class WRender {
    /**
     * 
     * @param {*} string 
     * @returns {HTMLElement}
     */
    static CreateStringNode = (string) => {
        let node = document.createRange().createContextualFragment(string);
        return node.childNodes[0];
    }
    static createElement = (Node) => {
        try {
            if (typeof Node === "undefined" || Node == null) {
                return document.createTextNode("Nodo nulo o indefinido.");
            } else if (typeof Node === "string" || typeof Node === "number") {
                if (Node.length > 100) {
                    return this.CreateStringNode(`<p>${Node}</p>`);
                }
                return this.CreateStringNode(`<label>${Node}</label>`);
            } else if (Node.__proto__ === HTMLElement.prototype
                || Node.__proto__.__proto__ === HTMLElement.prototype) {
                return Node;
            } else {
                if (Node.__proto__ == Array.prototype) {
                    Node = { type: "div", children: Node }
                }
                const element = document.createElement(Node.type);
                if (Node.props != undefined && Node.props.__proto__ == Object.prototype) {
                    for (const prop in Node.props) {
                        if (prop == "class") { element.className = Node.props[prop]; }//CLASSNAME
                        else if (prop == "style" && Node.props[prop].__proto__ == Object.prototype) {  //STYLE                          
                            for (const styleProp in Node.props[prop]) {
                                element[prop][styleProp] = Node.props[prop][styleProp];
                            }
                        }
                        else element[prop] = Node.props[prop];//NORMAL
                    }
                }
                if (Node.children != undefined && Node.children.__proto__ == Array.prototype) {
                    Node.children.forEach(Child => {
                        element.appendChild(this.createElement(Child));
                    });
                }
                return element;
            }
        } catch (error) {
            console.log(error, Node);
            return document.createTextNode("Problemas en la construcción del nodo.");
        }
    }
    static createElementNS = (node, uri = "svg") => {
        try {
            let URI = null;
            switch (uri) {
                case "svg":
                    URI = "http:\/\/www.w3.org/2000/svg";
                    break;
                case "html":
                    URI = "http://www.w3.org/1999/xhtml";
                    break;
                case "xbl":
                    URI = "http://www.mozilla.org/xbl";
                    break;
                case "xul":
                    URI = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
                    break;
                default:
                    URI = null;
                    break;
            }
            const element = document.createElementNS(URI, node.type)
            if (node.props) {
                for (const prop in node.props) {
                    if (typeof node.props[prop] === "function") {
                        element[prop] = node.props[prop];
                    } else if (typeof node.props[prop] === 'object') {
                        element[prop] = node.props[prop];
                    } else {
                        try {
                            element.setAttributeNS(null, prop, node.props[prop])
                        } catch (error) {
                            element.setAttributeNS(URI, prop, node.props[prop]);
                        }
                    }
                }
            }
            if (node.children) {
                node.children
                    .map(this.createElementNS)
                    .forEach(child => element.appendChild(child, uri))
            }
            return element;
        } catch (error) {

        }
    }
    /**
     * 
     * @param {WNode} Node 
     * @returns {HTMLElement}
     */
    static Create = (Node) => {
        try {
            if (typeof Node === "undefined" || Node == null) {
                return document.createTextNode("Nodo nulo o indefinido.");
            } else if (typeof Node === "string" || typeof Node === "number") {
                if (Node.length == 0) {
                    return "";
                } else if (Node.length > 100) {
                    return this.CreateStringNode(`<p>${Node}</p>`);
                }
                return this.CreateStringNode(`<label>${Node}</label>`);
            } else if (Node.__proto__ === HTMLElement.prototype
                || Node.__proto__.__proto__ === HTMLElement.prototype) {
                return Node;
            } else {
                if (Node.__proto__ == Array.prototype) {
                    Node = new WNode({ children: Node });
                }
                Node.tagName = Node.tagName ?? "div";
                const element = document.createElement(Node.tagName);
                for (const prop in Node) {
                    if (prop == "tagName") { continue; }
                    else if (prop == "class") { element.className = Node[prop]; }//CLASSNAME
                    else if (prop == "style" && Node[prop].__proto__ == Object.prototype) {  //STYLE
                        this.SetStyle(element, Node[prop]);
                    } else if (prop == "children") {
                        if (Node.children != undefined && Node.children.__proto__ == Array.prototype) {
                            Node.children.forEach(Child => {
                                element.appendChild(this.Create(Child));
                            });
                        } else if (Node.children != undefined && Node.children.__proto__ == Object.prototype) {
                            Node.children.N = Node.children.N ?? 0;
                            Node.children.childs = Node.children.childs ?? [];
                            for (let index = 0; index < Node.children.N; index++) {
                                const contain = Node.children.childs[index] ?? "";
                                element.appendChild(this.Create({
                                    tagName: Node.children.tagName,
                                    class: Node.children.className,
                                    children: contain
                                }));
                            }
                        } else {
                            element.appendChild(this.Create(Node.children));
                        }
                    }
                    else element[prop] = Node[prop];//NORMAL
                }
                //children
                return element;
            }
        } catch (error) {
            console.log(error, Node);
            return document.createTextNode("Problemas en la construcción del nodo.");
        }
    }
    /**
     * @param  {HTMLElement} Node
     * @param  {ElementStyle} Style
    */
    static SetStyle = (Node, Style) => {
        for (const styleProp in Style) {
            Node.style[styleProp] = Style[styleProp];
        }
    }

}
/**
 * @typedef {Object} ConfigDOMManager
     * @property {Boolean} [SPAManage]
     * @property {WAppNavigator} [WNavigator]
     * @property {HTMLElement} [MainContainer]
     * @property {String} [ContainerName]
     * */
class ComponentsManager {
    /**
     * @param {ConfigDOMManager} Config 
     */
    constructor(Config = {}) {
        this.DomComponents = [];
        this.type = "div";
        this.props = {
            class: "MyForm"
        };
        this.SelectedComponent = "";
        this.ContainerName = Config.ContainerName;
        this.MainContainer = Config.MainContainer;
        this.Config = Config;
        if (this.Config.SPAManage == true) {
            window.onhashchange = () => {
                if (this.Config.SPAManage != true) {
                    return;
                }
                let NavManageClick = sessionStorage.getItem("NavManageClick");
                if (NavManageClick == "true") {
                    sessionStorage.setItem("NavManageClick", "false");
                    return;
                }
                const hashD = window.location.hash.replace("#", "");
                let navigateComponets = JSON.parse(sessionStorage.getItem("navigateComponets"));
                if (navigateComponets != null) {
                    const newNode = this.DomComponents.find(node => node.id == hashD);
                    this.NavigateFunction(hashD, newNode, this.MainContainer);
                }
            }
            if (this.Config.WNavigator != undefined) {
                const hashD = window.location.hash.replace("#", "");
                const navElment = this.Config.WNavigator.Elements.find(e => e.id == hashD)
                if (navElment != null && navElment.action != undefined) {
                    const elementNav = this.Config.WNavigator.shadowRoot.querySelector("#element" + navElment.id)
                    if (elementNav != null) {
                        this.Config.WNavigator.InitialNav = () => {
                            elementNav.onclick()
                        }
                    }

                }
            }
        }
    }
    NavigationLog = [];
    NavigateFunction = async (IdComponent, ComponentsInstance, ContainerName = "ContainerName", back = false) => {
        this.ContainerName = ContainerName ?? this.ContainerName;
        if (this.MainContainer == undefined) {
            this.MainContainer = document.querySelector("#" + this.ContainerName);
        }
        const ContainerNavigate = this.MainContainer;
        let Nodes = ContainerNavigate.querySelectorAll(".DivContainer");
        Nodes.forEach((node) => {
            if (node.id != IdComponent) {
                let nodeF = this.DomComponents.find(n => n == node);
                if (nodeF != undefined && nodeF != null) {
                    nodeF = node;
                } else {
                    this.DomComponents.push(node);
                }
                if (ContainerNavigate.querySelector("#" + node.id)) {
                    ContainerNavigate.removeChild(node);
                }
            }
        });
        if (!ContainerNavigate.querySelector("#" + IdComponent)) {
            const node = this.DomComponents.find(node => node.id == IdComponent);
            if (node != undefined && node != null) {
                ContainerNavigate.append(node);
            } else {
                const NewChild = WRender.createElement(ComponentsInstance);
                NewChild.id = IdComponent;
                NewChild.className = NewChild.className + " DivContainer";
                this.DomComponents.push(NewChild);
                ContainerNavigate.append(NewChild);
            }
            if (this.Config.SPAManage == true) {
                sessionStorage.setItem("NavManageClick", "true");
                window.location = "#" + IdComponent;
                const newNode = this.DomComponents.find(node => node.id == IdComponent);
                let navigateComponets = JSON.parse(sessionStorage.getItem("navigateComponets"));
                if (navigateComponets == null) {
                    navigateComponets = [];
                }
                navigateComponets.push(newNode);
                sessionStorage.setItem("navigateComponets", JSON.stringify(navigateComponets));
            }
            if (!back) this.NavigationLog.push(IdComponent);
        }
    }
    AddComponent = async (IdComponent, ComponentsInstance, ContainerName, order = "last") => {
        if (this.MainContainer == undefined) {
            this.MainContainer = ContainerName;
        }
        const ContainerNavigate = document.querySelector("#" + this.MainContainer);
        if (ContainerNavigate.querySelector("#" + IdComponent)) {
            window.location = "#" + IdComponent;
            return;
        } else {
            const NewChild = WRender.createElement(ComponentsInstance);
            NewChild.className = NewChild.className + " AddComponent";
            NewChild.id = IdComponent;
            this.DomComponents[IdComponent] = NewChild;
            if (order == "last") {
                ContainerNavigate.append(NewChild);
                return;
            } else if (order == "first") {
                ContainerNavigate.insertBefore(NewChild, ContainerNavigate.firstElementChild);
            }
        }
    }
    Back = () => {
        if (this.NavigationLog.length < 2) return;
        const IdComponent = this.NavigationLog[this.NavigationLog.length - 2];
        this.NavigationLog.pop();
        this.NavigateFunction(IdComponent, undefined, undefined, true);
    }
    static modalFunction(ventanaM) {
        if (ventanaM.style.opacity == 0) {
            // WRender.SetStyle(ventanaM, {
            //     //transform: "translateY(-100%)",
            //     transition: "all ease 0.3s",
            //     display: "block"
            // });
            // setTimeout(() => {
            //     WRender.SetStyle(ventanaM, {
            //         //transform: "translateY(0%)",
            //         opacity: 1
            //     });
            // }, 100);
            ventanaM.style.transition = "all ease 0.3s";
            ventanaM.style.display = "block";
            setTimeout(() => {
                ventanaM.style.opacity = 1;
            }, 333);
        } else {
            ventanaM.style.transition = "all ease 0.3s";
            ventanaM.style.opacity = 0;
            setTimeout(() => {
                ventanaM.style.display = "none";
            }, 333);
        }
    }
    static DisplayUniqAcorden(elementId) {
        let SectionElement = document.getElementById(elementId);
        let valueSize = "0px"
        if (SectionElement.offsetHeight != 0) {
            valueSize = SectionElement.offsetHeight + "px";
        }
        if (SectionElement.style.display == "none") {
            SectionElement.style.display = "block";
            setTimeout(() => {
                SectionElement.style.maxHeight = "800px";
                SectionElement.style.minHeight = "300px";
            }, 100);
        } else {
            SectionElement.style.maxHeight = valueSize;
            SectionElement.style.minHeight = valueSize;
            setTimeout(() => {
                SectionElement.style.display = "none";
            }, 1000);
        }
    }
    static DisplayAcorden(SectionElement, valueSize = 0) {
        //let SectionElement = document.getElementById(elementId);
        if (SectionElement.offsetHeight == valueSize) {
            SectionElement.style.maxHeight = "800px";
            SectionElement.style.minHeight = "150px";
        } else {
            SectionElement.style.maxHeight = valueSize + "px";
            SectionElement.style.minHeight = valueSize + "px";

        }
    }
}
class WArrayF {
    static JSONParse(param) {
        return JSON.parse((param).replace(/&quot;/gi, '"'));
    }
    /**
     * @param {Array} Array Arreglo para ordenar 
     * @param {number} type Valor 1 o 2
     * @returns 
     */
    static orderByDate(Array, type) {
        var meses = [
            "enero", "febrero", "marzo",
            "abril", "mayo", "junio", "julio",
            "agosto", "septiembre", "octubre",
            "noviembre", "diciembre"
        ];
        if (type == 1) {
            Array.sort((a, b) => a.time - b.time);
        } else if (type == 2) {
            Array.forEach(element => {
                if (element.time.includes("diciembre")) {
                    var Year = new Date(Date.parse(element.time)).getFullYear();
                    element.time = Date.parse(Year + " December");
                } else element.time = Date.parse(element.time);
            });
            Array.sort((a, b) => a.time - b.time);

            Array.forEach(element => {
                var fecha = new Date(element.time);
                element.time = meses[fecha.getMonth()] + " " + fecha.getFullYear();
            });

        } else {
            var Array2 = [];
            Array.forEach(element => {
                var object = {
                    cuarter: null,
                    year: null
                };
                object.cuarter = element.time.substring(1, 0);
                object.year = element.time.substring(element.time.length, 14);
                Array2.push(object);
            })
            Array2.sort((a, b) => a.year - b.year);
            var Array3 = [];
            Array2.forEach(element => {
                var object = Array.find(x => x.time.substring(1, 0).includes(element.cuarter) &&
                    x.time.includes(element.year));
                Array3.push(object);
            });
            Array = Array3;
        }
        return Array;
    }
    /**
     * Agrupa un arreglo por medio de un parametros
     * @param {Array} DataArray arreglo original
     * @param {String} param propiedad por la cual se va a evaluar el arreglo agrupado
     * @param {String} sumParam parametro a sumar
     * @returns Arreglo agrupado por parametro con su contador y suma
     */
    static GroupBy(DataArray, Property, sumProperty = null) {
        let DataArraySR = []
        DataArray?.forEach(element => {
            const DFilt = DataArraySR.find(x => x[Property] == element[Property]);
            if (!DFilt) {
                const NewElement = {};
                for (const prop in element) {
                    NewElement[prop] = element[prop]
                }
                if (!element.count) {
                    NewElement.count = 1;
                }
                NewElement.rate = ((1 / DataArray.length) * 100).toFixed(2) + "%";
                DataArraySR.push(NewElement)
            } else {
                if (!element.count) {
                    DFilt.count = DFilt.count + 1;
                }
                DFilt.rate = ((DFilt.count / DataArray.length) * 100).toFixed(2) + "%";
                if (sumProperty != null) {
                    DFilt[sumProperty] = DFilt[sumProperty] + element[sumProperty];
                }
            }
        });
        return DataArraySR;
    }
    /**
     * Agrupa un arreglo por medio de un parametros
     * @param {Array} DataArray arreglo original
     * @param {Object} param Objeto con el cual por la cual se va a evaluar el arreglo agrupado
     * @param {String} sumParam parametro a sumar
     * @returns Arreglo agrupado por parametro con su contador y suma
     */
    static GroupByObject(DataArray, param = {}, sumParam = null) {
        let DataArraySR = [];
        DataArray.forEach(element => {
            const DFilt = DataArraySR.find(obj => {
                let flagObj = true;
                for (const prop in param) {
                    if (obj[prop] != element[prop]) {
                        flagObj = false;
                    }
                }
                return flagObj;
            });
            if (!DFilt) {
                const NewElement = {};
                for (const prop in element) {
                    NewElement[prop] = element[prop]
                }
                if (!element.count) {
                    NewElement.count = 1;
                }
                NewElement.rate = ((1 / DataArray.length) * 100).toFixed(2) + "%";
                DataArraySR.push(NewElement)
            } else {
                if (!element.count) {
                    DFilt.count = DFilt.count + 1;
                }
                DFilt.rate = ((DFilt.count / DataArray.length) * 100).toFixed(2) + "%";
                if (sumParam != null) {
                    DFilt[sumParam] = DFilt[sumParam] + element[sumParam];
                }
            }
        });
        return DataArraySR;
    }
    static MaxValue(Data, MaxParam) {
        var Maxvalue = Data[0][MaxParam] ?? 0;
        for (let index = 0; index < Data.length; index++) {
            if (parseInt(Data[index][MaxParam]) > Maxvalue) {
                Maxvalue = Data[index][MaxParam];
            }
        }
        return Maxvalue;
    }
    static MinValue(Data, MaxParam) {
        var MinValue = Data[0][MaxParam];
        for (let index = 0; index < Data.length; index++) {
            if (parseInt(Data[index][MaxParam]) < MinValue) {
                MinValue = Data[index][MaxParam];
            }
        }
        return MinValue;
    }
    static MaxDateValue(Data, MaxParam) {
        var Maxvalue = new Date(Data[0][MaxParam]);
        for (let index = 0; index < Data.length; index++) {

            if (new Date(Data[index][MaxParam]) > Maxvalue) {
                Maxvalue = new Date(Data[index][MaxParam]);
            }
        }
        return Maxvalue;
    }
    static MinDateValue(Data, MaxParam) {
        var MinValue = new Date(Data[0][MaxParam]);
        for (let index = 0; index < Data.length; index++) {

            if (new Date(Data[index][MaxParam]) < MinValue) {
                MinValue = new Date(Data[index][MaxParam]);
            }
        }
        return MinValue;
    }
    //reparar
    static SumValue(DataArry, EvalValue) {
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
        }
        return Maxvalue;
    }
    /**
     * 
     * @param {*} DataArry 
     * @param {*} EvalValue 
     * @returns {Number}
     */
    static SumValAtt(DataArry, EvalValue) {//retorna la suma 
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            if (typeof DataArry[index][EvalValue] === "number" || parseFloat(DataArry[index][EvalValue]) != "NaN") {
                Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
            } else {
                Maxvalue = "Error!";
                break;
            }
        }
        return Maxvalue;
    }
    static SumValAttByProp(DataArry, Atrib, EvalValue) {
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            const Obj = DataArry[index];
            if (Obj[Atrib.prop] == Atrib.value) {
                if (typeof Obj[EvalValue] === "number") {
                    Maxvalue = Maxvalue + parseFloat(Obj[EvalValue]);
                } else {
                    Maxvalue = "Error!";
                    break;
                }
            }
        }
        return Maxvalue;
    }
    //BUSQUEDA Y COMPARACIONES
    static FindInArray(element, Dataset) {
        let val = false;
        for (let index = 0; index < Dataset.length; index++) {
            const Data = Dataset[index];
            val = this.compareObj(element, Data)
            if (val == true) {
                break;
            }
        }
        return val;
    }
    static compareObj(ComparativeObject, EvalObject) {//compara si dos objetos son iguales en las propiedades        
        if (typeof ComparativeObject === "string" && typeof ComparativeObject === "number") {
            if (ComparativeObject == EvalObject) return true;
            else return false;
        }
        let val = true;
        for (const prop in this.replacer(ComparativeObject)) {
            if (ComparativeObject[prop] !== EvalObject[prop]) {
                val = false;
                break;
            }
        }
        return val;
    }
    static async searchFunction(Dataset, param, apiUrl) {
        return Dataset.filter((element) => {
            for (const prop in element) {
                try {
                    if (this.evalValue(element[prop], param) != null) {
                        return element;
                    }
                } catch (error) {
                    console.log(element);
                }
            }
        });
    }
    static evalValue = (element, param) => {
        const evalF = (parametro, objetoEvaluado) => {
            if (parametro.__proto__ == Object.prototype || parametro.__proto__.__proto__ == EntityClass.prototype) {
                if (this.compareObj(objetoEvaluado, parametro)) return objetoEvaluado;
            } else if (parametro.__proto__ == Array.prototype) {
                const find = parametro.find(x => WArrayF.compareObj(objetoEvaluado, x));
                if (find == undefined) {
                    flagObj = false;
                }
            } else {
                for (const objectProto in objetoEvaluado) {
                    if (objetoEvaluado[objectProto] != null) {
                        if (objetoEvaluado[objectProto].toString().toUpperCase().startsWith(parametro.toString().toUpperCase())) {
                            return objetoEvaluado;
                        }
                    }
                }
            }
            return undefined
        }
        if (element != null) {
            if (element.__proto__ == Object.prototype) {
                if (evalF(param, element)) {
                    return element
                }
            } else if (element.__proto__ == Array.prototype) {
                const find = element.find(item => {
                    if (item != null) {
                        if (item.__proto__ == Object.prototype) {
                            if (evalF(param, item)) {
                                return true
                            }
                        } else if (item.toString().toUpperCase().startsWith(param.toString().toUpperCase())) {
                            return true;
                        }
                    }
                });
                if (find) {
                    return element;
                }
            } else if (element.toString().toUpperCase().startsWith(param.toString().toUpperCase())) {
                return element;
            }
        }
        return null
    }
    /**
    * @param {Object} Model
    * @param {string} prop
    */
    static isModelFromFunction(Model, prop) {
        if (Model[prop].ModelObject.__proto__ == Function.prototype) {
            Model[prop].ModelObject = Model[prop].ModelObject();
        }
        return Model[prop].ModelObject;
    }
    //STRINGS
    static Capitalize(str) {
        if (str == null) {
            return str;
        }
        str = str.toString();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    //verifica que un objeto este dentro de un array
    static checkDisplay(DisplayData, prop, Model = {}) {
        let flag = true;
        if (Model[prop] == undefined && Model[prop] == null) {
            flag = false;
        }
        if (Model[prop] != undefined && Model[prop] != null
            && Model[prop].__proto__ == Object.prototype
            && (Model[prop].primary || Model[prop].hidden)) {
            flag = false;
        }
        if (DisplayData != undefined && DisplayData.__proto__ == Array.prototype) {
            const findProp = DisplayData.find(x => x.toUpperCase() == prop.toUpperCase());
            if (!findProp) {
                flag = false;
            }
        }
        return flag;
    }
    static replacer(value) {
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
                value[prop].__proto__.constructor.name == "AsyncFunction" ||
                value[prop]?.__proto__ == Object.prototype ||
                value[prop]?.__proto__ == Function.prototype ||
                value[prop]?.__proto__ == Array.prototype) {
                continue;
            }
            replacerElement[prop] = value[prop]

        }
        return replacerElement;
    }
}
//METODOS VARIOS
const GenerateColor = () => {
    var hexadecimal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var color_aleatorio = "#FF";
    for (let index = 0; index < 4; index++) {
        const random = Math.floor(Math.random() * hexadecimal.length);
        color_aleatorio += hexadecimal[random]
    }
    return color_aleatorio
}
export { WAjaxTools, WRender, ComponentsManager, WArrayF, type, GenerateColor }

//Date UTILITYS
function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}
/**
 * @class Date
 * @memberof Date.prototype
 * @function
 * @name toISO
 * @returns 
**/
Date.prototype.toISO = function () {
    return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()) /* +
      'T' + pad(this.getUTCHours()) +
      ':' + pad(this.getUTCMinutes()) +
      ':' + pad(this.getUTCSeconds()) +
      '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z' */;
};
/**
 * 
 * @param {Integer} days 
 * @returns {Date}
 */
Date.prototype.addDays = function (days) {
    return this.setDate(this.getDate() + days);
};
/**
 * 
 * @param {Integer} days 
 * @returns {Date}
 */
Date.prototype.subtractDays = function (days) {
    return this.setDate(this.getDate() - days);
};
/**
 * 
 * @param {Integer} month 
 * @returns {Date}
 */
Date.prototype.modifyMonth = function (meses) {
    const fecha = new Date(this.toString()); //¡se hace esto para no modificar la fecha original!
    const mes = fecha.getMonth();
    fecha.setMonth(fecha.getMonth() + meses);
    while (fecha.getMonth() === mes) {
        fecha.setDate(fecha.getDate() - 1);
    }
    return fecha;
}

String.prototype.toDateFormatEs = function () {
    if (this == null || this == undefined || this == "") return "";
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dias_semana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(this);
    return dias_semana[fecha.getDay()]
        + ', ' + fecha.getDate()
        + ' de ' + meses[fecha.getMonth()]
        + ' de ' + fecha.getUTCFullYear();
};

String.prototype.getMonthFormatEs = function () {
    if (this == null || this == undefined || this == "") return "";
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dias_semana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(this);
    return meses[fecha.getMonth()];
};




String.prototype.toDateTimeFormatEs = function () {
    const fecha = new Date(this);
    return this.toDateFormatEs() + ' hora ' + pad(fecha.getUTCHours()) + ':' + pad(fecha.getUTCMinutes());
};



/**
 * @param {ElementStyle} Style Estilos del HTMLElement
 */
HTMLElement.prototype.SetStyle = function (Style = (new ElementStyle())) {
    WRender.SetStyle(this, Style);
}