import { PrintButtonLetras } from "../../Components";
import { game_over, id, iniciar } from "../../utils/ahorcadoGame";

import "./Ahorcado.css";
const template = () => `
<div class="fondo"> 
<img id="imagen" src="img/img0.png" alt="Ahorcado" />
<div class="juego">  
<p id="palabra_a_adivinar"></p>
    <button id="jugar">Obtener palabra</button>

    <p id="resultado"></p>

    <div id="letras"></div>
    </div>  
</div>`;

const listeners = () => {
  const btn = id("jugar");
  btn.addEventListener("click", iniciar);
};

export const PrintAhorcado = () => {
  document.querySelector("main").innerHTML = template();
  PrintButtonLetras();
  listeners();
  game_over();
};