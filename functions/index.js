const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
const cors = require("cors")({ origin: true });

const { getAllObjects, getObject, postObject, deleteObject, editObject } = require("./APIs/objects");
const { loginUser, signUpUser } = require("./APIs/users");

app.get("/objects", getAllObjects);
app.get("/objects/:id", getObject);
app.post("/objects", auth, postObject);
app.delete("/objects/:objectId", auth, deleteObject);
app.put("/objects/:objectId", auth, editObject);

app.post("/login", loginUser);
app.post("/signup", signUpUser);

app.use(cors);

exports.api = functions.https.onRequest(app);
