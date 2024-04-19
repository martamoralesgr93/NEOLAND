//! -----------------------------------------------------------------------
//? ------------------------------librerias--------------------------------
//! -----------------------------------------------------------------------
const nodemailer = require("nodemailer");
const validator = require("validator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

//! -----------------------------------------------------------------------
//? ------------------------------modelos----------------------------------
//! -----------------------------------------------------------------------
const User = require("../models/User.model");

//! -----------------------------------------------------------------------
//? ------------------------utils - middlewares - states ------------------
//! -----------------------------------------------------------------------
const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const randomCode = require("../../utils/randomCode");
const sendEmail = require("../../utils/sendEmail");
const {
  getTestEmailSend,
  setTestEmailSend,
} = require("../../state/state.data");
const setError = require("../../helpers/handle-error");
const { generateToken } = require("../../utils/token");

//------------------->CRUD es el acrónimo de "Crear, Leer, Actualizar y Borrar"
/**+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 */
//! -----------------------------------------------------------------------------
//? ----------------------------REGISTER LARGO EN CODIGO ------------------------
//! -----------------------------------------------------------------------------

const registerLargo = async (req, res, next) => {
  // capturamos la imagen nueva subida a cloudinary
  let catchImg = req.file?.path;
  try {
    // actualizamos los elementos unique del modelo
    await User.syncIndexes();

    const { email, name } = req.body; // lo que enviamos por la parte del body de la request

    // vamos a buscsar al usuario
    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );

    if (!userExist) {
      let confirmationCode = randomCode();
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const userSave = await newUser.save();
        if (userSave) {
          // ---------------------------> ENVIAR EL CODIGO CON NODEMAILER --------------------
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: emailEnv,
              pass: password,
            },
          });

          const mailOptions = {
            from: emailEnv,
            to: email,
            subject: "Confirmation code",
            text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: userSave,
                confirmationCode: "error, resend code",
              });
            }
            console.log("Email sent: " + info.response);
            return res.status(200).json({
              user: userSave,
              confirmationCode,
            });
          });
        } else {
          return res.status(404).json("error save user");
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    // SIEMPRE QUE HAY UN ERROR GENERAL TENEMOS QUE BORRAR LA IMAGEN QUE HA SUBIDO EL MIDDLEWARE
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};
//! -----------------------------------------------------------------------------
//? ----------------------------REGISTER CORTO EN CODIGO ------------------------
//! -----------------------------------------------------------------------------

