const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
const cors = require("cors");

const { getAllSiteEvents } = require("./APIs/siteLoadEvents");
const { getAllObjects, getObject, postObject, deleteObject, editObject } = require("./APIs/objects");
const { getDojoDefAppState, upsertDojoDefAppState } = require("./APIs/dojoDefinitionAppStates");
const { loginUser, signUpUser } = require("./APIs/users");

app.use(cors({ origin: false }));

app.get("/siteEvents", auth, getAllSiteEvents);

app.get("/objects", getAllObjects);
app.get("/objects/:objectId", getObject);
app.post("/objects", auth, postObject);
app.delete("/objects/:objectId", auth, deleteObject);
app.put("/objects/:objectId", auth, editObject);

app.get("/dojo/definitions/appState", auth, getDojoDefAppState);
app.put("/dojo/definitions/appState", auth, upsertDojoDefAppState);

app.post("/user/login", loginUser);
app.post("/user/signup", signUpUser);

exports.api = functions.https.onRequest(app);
