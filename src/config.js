import mongoose from "mongoose";

import { initializeApp } from "firebase-admin/app";

import admin from "firebase-admin"

import passportLocalMongoose from "passport-local-mongoose";

const { credential } = admin;

let serviceAccount = {
    type: "service_account",
    project_id: "basefb-f8eda",
    private_key_id: "23f87ee1dca0cf77d53fd12d81967fc0c7dc5357",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDDqKBkocTWzvWZ\nV1V8g8wN8SjuCESWnJ282v/7/m+xVJ0qeztJFOrQ4ZjTdtRtvxtx17iJVapeyuzQ\nA21Pw2yjFq04GjwHfH5noaQjYdpuuoKc14mHDC4WPEY/tnH+A/Ou49T/UxaTzi73\nFzDgR1yL4ZXRasKBUlIEl+67cjBx9Dw0HEvJxypyj3MxK4y6Aj1zXEjImgWj5vWY\nLW66ZDQfiumcRnR4KoDEjQ0jkprhlhrzhVVfxyjDjAfc1xl8lKOxHFGtM8BfCBS3\n9XHdy6y/ob7iOmXtjQdHW/ReHp0R39n3vsT+NLJrHlj/Yr0asHa89uNDya0m9xPV\nOKmN+I35AgMBAAECggEACHKgSzwDVVF9/+sKBzxjC/KOxXlAqd6U/m2Xuhv+G1JX\nj1kfAgynx1FIQZAaw6rJzvBlGLPkzV82WpRdTMF3sDJ3U+npD9svk36iiT8NOPTv\nVQGG3/h2CHJ9h3xzf0fRJorSfFwsaEERnMxI6VQXcjgxGWfCQmZpIWbkcT4wyoix\nWPw3DCVFKsCgdWIAq8ZietX9G6Pnt64zUR7rqbyqVUdT6L+jUfb/+vvv1H5762ny\nqUECe7tv0WUPg9bWUKmjBHttN4KHYRX4+D0RKAlVhmGhOljnmCtwtD6Cmv7WZcDK\nCnI9EF9J/XycNCoKpV1nuHWeN1k0EDuko1yhGyg0IQKBgQDjshs08bnSU0qEVYKb\nivRSy2Df2ObisUwREUEvVjF0951YMVi66OQXHppvZDoIYxOdjZNIoPyouK88iBSt\nrdc2E6nOE6oDEe2C2zTzoA7kMHHxKGd2V+X6afOOpggrFATEj9yj4sCj27l0+cc0\nZ6Lk3SvBlG+gNOb/PJ/l7NaC4QKBgQDb+wPswOKlu7ObC/mjQGWvSXntiHWeGBQ0\nJY3fI2Qaki7wcIt9RhmZs4aiAX9TDI/OEbCeFpbhuLPulw3tmZ1xCsxeN90BeOfD\n3NEDfwCHlNaoJf47UE2YyOWLTFGfjAxuiF8GK7HoD+76XbohZqJO7SQsZcWbOpRc\neaGfOQSGGQKBgBAeCFz8C1o++RRa9S7LbDX8HXRa5yT+xdKjdQjDwiZ0bJfUjmJU\nn+ifCvF9l7oGQVoyrk1Cz/+lawoO29/bYVN7mtZyf+NNvpE3sQzZtJQkdbxLTt+K\no0XRgCMFz6g0941uXYDgSSCQKhWEpLwp5dbrbPB78FbXx84jXXIqDJkhAoGAL5b0\nWGm6HqSmzGogzYKG/Q7mQ877swH+jPF66cUcSOtLIFUYuDdMHoZKIA42316eVbRa\nAzlb1uVAd+NR7g8HkocFg3SOaV0gtqy0ww7crHg0oBfoEijjQKRllGckWWHQ5rC1\n7f3R9SRNTPit5b/waSbAZqJ1x4k6w27E2k9ZfTECgYA00Z9PeFjDSxVEdSdpFbwu\n/XmvxUdcmJNP7v9NE67mv2RTJWoXQkQboYf73N0KcE/ZKztqiyJUOvO20seMGaTI\nWJeZXg+fsUv1aqniH7r7FyYwpsF5mUGutKRUqkypoz9+7qzT5S6xOhAs2E7tMvXL\nSJT1irHjMLxd8lWFEaLYaQ==\n-----END PRIVATE KEY-----\n",
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
      "mongodb+srv://root:root@cluster0.wsvmh2e.mongodb.net/mensajes?retryWrites=true&w=majority",
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
