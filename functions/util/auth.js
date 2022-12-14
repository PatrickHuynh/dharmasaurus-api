const { admin, db } = require("./admin");

module.exports = (request, response, next) => {
  let idToken;
  if (request.headers.authorization && request.headers.authorization.startsWith("Bearer ")) {
    idToken = request.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return response.status(403).json({ error: "Unauthorized" });
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      request.user = decodedToken;
      response.locals.userId = request.user.uid;
      return db.collection("users").where("uid", "==", request.user.uid).limit(1).get();
    })
    .then((data) => {
      request.user.username = data.docs[0].data().username;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
      return response.status(403).json(err);
    });
};
