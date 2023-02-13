class WOrtograficValidation {
    static es = (val = "") => {
        try {
            val = val.toString().replaceAll("_id", "")
                .replaceAll("Tbl_", "")
                .replaceAll("Cat_", "")
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
        { error: ["CODIGO"], value: "código" },
        { error: ["TITULO"], value: "título" },
        { error: ["GENERO"], value: "género" },
        { error: ["DNI"], value: "DNI" },
    ]
}
export { WOrtograficValidation }