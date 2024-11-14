class DateTime extends Date {
    /**
    * @param {String|Date} [dateTime] 
    */
    constructor(dateTime) {
        if (dateTime == undefined) {
            super(new Date().getTime());
            this.Date = new Date();
        } else if (dateTime instanceof Date) {
            super(dateTime.getTime());
            this.Date = dateTime;
        } else {
            super(dateTime);
            this.Date = new Date(dateTime);
        }

    }
    /**
     * @returns {String} ISO 8601 date string (YYYY-MM-DD)
     */
    toISO() {
        return this.Date.toISO();
    }
    /**
    * @returns {String} ISO 8601 date string (YYYY-MM-DD)
    */
    toDDMMYYYY() {
        let date =this.Date;

        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        if (month < 10) {
            return `${day}-0${month}-${year}`
        } else {
            return  `${day}-${month}-${year}`
        }
    }
    /**
     * @returns {String} Formatted date string (dd de mes de a o)
     */
    toDateFormatEs() {
        return this.Date.toString().toDateFormatEs();
    }

    /**
     * @returns {String} Formatted date and time string (d de mes de a o, h:i a)
     */
    toDateTimeFormatEs() {
        return this.Date.toString().toDateTimeFormatEs();
    }
    /**
     * @returns {Date} A new Date object representing the start of the day
     * (i.e. the date at 00:00:00)
     */
    toStartDate() {
        return this.Date.toStartDate();
    }
    /**
     * Adds the given number of days to the date
     * @param {Integer} days The number of days to add
     * @returns {DateTime} The modified DateTime object
     */
    addDays(days) {
        this.Date.addDays(days);
        return this;
    }
    /**
     * Subtracts the given number of days from the date
     * @param {Integer} days The number of days to subtract
     * @returns {DateTime} The modified DateTime object
     */
    subtractDays(days) {
        this.Date.subtractDays(days);
        return this;
    }

    /**
     * Modifies the month of the date by the given number of months
     * @param {Number} meses The number of months to add (positive) or subtract (negative)
     * @returns {DateTime} The modified DateTime object
     */
    modifyMonth(meses) {
        this.Date.modifyMonth(meses);
        return this;
    }



    /**
     * @returns {String} Month as a string (e.g. 'enero', 'febrero', etc.)
     */
    getMonthFormatEs() {
        return this.Date.getMonthFormatEs();
    }

    /**
     * @returns {String} Day of the week as a string (e.g. 'lunes', 'martes', etc.)
     */
    getDayFormatEs() {
        return this.Date.getDayFormatEs();
    }

}
export { DateTime };

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

String.prototype.toDateTimeFormatEs = function () {
    if (this == null || this == undefined || this == "") return "";
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dias_semana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fecha = new Date(this);
    return dias_semana[fecha.getDay()]
        + ', ' + fecha.getDate()
        + ' de ' + meses[fecha.getMonth()]
        + ' de ' + fecha.getUTCFullYear()
        + ' ' + pad(fecha.getHours()) + ':' + pad(fecha.getMinutes());
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
