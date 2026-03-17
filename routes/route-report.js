import express from "express";
const router = express.Router();
import backend from "../backend/backend-report.js";
import auth from "../helper/auth.js";

router.get('/', (req, res) => {
    res.render('report/page-report.ejs', {title: 'Laporan Pengeluaran'});
});

router.post('/data', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const user = await auth.authCheck(token);
        const result = await backend.getReportData(req.body);
        res.json(result);
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

router.post('/export/excel', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const user = await auth.authCheck(token);
        const result = await backend.exportToExcel(req.body);
        
        if (result.status === 'ok') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.data);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

router.post('/export/pdf', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const user = await auth.authCheck(token);
        const result = await backend.exportToPDF(req.body);
        
        if (result.status === 'ok') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.data);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

router.post('/summary', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const user = await auth.authCheck(token);
        const result = await backend.getReportSummary(req.body);
        res.json(result);
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

export default router;