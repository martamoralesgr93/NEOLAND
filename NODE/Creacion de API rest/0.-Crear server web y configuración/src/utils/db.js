//!------------------------------------------------------------------------------
//?----------------------CONEXION CON LA base de datos MONGO DB------------------
//!------------------------------------------------------------------------------

// nos traemos el dotenv para que no sea público
const dotenv = require("dotenv");
dotenv.config();

// Nos traemos la libreria que controla MONGO DB
const mongoose = require("mongoose");

// nos traemos la MONGO_URI del .env
const MONGO_URI = process.env.MONGO_URI;

/// esta funcion exporta e importa el index que va conectar con Mongo

const connect = async () => {
  try {
    const db = await mongoose.connect(MONGO_URI);

    //  HOST  y NAME  de la DB -- Destructiren

    const { name, host } = db.connection;

    console.log(
      `Conectada la DB 👌  en el host: ${host} con el nombre: ${name}`
    );
  } catch (error) {
    console.log("No se ha conectado la db❌", error.message);
  }
};

module.exports = { connect };
