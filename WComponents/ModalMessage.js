//@ts-check
import { WAlertMessage } from "./WAlertMessage.js";

window.addEventListener('load', async () => {
	console.log(localStorage.getItem("reloadWAlertMessage"));
	const message = localStorage.getItem("reloadWAlertMessage");
	if (message != null) {
		document.body.append(ModalMessage(message));
		localStorage.removeItem("reloadWAlertMessage");
	}
})
export const ModalMessage = (/** @type {String} */ message, detail = "", reload = false) => {
	if (reload == true) {
		localStorage.setItem("reloadWAlertMessage", message);
		window.location.reload();
	}
	WAlertMessage.Info(message, true);
	return new WAlertMessage({ Message: message, Temporal: true });
}
