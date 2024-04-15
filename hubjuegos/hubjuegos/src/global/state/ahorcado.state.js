let info = {
    palabrita: "",
    cant_errores: 0,
    cant_aciertos: 0,
  };
  export const getInfoAhorcado = () => info;
  
  export const setPalabrita = (data) => (info.palabrita = data);
  export const setErrores = (data) => (info.cant_errores = data);
  export const setAciertos = (data) => (info.cant_aciertos = data);