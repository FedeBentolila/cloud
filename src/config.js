import mongoose from "mongoose";

import { initializeApp } from "firebase-admin/app";

import admin from "firebase-admin"

import passportLocalMongoose from "passport-local-mongoose";

import * as dotenv from 'dotenv';
dotenv.config()

const { credential } = admin;


let serviceAccount = {
    type: "service_account",
    project_id: "basefb-f8eda",
    private_key_id: "23f87ee1dca0cf77d53fd12d81967fc0c7dc5357",
    private_key: process.env.CLAVEFB,
    client_email: "firebase-adminsdk-ejxbn@basefb-f8eda.iam.gserviceaccount.com",
    client_id: "112528954905732598106",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ejxbn%40basefb-f8eda.iam.gserviceaccount.com",
  };



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
      process.env.CLAVEMONGO,
      {
        useNewUrlparser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("ok conexion mensajes");
  }

  export async function ConexionFb() {
  initializeApp({
    credential: credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    databaseURL: "https://basefb-f8eda.firebaseio.com",
  });

  console.log("ok fb");
}



const usersCollection= 'users';
const Schemauser= mongoose.Schema
const UserSchema= new Schemauser({
    username: {type: String},
    password: {type: String},
});

UserSchema.plugin(passportLocalMongoose);

export const User= mongoose.model(
    usersCollection,
    UserSchema
);
