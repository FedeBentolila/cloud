import express from "express";
import {Server as HttpServer} from'http';
import {Server as Socket} from 'socket.io';
import { ContenedorFs } from "./contenedores/Contenedorfs.js";
import faker from 'faker';
faker.locale='es';
import { normalize, denormalize, schema } from "normalizr";
import util from 'util';
import mongoose from "mongoose";
import { ContenedorMongo } from "./contenedores/ContenedorMongo.js";
import { ContenedorFB } from "./contenedores/Contenedorfb.js";
import { ConexionMongo } from "./config.js";
import { ConexionFb } from "./config.js";

let mensajesdemongo= new ContenedorMongo('mensajes')

let mensajesdefb= new ContenedorFB('mensajes')

ConexionMongo()



function print (Objeto){
  console.log(util.inspect(Objeto,false,12,true))
}

//Schemas Normalizr
const author = new schema.Entity('authors')
const mensaje = new schema.Entity('mensajes', {
  author: author
})
////////////////////////

const aplicacion = express();
const httpServer= new HttpServer(aplicacion);
const io= new Socket(httpServer);
const PUERTO = 8080;
const publicRoot= "./src/public"
let productosdefs= new ContenedorFs("./src/db/productos.json")
let mensajesdefs= new ContenedorFs("./src/db/mensajes.json")

httpServer.listen(PUERTO, () => {
  console.log(
    `Aplicación escuchando en el puerto: ${PUERTO}`
  );
});

aplicacion.use(express.static(publicRoot));


io.on('connection', function(socket){
  console.log('Un cliente se ha conectado');

  productosdefs.getAllfakeproducts(5).then((res)=>{
    socket.emit('fakeproducts', res);
  })

  mensajesdefs.getAllmensajes().then((res)=>{
    /////////////////////////Normalizr
    const normalizedData = normalize(res, [mensaje])
    //////////////////////////////////////////

    socket.emit('messages', normalizedData);
  })
  
  productosdefs.getAll().then((res)=>{
    socket.emit('lineaproducto', res);
  })

  socket.on('new message', data=>{


      mensajesdefs.Savemensajes(data).then((res)=>{
        const normalizedData = normalize(res, [mensaje])
        
        io.sockets.emit('messages', normalizedData)
        
      });

      mensajesdemongo.saveMongo(data)

      mensajesdefb.saveFb(data)

    
  });

  socket.on('new lineaproducto', data=>{

    productosdefs.Save(data).then((res)=>{
      
    io.sockets.emit('lineaproducto2',res )
  })
  });
});


aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

aplicacion.get("/", (peticion, respuesta) => {
  respuesta.sendFile('index.html', {root: publicRoot});
});

aplicacion.get("/chat", (peticion, respuesta) => {
  respuesta.sendFile('chat.html', {root: publicRoot});
});

aplicacion.get("/productos-test", (peticion, respuesta) => {
   respuesta.sendFile('indexfake.html', {root: publicRoot});
  });