const registerUtil = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();

    const { email, name } = req.body;

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );
    if (!userExist) {
      let confirmationCode = randomCode();
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }

      try {
        const userSave = await newUser.save();

        if (userSave) {
          sendEmail(email, name, confirmationCode);
          setTimeout(() => {
            if (getTestEmailSend()) {
              // el estado ya utilizado lo reinicializo a false
              setTestEmailSend(false);
              return res.status(200).json({
                user: userSave,
                confirmationCode,
              });
            } else {
              setTestEmailSend(false);
              return res.status(404).json({
                user: userSave,
                confirmationCode: "error, resend code",
              });
            }
          }, 2500);
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

const registerWithRedirect = async (req, res, next) => {
  // capturamos la imagen por si hay un error borrarla en cloudinary
  let catchImg = req.file?.path;

  // Importante con el async await hacerlo con un try catch
  try {
    // actualizamos los indexes de los elementos unicos por si acaso han variado
    await User.syncIndexes();
    // Generamos el codigo con la funcion que hicimos en utils y que tienes mas arriba
    let confirmationCode = randomCode();

    // Hacemos destructuring del email y name que viene del body
    const { email, name } = req.body;

    // ---> comprobamos si existe el usuario

    // aqui se ponen el email y el name por separado porque ambos son unique,
    // si no fueran unique hay que meterlo como {email:req.body.email, name: req.body.name}
    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );

    // SI NO EXISTE ENTONCES HACEMOS LA LÓGICA DEL REGISTER
    if (!userExist) {
      // Creamos un nuevo usuario con el req.body y le añadimos el codigo de confirmacion
      const newUser = new User({ ...req.body, confirmationCode });
      console.log(newUser);

      //  tenemos el archivo de la imagen le metemos el req.file.path que es donde guarda...
      // .. el middleware la URL de cloudinary
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        // si no nos pasa nada le pondremos una imagen predefinida
        newUser.image = "https://pic.onlinewebfonts.com/svg/img_181369.png";
      }
      // -----> GUARDAMOS EL USUARIO EN LA DB
      try {
        const userSave = await newUser.save();

        if (userSave) {
          // si hay usuario hacemos el redirech
          return res.redirect(
            303,
            `http://localhost:8080/api/v1/users/register/sendMail/${userSave._id}`
          );
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      //----> SI EL USUARIO EXISTE:
      // + Borramos la imagen de cloudinary porque si existe no registramos el user
      // + Mandamos un error de que usuario ya existe
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json("this user already exist");
    }
  } catch (error) {
    // si hay un error general borramos la URL porque no hemos registrado al usuario
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

/// ------------------------------------------------------------------------------------
/// --------------------CONTROLADOR DE ENVIAR EL CODE  ---------------------------------
///-------------------------------------------------------------------------------------

const sendMailRedirect = async (req, res, next) => {
  try {
    // nos traemos el id de los params
    const { id } = req.params;
    // buscamos al usuario por id para luego utilizarlo para sacar el email y el codigo
    const userDB = await User.findById(id);

    // ---------------------------CONFIGURAMOS NODEMAILER -----------------------------------
    const emailEnv = process.env.EMAIL;
    const password = process.env.PASSWORD;
    // --> 1) Configuramos el transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailEnv,
        pass: password,
      },
    });
    // --> 2) creamos las opciones del envio del email
    const mailOptions = {
      from: emailEnv,
      to: userDB.email,
      subject: "Confirmation code",
      text: `tu codigo es ${userDB.confirmationCode}, gracias por confiar en nosotros ${userDB.name}`,
    };
    // --> 3) enviamos el correo y gestionamos el error o el ok del envio
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        // damos feedback al frontal de que no se ha enviado correctamente el codigo
        //TODO!  esto lo hacemos para que el frontal vuelva a enviar una request de este..
        // ... endpoint y vuelva a enviar el código al usuario.
        return res.status(404).json({
          user: userDB,
          confirmationCode: "error, resend code",
        });
      } else {
        console.log("Email sent: " + info.response);
        // damos feedback al frontal de que se ha enviado correctamente el codigo
        return res.status(200).json({
          user: userDB,
          confirmationCode: userDB.confirmationCode,
        });
      }
    });
  } catch (error) {
    return next(error);
  }
};

