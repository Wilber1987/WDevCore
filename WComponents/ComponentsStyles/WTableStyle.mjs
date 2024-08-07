import { css } from "../../WModules/WStyledRender.js";

export const WTableStyle = css`.WTable {
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    border: 1px rgba(10, 10, 10, 0.2) solid;
}

.WTable th {
    text-align: left;
    padding: 10px;
    text-transform: capitalize;
    position: relative;
    padding-right: 15px;
    border-right: 1px #eaeaea solid;
}

.WTable th label::first-letter {
    text-transform: uppercase;
}

.WTable td {
    padding: 0.8rem;
    text-align: left;
    vertical-align: top;
    border-right: 1px #eaeaea solid;
}

.WTable td label {
    overflow: hidden;
    max-height: 200px;
    text-overflow: ellipsis;
    display: block;
    overflow-y: auto;
    font-size: 10px !important;
    padding: 0 5px;
    max-width: 400px;
}

.WTable td label * {
    font-size: 11px !important;
    text-align: justify !important;
    padding: 0px !important;
    margin: 0px !important;
    background: none !important;
    max-width: 100%
}

.WTable .tdAction {
    text-align: center;
    width: 120px;
    align-items: center,
}

.WTable tbody tr:nth-child(odd) {
    background-color: rgba(0, 0, 0, 0.05);
}

.icon {
    height: 16px;
    width: 16px;
    filter: invert(1);
}

.orderBtn {
    height: 14px;
    max-width: 14px;
    width: 10%;
    cursor: pointer;
    margin: 2px;
}

th label {
    padding: 5px;
    width: calc(70% - 10px);
    display: inline-block;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
}

.tdAcordeon {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow: hidden;
    align-items: center;
    justify-content: flex-start;
}

.thOptions {
    display: grid;
    grid-template-columns: calc(100% - 150px) 150px;
    justify-content: space-between;
}

.thOptions w-filter-option {
    grid-column: span 2;
    position: relative;
    z-index: 1;
}

input[type=text],
input[type=string],
input[type=number],
input[type=date] {
    width: 300px;
}

input:active,
input:focus {
    outline: none;
}

input[type=button] {
    cursor: pointer;
    width: calc(100% - 0px);
    height: initial;
}

input[type=radio] {
    cursor: pointer;
    appearance: none;
    background-color: #fff;
    border-radius: 50%;
    font: inherit;
    color: currentColor;
    width: 15px;
    height: 15px;
    border: 0.15em solid #999;
    display: grid;
    place-content: center;
}

input[type=radio]::before {
    content: "";
    width: 10px;
    height: 10px;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em var(--form-control-color);
    transform-origin: bottom left;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

input[type=radio]:checked::before {
    content: " ";
    background-color: cornflowerblue;
    transform: scale(1);
}

.sort-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 8px;
    height: 16px;
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);

}

.sort-up,
.sort-down {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background-color: #999;
    height: 6px !important;
    width: 8px;
    border: none;
}

.sort-down {
    clip-path: polygon(100% 0, 0 0, 50% 100%);
}

.sort-active {
    background-color: #322c64;
}

.paginateBTN {
    display: inline-block;
    padding: 5px;
    color: #888888;
    margin: 5px;
    cursor: pointer;
    border-radius: 0.2cm;
    transition: all 0.6s;
    font-size: 12px;
    font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.paginateBTNHidden {
    display: none;
}

.paginateBTNActive {
    font-weight: bold;
    color: #444444;
}

.pagBTN {
    display: inline-block;
    padding: 5px;
    color: #888888;
    margin: 5px;
    cursor: pointer;
    border-radius: 0.2cm;
    font-weight: bold;
    transition: all 0.6s;
    text-align: center;
}

.tfooter {
    display: flex;
    border: 1px rgba(10, 10, 10, 0.2) solid;
    border-top: none;
    justify-content: flex-end;
    padding-left: 20px;
    padding-right: 20px;
}

.tfooterNumbers {
    overflow: hidden;
    max-width: 390px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.labelMultiselect {
    padding: 5px 10px;
    border-radius: 0.3cm;
    background-color: #009f97;
    color: #fff;
    font-size: 9px;
    overflow: hidden;
    margin: 5px;
    width: 100%
}

.BtnTable,
.BtnTableA,
.BtnTableS,
.BtnTableSR {
    font-weight: bold;
    border: none;
    padding: 5px;
    margin-left: 5px;
    text-align: center;
    display: inline-block;
    min-width: 20px;
    font-size: 10px;
    cursor: pointer;
    background-color: #4894aa;
    color: #fff;
    border-radius: 0.2cm;
    margin-bottom: 2px;
}

.Btn {
    cursor: pointer;
}

.BtnTableS {
    background-color: #5fb454;
}

.BtnTableA {
    background-color: #d24545;
}

.BtnTableSR {
    background-color: #4894aa;
    width: inherit;
    min-width: 100px;
}

.Btn[type=checkbox] {
    height: 20px;
    min-width: 20px;
    margin: 5px;
}

.imgPhoto {
    width: 50px;
    border-radius: 50%;
    height: 50px;
    size: 100%;
    display: block;
    margin: auto;
    object-fit: cover;
    box-shadow: 0 2px 5px 0 rgb(0 0 0 / 30%);
}

*::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

*::-webkit-scrollbar-thumb:hover {
    background: #b3b3b3;
    box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.2);
}

*::-webkit-scrollbar-thumb:active {
    background-color: #999999;
}

*::-webkit-scrollbar {
    width: 8px;
    height: 10px;
    margin: 10px;
}

*::-webkit-scrollbar-track {
    background: #e1e1e1;
    border-radius: 4px;
}

*::-webkit-scrollbar-track:active,
*::-webkit-scrollbar-track:hover {
    background: #d4d4d4;
}

@media (max-width: 600px) {
    divForm div {
        width: calc(100% - 10px);
        margin: 5px;
    }

    .WTable {
        display: block;
    }

    .WTable tbody {
        display: block;
    }

    .WTable thead {
        display: none;
    }

    .WTable tr {
        display: block;
        margin: 10px;
        border-radius: 0.3cm;
        overflow: hidden;
        box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.5);
    }

    .WTable td {
        display: flex;
        border-bottom: 1px rgba(10, 10, 10, 0.3) solid;
        padding: 10px;
    }

    .WTable .tdAction {
        display: block;
        justify-content: center;
        align-items: center;
        width: auto;
        padding: 10px;
    }

    input[type=text],
    input[type=string],
    input[type=number],
    input[type=date] {
        padding: 5px 10px;
        width: calc(100% - 20px);
    }
}`