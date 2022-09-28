const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");

const { getAllObjects, getObject, postObject, deleteObject, editObject } = require("./APIs/objects");
const { loginUser, signUpUser } = require("./APIs/users");

app.get("/objects", getAllObjects);
app.get("/objects/:objectId", getObject);
app.post("/objects", postObject);
app.delete("/objects/:objectId", deleteObject);
app.put("/objects/:objectId", editObject);

app.post("/login", loginUser);
app.post("/signup", signUpUser);

exports.api = functions.https.onRequest(app);
