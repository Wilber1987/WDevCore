export class NumberUtility {
    static numeroALetras(numero, esMoneda = true, moneda = "PESOS") {
        if (numero === null || numero === undefined) {
            return "";
        }

        return Moneda.convertir(esMoneda ? Number(numero).toFixed(2) : Number(numero).toString(), false, moneda);
    }

    static convertirNumeroALetras(numero) {
        let entero = Math.trunc(numero);
        let decimales = Math.round((numero - entero) * 100);
        let resultado = Moneda.numeroALetras(entero);
        if (decimales > 0) {
            resultado += ` con ${Moneda.numeroALetras(decimales)} centavos`;
        }
        return resultado.toLowerCase();
    }

    static convertirAMoneda(cantidad) {
        return cantidad?.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(",", "|").replace(".", ",").replace("|", ".");
    }
}

export class Moneda {
    static UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    static DECENAS = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", 
                       "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    static CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    static convertir(numero, mayusculas = false, moneda = "PESOS") {
        let partes = numero.toString().replace(".", ",").split(",");
        let parteEntera = partes[0];
        let parteDecimal = partes.length > 1 ? partes[1] : "00";

        let literal = this.obtenerLiteral(parteEntera);
        let decimalLiteral = this.obtenerLiteral(parteDecimal);

        let resultado = `${literal} ${moneda} con ${decimalLiteral} centavos`;
        return mayusculas ? resultado.toUpperCase() : resultado;
    }

    static obtenerLiteral(numero) {
        let n = parseInt(numero);
        if (n === 0) return "cero";
        if (n > 999999) return this.getMillones(numero);
        if (n > 999) return this.getMiles(numero);
        if (n > 99) return this.getCentenas(numero);
        if (n > 9) return this.getDecenas(numero);
        return this.getUnidades(numero);
    }

    static getUnidades(num) {
        return this.UNIDADES[parseInt(num)] || "";
    }

    static getDecenas(num) {
        let n = parseInt(num);
        if (n < 10) return this.getUnidades(num);
        if (n < 20) return this.DECENAS[n - 10];
        let unidad = this.getUnidades(n % 10);
        return unidad ? `${this.DECENAS[Math.trunc(n / 10) + 8]} y ${unidad}` : this.DECENAS[Math.trunc(n / 10) + 8];
    }

    static getCentenas(num) {
        let n = parseInt(num);
        if (n === 100) return "cien";
        return this.CENTENAS[Math.trunc(n / 100)] + " " + this.getDecenas(n % 100);
    }

    static getMiles(numero) {
        let miles = Math.trunc(numero / 1000);
        let resto = numero % 1000;
        return miles > 1 ? `${this.getCentenas(miles)} mil ${this.getCentenas(resto)}` : `mil ${this.getCentenas(resto)}`;
    }

    static getMillones(numero) {
        let millones = Math.trunc(numero / 1000000);
        let resto = numero % 1000000;
        return millones > 1 ? `${this.getCentenas(millones)} millones ${this.getMiles(resto)}` : `un millón ${this.getMiles(resto)}`;
    }
}
