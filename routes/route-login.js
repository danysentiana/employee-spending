import express from "express";
const router = express.Router();
import formidable from 'formidable';
import { firstValues } from 'formidable/src/helpers/firstValues.js';
import backend from "../backend/backend-login.js";

router.get("/", function (req, res, next) {
  res.render("page-login.ejs", { title: "Halaman Login" });
});

router.post("/", async (req, res, next) => {
  const form = formidable({});
  let fields;
  let files;
  try {
    [fields, files] = await form.parse(req);

    const fieldsData = firstValues(form, fields);

    const data = {
      username: fieldsData.login_username,
      password: fieldsData.login_password,
    };

    const result = await backend.login(data);
    res.json(result);
  } catch (error) {
    res.json({
      status: "nok",
      data: "",
      message: error
    }); 
  }
});

export default router;
