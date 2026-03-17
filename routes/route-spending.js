import express from "express";
const router = express.Router();
import backend from "../backend/backend-spending.js";
import auth from "../helper/auth.js";

router.get('/', (req, res) => {
    res.render('spending/page-spending.ejs', {title: 'Data Pengeluaran'});
});

router.get('/add', (req, res) => {
    res.render('spending/page-spending-add.ejs', {title: 'Tambah Pengeluaran'});
});

router.get('/table', async (req, res) => {
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const order = req.query.order;

    const filter = {
        search_department: req.query.search_department,
        search_employee: req.query.search_employee,
        search_date_from: req.query.search_date_from,
        search_date_to: req.query.search_date_to,
        search_value_min: req.query.search_value_min,
        search_value_max: req.query.search_value_max
    };

    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const response = await auth.authCheck(token);
        const data = await backend.setSpendingTable(start, length, draw, order, filter, response);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({
            status: "nok",
            data: "",
            message: error,
        });
    }
});

router.post('/add', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const user = await auth.authCheck(token);
        
        // Check if user has permission (Admin can Create/Update/Delete, User can only Create/Read)
        if (user.role !== 1) {
            return res.status(403).json({
                status: "nok",
                message: "Anda tidak memiliki izin untuk melakukan aksi ini"
            });
        }
        
        const result = await backend.createSpending(req.body, user);
        res.json(result);
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const spendingId = req.params.id;
        const result = await backend.getSpendingById(spendingId);

        if (result.status !== 'ok') {
            return res.status(404).send(result.message);
        }
        res.render('spending/page-spending-add.ejs', {title: 'Edit Pengeluaran', spendingData: result.data});
    } catch (error) {
        res.status(500).send("Terjadi kesalahan server");
    }
});

router.get('/detail/:id', async (req, res) => {
    const spendingId = req.params.id;
    try {
        const result = await backend.getSpendingById(spendingId);
        if (result.status !== 'ok') {
            return res.status(404).json(result);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "nok",
            message: "Terjadi kesalahan server"
        });
    }
});

router.post('/update/:id', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    const spendingId = req.params.id;

    try {
        const user = await auth.authCheck(token);
        
        // Check if user has permission (Admin only)
        if (user.role !== 1) {
            return res.status(403).json({
                status: "nok",
                message: "Anda tidak memiliki izin untuk melakukan aksi ini"
            });
        }
        
        const result = await backend.updateSpending(spendingId, req.body, user);
        res.json(result);
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    const spendingId = req.params.id;

    try {
        const user = await auth.authCheck(token);
        
        // Check if user has permission (Admin only)
        if (user.role !== 1) {
            return res.status(403).json({
                status: "nok",
                message: "Anda tidak memiliki izin untuk melakukan aksi ini"
            });
        }
        
        const result = await backend.deleteSpending(spendingId);
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