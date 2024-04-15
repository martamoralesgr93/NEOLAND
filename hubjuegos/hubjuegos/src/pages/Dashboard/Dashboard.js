

import { initControler, getInfo } from "../../utils";

import "./Dashboard.css";

const template = () => 
  `<div id="containerDashboard"><ul>
  <li>
    <figure id="navigatePokemon">
      <img
        src="https://res.cloudinary.com/dq186ej4c/image/upload/v1689761508/pngwing.com_r0hr9b.png"
        alt="go to page pokemon"
      />
      <h2>POKEMON</h2>
    </figure>
  </li>
  <li>
    <figure id="navegateAhorcado">
      <img
        src="https://res.cloudinary.com/dfmtnqzyl/image/upload/v1712762556/88-removebg-preview_1_txbnbj.png"
        alt=" go to ahorcado game"
      />
      <h2>AHORCADO</h2>
    </figure>
  </li>

</ul>
</div>`
  
;

const addEventListeners = () => {
  // le damos el evento al boton de pokemon que es la unica pagina de contenido *
const navigatePokemon = document.getElementById("navigatePokemon");
navigatePokemon.addEventListener("click", () => {
  initControler("Pokemon");});

  const navigateMemory = document.getElementById("navegateAhorcado");
  navigateMemory.addEventListener("click", () => {
    initControler("Ahorcado");
  });
};

export const printTemplateDashboard = () => {
  
  

  document.querySelector("main").innerHTML = template();


  document.querySelector("nav").style.display = "flex";

  // escuchadores de la pagina */
  addEventListeners();
  getInfo();
};


