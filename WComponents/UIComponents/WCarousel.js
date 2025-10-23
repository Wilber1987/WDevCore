//@ts-check
import { html } from "../../WModules/WComponentsTools.js";
import { css } from "../../WModules/WStyledRender.js";

class WCarousel extends HTMLElement {
    /**
     * @param {HTMLElement[]} items - Array de elementos HTML a mostrar en el carrusel
     */
    constructor(items = []) {
         super();
        this.items = Array.isArray(items) ? [...items] : []; // Solo si viene del constructor
        this.currentIndex = 0;
        this.append(this.CustomStyle);
    }

    connectedCallback() {
        // Opcional: inicialización adicional si es necesario
        // Si no se inicializó por constructor, tomar los hijos embebidos
        if (this.items.length === 0) {
            // Convertir los hijos actuales en un array
            // @ts-ignore
            this.items = Array.from(this.children).map(child => child);
            // Limpiar el contenido visual original
            this.innerHTML = "";
        }
        this.Draw();
    }

    Draw = () => {
        // Clonamos los ítems para hacer el carrusel cíclico visualmente
        // Añadimos copia del último al inicio y del primero al final
        /** @type {HTMLElement[]} */
        const extendedItems = [
            // @ts-ignore
            this.items[this.items.length - 1].cloneNode(true), ...this.items.map(el => el.cloneNode(true)), this.items[0].cloneNode(true)
        ];

        const content = html`<div class="carousel-container">
                <button class="nav-btn prev" onclick="${this.prev}"><</button>
                <div class="carousel-track"  ontransitionend="${(/** @type {any} */ e) => this.onTransitionEnd(e)}">
                    ${this.GetNodeChilds(extendedItems)}
                </div>
                <button class="nav-btn next" onclick="${this.next}">></button>
            </div>`;

        this.append(content);

        // Posicionamos en el primer ítem real (índice 1 del track)
        this.updateTrackPosition();
    };

    updateTrackPosition = () => {
        /** @type {HTMLElement?} */
        const track = this.querySelector('.carousel-track');
        if (track) {
            // Cada slide tiene 100% de ancho → desplazamiento = -100% * (currentIndex + 1)
            const offset = -(this.currentIndex + 1) * 100;
            track.style.transform = `translateX(${offset}%)`;
        }
    }

    next = () => {
        this.currentIndex++;
        this.updateTrackPosition();
    };

    prev = () => {
        this.currentIndex--;
        this.updateTrackPosition();
    };

    onTransitionEnd = (/** @type {{ target: Element | null; }} */ e) => {
        // Solo reaccionamos al final de la transición del track
        if (e.target !== this.querySelector('.carousel-track')) return;

        // Manejo cíclico: si llegamos al "falso" último (índice length + 1), saltamos al primero real
        if (this.currentIndex >= this.items.length) {
            this.currentIndex = 0;
            // Desactivamos transición brevemente para saltar sin animación
            /** @type {HTMLElement?} */
            const track = this.querySelector('.carousel-track');
            if (track) {
                track.style.transition = 'none';
                requestAnimationFrame(() => {
                    this.updateTrackPosition();
                    // Reactivamos transición
                    setTimeout(() => {
                        track.style.transition = '';
                    }, 50);
                });
            }

        } else if (this.currentIndex < 0) {
            this.currentIndex = this.items.length - 1;
            /** @type {HTMLElement?} */
            const track = this.querySelector('.carousel-track');
            if (track) {
                track.style.transition = 'none';
                requestAnimationFrame(() => {
                    this.updateTrackPosition();
                    setTimeout(() => {
                        track.style.transition = '';
                    }, 50);
                });
            }
        }
    };

    CustomStyle = css`
    w-carousel {
        display: block;
        width: 100%;
        height: 100%; /* Requiere que el padre tenga altura */
        overflow: hidden;
        position: relative;
        contain: layout style; /* Mejora rendimiento y aislamiento */
    }

    .carousel-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .carousel-track {
        display: flex;
        width: 100%;
        height: 100%;
        transition: transform 0.5s ease-in-out;
    }

    .carousel-slide {
        min-width: 100%;
        flex-shrink: 0;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden; /* ¡Clave! evita que hijos se salgan */
    }

    .carousel-child {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain; /* Si es <img>, escala sin deformar */
        box-sizing: border-box; /* Incluye padding/border en el 100% */
    }

    /* Botones (sin cambios) */
    .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        cursor: pointer;
        border-radius: 50%;
        z-index: 10;
    }

    .prev { left: 10px; }
    .next { right: 10px; }

    .nav-btn:hover {
        background: rgba(0, 0, 0, 0.8);
    }
`;

    /**
     * @param {any[]} extendedItems
     */
    GetNodeChilds(extendedItems) {
        return extendedItems.map(item => {
            item.className += " carousel-child";
            return html`<div class="carousel-slide">${item}</div>`;
        });
    }
}

customElements.define('w-carousel', WCarousel);
export { WCarousel };