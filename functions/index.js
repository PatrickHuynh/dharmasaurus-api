const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
const cors = require("cors");

const { getAllObjects, getObject, postObject, deleteObject, editObject } = require("./APIs/objects");
const { loginUser, signUpUser } = require("./APIs/users");

app.use(cors({ origin: true }));

app.get("/objects", getAllObjects);
app.get("/objects/:id", getObject);
app.post("/objects", auth, postObject);
app.delete("/objects/:objectId", auth, deleteObject);
app.put("/objects/:objectId", auth, editObject);

app.post("/login", loginUser);
app.post("/signup", signUpUser);

exports.api = functions.https.onRequest(app);
