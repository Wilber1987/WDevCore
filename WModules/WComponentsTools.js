import {ElementStyle, WNode} from "./CommonModel.js";


/** 
 * @returns {HTMLElement}
 * @param {any} strings
 * @param {any[]} values
 */
function html(strings, ...values) {
    // @ts-ignore
    // Unir las partes de la plantilla de cadena
    const result = strings.reduce((accumulator, currentString, index) => {
        accumulator += currentString;
        if (index < values.length) {
            const value = values[index];
            if (typeof value === 'function') {
                // Extraer el nombre del evento y el manejador
                const match = currentString.match(/(\s*on\w+)=/);
                if (match && match[1]) {
                    const eventName = match[1];
                    accumulator += `${eventName}="${value.toString()}"`;
                } else {
                    accumulator += value;
                }
            } else {
                accumulator += value;
            }
        }
        return accumulator;
    }, '');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = result;

    return WRender.CreateStringNode(result);
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
            console.log(error);
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
                    this.CreateStringNode(`<label></label>`);
                } else if (Node.length > 100) {
                    return this.CreateStringNode(`<p>${Node}</p>`);
                }
                return this.CreateStringNode(`<label>${Node}</label>`);
            } else if (this.isHTMLElement(Node)) {
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
            console.log(Node.__proto__);
            console.log(Node.__proto__);
            console.log(Node.__proto__);
            return document.createTextNode("Problemas en la construcción del nodo.");
        }
    }
    static isHTMLElement(node) {
        let currentProto = Object.getPrototypeOf(node);

        while (currentProto !== null) {
            if (currentProto === HTMLElement.prototype) {
                return true;
            }
            currentProto = Object.getPrototypeOf(currentProto);
        }

        return false;
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
export { WRender }
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
export { ComponentsManager, GenerateColor }

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
    const year = this.getFullYear();
    const month = pad(this.getMonth() + 1);
    const day = pad(this.getDate());
    return `${year}-${month}-${day}`;
   /* + return this.getUTCFullYear() +   '-' + pad(this.getUTCMonth() + 1) + '-' + pad(this.getUTCDate()) 
      'T' + pad(this.getUTCHours()) +
      ':' + pad(this.getUTCMinutes()) +
      ':' + pad(this.getUTCSeconds()) +
      '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z' */;
};

String.prototype.toISO = function () {
    const date = new Date(this).toISO();
    return date;
};
Date.prototype.toStartDate = function () {
    return new Date(this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate()))
};
/**
 * 
 * @param {Integer} days 
 * @returns {Date}
 */
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days)
    return this;
};
/**
 * 
 * @param {Integer} days 
 * @returns {Date}
 */
Date.prototype.subtractDays = function (days) {
    this.setDate(this.getDate() - days)
    return this;
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

//MONEDA
/**
 * 
 * @param {Number} numero 
 * @param {String} currency EUR
 * @returns {String}
 */
function ConvertToMoneyString(numero, currency = undefined) {
    return new Intl.NumberFormat('es-ES', {
        style: 'decimal',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
    }).format(numero).replace(/,/g, '|').replace(/\./g, ',').replace(/\|/g, '.');;
}

export { ConvertToMoneyString }