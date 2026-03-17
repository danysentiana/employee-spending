import db from "../helper/knex.js";

const setDepartmentTable = async (start, length, draw, order, filter, decoded) => {
    try {
        const orderData = Array.isArray(order) && order.length
            ? order
            : [{ column: 0, dir: "asc" }];
        const orderDir = orderData[0].dir ?? "asc";
        const orderColumn = parseInt(orderData[0].column ?? 0, 10);

        let query = db("Departments")
            .select("*")
            .orderBy("department_id", "desc");

        switch (orderColumn) {
            case 1:
                query = query.orderBy("department_id", orderDir);
                break;
            case 2:
                query = query.orderBy("department_name", orderDir);
                break;
            default:
                query = query.orderBy("department_id", orderDir);
                break;
        }

        const fullResult = await query.clone();
        const pagination = await query.clone().limit(length).offset(start);
        const result = pagination.map((row, index) => {
            return {
                no: index + 1 + start,
                department_id: row.department_id,
                department_name: row.department_name,
            };
        });
        return {
            status: "ok",
            draw,
            data: result,
            recordsTotal: fullResult.length,
            recordsFiltered: fullResult.length,
            message: "Get Data Success",
        };
    } catch (error) {
        console.error(error);
        return {
            status: "nok",
            message: "Get Data Failed",
        };
    }
};

const createDepartment = async (data, user) => {
    try {
        if (!data.department_name) {
            return { status: "nok", message: "Nama Departemen wajib diisi." };
        }

        const [newDepartmentId] = await db("Departments").insert({
            department_name: data.department_name
        }).returning("department_id");

        return {
            status: "ok",
            departmentId: typeof newDepartmentId === 'object' ? newDepartmentId.department_id : newDepartmentId,
            message: "Departemen berhasil ditambahkan.",
        };
    } catch (error) {
        console.error("Error creating department:", error);
        return {
            status: "nok",
            message: "Gagal menambahkan departemen: " + error.message,
        };
    }
};

const getDepartmentById = async (id) => {
    try {
        const departmentData = await db("Departments").where("department_id", id).first();
        if (!departmentData) {
            return { status: "nok", message: "Data Departemen tidak ditemukan." };
        }
        return { status: "ok", data: departmentData };
    } catch (error) {
        console.error("Error getting department by ID:", error);
        return {
            status: "nok",
            message: "Gagal mengambil data departemen: " + error.message,
        };
    }
};

const updateDepartment = async (id, data, user) => {
    try {
        if (!data.department_name) {
            return { status: "nok", message: "Nama Departemen wajib diisi." };
        }

        const existingDepartment = await db("Departments").where("department_id", id).first();
        if (!existingDepartment) {
            return { status: "nok", message: "Data Departemen tidak ditemukan." };
        }

        await db("Departments").where("department_id", id).update({
            department_name: data.department_name
        });

        return {
            status: "ok",
            message: "Departemen berhasil diperbarui.",
        };
    } catch (error) {
        console.error("Error updating department:", error);
        return { status: "nok", message: "Gagal memperbarui departemen: " + error.message };
    }
};

const deleteDepartment = async (id) => {
    try {
        const existingDepartment = await db("Departments").where("department_id", id).first();
        if (!existingDepartment) {
            return { status: "nok", message: "Data Departemen tidak ditemukan." };
        }

        await db("Departments").where("department_id", id).del();

        return {
            status: "ok",
            message: "Departemen berhasil dihapus.",
        };
    } catch (error) {
        console.error("Error deleting department:", error);
        return { status: "nok", message: "Gagal menghapus departemen: " + error.message };
    }
};

const getAllDepartments = async () => {
    try {
        const departments = await db("Departments")
            .select("department_id", "department_name")
            .orderBy("department_name", "asc");
        
        return {
            status: "ok",
            data: departments,
            message: "Get Departments Success",
        };
    } catch (error) {
        console.error("Error getting all departments:", error);
        return {
            status: "nok",
            message: "Get Departments Failed",
        };
    }
};

export default {
    setDepartmentTable,
    createDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getAllDepartments
};