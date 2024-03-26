const numbers = [1, 2, 3, 5, 45, 37, 58];

function sumAll(param) {
  let suma = 0; // Inicializamos la suma como 0
  
  for (let i = 0; i < param.length; i++) {
    suma += param[i]; // Sumamos cada número al total
  }

  return suma;
}

console.log(sumAll(numbers)); 