import express from "express";
import  log4js  from "log4js";
import compression from "compression";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";
import { ContenedorFs } from "./contenedores/Contenedorfs.js";
import faker from "faker";
faker.locale = "es";
import { normalize, denormalize, schema } from "normalizr";
import util from "util";
import mongoose from "mongoose";
import { ContenedorMongo } from "./contenedores/ContenedorMongo.js";
import { ContenedorFB } from "./contenedores/Contenedorfb.js";
import { ConexionMongo } from "./config.js";
import { ConexionFb } from "./config.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };
import { response, json } from "express";
import passport from "passport";
import bodyParser from "body-parser";
import { ensureLoggedIn } from "connect-ensure-login";
import { User } from "./config.js";
import * as dotenv from "dotenv";
import minimist from "minimist";
import { fork } from "child_process";
import os from 'os';
import cluster from 'cluster';

const numProcesadores = os.cpus().length;


/////////////////////////log4js
log4js.configure({
  appenders:{
    consolalog:{type:"console"},
    warnlog: {type:'file', filename: 'warn.log'},
    errorlog: {type:'file', filename: 'error.log'},
  },
  categories:{
    default:{appenders:['consolalog'], level:'all'},
    consola:{appenders:['consolalog'], level:'info'},
    warning:{appenders:['warnlog'], level:'warn'},
    error:{appenders:['errorlog'], level:'error'},
  }
})

const loggerConsola= log4js.getLogger('consola')
const loggerWarn= log4js.getLogger('warning')
const loggerError= log4js.getLogger('error')
///////////////////////

//////////////////////////CLUSTER O FORK/////////////////////////////////
if (cluster.isPrimary && process.argv[3]=='CLUSTER') {
  console.log(`Nuevo master: ${process.pid} corriendo, con ${numProcesadores} workers`);

  for (let i = 0 ; i < numProcesadores ; i++) {
    cluster.fork(); 
  }

  cluster.on('exit', (worker) => {
    console.log(`El worker ${worker.process.pid} ha muerto`);
    cluster.fork(); 
  }); 

} else {

  //node src/server.js -p 9090

/* const options = {
  alias: {
    p: "port",
  },
  default: {
    port: 8080,
  },
};

const puerto = minimist(process.argv.slice(2), options);

const PORT = puerto.p; */

const PORT = process.argv[2] || 8080;

dotenv.config();

let mensajesdemongo = new ContenedorMongo("mensajes");
let mensajesdefb = new ContenedorFB("mensajes");

ConexionMongo();

function print(Objeto) {
  console.log(util.inspect(Objeto, false, 12, true));
}

const author = new schema.Entity("authors");
const mensaje = new schema.Entity("mensajes", {
  author: author,
});
const aplicacion = express();
aplicacion.use(compression())
aplicacion.set("view engine", "ejs");
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));
aplicacion.use(cookieParser());
aplicacion.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.CLAVEMONGOSESSION,
      mongoOptions: advancedOptions,
    }),
    secret: "Secreto",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);
aplicacion.use(bodyParser.urlencoded({ extended: false }));
aplicacion.use(passport.initialize());
aplicacion.use(passport.session());

aplicacion.use((req, res, next) => {
  loggerConsola.info(`${req.method} ${req.url}`);
  next();
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const httpServer = new HttpServer(aplicacion);
const io = new Socket(httpServer);
const publicRoot = "./src/public";
let productosdefs = new ContenedorFs("./src/db/productos.json");
let mensajesdefs = new ContenedorFs("./src/db/mensajes.json");
httpServer.listen(PORT, () => {
  console.log(`Aplicación escuchando en el puerto: ${PORT}`);
  console.log(`Worker en ${PORT}, PID: ${process.pid}`)
});

aplicacion.use(express.static(publicRoot));

io.on("connection", function (socket) {
  console.log("Un cliente se ha conectado");

  productosdefs.getAllfakeproducts(5).then((res) => {
    socket.emit("fakeproducts", res);
  }).catch((err)=>{
    loggerError.error(err);
    res.status(err.status || 500).send(err.message)
  });

  mensajesdefs.getAllmensajes().then((res) => {
    const normalizedData = normalize(res, [mensaje]);
    socket.emit("messages", normalizedData);
  }).catch((err)=>{
    loggerError.error(err);
    res.status(err.status || 500).send(err.message)
  });

  productosdefs.getAll().then((res) => {
    socket.emit("lineaproducto", res);
  }).catch((err)=>{
    loggerError.error(err);
    res.status(err.status || 500).send(err.message)
  });

  socket.on("new message", (data) => {
    mensajesdefs.Savemensajes(data).then((res) => {
      const normalizedData = normalize(res, [mensaje]);
      io.sockets.emit("messages", normalizedData);
    }).catch((err)=>{
      loggerError.error(err);
      res.status(err.status || 500).send(err.message)
    });
    mensajesdemongo.saveMongo(data);
    // ATENCION esta caido firebase por falta de actualizar claves: corregir :   mensajesdefb.saveFb(data);
  });

  socket.on("new lineaproducto", (data) => {
    productosdefs.Save(data).then((res) => {
      io.sockets.emit("lineaproducto2", res);
    }).catch((err)=>{
      loggerError.error(err);
      res.status(err.status || 500).send(err.message)
    });
  });
});

aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

aplicacion.get("/register", (peticion, respuesta) => {
  respuesta.render("register", {});
});

aplicacion.post("/register", (peticion, respuesta) => {
  User.register(
    new User({ username: peticion.body.username }),
    peticion.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        respuesta.render("registererror", {});
      } else {
        passport.authenticate("local")(peticion, respuesta, () => {
          respuesta.render("login", {});
        });
      }
    }
  );
});

