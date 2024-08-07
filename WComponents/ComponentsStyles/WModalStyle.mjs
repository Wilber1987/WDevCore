import { css } from "../../WModules/WStyledRender.js";
export const WModalStyle = css`
  .ContainerFormWModal {
       display: grid;
       grid-template-rows: 70px calc(100% - 70px);
       margin: auto;
       margin-top: 20px;
       background-color: #fff;
       width: 80%;
       max-height: calc(100% - 10px);
       border-radius: 0.3cm;
       position: relative;
       box-shadow: 0 0px 3px 0px #000;
       padding: 0 0 20px 0;
  }

  .ContainerFormWModal h2 {
       padding: 10px;
       margin: 0px;
       background: #09f;
  }

  .ContainerFormWModal h1,
  .ContainerFormWModal h3,
  .ContainerFormWModal h4,
  .ContainerFormWModal h5 {
       display: block;
       padding: 10px;
       text-align: center;
       font: 400 13.3333px !important;
  }

  .ModalContent {
       overflow-y: auto;
       display: block;
       padding: 30px;
  }

  .ModalHeader {
       color: #444;
       font-weight: bold;
       font-size: 20px;
       display: flex;
       justify-content: center;
       align-items: center;
       padding: 40px 30px 20px 30px;
       margin-bottom: 20px;
       text-transform: uppercase;
       position: relative;
  }

  .ModalElement {
       background-color: #4da6ff;
       padding: 10px;
       border-radius: 5px;
  }

  .BtnClose {
       font-size: 18pt;
       position: absolute;
       color: #b9b2b3;
       cursor: pointer;
       width: 30px;
       border-radius: 10px;
       display: flex;
       justify-content: center;
       align-items: center;
       border: none;
       background-color: unset;
       top: 10px;
       right: 20px;
  }

  .HeaderIcon {
       height: 50px;
       width: 50px;
       position: relative;
       left: -10px;
       ;
  }

  .ObjectModalContainer {
       max-height: calc(100vh - 120px);
       height: 100%;
       width: 90%;
       margin: 0px auto;
       margin-bottom: 20px;
       display: block;
       justify-content: center;
       padding: 5px;
       overflow-y: auto;
  }

  @media (max-width: 1200px) {
       .ContainerFormWModal {
            width: 90%;
       }
  }

  @media (max-width: 800px) {
       .ContainerFormWModal {
            position: fixed;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            height: 100%;
       }

       divForm {
            padding: 20px;
            display: grid;
            grid-gap: 1rem;
            grid-template-columns: calc(100% - 20px) !important;
            grid-template-rows: auto;
            justify-content: center;
       }

       .ContainerFormWModal {
            margin-top: 0px;
            width: 100%;
            max-height: calc(100vh - 0px);
            height: calc(100vh - 0px);
            border-radius: 0cm;
       }

       .ObjectModalContainer {
            max-height: calc(100% - 80px);
       }
  }
`;