const resendCode = async (req, res, next) => {
  console.log("body", req);
  try {
    //! vamos a configurar nodemailer porque tenemos que enviar un codigo
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });

    //! hay que ver que el usuario exista porque si no existe no tiene sentido hacer ninguna verificacion
    const userExists = await User.findOne({ email: req.body?.email });

    if (userExists) {
      const mailOptions = {
        from: email,
        to: req.body?.email,
        subject: "Confirmation code",
        text: `tu codigo es ${userExists.confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(404).json({
            resend: false,
          });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json("User not found");
    }
  } catch (error) {
    return next(setError(500, error.message || "Error general send code"));
  }
};

//! ------------------------------------------------------------------------
//? -------------------------- CHECK NEW USER------------------------------
//! ------------------------------------------------------------------------

const checkNewUser = async (req, res, next) => {


/*Cuando el usuario se registre recibirá un código al email y se le enviará 
automáticamente en el front (despues de darle al botón de register) a una 
pantalla donde tendrá que confirmar el código.  Este controlador hace justo 
esa comprobación:
...Si el usuario no introduce bien el código, borramos al usuario de la DB.
...Si lo introduce correctamente le cambiamos en el back el check a true, 
para indicar  que ha pasado la verificación.
  
Pare realizar este paso necesitamos:
  
        1) -> email y el codigo de confirmacion
        2) -> buscar el user en la bdo con el email 
        3) -> comparar los codigos
        4) -> hacer un update y cambiar la clave check

Se producirá un error cuando: 
        
        1) el email no exista  en el back
        2) los codigos no son iguales
        3) que falle la update
  
*/

  try { // Esto sirve para traer de la req.body el email y codigo de confirmation/

    const { email, confirmationCode } = req.body;
    const userExists = await User.findOne({ email });

    if (!userExists) {  // si no existe----> 404 de no se encuentra

      return res.status(404).json("User not found");
    } else { // en esta parte comparamos que el codigo que recibimos por la req.body y el del userExists es igual*/
      
      if (confirmationCode === userExists.confirmationCode) {
        try {
     await userExists.updateOne({ check: true }); // Con esta utilidad hacemos un test para ver si a actualizado la clave y después hace un testeo de que este user se ha actualizado correctamente, después hago findOne
          
          const updateUser = await User.findOne({ email }); // este finOne nos sirve para hacer un ternario que nos diga si la propiedad vale true o false
          return res.status(200).json({
            testCheckOk: updateUser.check == true ? true : false,
          });
        } catch (error) {
          return res.status(404).json(error.message);
        }
      } else {  // el else de cuando los codigos no son iguales
        try { // En caso de que el codigo sea incorrecto lo borramos de la base datos y lo mandamos al registro
      
          await User.findByIdAndDelete(userExists._id); // con esto borramos la imagen
         
        deleteImgCloudinary(userExists.image); // si el delate se ha hecho bien mandamos un 200
            return res.status(200).json({
            userExists,
            check: false,

            // test de eliminacion de este user
            delete: (await User.findById(userExists._id))
              ? "error delete user"
              : "ok delete user",
          });
        } catch (error) {
          return res
            .status(404)
            .json(error.message || "error general delete user");
        }
      }
    }
  } catch (error) { // para devolver errores genrales 
    return next(setError(500, error.message || "General error check code"));
  }
};

//! -----------------------------------------------------------------------------
//? --------------------------------LOGIN ---------------------------------------
//! -----------------------------------------------------------------------------

const login = async (req, res, next) => {
  /**
   *
   * En Login se trae el email y la password de la solicitud. En este paso se busca el 
   * usuario por el email y si está, se comapara la contraseña de la solicitud 
   * con la contraseña del usuario guardado mediante bcrypt.compareSync ; y si devuelve 
   * true creamos el token con generateToken y lo incluimos en la respuesta.
   * Pare realizar este paso necesitamos:
   *    1) Del body vamos a recibir el email y la contraseña
   *    2) Se comprueba con el email que exista en la mongo db
   *    3) Se comprueba que la contraseña coincida con la base de datos y se compara una contraseña sin encrytar con un encritada -> bcrypt
   *    4) Si con iguales genero un token --> con la funcion generateToken  de los util el token
   *
   * Los posibles errores pueden ser:
   *    ...Si el usuario no exista en la db
   *    ...Si la contraseña no coincide
   *   ....Si la generacion del token no falla
   
   */

  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) { // compara dos contraseñar una sin encryptar y otra que si lo esta
      if (bcrypt.compareSync(password, userDB.password)) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error.message);
  }
};

//! -----------------------------------------------------------------------------
//? --------------------------------AUTOLOGIN -----------------------------------
//! -----------------------------------------------------------------------------

const autoLogin = async (req, res, next) => {
  /** COMPARA DOS CONTRASEÑAS ENCRYPTADA Y NO HACE FALTA EL COMPARESYNC
   * */
  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      // comparo dos contraseñas encriptadas
      if (password == userDB.password) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json("password dont match");
      }
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? -----------------------CONTRASEÑAS Y SUS CAMBIOS-----------------------------
//! -----------------------------------------------------------------------------

/** Esto no lo hemos dado aún */

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO NO ESTAS LOGADO---------------
//? -----------------------------------------------------------------------------

const changePassword = async (req, res, next) => {
  /**
   * En este punto se recibe el email del usuario por el body, para después comprobar
   * que exista este user en la base de datos. A continuación, se genera una contraseña 
   * nueva (estará en utils), hay que encryptarla y guardarla en el base de datos. 
   * Hecho esto, se envía al usario.
   *
   * ¿Qué puede ser salir mal?
   * ...Que el user no este registrado
   * ...Que no se haya generado la contraseña
   * ...Que no le haya enviado el correo con la contraseña
   * ...Que no se haya actualizado la contraseña en la base de datos
   */

  try {
    /** Esto sirve para comprobar que el usario existe en la base de datos, para ello enviaremos un correo*/
    const { email } = req.body;
    console.log(req.body);
    const userDb = await User.findOne({ email });
    if (userDb) {
      /// y si existe le hacemos el redirect
      const PORT = process.env.PORT;
      return res.redirect(
        307,
        `http://localhost:${PORT}/api/v1/users/sendPassword/${userDb._id}`
      );
    } else {
      return res.status(404).json("User no register");
    }
  } catch (error) {
    return next(error);
  }
};