aplicacion.get("/login", (peticion, respuesta) => {
  respuesta.render("login", {});
});

aplicacion.get("/logout", (peticion, respuesta) => {
  let nombre = peticion.user.username;
  peticion.logout((err) => {
    if (err) {
      return next(err);
    }
    respuesta.render("logout", { nombre });
  });

  /* let nombre = peticion.session.nombre;
  peticion.session.destroy((err) => {
    if (!err) {
      respuesta.render("logout", { nombre });
    } else {
      respuesta.send({ status: "logout error", body: err });
    }
  }); */
});

aplicacion.get("/loginerror", (peticion, respuesta) => {
  respuesta.render("loginerror", {});
});

aplicacion.get(
  "/productos",
  ensureLoggedIn("/loginerror"),
  (peticion, respuesta) => {
    let nombre = peticion.user.username;
    productosdefs.getAll().then((res) => {
      respuesta.render("productos", { res, nombre });
    }).catch((err)=>{
      loggerError.error(err);
      res.status(err.status || 500).send(err.message)
    });

    /* if (peticion.session.nombre) {
    let nombre = peticion.session.nombre;
    productosdefs.getAll().then((res) => {
      respuesta.render("productos", { res, nombre });
    });
  } else {
    respuesta.render("login", {});
  } */
  }
);

aplicacion.post(
  "/productos",
  passport.authenticate("local", { failureRedirect: "/loginerror" }),
  function (peticion, respuesta) {
    let nombre = peticion.user.username;
    productosdefs.getAll().then((res) => {
      respuesta.render("productos", { res, nombre });
    });

    /*  if (peticion.session.nombre) {
    let nombre = peticion.session.nombre;
    productosdefs.getAll().then((res) => {
      respuesta.render("productos", { res, nombre });
    });
  } else {
    peticion.session.nombre = peticion.body.nombre;
    let nombre = peticion.session.nombre;
    productosdefs.getAll().then((res) => {
      respuesta.render("productos", { res, nombre });
    });
  } */
  }
);

aplicacion.get("/", (peticion, respuesta) => {
  respuesta.sendFile("index.html", { root: publicRoot });
});

aplicacion.get("/chat", (peticion, respuesta) => {
  respuesta.sendFile("chat.html", { root: publicRoot });
});

aplicacion.get("/productos-test", (peticion, respuesta) => {
  respuesta.sendFile("indexfake.html", { root: publicRoot });
});

const info = {
  "Sistema operativo": process.platform,
  "Version de node": process.version,
  'Memoria': process.memoryUsage(),
  "id del proceso": process.pid,
  "Carpeta del proyecto": process.cwd(),
  "Path de ejecucion": process.execPath,
  "Argumentos de entrada": process.argv.slice(2),
  'numero de procesadores': numProcesadores
};

aplicacion.get("/info", (peticion, respuesta) => {

  respuesta.send(`Servidor express en Puerto: ${PORT}, Workers: ${numProcesadores}, PID: ${process.pid} - ${(new Date()).toLocaleString()}`);

  //respuesta.json(info);

});

aplicacion.get("/api/randoms", (peticion, respuesta) => {

  respuesta.send(`Servidor express en Puerto: ${PORT}, Workers: ${numProcesadores}, PID: ${process.pid} - ${(new Date()).toLocaleString()}`);

// EJERCICIO PREVIO
/*   let cantidad = peticion.query.cant;
  if (cantidad == undefined) {
    cantidad = 100000;
  }
  const hijo = fork("./src/computo.js");
  hijo.on("message", (param) => {
    if (param == "listo") {
      hijo.send(cantidad);
    } else {
      respuesta.json({
        resultado: param,
      });
    }
  }); */


});

aplicacion.all('*', (req, res) => {
  loggerWarn.warn(`${req.method} ${req.url}`)
  res.status(404).send("No existe esa ruta");
});


  //cierre del else de CLUSTER O FORK
}





