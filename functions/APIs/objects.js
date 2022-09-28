const { db } = require("../util/admin");

exports.getAllObjects = (request, response) => {
  db.collection("objects")
    .get()
    .then((data) => {
      let objects = [];
      data.forEach((doc) => {
        objects.push({
          objectId: doc.id,
          name: doc.data().name,
          definition: doc.data().definition,
          createdAt: doc.data().createdAt,
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
  db.doc(`/objects/${request.params.todoId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({
          error: "Object not found",
        });
      }
      objectData = doc.data();
      objectData.objectId = doc.id;
      return response.json(objectData);
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: error.code });
    });
};

exports.postObject = (request, response) => {
  if (request.body.body.trim() === "") {
    return response.status(400).json({ body: "Must not be empty" });
  }

  if (request.body.name.trim() === "") {
    return response.status(400).json({ name: "Must not be empty" });
  }
  const newDoc = {
    name: request.body.name,
    definition: request.body.definition,
    createdAt: new Date().toISOString(),
  };
  db.collection("objects")
    .add(newDoc)
    .then((doc) => {
      const responseDoc = newDoc;
      responseDoc.id = doc.id;
      return response.json(responseDoc);
    })
    .catch((err) => {
      response.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
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
