import createError from "http-errors";
import express from "express";
import partials from "express-partials";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import logger from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(partials());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

console.log("App is running in " + process.env.NODE_ENV + " mode.");

//----------
import login from "./routes/route-login.js";
import department from "./routes/route-department.js";
import employee from "./routes/route-employee.js";
import spending from "./routes/route-spending.js";
import report from "./routes/route-report.js";

//----------
app.use("/", login);
app.use("/department", department);
app.use("/employee", employee);
app.use("/spending", spending);
app.use("/report", report);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.status === 404) {
    res.status(err.status);
    res.redirect('/error/404');
  } else {
    res.status(err.status || 500);
    res.redirect('/error/500');
  }
});

export default app;