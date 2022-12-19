import mongoose from "mongoose";

import { mensajesmodule } from "../config.js";


let date = new Date();
let dateStr =
  ("00" + date.getDate()).slice(-2) +
  "/" +
  ("00" + (date.getMonth() + 1)).slice(-2) +
  "/" +
  date.getFullYear() +
  " " +
  ("00" + date.getHours()).slice(-2) +
  ":" +
  ("00" + date.getMinutes()).slice(-2) +
  ":" +
  ("00" + date.getSeconds()).slice(-2);


export class ContenedorMongo {
    constructor(nombre) {
      this.nombre = nombre;
    }

    async saveMongo(objeto) {
        const archivo = await mensajesmodule.find();
        let id = 1;
        archivo.forEach((element, index) => {
          if (element.id >= id) {
            id = element.id + 1;
          }
        });
        objeto.id = id;
        let mensajesSaveModel = new mensajesmodule(objeto);
        await mensajesSaveModel.save();
      }

}



  