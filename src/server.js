import express from "express";
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
import * as dotenv from 'dotenv';
import minimist from "minimist";
import { fork } from "child_process";



//////////////////////////////////////////////////////////////////////
const options= {
  alias: {
    p: 'port'
},
  default: {
      port: 8080
  },
}

const puerto= minimist(process.argv.slice(2), options);

const PORT = puerto.p

//node src/server.js -p 9090

dotenv.config()

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
});

aplicacion.use(express.static(publicRoot));

io.on("connection", function (socket) {
  console.log("Un cliente se ha conectado");

  productosdefs.getAllfakeproducts(5).then((res) => {
    socket.emit("fakeproducts", res);
  });

  mensajesdefs.getAllmensajes().then((res) => {
    const normalizedData = normalize(res, [mensaje]);
    socket.emit("messages", normalizedData);
  });

  productosdefs.getAll().then((res) => {
    socket.emit("lineaproducto", res);
  });

  socket.on("new message", (data) => {
    mensajesdefs.Savemensajes(data).then((res) => {
      const normalizedData = normalize(res, [mensaje]);
      io.sockets.emit("messages", normalizedData);
    });
    mensajesdemongo.saveMongo(data);
    mensajesdefb.saveFb(data);
  });

  socket.on("new lineaproducto", (data) => {
    productosdefs.Save(data).then((res) => {
      io.sockets.emit("lineaproducto2", res);
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


const info= {
  'Sistema operativo': process.platform,
  'Version de node': process.version,
  'Memoria': process.memoryUsage(),
  'id del proceso': process.pid,
  'Carpeta del proyecto': process.cwd(),
  'Path de ejecucion': process.execPath,
  'Argumentos de entrada': process.argv.slice(2)

}

aplicacion.get("/info", (peticion, respuesta) => {
  respuesta.json(info);
});

aplicacion.get("/api/randoms", (peticion, respuesta) => {
  let cantidad= peticion.query.cant
  if (cantidad==undefined) {
    cantidad=100000
  }
  const hijo = fork('./src/computo.js');
  hijo.on('message', param => {
    if (param == 'listo') {
      hijo.send(cantidad);
    } else {
      respuesta.json({
        resultado: param
      });
    }
  })
});
