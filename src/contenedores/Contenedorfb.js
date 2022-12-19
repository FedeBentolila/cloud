import admin from "firebase-admin";
import { ConexionFb } from "../config.js";

ConexionFb();
const db = admin.firestore();

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

  export class ContenedorFB {
    constructor(coleccion) {
      this.coleccion = coleccion;
    }

    async saveFb(objetox) {
        const query = db.collection(this.coleccion);
        const querySnapshot = await query.get();
        let docs = querySnapshot.docs;
        let id = docs.length + 1;
        objetox.id = id;
        let doc = query.doc(`${id}`);
        await doc.create(objetox);
      }


}