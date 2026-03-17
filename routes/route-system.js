import express from "express";
const router = express.Router();
// const formidableMiddleware from "express-formidable");
import formidable from "formidable";
import back from "../backend/backend-system.js";
import auth from "../helper/auth.js";

router.get("/privacy-policy", function (req, res, next) {
  res.render("page-privacypolicy.ejs", { title: "aaaa" });
});

router.get("/contact-us", function (req, res) {
  res.render("page-contact-us.ejs", { title: "aaaa" });
});

router.get("/confirm-mail", function (req, res) {
  res.render("page-confirm-mail.ejs", { title: "aaaa" });
});

// router.get("/error/:status", function (req, res) {
//   res.render("page-error.ejs", { statusCode: req.params.status, statusName: "Error" });
// });

router.get("/error/401", function (req, res) {
  res.render("page-error401.ejs", { title: "aaaa" });
});

router.get("/error/404", function (req, res) {
  res.render("page-error404.ejs", { title: "aaaa" });
});

router.get("/error/500", function (req, res) {
  res.render("page-error500.ejs", { title: "aaaa" });
});

router.get("/maintenance", function (req, res) {
  res.render("page-maintenance.ejs", { title: "aaaa" });
});

router.get("/contact-us", function (req, res) {
  res.render("page-contact-us.ejs", { title: "aaaa" });
});

router.get("/reset-password", function (req, res) {
  res.render("page-reset-password.ejs", { title: "aaaa" });
});

router.get("/template-email", function (req, res) {
  res.render("page-template-email.ejs", { title: "aaaa" });
});

router.get("/reset-password/update", function (req, res) {
  res.render("page-reset-password-update.ejs", { title: "aaaa" });
});

router.get("/change-password", function (req, res) {
  res.render("page-change-password.ejs", { title: "aaaa" });
});

router.get("/chat", function (req, res) {
  res.render("page-chat.ejs", { title: "aaaa" });
});

router.get('/maintenance/check', function (req, res, next) {
  back.maintenanceCheck().then((response) => {
      res.json(response);
  }).catch((error) => {
    res.json({
        status: "nok",
        data: "",
        message: error
    });
  });
});

// router.post("/reset-password", formidableMiddleware(), function (req, res) {
//   back.resetPassword(req.fields.reset_password_email).then((response) => {
//     res.json(response);
//   }).catch((error) => {
//     res.json({
//         status: "nok",
//         data: "",
//         message: error
//     });
//   });
// });

// router.post("/reset-password/update", formidableMiddleware(), function (req, res) {
//   let data = {
//     email: req.fields.email,
//     key: req.fields.key,
//     pass: req.fields.new_password
//   };
//   back.updatePassword(data).then((response) => {
//     res.json(response);
//   }).catch((error) => {
//     console.log(error)
//     res.json({
//         status: "nok",
//         data: "",
//         message: error
//     });
//   });
// });

router.post("/change-password", function (req, res) {
  const token = req.headers['authorization'].replace('Bearer ', '');
  let data = {
    oldPass: req.body.old_password,
    newPass: req.body.new_password
  };
  auth.authCheck(token).then((response) => {
    back.changePassword(data, response).then((response) => {
      res.json(response);
    }).catch((error) => {
      res.json({
          status: "nok",
          data: "",
          message: error
      });
    });
  }).catch((error) => {
    res.status(401);
    res.json({
        status: "nok",
        data: "",
        message: error
    });
  });
});

export default router;
