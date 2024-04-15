
import { palabras } from "../global/data/ahorcado.data";
import {
  getInfoAhorcado,
  setAciertos,
  setErrores,
  setPalabrita,
} from "../global/state/ahorcado.state";

export const id = (str) => {
  return document.getElementById(str);
};

export const obtener_random = (num_min, num_max) => {
  const amplitud_valores = num_max - num_min; //valor más alto - valor más bajo del random... (7 - 0)
  const valor_al_azar =
    Math.floor(Math.random() * amplitud_valores) +
    num_min; /* 5 - 15 = 10 + 5 */
  return valor_al_azar;
};

export const iniciar = (event) => {
  const imagen = id("imagen");
  imagen.src = "img/img0.png";
  const btn = id("jugar");
  btn.disabled = true;
  setErrores(0);
  setAciertos(0);

  const parrafo = id("palabra_a_adivinar");
  parrafo.innerHTML = "";

  const cant_palabras = palabras.length;
  const valor_al_azar = obtener_random(0, cant_palabras);
  setPalabrita(palabras[valor_al_azar]);

  const cant_letras = getInfoAhorcado().palabrita.length;

  const btn_letras = document.querySelectorAll("#letras button");
  for (let i = 0; i < btn_letras.length; i++) {
    btn_letras[i].disabled = false;
  }

  for (let i = 0; i < cant_letras; i++) {
    const span = document.createElement("span");
    parrafo.appendChild(span);
  }
};

export const click_letras = (event) => {
  const spans = document.querySelectorAll("#palabra_a_adivinar span");
  const button = event.target;
  button.disabled = true;

  const letra = button.innerHTML.toLowerCase();
  const palabra = getInfoAhorcado().palabrita.toLowerCase();

  let acerto = false;
  for (let i = 0; i < palabra.length; i++) {
    if (letra == palabra[i]) {
      spans[i].innerHTML = letra;
      let aciertos = parseInt(getInfoAhorcado().cant_aciertos);
      setAciertos(aciertos+ 1);
      acerto = true;
    }
  }

  if (acerto == false) {
    let errores = parseInt(getInfoAhorcado().cant_errores);
    console.log(errores);
    setErrores(errores + 1);
    console.log("errores", getInfoAhorcado().cant_errores);
    const source = `img/img${getInfoAhorcado().cant_errores}.png`;
    const imagen = document.getElementById("imagen");
    imagen.src = source;
  }

  if (getInfoAhorcado().cant_errores == 7) {
    id("resultado").innerHTML =
      "Perdiste, el pokemoon era " + getInfoAhorcado().palabrita;
    game_over();
  } else if (
    getInfoAhorcado().cant_aciertos == getInfoAhorcado().palabrita.length
  ) {
    id("resultado").innerHTML = "¡Enhorabuena, te hiciste con TODOS! ";
    game_over();
  }
  console.log(
    "la letra " + letra + " en la palabra " + palabra + " ¿existe?: " + acerto
  );
};

export const game_over = () => {
  const btn_letras = document.querySelectorAll("#letras button");
  for (let i = 0; i < btn_letras.length; i++) {
    btn_letras[i].disabled = true;
  }
  const btn = id("jugar");
  btn.disabled = false;
};
