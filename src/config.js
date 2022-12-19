import mongoose from "mongoose";

const mensajesCollection= 'mensajes';
const Schema= mongoose.Schema
const mensajesSchema= new Schema({
    author: {type: Map},
    text: {type: String},
    time: {type: String},
    id: {type: Number},
});

export const mensajesmodule= mongoose.model(
    mensajesCollection,
    mensajesSchema
);

export async function ConexionMongo() {
    mongoose.connect(
      "mongodb+srv://root:root@cluster0.wsvmh2e.mongodb.net/mensajes?retryWrites=true&w=majority",
      {
        useNewUrlparser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("ok conexion");
  }