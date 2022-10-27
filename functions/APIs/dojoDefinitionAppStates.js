const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { BSONTypeError } = require("bson");
const { mongodbConfig } = require("../util/config");
const { db } = require("../util/admin");
const client = new MongoClient(mongodbConfig.uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

exports.getDojoDefAppState = async (request, response) => {
  try {
    await client.connect();
    let userId = response.locals.userId;
    const results = await client.db("main").collection("dojoDefinitionsAppStates").findOne({ userId: userId });
    return response.status(200).json(results["dojoAppState"]);
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

exports.deleteDojoDefAppState = async (request, response) => {
  try {
    await client.connect();
    let userId = response.locals.userId;
    const results = await client.db("main").collection("dojoDefinitionsAppStates").deleteOne({ userId: userId });
    if (results.deletedCount == 0) {
      return response.status(404).json({ error: ` No user data found for this app` });
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

exports.upsertDojoDefAppState = async (request, response) => {
  try {
    await client.connect();
    const options = { upsert: true };
    let userId = response.locals.userId;
    let appState = request.body;
    const results = await client
      .db("main")
      .collection("dojoDefinitionsAppStates")
      .updateOne({ userId: userId }, { $set: { dojoAppState: appState } }, { upsert: true });
    return response.status(200).json({ success: "Updated object" });
  } catch (e) {
    if (e instanceof BSONTypeError) {
      response.status(404).json({
        error: e.message, //"Object not found",
      });
    } else {
      console.log(e);
      return response.status(400).json({ error: "Server error" });
    }
  } finally {
    await client.close();
  }
};
