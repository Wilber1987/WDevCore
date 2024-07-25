import {EntityClass} from "./EntityClass.js";

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
     * Agrupa un arreglo por medio de una lista de parametros y evalua
     * @param {Array} DataArray arreglo original
     * @param {String} param propiedad por la cual se va a evaluar el arreglo agrupado
     * @param {String} sumParam parametro a sumar
     * @returns {Array} Arreglo agrupado por parametro con su contador y suma
     */
    static GroupArray(DataArray, GroupPropertys = [], EvalParams = [], index = 0) {
        if (!GroupPropertys[index]) {
            return undefined;
        }
        let DataArraySR = []
        const groupedData = Object.groupBy(DataArray, (groupData) => groupData[GroupPropertys[index]]);
        for (const key in groupedData) {
            const group = {};
            group[GroupPropertys[index]] = key;
            const consolidadoModel = groupedData[key].find(m => m[GroupPropertys[index]] != null && m[GroupPropertys[index]] != undefined)
            WArrayF.ConsolidateProp(consolidadoModel, GroupPropertys[index], DataArray, group, {
                filterProp: GroupPropertys[index],
                value: key
            })
            EvalParams.forEach(evalParam => {
                const Model = groupedData[key][0]//.find(m => m[evalParam] != null && m[evalParam] != undefined)

                if (!Model || WArrayF.isNotConsolidable(evalParam, Model)) {
                    return;
                }
                WArrayF.ConsolidateProp(Model, evalParam, DataArray, group, {
                    filterProp: GroupPropertys[index],
                    value: key
                });
            });
            if (GroupPropertys[index + 1]) {
                group.Data = WArrayF.GroupArray(groupedData[key], GroupPropertys, EvalParams, index + 1);
            }
            DataArraySR.push(group);
        }
        return DataArraySR;
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
                //console.log(element);
                if (!element.hasOwnProperty("count")) {
                    element.count = 1;
                    NewElement.count = 1;
                }
                NewElement.rate = ((1 / DataArray.length) * 100).toFixed(2) + "%";
                DataArraySR.push(NewElement)
            } else {
                if (!element.count) {
                    element.count = 1;
                    DFilt.count++;
                } else {
                    DFilt.count = DFilt.count + element.count;
                }
                DFilt.rate = ((DFilt.count / DataArray.length) * 100).toFixed(2) + "%";
                if (sumProperty != null && sumProperty != "count") {
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
                NewElement.count = element.count ?? 1;
                //console.log(NewElement);
                NewElement.rate = ((1 / DataArray.length) * 100).toFixed(2) + "%";
                DataArraySR.push(NewElement)
            } else {
                //console.log(DFilt);
                const countVal = element.count ?? 1;
                DFilt.count = DFilt.count + countVal;
                DFilt.rate = ((DFilt.count / DataArray.length) * 100).toFixed(2) + "%";
                if (sumParam != null && element[sumParam] != null && element[sumParam] != undefined) {
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
        var MinValue = Data[0][MaxParam] ?? 0
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
            if (typeof DataArry[index][EvalValue] === "number" || parseFloat(DataArry[index][EvalValue]).toString() != "NaN") {
                Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
            } else {
                console.log("ERROR: ", EvalValue, DataArry[index][EvalValue]);
                break;
            }
        }
        return Maxvalue;
    }

    /**
     *
     * @param {*} DataArry
     * @param {*} EvalValue
     * @returns {Number}
     */
    static CountValues(DataArry, EvalValue) {//retorna la suma 
        var Maxvalue = 0;
        for (let index = 0; index < DataArry.length; index++) {
            if (!DataArry[index].hasOwnProperty(EvalValue)) {
                DataArry[index][EvalValue] = 1;
            }
            Maxvalue = Maxvalue + parseFloat(DataArry[index][EvalValue]);
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
        const dataset = Dataset.filter((element) => {
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
        return dataset;
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
                        if (objetoEvaluado[objectProto].toString().toUpperCase().includes(parametro.toString().toUpperCase())) {
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
                        } else if (item.toString().toUpperCase().includes(param.toString().toUpperCase())) {
                            return true;
                        }
                    }
                });
                if (find) {
                    return element;
                }
            } else if (element.toString().toUpperCase().includes(param.toString().toUpperCase())) {
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
        return this.ModelFromFunction(Model[prop]);
    }

    /**
     * @param {Object} Model
     * @param {string} prop
     */
    static ModelFromFunction(propierty) {
        if (propierty.ModelObject.__proto__ == Function.prototype) {
            propierty.ModelObject = propierty.ModelObject();
        }
        return propierty.ModelObject;
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

    /**
     * @param {Array} Array Arreglo para ordenar
     * @param {Object} [Model] Arreglo para ordenar
     * @returns {Object}
     */
    static Consolidado(Array, Model) {
        Model = Model ?? Array[0];
        const consolidado = {};

        for (const prop in Model) {
            if (WArrayF.isNotConsolidable(prop, Model)) {
                continue;
            }
            WArrayF.ConsolidateProp(Model, prop, Array, consolidado);
        }
        return consolidado;
    }

    static isNotConsolidable = (prop, ModelObject) => {
        if (ModelObject != undefined && ModelObject[prop]?.type != undefined && (
                //|| ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
                //|| ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
                ModelObject[prop]?.primary == true
                || ModelObject[prop]?.hidden == true
                || ModelObject[prop]?.hiddenInTable == true
            )
            || ModelObject[prop]?.__proto__ == Function.prototype
            || ModelObject[prop]?.__proto__.constructor.name == "AsyncFunction") {
            return true;
        }
        ;
    }

    static ConsolidateProp(Model, prop, Array, consolidado, filterData) {
        //{ filterProp: Propertys[index], value: key }
        //console.log(filterData);
        const FilterArray = !filterData ? Array : Array.filter(dato => dato[filterData.filterProp] == filterData.value)
        //console.log(FilterArray, typeof Model[prop] === "number");
        consolidado[prop] = {};

        if (Model[prop] == undefined || typeof Model[prop] === "number") {
            const sumaCantidad = this.CountValues(FilterArray, prop);
            consolidado[prop].Cantidad = sumaCantidad;
            consolidado[prop].Porcentaje = sumaCantidad / Array.length * 100;
            //consolidado[prop].Max = this.MaxValue(FilterArray, prop);
            //consolidado[prop].Min = this.MinValue(FilterArray, prop);
        } else {
            consolidado[prop].Valor = Model[prop];
        }
    }

    static replacer(value) {
        if (value == null) {
            return null;
        }
        const replacerElement = {};
        for (const prop in value) {
            if ((prop == "get" && prop == "set") ||
                prop == "ApiMethods" ||
                prop == "FilterData" ||
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
                value[prop]?.__proto__ == Array.prototype || prop == "OrderData") {
                continue;
            }
            replacerElement[prop] = value[prop]

        }
        return replacerElement;
    }
}

export {WArrayF};