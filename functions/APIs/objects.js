const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { BSONTypeError } = require("bson");
const { mongodbConfig } = require("../util/config");
const { db } = require("../util/admin");
const client = new MongoClient(mongodbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

exports.getAllObjects = async (request, response) => {
  try {
    await client.connect();
    const results = await client.db("main").collection("objects").find().toArray();
    let clientIP = request.headers["x-forwarded-for"] || request.socket.remoteAddress;
    clientIP = clientIP ? clientIP : "unknown";
    db.collection("siteLoadEvents").add({
      name: "/definitions/getAllObjects",
      fromIP: clientIP,
      time: new Date.now(),
    });
    return response.status(200).json(results);
  } catch (e) {
    console.log(e);
    return response.status(400).json({ error: "Server error" });
  } finally {
    await client.close();
  }
};

exports.getObject = async (request, response) => {
  try {
    await client.connect();
    let objId = request.params.objectId;
    const results = await client.db("main").collection("objects").findOne(ObjectId(objId));
    return response.status(200).json(results);
  } catch (e) {
    if (e instanceof BSONTypeError) {
      response.status(404).json({
        error: "Object not found",
      });
    } else {
      console.log(e);
      return response.status(400).json({ error: "Server error" });
    }
  } finally {
    await client.close();
  }
};

exports.postObject = async (request, response) => {
  try {
    await client.connect();
    const newDoc = {
      name: request.body.name,
      definition: request.body.definition,
      mainTopic: request.body.mainTopic,
      source: request.body.source,
    };
    let results = await client.db("main").collection("objects").insertOne(newDoc);
    return response.status(200).json(results);
  } catch (e) {
    console.log(e);
    return response.status(400).json({ error: "Server error" });
  } finally {
    await client.close();
  }
};

exports.deleteObject = async (request, response) => {
  try {
    await client.connect();
    let objId = request.params.objectId;
    const results = await client
      .db("main")
      .collection("objects")
      .deleteOne({ _id: ObjectId(objId) });
    if (results.deletedCount == 0) {
      return response.status(404).json({ error: `${objId} | Object id not found` });
    }
    return response.status(200).json(results);
  } catch (e) {
    if (e instanceof BSONTypeError) {
      response.status(404).json({
        error: "Object not found",
      });
    } else {
      console.log(e);
      return response.status(400).json({ error: "Server error" });
    }
  } finally {
    await client.close();
  }
};

exports.editObject = async (request, response) => {
  try {
    await client.connect();
    let objId = request.params.objectId;
    const newDoc = {
      name: request.body.name,
      definition: request.body.definition,
      mainTopic: request.body.mainTopic,
      source: request.body.source,
    };
    const results = await client
      .db("main")
      .collection("objects")
      .findOneAndUpdate(
        { _id: ObjectId(objId) },
        {
          $set: {
            name: newDoc.name,
            definition: newDoc.definition,
            mainTopic: newDoc.mainTopic,
            source: newDoc.source,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );
    return response.status(200).json({ success: "Updated object" });
  } catch (e) {
    if (e instanceof BSONTypeError) {
      response.status(404).json({
        error: "Object not found",
      });
    } else {
      console.log(e);
      return response.status(400).json({ error: "Server error" });
    }
  } finally {
    await client.close();
  }
};