const sendPassword = async (req, res, next) => {
  try {
    /** En esta funcion se busca el usario por ID del parámetro */
    const { id } = req.params;
    const userDb = await User.findById(id);
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: password,
      },
    });
    let passwordSecure = randomPassword();
    console.log(passwordSecure);
    const mailOptions = {
      from: email,
      to: userDb.email,
      subject: "-----",
      text: `User: ${userDb.name}. code: ${passwordSecure} Hemos enviado esto porque tenemos una solicitud de cambio de contraseña, si no has sido ponte en contacto con nosotros, gracias.`,
    };
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) { /// En este paso, si hay un error, se manda un 404*/
        console.log(error);
        return res.status(404).json("dont send email and dont update user");
      } else {
        console.log("Email sent: " + info.response);
        /// y si no hay ningún, se guarda esta contraseña en mongo db

        const newPasswordBcrypt = bcrypt.hashSync(passwordSecure, 10); // y después se encripta la pantalla con esta función

        try {
         
          await User.findByIdAndUpdate(id, { password: newPasswordBcrypt });  /** este método busca por id y luego modifica 
          las claves que le digas, en este caso, queremos meter la contraseña haseada en la parte de password */

          //!------------------ test --------------------------------------------
          
          const userUpdatePassword = await User.findById(id); // Esto sirve para buscar el user que ya está actualizado

          if (bcrypt.compareSync(passwordSecure, userUpdatePassword.password)) { //Con: "sync" comparo una contraseña no encriptada con una encriptada
            return res.status(200).json({ // si son iguales quiere decir que el back se ha actualizado correctamente
              updateUser: true, // es la contraseña encriptada
              sendPassword: true, // es la contraseña no encriptada
            });
          } else {
             return res.status(404).json({ /** si no son iguales le diremos que hemos enviado el correo pero que no
             * hemos actualizado el user del back en mongo db */
              updateUser: false,
              sendPassword: true,
            });
          }
        } catch (error) {  // Lo que captura el error 
          return res.status(404).json(error.message);
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

//? -----------------------------------------------------------------------------
//! --!!!!!!!!-----------CONTROLADORES QUE LLEVAN TOKEN NECESARIO--------!!!!!!!!
//? -----------------------------------------------------------------------------

/** Esto no lo hemos dado aún */

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO NO ESTAS LOGADO---------------
//? -----------------------------------------------------------------------------

  // Para cambiar la contraseña estando logueado se seguirán los siguientes pasos:
  /* 1) por el body recibo la contraseña nueva y antigua
   * 2) _id => lo saco de la req.user
   * 3) la antigua contraseña que has escrito coincida con el back compareSync
   * 4) La nueva contraseña se encrypta
   * 5) se actualiza en el back
   * test----
   *
   *
   * Es posible que tengamos lo siguientes errores:
   * ...Que la contraseña antigua no coincida con la del back
   * ...Que  no se actualize la contraseña en el back
   */


  const modifyPassword = async (req, res, next) => {
  console.log("req.user", req.user);  /** IMPORTANTE ---> REQ.USER ----> LO CREAR LOS AUTH MIDDLEWARE */

  try {
    //! 1 RECIBO LA CONTRASEÑA NUEV A Y LA ANTIGUA POR EL BODY */
    const { password, newPassword } = req.body;
     //! 2 SACO EL "ID" DE LA REQ.USER */
    const { _id } = req.user;  
      //! 3 COMPARAMOS QUE LA ANTIGUA CONTRASEÑA QUE SE HA ESCRITO COINDE CON LA EL BACK "compareSync" */
    if (bcrypt.compareSync(password, req.user.password)) { /** comparamos la contrasela vieja sin encriptar y la encriptada */

     //! 4 ENCRIPTAMOS LA NUEVA CONTRASEÑA */
      const newPasswordHashed = bcrypt.hashSync(newPassword, 10); /** tenemos que encriptar la contraseña para poder guardarla en el back mongo db */

      //! 5 SE ACTUALIZA LA CONTRASEÑA EN EL BACK: MONGO DB */
      try {
        await User.findByIdAndUpdate(_id, { password: newPasswordHashed });

        // TESTING EN TIEMPO REAL  */

        //! 1) Se trae el user actualizado
        const userUpdate = await User.findById(_id);

        //! 2) Comapra la contraseña sin encriptar y la tenemos en el back que esta encriptada
        if (bcrypt.compareSync(newPassword, userUpdate.password)) {
          return res.status(200).json({ /// SI SON IGUALES 200 ---> UPDATE OK
            updateUser: true,
          });
        } else {
          return res.status(404).json({ /// SI NO SON IGUALES -------> 404 NOT FOUND
            updateUser: false,
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      return res.status(404).json("password dont match"); /** si las contraseñas no son iguales le mando un 404 diciendo que las contraseñas no son iguales */
    }
  } catch (error) {
    return next(error); // Error general --- En este caso, "to ChagePassword with AUTH"
  }
};


//! -----------------------------------------------------------------------------
//? ---------------------------------UPDATE--------------------------------------
//! -----------------------------------------------------------------------------

const update = async (req, res, next) => {
  // capturamos la imagen nueva subida a cloudinary
  let catchImg = req.file?.path;

  try {
    // actualizamos los elementos unique del modelo
    await User.syncIndexes();

    // instanciamos un nuevo objeto del modelo de user con el req.body
    const patchUser = new User(req.body);

    // si tenemos imagen metemos a la instancia del modelo esta imagen nuevo que es lo que capturamos en catchImg
    req.file && (patchUser.image = catchImg);

    /** vamos a salvaguardar info que no quiero que el usuario pueda cambiarme */
    // AUNQUE ME PIDA CAMBIAR ESTAS CLAVES NO SE LO VOY A CAMBIAR
    patchUser._id = req.user._id;
    patchUser.password = req.user.password;
    patchUser.rol = req.user.rol;
    patchUser.confirmationCode = req.user.confirmationCode;
    patchUser.email = req.user.email;
    patchUser.check = req.user.check;
    patchUser.gender = req.user.gender;

    try {
      /** hacemos una actualizacion NO HACER CON EL SAVE
       * le metemos en el primer valor el id de el objeto a actualizar
       * y en el segundo valor le metemos la info que queremos actualizar
       */
      await User.findByIdAndUpdate(req.user._id, patchUser);

      // si nos ha metido una imagen nueva y ya la hemos actualizado pues tenemos que borrar la antigua
      // la antigua imagen la tenemos guardada con el usuario autenticado --> req.user
      if (req.file) deleteImgCloudinary(req.user.image);

      // ++++++++++++++++++++++ TEST RUNTIME+++++++++++++++++++++++++++++++++++++++
      /** siempre lo pprimero cuando testeamos es el elemento actualizado para comparar la info que viene
       * del req.body
       */
      const updateUser = await User.findById(req.user._id);

      /** sacamos las claves del objeto del req.body para saber que info nos han pedido actualizar */
      const updateKeys = Object.keys(req.body); // ["name"]

      // creamos un array donde guardamos los test
      const testUpdate = [];

      // recorremos el array de la info que con el req.body nos dijeron de actualizar
      /** recordar este array lo sacamos con el Object.keys */

      // updateKeys ES UN ARRAY CON LOS NOMBRES DE LAS CLAVES = ["name", "email", "rol"]

      ///----------------> para todo lo diferente de la imagen ----------------------------------
      updateKeys.forEach((item) => {
        /** vamos a comprobar que la info actualizada sea igual que lo que me mando por el body... */
        if (updateUser[item] === req.body[item]) {
          /** aparte vamos a comprobar que esta info sea diferente a lo que ya teniamos en mongo subido antes */
          if (updateUser[item] != req.user[item]) {
            // si es diferente a lo que ya teniamos lanzamos el nombre de la clave y su valor como true en un objeto
            // este objeto see pusea en el array que creamos arriba que guarda todos los testing en el runtime
            testUpdate.push({
              [item]: true,
            });
          } else {
            // si son igual lo que pusearemos sera el mismo objeto que arrriba pro diciendo que la info es igual
            testUpdate.push({
              [item]: "sameOldInfo",
            });
          }
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      /// ---------------------- para la imagen ---------------------------------
      if (req.file) {
        /** si la imagen del user actualizado es estrictamente igual a la imagen nueva que la
         * guardamos en el catchImg, mandamos un objeto con la clave image y su valor en true
         * en caso contrario mandamos esta clave con su valor en false
         */
        updateUser.image === catchImg
          ? testUpdate.push({
              image: true,
            })
          : testUpdate.push({
              image: false,
            });
      }

      /** una vez finalizado el testing en el runtime vamos a mandar el usuario actualizado y el objeto
       * con los test
       */
      return res.status(200).json({
        updateUser,
        testUpdate,
      });
    } catch (error) {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(404).json(error.message);
    }
  } catch (error) {
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ---------------------------------DELETE--------------------------------------
//! -----------------------------------------------------------------------------

// USO DEL "deleteUser" CON ELLA RECUPERAMOS EL "id" Y LA IMAGEN DE LA SOLICITUD PARA PODER BUSCAR Y BORRAR AL USARIO */
const deleteUser = async (req, res, next) => {
  try {
    const { _id, image } = req.user;
    await User.findByIdAndDelete(_id); // con esto hacemos un test para ver si lo ha borrado
    if (await User.findById(_id)) {
      // si el usuario
      return res.status(404).json("not deleted"); ///
    } else {
      deleteImgCloudinary(image); // Debe borrar TODO lo que haya hecho el usario, incluyendo: likes, comentarios, chats, posts, reviews,...
      return res.status(200).json("ok delete");
    }
  } catch (error) {
    return next(error); // Error general
  }
};

//! -----------------------------------------------------------------------------
//? ---------------------------------findById------------------------------------
//! -----------------------------------------------------------------------------

const byId = async (req, res, next) => {
  try {
    const userById = await User.findById(req.params.id); // si no lo encuentra es un null
    if (userById) {
      return res.status(200).json(userById);
    } else {
      return res.status(404).json("usuario no encontrado");
    }
  } catch (error) {
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ---------------------------------getAll--------------------------------------
//! -----------------------------------------------------------------------------

const getAll = async (req, res, next) => {
  try {
    const getAllUser = await User.find(); // esto devuelve un array
    if (getAll.length === 0) {
      return res.status(404).json("no encontrados");
    } else return res.status(200).json({ data: getAllUser });
  } catch (error) {
    return next(error);
  }
};
//! -----------------------------------------------------------------------------
//? ---------------------------------get By name---------------------------------
//! -----------------------------------------------------------------------------

const byName = async (req, res, next) => {
  try {
    const getNameUser = await User.findOne({ name: req.params.name });
    if (getNameUser) {
      return res.status(200).json(getNameUser);
    } else {
      return res.status(404).json("usuario no encontrado");
    }
  } catch (error) {
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ---------------------------------get By Gender---------------------------------
//! -----------------------------------------------------------------------------

const byGender = async (req, res, next) => {
  try {
    const getGenderUser = await User.find({
      gender: req.params.gender,
      name: req.params.name,
    });
    if (getGenderUser) {
      return res.status(200).json(getGenderUser);
    } else {
      return res.status(404).json("usuario no encontrado");
    }
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  registerLargo,
  registerUtil,
  registerWithRedirect,
  sendMailRedirect,
  resendCode,
  checkNewUser,
  login,
  autoLogin,
  changePassword,
  sendPassword,
  modifyPassword,
  update,
  deleteUser,
  getAll,
  byId,
  byName,
  byGender,
};

