const express = require("express");
const path = require("path");
const logger = require("morgan");
const multer = require("multer");
const app = express();
const router = express.Router();
const upload = multer({ dest: "./public/uploads" });

port = 3000;

//Middleware
// 4.Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// 5.Third-party middleware
app.use(logger("combined"));

// 1.Application-level middleware
//Route GET: http://localhost:3000
const loggerMid = (req, res, next) => {
  console.log(`${new Date()}`);
  next();
};
app.use(loggerMid);
//Get: localhost:3000/users/
app.get("/", (req, res) => {
  res.send("Welcome to middleware");
});

// 2.Router-level middleware
app.use("/api/users", router);
const fakeAuth = (req, res, next) => {
  const authStatus = true;
  if (authStatus) {
    console.log("User authStatus:", authStatus);
    next();
  } else {
    res.status(401);
    throw new Error("User is not authorized");
  }
};

const getUsers = (req, res) => {
  res.json({ message: "Get all users" });
};

const createUser = (req, res) => {
  console.log("This is the body recevies from client :", req.body);
  res.json({ message: "Create new user" });
};

router.use(fakeAuth);
//GET: http://localhost:3000/api/users/
router.route("/").get(getUsers);
//POST: http://localhost:3000/api/users/
router.route("/").post(createUser);

// 3.Error-handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  switch (statusCode) {
    case 401:
      res.json({ title: "Unauthorized", message: err.message });
      break;
    case 404:
      res.json({ title: "Not Found", message: err.message });
      break;
    case 500:
      res.json({ title: "Server Error", message: err.message });
      break;
    default:
      break;
  }
};

app.post(
  "/upload",
  upload.single("image"),
  (req, res, next) => {
    console.log(req.file, req.body);
    res.send(req.file);
  },
  (err, req, res, next) => {
    res.status(400).send({ err: err.message });
  }
);

app.all("*", (req, res) => {
  res.status(404);
  throw new Error("Route not found");
});

app.use(errorHandler);
//Server setup
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
