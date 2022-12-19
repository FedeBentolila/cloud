import * as fs from "fs";
import faker from 'faker'

let messages = [];
let Arreglodeproductos = [];
let idproductos = 1;
let idmensajes=1;

export class ContenedorFs {
    constructor(nombre) {
      this.nombre = nombre;
    }

    async  leerarchivodemensajes() {
        try {
          let contenido= await fs.promises.readFile(this.nombre, "utf-8")
            let archivo = JSON.parse(contenido);
            messages = archivo; 
            idmensajes= messages.length+1
        } catch (error) {
          console.log("error de lectura del archivo", error);
        }
      }
      
      async  Savemensajes(Objeto) {
        try {
          await this.leerarchivodemensajes();

          Objeto={
            ...Objeto,
            id: idmensajes
          }
      
          messages.push(Objeto);
      
          await fs.promises.writeFile(
            this.nombre,
            JSON.stringify(messages, 1, "\n")
          );

          return messages
      
        } catch (error) {
          console.log("hubo un error no se pudo guardar el mensaje", error);
        }
       
      }
      
      async  getAllmensajes() {
        await this.leerarchivodemensajes();
      
        return messages;
      }

      
      async Save(Objeto) {
        try {
          await this.getAll();
      
          Objeto = {
            ...Objeto,
            id: idproductos,
          };
      
          console.log("el ID del producto agregado es", idproductos);
      
          Arreglodeproductos.push(Objeto);
      
          await fs.promises.writeFile(
            this.nombre,
            JSON.stringify(Arreglodeproductos, 1, "\n")
          );

          return Objeto
      
        } catch (error) {
          console.log("hubo un error no se pudo guardar el ojbeto");
        }
       
      }
      
      async  getByID(idabuscar) {
        try {
          await this.getAll();
      
          if (
            (objetobuscado = Arreglodeproductos.find(({ id }) => id === idabuscar))
          ) {
            return objetobuscado;
            // console.log(objetobuscado)
          } else {
            console.log(null);
          }
        } catch (error) {
          console.log("error al buscar el id");
        }
      }
      
      async  getAll() {
        try {
            let contenido = await fs.promises.readFile(this.nombre, "utf-8")
             let archivo = JSON.parse(contenido);
             Arreglodeproductos = archivo;
             idproductos = Arreglodeproductos.length + 1;
             return Arreglodeproductos;
            
           } catch (error) {
             console.log("error de lectura del archivo", error);
           }
      
      }
      
      async deleteByID(idabuscar) {
        try {
          await this.getAll();
          let objetobuscado
          if (
            (objetobuscado = Arreglodeproductos.find(({ id }) => id === idabuscar))
          ) {
            Arreglodeproductos.splice(
              Arreglodeproductos.findIndex((a) => a.id === idabuscar),
              1
            );
      
            await fs.promises.writeFile(
              this.nombre,
              JSON.stringify(Arreglodeproductos, 1, "\n")
            );
      
            return objetobuscado;
          } else {
            console.log("no existe ese archivo para borrar");
          }
        } catch (error) {
          console.log("error al buscar el id");
        }
      }
      
      async deleteAll() {
        try {
          await this.getAll();
      
          if (Arreglodeproductos) {
            Arreglodeproductos = [];
      
            await fs.promises.writeFile(
              this.nombre,
              JSON.stringify(Arreglodeproductos, 1, "\n")
            );
          } else {
            console.log("no existen archivos para borrar");
          }
        } catch (error) {
          console.log("error al buscar el id");
        }
      }

      async getAllfakeproducts(cantidad){
        const productos=[];
        for (let index = 0; index < cantidad; index++) {
          productos.push({
            title:faker.commerce.product(),
            price:faker.commerce.price(),
            thumbnail:faker.image.fashion(100, 100, true),
            id: index+1
          }) 
        }
        return productos
      }



}