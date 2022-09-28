const { linkWithPhoneNumber } = require("firebase/auth");
const { db } = require("../util/admin");

exports.getAllObjects = (request, response) => {
  db.collection("objects")
    .get()
    .then((data) => {
      let objects = [];
      data.forEach((doc) => {
        objects.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      return response.json(objects);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.getObject = (request, response) => {
  db.doc(`/objects/${request.params.id}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({
          error: "Object not found",
        });
      }
      objectData = doc.data();
      objectData.id = doc.id;
      return response.json({ id: doc.id, ...objectData });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: error.code });
    });
};

exports.postObject = async (request, response) => {
  if (request.body.name == null) {
    return response.status(400).json({ name: "Must not be empty" });
  }
  if (request.body.name.trim() === "") {
    return response.status(400).json({ name: "Must not be empty" });
  }

  const newDoc = {
    ...request.body,
    createdAt: new Date().toISOString(),
  };

  try {
    let query = db.collection("objects").where("name", "==", newDoc.name);
    let result = await query.limit(1).get();
    if (result.docs.length != 0) {
      return response.status(400).json({ name: `(${newDoc.name}) Name of object already exists` });
    }
    let coln = db.collection("objects");
    let doc = await coln.add(newDoc);
    return response.json({ id: doc.id, ...newDoc });
  } catch (e) {
    response.status(500).json({ error: "Something went wrong" });
    console.error(e);
  }
};

exports.deleteObject = (request, response) => {
  const document = db.doc(`/objects/${request.params.todoId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Object not found" });
      }
      return document.delete();
    })
    .then(() => {
      response.json({ message: "Delete successfull" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};

exports.editObject = (request, response) => {
  if (request.body.objectId || request.body.createdAt) {
    response.status(403).json({ message: "Not allowed to edit" });
  }
  let document = db.collection("objects").doc(`${request.params.todoId}`);
  document
    .update(request.body)
    .then(() => {
      response.json({ message: "Updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({
        error: err.code,
      });
    });
};
