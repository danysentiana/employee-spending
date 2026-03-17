import express from "express";
const router = express.Router();

router.get('/', function (req, res, next) {
    res.render('page-privacypolicy.ejs', {title: 'aaaa'});
});

export default router;
