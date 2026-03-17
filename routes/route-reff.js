import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import auth from "../helper/auth.js";
import backend from "../backend/backend-reff.js";
const fileRootPath = process.env.LOCAL_FILE_PATH;

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, fileRootPath);

router.get("/file", async (req, res) => {
    const { file, token } = req.query;

    if (!file) {
        res.status(400).json({ status: "nok", message: "Parameter file wajib diisi" });
        return;
    }

    try {
        await auth.authCheck(token);

        // prevent path traversal attacks.
        const relativePath = path.normalize(file.toString()).replace(/^(\.\.[\/\\])+/, '');

        const safePath = path.join(uploadRoot, relativePath);

        if (!safePath.startsWith(uploadRoot)) {
            res.status(403).json({ status: "nok", message: "Akses file ditolak" });
            return;
        }

        if (!fs.existsSync(safePath)) {
            res.status(404).json({ status: "nok", message: "File tidak ditemukan" });
            return;
        }

        res.sendFile(safePath);
    } catch (error) {
        res.status(401).json({
            status: "nok",
            message: error?.message || "Otentikasi gagal",
        });
    }
});

router.get('/pks', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getPKS(decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/history-list', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getHistoryList(decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/service-list-by-pks', async (req, res) => {
    const pksId = req.query.pksId;
    
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getServiceListByPKSId(pksId, decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/batch-list', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getBatch(decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/batch-list-by-pks-and-service', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const { pksId, serviceId } = req.query;
        const data = await backend.getBatchListByPKSIdAndServiceId(pksId, serviceId, decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/step-list-by-pks', async (req, res) => {
    const pksId = req.query.pksId;
    console.log("step ", pksId);
    
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getStepListByPKSId(pksId, decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/loan-status', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getLoanStatus(decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/member-list', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const { type } = req.query;
        const data = await backend.getMemberList(type);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

router.get('/member-details', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const { nik } = req.query;
        const data = await backend.getMemberDetails(nik);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});
router.get('/bank-list', async (req, res) => {
    try {
        const token = req.headers['authorization'].replace('Bearer ', '');
        const decoded = await auth.authCheck(token);
        const data = await backend.getBanks(decoded);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error
        });
    }
});

export default router;
