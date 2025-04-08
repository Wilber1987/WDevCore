//@ts-check
import { StylesControlsV2 } from "../StyleModules/WStyleComponents.js";
import { ComponentsManager, ConvertToMoneyString, html, WRender } from "../WModules/WComponentsTools.js";
import { WOrtograficValidation } from "../WModules/WOrtograficValidation.js";
import { css } from "../WModules/WStyledRender.js";
import { WDocumentViewer } from "./WDocumentViewer.js";

/**
 * @typedef {Object} ReportConfig
 * @property {Array} [Dataset]
 * @property {Object} [ModelObject]
 * @property {HTMLElement} [Header]
 * @property {String} [PageType]
 * @property {Function} [exportXlsAction]
 * @property {boolean} [exportPdf]
 * @property {boolean} [print]
 * @property {boolean} [exportPdfApi]
 * @property {boolean} [exportXls]
 * @property {Array<string>} [GroupParams] - Parámetros para agrupar los datos.
 * @property {Array<string>} [EvalParams] - Parámetros para evaluar (suma, conteo, avg) en cada 
 */class WReportComponent extends HTMLElement {
	/**
	 * @param {ReportConfig} Config 
	 */
	constructor(Config) {
		super();
		this.Config = Config;
		this.OptionContainer = WRender.Create({ className: "OptionContainer" });
		this.MainContainer = WRender.Create({ className: "MainContainer", id: 'Container' });
		this.Manager = new ComponentsManager({ MainContainer: this.MainContainer, SPAManage: false });
		this.ReportContainer = WRender.Create({ className: "ReportContainer", id: 'Container' });
		this.append(StylesControlsV2.cloneNode(true));
	}

	connectedCallback() {
		this.Draw();
	}

	Draw = async () => {
		if (!this.Config.Dataset) return;
		this.OptionContainer.innerHTML = "";
		this.MainContainer.innerHTML = "";
		this.ReportContainer.innerHTML = "";
		this.Manager.DomComponents = [];
		this.appendChild(this.OptionContainer);
		this.appendChild(this.MainContainer);
		this.appendChild(this.CustomStyle);
		this.MetricLevels = {}; // Reiniciamos la propiedad para recalcular
		const groupedData = this.groupData(this.Config.Dataset);
		console.log(groupedData);

		this.RenderGroups(groupedData);
		this.ReportContainer.appendChild(this.RenderMetrics(this.MetricLevels["General Summary"], 0));
		this.SetOptions();
		this.Manager.NavigateFunction("report", this.ReportContainer);
	}

	SetOptions() {
		this.OptionContainer.appendChild(html`<button class="BtnPrimary" onclick="${() => {
			this.Manager.NavigateFunction("report");
		}}">Reporte</button>`);

		this.OptionContainer.appendChild(html`<button class="BtnPrimary" onclick="${() => {
			const documentViewer = this.ViewDocument();
			this.Manager.NavigateFunction("documentViewer", documentViewer);
		}}">Vista de documento</button>`);
	}

	ViewDocument() {
		return new WDocumentViewer({
			Header: this.Config.Header,
			PageType: this.Config.PageType,
			exportPdf: this.Config.exportPdf,
			exportPdfApi: this.Config.exportPdfApi,
			exportXls: this.Config.exportXls,
			print: this.Config.print,
			exportXlsAction: this.Config.exportXlsAction,
			CustomStyle: this.CustomStyle.cloneNode(true),
			// @ts-ignore
			Dataset: this.ReportContainer.cloneNode(true).childNodes
		});
	}

	groupData2(data) {
		const { GroupParams, EvalParams } = this.Config;
		if (!GroupParams || GroupParams.length === 0) return { "All Data": data };

		const grouped = {};
		this.MetricLevels = {};
		data.forEach(item => {
			let currentLevel = grouped;
			GroupParams.forEach((param, index) => {
				const key = item[param] ?? "Undefined";
				if (!currentLevel[key]) {
					currentLevel[key] = index === GroupParams.length - 1 ? [] : {};
				}
				currentLevel = currentLevel[key];
			});
			currentLevel.push(item);
		});
		return grouped;
	}

	groupData(data) {

		const { GroupParams, EvalParams } = this.Config;
		if (!GroupParams || GroupParams.length === 0) {
			// @ts-ignore
			this.MetricLevels["All Data"] = this.calculateSummary(data);
			return { "All Data": data };
		}

		const grouped = {};


		data.forEach(item => {
			let currentLevel = grouped;
			let path = []; // Almacena el nivel de agrupación

			GroupParams.forEach((param, index) => {
				const key = item[param] ?? "Undefined";
				path.push(key);
				if (!currentLevel[key]) {
					currentLevel[key] = index === GroupParams.length - 1 ? [] : {};
				}
				currentLevel = currentLevel[key];
			});

			currentLevel.push(item);
		});

		// Función recursiva para calcular los resúmenes de cada grupo
		const processGroup = (group, path = []) => {
			let allItems = [];

			Object.keys(group).forEach(key => {
				const currentPath = [...path, key];
				if (Array.isArray(group[key])) {
					// Si es un array, calcular resumen y almacenarlo en MetricLevels
					// @ts-ignore
					this.MetricLevels[currentPath.join(" > ")] = this.calculateSummary(group[key], data);
					allItems = allItems.concat(group[key]);
				} else {
					// Si es un objeto anidado, procesarlo recursivamente
					const subItems = processGroup(group[key], currentPath);
					allItems = allItems.concat(subItems);
				}
			});

			// Resumen del nivel actual
			if (allItems.length > 0) {
				// @ts-ignore
				this.MetricLevels[path.join(" > ")] = this.calculateSummary(allItems, data);
			}

			return allItems;
		};

		processGroup(grouped);

		// Consolidado general
		// @ts-ignore
		this.MetricLevels["General Summary"] = this.calculateSummary(data);

		console.log(this.MetricLevels);


		return grouped;
	}

	// Método auxiliar para calcular el resumen de un conjunto de datos
	calculateSummary(data, parentData) {
		const summary = {};
		const { EvalParams, ModelObject } = this.Config;

		EvalParams?.forEach(param => {
			const isWithModel = ModelObject != null && ModelObject != undefined;
			const isMoney = isWithModel && ModelObject[param]?.type?.toUpperCase() === "MONEY";
			const isNumber = isWithModel && ModelObject[param]?.type?.toUpperCase() === "NUMBER";

			// Solo sumar valores numéricos si el tipo es MONEY o NUMBER
			const totalSum = (isMoney || isNumber)
				? data.reduce((acc, item) => acc + (typeof item[param] === 'number' ? item[param] : 0), 0)
				: undefined;


			const totalElements = parentData?.length ?? data.length; // Total de elementos en data
			const validCount = data.filter(item => item[param] !== undefined && item[param] !== null).length; // Cuenta los elementos válidos
			const avg = totalElements > 0 ? (validCount / totalElements) * 100 : 0; // % de elementos válidos

			summary[param] = {
				...(totalSum !== undefined ? { sum: totalSum } : {}), // Solo incluir 'sum' si se calculó
				count: validCount, // Número de elementos válidos
				avg // % de elementos válidos sobre el total
			};
			console.log(summary);
			
		});

		return summary;
	}




	/*calculateMetrics(group, EvalParams) {
		const metrics = {};
		EvalParams?.forEach(param => {
			const values = group.map(item => item[param]).filter(v => typeof v === 'number');
			metrics[param] = {
				sum: values.reduce((acc, v) => acc + v, 0),
				count: values.length,
				avg: values.length > 0 ? values.reduce((acc, v) => acc + v, 0) / values.length : 0
			};
		});
		return metrics;
	}*/

	RenderGroups(groupedData, level = 0, path = []) {
		Object.keys(groupedData).forEach(key => {
			const currentPath = [...path, key]; // Construimos el identificador del grupo
			const groupKey = currentPath.join(" > "); // Formato de clave para recuperar métricas

			// Obtener resumen del grupo actual
			// @ts-ignore
			const summary = this.MetricLevels[groupKey] || {};


			// Crear un contenedor para el grupo
			const container = WRender.Create({
				className: `group-level-${level} group-level`,
				children: [
					WRender.Create({
						className: "group-title" + ` group-${level}`,
						children: [WOrtograficValidation.es(key)]
					})
				]
			});

			// Agregar al contenedor principal del reporte
			this.ReportContainer.appendChild(container);

			if (Array.isArray(groupedData[key])) {
				// Si es una lista de datos, renderizar la tabla
				this.CreateTable(groupedData[key], this.ReportContainer);
			} else {
				// Si es un subgrupo, renderizarlo recursivamente
				this.RenderGroups(groupedData[key], level + 1, currentPath);
			}
			this.ReportContainer.appendChild(this.RenderMetrics(summary, level + 1));
		});

	}

	// Método auxiliar para renderizar métricas
	RenderMetrics(summary, level) {
		return WRender.Create({
			className: "metrics-container  level" + level,
			children:  Object.keys(summary ?? {}).map(metric =>
				WRender.Create({
					className: "metric",
					children: [this.ProcessMetricValue(metric, summary)]
				})
			)
		});
	}

	ProcessMetricValue(metric, summary) {
		const isWithModel = this.Config.ModelObject != null && this.Config.ModelObject != undefined;
		const isMoney = isWithModel && this.Config.ModelObject[metric]?.type?.toUpperCase() === "MONEY";
		const isNumber = isWithModel && this.Config.ModelObject[metric]?.type?.toUpperCase() === "NUMBER";
		let sumValue = "";
		let countValue = `Count: ${summary[metric].count}`;
		let avgValue = `Avg: ${summary[metric].avg.toFixed(2)}%`;
		
		
		if (isMoney || isNumber) {
			sumValue = `${summary[metric].sum}`;
			if (isMoney) {
				sumValue = `${ConvertToMoneyString(summary[metric].sum)}`;
			}
		}
		return html`<div class="metric-container">               
                ${(isMoney || isNumber) ? html`<label class="metric-label">
						<label class="metric-label">
							<span class="metric-name">${metric}: ${isWithModel && this.Config.ModelObject[metric]?.Currency ? this.Config.ModelObject[metric].Currency : ""}</span>
						</label>
                        <span class="metric-value">${sumValue}</span>
                    </label>`
				: ""}
                <label class="metric-label">
                    <span class="metric-value">${countValue}</span>
                </label>
                <label class="metric-label">
                    <span class="metric-value">${avgValue}</span>
                </label>
            </div>`;
	}


	CreateTable(data, parent) {
		const table = WRender.Create({ tagName: "table", className: "report-table" });
		data.forEach((item, index) => {
			this.TableHeader(index, item, table);
			const row = WRender.Create({
				tagName: "tr", className: "table-row"
			});
			for (const prop in item) {
				if (this.IsDrawableRow(item, prop)) {
					row.appendChild(this.BuildTD(prop, item[prop], item));
				}
			}
			table.appendChild(row);
		});
		parent.appendChild(table);
	}
	TableHeader(index, item, table) {
		if (index == 0) {
			const row = WRender.Create({
				tagName: "tr", className: "table-row"
			});
			for (const prop in item) {
				if (this.IsDrawableRow(item, prop)) {
					row.appendChild(WRender.Create({
						tagName: "th",
						className: "table-cell",
						children: [WOrtograficValidation.es(prop)]
					}));
				}
			}
			table.appendChild(row);
		}
	}

	BuildTD(prop, value, item) {
		let classType = "";
		let processValue = value;
		if (this.Config.ModelObject && this.Config.ModelObject[prop]) {
			switch (this.Config.ModelObject[prop].type?.toUpperCase()) {
				case "DATE":
					classType = "row-date";
					processValue = new Date(value).toLocaleDateString();
					break;
				case "NUMBER":
					classType = "row-number";
					break;
				case "PHONE":
					classType = "row-number";
					break;
				case "DATETIME":
					processValue = new Date(value).toLocaleString();
					classType = "row-date";
					break;
				case "MONEY":
					classType = "row-money";
					return WRender.Create({
						tagName: "td", className: "table-cell " + classType, children: [
							html`<label>
								<span>${(this.Config.ModelObject[prop].Currency ? this.Config.ModelObject[prop].Currency + " " : "")}</span>
								<span>${ConvertToMoneyString(value)}</span>
							</label>`
						]
					});
				case "OPERATION":
					processValue = this.Config.ModelObject[prop].action(item)
					break
				case "PERCENTAGE":
					processValue = `${processValue?.toFixed(2)}%`;
					classType = "row-number";
					break;
			}
		}

		return WRender.Create({ tagName: "td", className: "table-cell " + classType, children: [processValue?.toString()] });
	}
	IsDrawableRow(element, prop) {
		if (this.Config.ModelObject == undefined
			&& (typeof element[prop] == "number"
				|| typeof element[prop] == "string"
				|| typeof element[prop] == "boolean"
				|| typeof element[prop] == "bigint")) {
			return true;
		}
		const hidden = typeof this.Config.ModelObject[prop]?.hidden === "function" ? this.Config.ModelObject[prop]?.hidden(element) : this.Config.ModelObject[prop]?.hidden;
		if ((this.Config.ModelObject[prop]?.type == undefined
			|| this.Config.ModelObject[prop]?.type.toUpperCase() == "MASTERDETAIL"
			|| this.Config.ModelObject[prop]?.type.toUpperCase() == "MULTISELECT"
			|| this.Config.ModelObject[prop]?.primary == true
			|| hidden
			|| this.Config.ModelObject[prop]?.hiddenInTable == true)
			|| element[prop]?.__proto__ == Function.prototype
			|| element[prop]?.__proto__.constructor.name == "AsyncFunction") {
			return false;
		}
		return true;
	}


	CustomStyle = css`
		*{
			-webkit-print-color-adjust: exact !important;
			border-collapse: collapse;
		}
		w-report {
			display: block;
			padding: 20px;
			background-color: #ffffff;
		}
		.group-level {
			height: auto;
			overflow: hidden;
		}
		.MainContainer{
			overflow-y: auto;
			color: #292929;
		}

		.container {
			flex: 8;
			display: grid;
			flex-direction: column;            
			border: 1px #cdcbcb solid;    
			grid-auto-rows: min-content;
		}   
		.container label { padding: 5px; }      
		.header-container {
			display: grid;
			grid-template-columns: 100px calc(100% - 120px);
			gap: 15px 30px;
			margin-bottom: 20px;
		} 
		.header-container .logo {
			grid-row: span 3;
			width: 100%;
		}
		.header, .sub-header {
			margin: 0px;
			font-weight: bold;
			text-align: center;
		}
		.report-container {
			border-collapse: collapse;
			border: 1px solid #D2D2D2;
		}
		.child {
			border: none;
			padding: 0px;  
		}
		.child-object{
			display: flex;
			flex-direction: column;            
			gap: 10px;
			padding: 5px 10px;  
			font-size: 12px;
		}
		.report-container:first-child {
			border-left: 1px solid #D2D2D2;
		}
		
		* {
			box-sizing: border-box;
			font-family: "Open Sans", sans-serif;
		}

		
		/* Grupos */
		.group-title {
			font-size: 16px;
			font-weight: bold;
			padding: 10px;
			margin: 10px 0;
			border-left: 5px solid #3498db;
		}
		.group-title.group-0 {
			text-transform: uppercase;
			font-size: 20px;
			border-left: unset;
			border-bottom: 5px solid #3498db;
		}
			

		/* Métricas */
		.metrics-container {
			padding: 10px;
			margin: 10px 0;
			border: 1px solid #d0e1ff;
			border-radius: 5px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			gap: 20px;
		}

		.metric {
			font-size: 14px;
			font-weight: bold;
			min-width: 180px;
			display: flex;
			justify-content: space-between;
		}

		/* Tablas */
		.report-table {
			width: 100%;
			border-collapse: collapse;
			margin-top: 10px;
			background: #fff;
		}

		.table-row {
			border-bottom: 1px solid #ddd;
		}

		.table-cell {
			padding: 8px 12px;
			text-align: left;
			border: 1px solid #ddd;
		}

		.row-title, .row-footer, .row-number, .row-string {
			padding: 5px 10px;
			
			border: 1px solid #dadada;
		}       
		.row-money  label{
			display: flex;
			justify-content: space-between;
			
		}
		.row-title, .row-footer {
			padding: 5px 10px;
			color: #5D6975;
			background-color: #f1f1f1;
			white-space: nowrap;
			font-weight: normal;
			text-transform: uppercase;
			font-weight: bold;
		}   
		
		.row-number {
			text-align: right;
		}

		.table-row:nth-child(even) {
			background-color: #f2f2f2;
		}

		/* Botón de exportación */
		.OptionContainer {
			display: flex;
			justify-content: flex-end;
			margin-bottom: 10px;
		}
		.level0 {
			border: solid 1px #0055a5;
			font-weight: bold;
		}
		.level1 {
			border: solid 1px #3098f8;
		}
		.level2 {	
			border: solid 1px #6b9fcf;
		}
		.level3 {	
			border: solid 1px #76a7d4;
		}
		.metric-container {
			display: flex;
			border-radius: 5px;
		}

		.metric-label {
			font-weight: bold;
			padding: 0px 5px;
		}

		.metric-name {
			font-size: 16px;
		}

		.metric-value {
			font-size: 16px;
			color: #222;
		}


		/* Modo impresión */
		@media print {
			.MainContainer {
				border: none;
				background: white;
				padding: 0;
				margin: 0;
				box-shadow: none;
			}		
			.group-title {
				background: none;
				border-left: none;
				font-size: 14px;
			}

			.table-cell {
				padding: 5px;
				font-size: 12px;
			}

			
		}      
	`;

	replacer(value) {
		if (value == null) {
			return null;
		}
		const replacerElement = {};
		for (const prop in value) {
			if ((prop == "get" || prop == "set") ||
				prop == "ApiMethods" ||
				prop == "FilterData" ||
				prop == "Get" ||
				prop == "Find" ||
				prop == "GetByProps" ||
				prop == "FindByProps" ||
				prop == "Save" ||
				prop == "Update" ||
				prop == "GetData" ||
				prop == "SaveData" ||
				value[prop] == null ||
				value[prop] == undefined ||
				value[prop].__proto__.constructor.name == "AsyncFunction" ||
				// value[prop]?.__proto__ == Object.prototype ||
				value[prop]?.__proto__ == Function.prototype || prop == "OrderData") {
				continue;
			}
			replacerElement[prop] = value[prop]

		}
		return replacerElement;
	}
}
customElements.define('w-report', WReportComponent);
export { WReportComponent };

const PageType = {
	A4: "A4",
	A4_HORIZONTAL: "A4-horizontal",
	CARTA: "carta",
	CARTA_HORIZONTAL: "carta-horizontal",
	OFICIO: "oficio",
	OFICIO_HORIZONTAL: "oficio-horizontal"
}
export { PageType };
