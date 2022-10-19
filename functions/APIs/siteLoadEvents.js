const { db } = require("../util/admin");

exports.getAllSiteEvents = async (request, response) => {
  try {
    let results = await db.collection("siteLoadEvents").get();
    results = results.docs.map((doc) => doc.data());
    return response.status(200).json(results);
  } catch (e) {
    console.log(e);
    return response.status(400).json({ error: "Server error" });
  }
};
