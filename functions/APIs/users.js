const { firebaseConfig } = require("../util/config");
const firebase = require("firebase/app");

const { db } = require("../util/admin");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require("firebase/auth");

const app = firebase.initializeApp(firebaseConfig);
//const { validateLoginData, validateSignUpData } = require("../util/validators");

// Login
exports.loginUser = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  //const { valid, errors } = validateLoginData(user);
  //if (!valid) return response.status(400).json(errors);

  const auth = getAuth(app);
  signInWithEmailAndPassword(auth, user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((error) => {
      console.error(error);
      return response.status(403).json({ general: "wrong credentials, please try again" });
    });
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

const isValidEmail = (email) => {
  const validRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(validRegex)) return true;
  else return false;
};

const isValidUsername = (username) => {
  const validRegex = /^[A-Za-z]+$/;
  if (username.match(validRegex)) return true;
  else return false;
};

const isValidSignUpData = (data) => {
  let errors = {};

  if (isEmpty(data.username)) {
    errors.username = "Must not be empty";
  } else if (!isValidUsername(data.username)) {
    errors.username = "Can only be upper or lowercase letters with no spaces";
  }

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Must be valid email address";
  }

  if (isEmpty(data.password)) {
    errors.password = "Must not be empty";
  } else if (data.password.length < 6) {
    errors.password = "Must be at least 6 characters";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

exports.signUpUser = (request, response) => {
  const newUser = {
    username: request.body.username,
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = isValidSignUpData(newUser);
  if (!valid) return response.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc) => {
      const auth = getAuth(app);
      if (doc.exists) {
        return response.status(400).json({ username: "This username has already been taken" });
      } else {
        return createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idtoken) => {
      token = idtoken;
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email already in use" });
      } else {
        return response.status(500).json({ general: "Something went wrong, please try again" });
      }
    });
};

exports.getUserDetail = (request, response) => {
  let userData = {};
  db.doc(`/users/${request.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.userCredentials = doc.data();
        return response.json(userData);
      }
    })
    .catch((error) => {
      console.error(error);
      return response.status(500).json({ error: error.code });
    });
};

// deleteImage = (imageName) => {
//   const bucket = admin.storage().bucket();
//   const path = `${imageName}`;
//   return bucket
//     .file(path)
//     .delete()
//     .then(() => {
//       return;
//     })
//     .catch((error) => {
//       return;
//     });
// };

// // Upload profile picture
// exports.uploadProfilePhoto = (request, response) => {
//   const BusBoy = require("busboy");
//   const path = require("path");
//   const os = require("os");
//   const fs = require("fs");
//   const busboy = BusBoy({ headers: request.headers });

//   let imageFileName;
//   let imageToBeUploaded = {};

//   busboy.on("file", (fieldname, file, info) => {
//     const { filename, encoding, mimeType } = info;
//     if (mimeType !== "image/png" && mimeType !== "image/jpeg") {
//       return response.status(400).json({ error: "Wrong file type submited" });
//     }
//     const imageExtension = filename.split(".")[filename.split(".").length - 1];
//     imageFileName = `${request.user.username}.${imageExtension}`;
//     const filePath = path.join(os.tmpdir(), imageFileName);
//     imageToBeUploaded = { filePath, mimeType };
//     file.pipe(fs.createWriteStream(filePath));
//   });
//   deleteImage(imageFileName);
//   busboy.on("finish", () => {
//     admin
//       .storage()
//       .bucket()
//       .upload(imageToBeUploaded.filePath, {
//         resumable: false,
//         metadata: {
//           metadata: {
//             contentType: imageToBeUploaded.mimeType,
//           },
//         },
//       })
//       .then(() => {
//         const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
//         return db.doc(`/users/${request.user.username}`).update({
//           imageUrl,
//         });
//       })
//       .then(() => {
//         return response.json({ message: "Image uploaded successfully" });
//       })
//       .catch((error) => {
//         console.error(error);
//         return response.status(500).json({ error: error.code });
//       });
//   });
//   busboy.end(request.rawBody);
// };

// exports.updateUserDetails = (request, response) => {
//   let document = db.collection("users").doc(`${request.user.username}`);
//   document
//     .update(request.body)
//     .then(() => {
//       response.json({ message: "Updated successfully" });
//     })
//     .catch((error) => {
//       console.error(error);
//       return response.status(500).json({
//         message: "Cannot Update the value",
//       });
//     });
// };
