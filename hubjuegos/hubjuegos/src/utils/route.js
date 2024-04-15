
import { getUser } from "../global/state/globalState";

import { Login, PrintPokemonPage, printTemplateDashboard } from "../pages";
import { PrintAhorcado } from "../pages/Ahorcado/Ahorcado";

export const initControler = (pagesRender) => {
 
  switch (pagesRender) {

	/////// -------OPERA ESTE CASO--- SI NO HAY USER EN EL CONTEXTO PINTA EL LOGIN
    case undefined:
      localStorage.getItem(getUser().name) ? printTemplateDashboard() : Login();
      break;

	////// ------------------------------------------------------------------------
    case "Pokemon":
      PrintPokemonPage();
      break;
    case "Dashboard":
      printTemplateDashboard();
      break;
    case "Topo":
      "Topo()";
      break;
    case "Login":
      Login();
      break;
    case "Ahorcado":
      PrintAhorcado();
      break;
  }
};