
// 1.1 Crea un bucle for que vaya desde 0 a 9 y muestralo por consola.

for (index = 0; index <= 9; index++)
{
    console.log(index);
}
// 1.2 Crea un bucle for que vaya desde 0 a 9 y muestralo por consola solo
// cuando el resto del numero dividido entre 2 sea 0.
for (index = 0; index <= 9; index++)
{
    if (index % 2 == 0) { console.log(index); }
}

// 1.3 Crea un bucle para conseguir dormir contando ovejas.
// Este bucle tiene que dar 10 vueltas, es decir, 10 console.log.
// Muestra por consola un mensaje diciendo 'Intentando dormir 🐑' en cada vuelta del bucle
// y cambia el mensaje en la décima vuelta a 'Dormido!'.

for (index = 0; index < 10; index++) {
    if (index < 9) {
        console.log("Intentando domir 🐑")
    }
    else {console.log("Dormido!");
    }
}
