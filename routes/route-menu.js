import express from "express";
const router = express.Router();
import backend from "../backend/backend-menu.js";
import auth from "../helper/auth.js";

router.get("/list", async (req, res) => {
    try {
        const token = req.headers["authorization"].replace("Bearer ", "");
        const response = await auth.authCheck(token);
        const menu = await backend.getMenu(response);
        res.json(menu);
    } catch (error) {
        res.status(401).json({ 
            status: "nok",
            data: "", 
            message: error 
        });
    }
});

export default router;
