//@ts-check

import { WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WSimpleModal } from "./WSimpleModal.js";

export const ModalMessage = (message, detail = "", reload = false) => {
	const ModalCheck = new WSimpleModal({
		title: message,
		CloseOption: false,
		ObjectModal: [WRender.Create({ tagName: 'p', class: "modalP", innerText: detail }), WRender.Create({
			style: { textAlign: "center" },
			children: [WRender.Create({
				tagName: 'input', type: 'button', className: 'Btn', value: 'ACEPTAR', onclick: async () => {
					ModalCheck.close();
					if (reload == true) {
						window.location.reload();
					}
				}
			}), css`
				.modalP{
					text-align: center;
				}
			`]
		})]
	});
	return ModalCheck;
}