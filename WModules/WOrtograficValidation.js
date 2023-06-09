class WOrtograficValidation {
    /**
     * 
     * @param {String} val 
     * @returns {String}
     */
    static es = (val = "") => {
        try {
            val = val.toString().replaceAll("_id", "")
                .replaceAll("Tbl_", "")
                .replaceAll("Cat_", "")
                .replaceAll("Catalogo_", "")
                .replaceAll("catalogo_", "")
                .replaceAll("Transaction_", "")
                .replaceAll("transaction_", "")
                .replaceAll("Relational_", "")
                .replaceAll("relational_", "")
                .replaceAll("cat_", "")
                .replaceAll("tbl_", "")
                .replaceAll("Tbl", "")
                .replaceAll("tbl", "")
                .replaceAll("id_", "")
                .replaceAll("Id_", "")
                .replaceAll("_Id", "")
                .replaceAll("_", " ");
            const words = val.split(" ");
            let valReturn = "";
            words.forEach((word, index) => {
                const valUper = word.toUpperCase();
                const validate = this.spanish.find(v => v.error.find(e => e == valUper));
                if (index > 0) {
                    valReturn += " ";
                }
                if (validate != null) {
                    valReturn += validate.value;
                } else {
                    valReturn += word;
                }
            });
            return valReturn;
        } catch (error) {
            console.log(error);
            console.log(val);
            return "";
        }   

    }
    static spanish = [
        { error: ["INSTITUCION", "INSTITUSION"], value: "institución" },
        { error: ["FINALIZACION"], value: "finalización" },
        { error: ["PAIS"], value: "país" },
        { error: ["PSICOLOGO"], value: "psicólogo" },
        { error: ["TELEFONO"], value: "teléfono" },
        { error: ["DNI"], value: "DNI" },
        { error: ["DIRECCION"], value: "dirección" },
        { error: ["VALORACION"], value: "valoración" },
        { error: ["CODIGO"], value: "código" },
        { error: ["TITULO"], value: "título" },
        { error: ["GENERO"], value: "género" },
        { error: ["DESCRIPCION"], value: "descripción" },
        { error: ["EMPENO"], value: "empeño" }, 
        { error: ["TRANSACCION", "Transaccion"], value: "transacción" },
        { error: ["CORDOBAS", "CORDOBA"], value: "C$" },
        { error: ["DOLARES", "DOLAR"], value: "$" },
        { error: ["IDENTIFICACION"], value: "identificación" },
    ]
}
export { WOrtograficValidation }