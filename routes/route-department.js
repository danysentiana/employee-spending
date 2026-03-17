import express from "express";
const router = express.Router();
import backend from "../backend/backend-department.js";
import auth from "../helper/auth.js";

router.get('/', (req, res) => {
    res.render('department/page-department.ejs', {title: 'Data Departemen'});
});

router.get('/add', (req, res) => {
    res.render('department/page-department-add.ejs', {title: 'Tambah Departemen'});
});

router.get('/table', async (req, res) => {
    console.log("Query Params:", req.query);
    
    const draw = req.query.draw;
    const start = parseInt(req.query.start);
    const length = parseInt(req.query.length);
    const order = req.query.order;

    const filter = {};

    const token = req.headers["authorization"]?.replace("Bearer ", "");

    try {
        const response = await auth.authCheck(token);
        const data = await backend.setDepartmentTable(start, length, draw, order, filter, response);
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
        
        const result = await backend.createDepartment(req.body, user);
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
        const departmentId = req.params.id;
        const result = await backend.getDepartmentById(departmentId);

        if (result.status !== 'ok') {
            return res.status(404).send(result.message);
        }
        res.render('department/page-department-add.ejs', {title: 'Edit Departemen', departmentData: result.data});
    } catch (error) {
        res.status(500).send("Terjadi kesalahan server");
    }
});

router.post('/update/:id', async (req, res) => {
    const token = req.headers["authorization"]?.replace("Bearer ", "");
    const departmentId = req.params.id;

    try {
        const user = await auth.authCheck(token);
        
        // Check if user has permission (Admin only)
        if (user.role !== 1) {
            return res.status(403).json({
                status: "nok",
                message: "Anda tidak memiliki izin untuk melakukan aksi ini"
            });
        }
        
        const result = await backend.updateDepartment(departmentId, req.body, user);
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
    const departmentId = req.params.id;

    try {
        const user = await auth.authCheck(token);
        
        // Check if user has permission (Admin only)
        if (user.role !== 1) {
            return res.status(403).json({
                status: "nok",
                message: "Anda tidak memiliki izin untuk melakukan aksi ini"
            });
        }
        
        const result = await backend.deleteDepartment(departmentId);
        res.json(result);
    } catch (error) {
        const statusCode = error?.message?.toLowerCase().includes("token") ? 401 : 500;
        res.status(statusCode).json({
            status: "nok",
            message: error?.message || "Terjadi kesalahan server"
        });
    }
});

router.get('/all', async (req, res) => {
    try {
        const result = await backend.getAllDepartments();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "nok",
            message: "Terjadi kesalahan server"
        });
    }
});

export default router;