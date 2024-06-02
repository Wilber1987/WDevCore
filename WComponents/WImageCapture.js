//@ts-check
import { WRender } from "../WModules/WComponentsTools.js";
import { css } from "../WModules/WStyledRender.js";
import { WModalForm } from "./WModalForm.js";

const videoElement = WRender.Create({ tagName: 'video', className: 'videoElement' });
const canvas = WRender.Create({ tagName: 'canvas', className: 'canvas' });
const croppedCanvas = WRender.Create({ tagName: 'canvas', className: 'croppedCanvas' });
//context
// @ts-ignore
const ctx = canvas.getContext('2d');
// @ts-ignore
const croppedCtx = croppedCanvas.getContext('2d');
let img = new Image();
let startX, startY, endX, endY;
let isDragging = false;
let isResizing = false;
let activeHandle = null;
let croppedImageBase64 = '';

const handles = [];
class WImageCapture extends HTMLElement {
    constructor(Config) {
        super();
        this.Config = Config
        this.attachShadow({ mode: 'open' });
        WRender.SetStyle(this, {
            display: "block",
            width: "-webkit-fill-available"
        })
        this.shadowRoot?.append(this.CustomStyle);
        this.Draw();
    }
    connectedCallback() { }
    Draw = async () => {
        this.ControlContainer = WRender.Create({
            class: "capture-container", children: []
        });
        const InputControl = WRender.Create({
            tagName: "input", id: "imageInput", className: "LabelFile", onchange: () => { }, type: "file", style: {
                display: "none"
            }
        });
        const label = WRender.Create({
            tagName: "label",
            class: "LabelFile",
            innerText: "Seleccionar archivo",
            htmlFor: "imageInput"
        });

        // @ts-ignore
        InputControl.accept = ".jpg, .jpeg, .png";

        const cameraButton = WRender.Create({
            tagName: 'button', className: 'LabelFile', innerText: 'Use Camera', onclick: async () => {
                //code.....
            }
        });
        const captureButton = WRender.Create({
            tagName: 'button', className: 'captureButton', innerText: '', onclick: async () => {
                //code.....
            }
        });

        this.setEvents(InputControl, canvas, ctx, cameraButton, videoElement, captureButton);

        this.ControlContainer.append(InputControl, canvas, label, cameraButton);
        this.shadowRoot?.append(this.ControlContainer)
    }
    setEvents(InputControl, canvas, ctx, cameraButton, videoElement, captureButton) {
        InputControl.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    this.initializeHandles();
                };
            }
        });

        cameraButton.addEventListener('click', () => {
            this.shadowRoot?.append(new WModalForm({
                ObjectModal:
                    WRender.Create({ className: "camera-container", children: [
                        videoElement, captureButton, css`
                            .camera-container {
                                position: relative;
                                width: -webkit-fill-available;
                            }
                            .videoElement {
                                width: -webkit-fill-available;
                            }  
                            .captureButton {
                                height: 40px;
                                width: 40px;
                                background-color: red;
                                border-radius: 50%;
                                border: none;
                                position: absolute;
                                bottom: 10px;
                                display: block;
                                margin: auto;
                            } 
                        `
                    ] })
            }));


            //videoElement.style.display = 'block';
            //captureButton.style.display = 'block';
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoElement.srcObject = stream;
                })
                .catch(error => {
                    console.error('Error accessing the camera', error);
                });
        });

        captureButton.addEventListener('click', () => {
            const videoWidth = videoElement.videoWidth;
            const videoHeight = videoElement.videoHeight;
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
            img.src = canvas.toDataURL('image/png');
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                this.initializeHandles();
            };
            videoElement.style.display = 'none';
            captureButton.style.display = 'none';
            const stream = videoElement.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        });

        canvas.addEventListener('mousedown', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const handle = this.getHandleUnderCursor(x, y);
            if (handle) {
                isResizing = true;
                activeHandle = handle;
            } else {
                startX = x;
                startY = y;
                isDragging = true;
            }
        });

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (isDragging) {
                endX = x;
                endY = y;

                // Redibuja la imagen y el rectángulo de selección
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                this.drawSelectionRect(startX, startY, endX, endY);
            } else if (isResizing) {
                this.resizeSelectionRect(x, y);
            }
        });

        document.addEventListener('mouseup', (event) => {
            if (isDragging || isResizing) {
                isDragging = false;
                isResizing = false;
                activeHandle = null;
                this.cropImage();
            }
        });
    }

    update() {
        this.Draw();
    }

    drawSelectionRect(startX, startY, endX, endY) {
        // @ts-ignore
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
        ctx.drawImage(img, 0, 0); // Redibujar la imagen original

        // Dibujar el rectángulo de selección
        ctx.beginPath();
        ctx.rect(startX, startY, endX - startX, endY - startY);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar los círculos en las esquinas del rectángulo
        const handleRadius = 5; // Radio de los círculos
        const handlePositions = [
            { x: startX, y: startY },
            { x: endX, y: startY },
            { x: startX, y: endY },
            { x: endX, y: endY }
        ];

        ctx.fillStyle = 'red';
        handlePositions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, handleRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        this.updateHandles();
    }


    cropImage() {
        const cropWidth = endX - startX;
        const cropHeight = endY - startY;
        // @ts-ignore
        croppedCanvas.width = cropWidth;
        // @ts-ignore
        croppedCanvas.height = cropHeight;
        croppedCtx.drawImage(
            img,
            startX, startY, cropWidth, cropHeight,
            0, 0, cropWidth, cropHeight
        );

        // Almacenar la imagen recortada en formato Base64
        // @ts-ignore
        croppedImageBase64 = croppedCanvas.toDataURL('image/png');
        console.log(croppedImageBase64); // Imprimir el resultado en la consola
        //const imgt = WRender.Create({tagName: "img", src: croppedImageBase64})
        //this.shadowRoot.append(new WModalForm({ ObjectModal: imgt}))
    }

    initializeHandles() {
        const handleSize = 10;
        for (let i = 0; i < 4; i++) {
            const handle = document.createElement('div');
            handle.className = 'handle';
            handle.style.width = `${handleSize}px`;
            handle.style.height = `${handleSize}px`;
            handle.style.display = 'none';
            handle.style.position = 'absolute';
            document.body.appendChild(handle);
            handles.push(handle);
        }
    }

    updateHandles() {
        const handlePositions = [
            { left: startX - 5, top: startY - 5 },
            { left: endX - 5, top: startY - 5 },
            { left: startX - 5, top: endY - 5 },
            { left: endX - 5, top: endY - 5 }
        ];
        handles.forEach((handle, index) => {
            handle.style.left = `${handlePositions[index].left}px`;
            handle.style.top = `${handlePositions[index].top}px`;
            handle.style.display = 'block';
        });
    }

    getHandleUnderCursor(x, y) {
        return handles.find(handle => {
            const rect = handle.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        });
    }

    resizeSelectionRect(x, y) {
        const handleIndex = handles.indexOf(activeHandle);
        switch (handleIndex) {
            case 0:
                startX = x;
                startY = y;
                break;
            case 1:
                endX = x;
                startY = y;
                break;
            case 2:
                startX = x;
                endY = y;
                break;
            case 3:
                endX = x;
                endY = y;
                break;
        }

        // Redibuja la imagen y el rectángulo de selección
        // @ts-ignore
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        this.drawSelectionRect(startX, startY, endX, endY);
    }
    CustomStyle = css`
        .capture-container{
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
         .WImageCapture{
            display: block;
         }  
         canvas {
            border: 1px solid black;
            position: relative;
            width: 100%;
        }
        .handle {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: red;
            cursor: pointer;
            opacity: 0;
        }
        .canvas-container {
            position: relative;
        }
           
        .imgPhoto {
            grid-row-start: 1 !important;
        }
        .DrawControlContainer{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .imgPhotoWModal {
            max-height: 250px;
            max-width: 250px;
            min-height: 250px;
            display: block;
            margin: auto;
            width: 100%;
            object-fit: cover;
            box-shadow: 0 0px 2px 0px #000;
            object-position: top;
            border-radius: .5cm;
        }
        .LabelFile {
            padding: 5px 10px;
            max-width: 250px;
            margin: auto;
            cursor: pointer;
            background-color: #4894aa;
            border-radius: 0.2cm;
            display: block;
            color: #fff;
            text-align: center;
            border: none;
            font-size: 14px;
        }  
         
     `
}
customElements.define('w-image-capture', WImageCapture);
export { WImageCapture }