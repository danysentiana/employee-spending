import db from "../helper/knex.js";

const setEmployeeTable = async (start, length, draw, order, filter, decoded) => {
    try {
        const orderData = Array.isArray(order) && order.length
            ? order
            : [{ column: 0, dir: "asc" }];
        const orderDir = orderData[0].dir ?? "asc";
        const orderColumn = parseInt(orderData[0].column ?? 0, 10);

        let query = db("Employees as e")
            .leftJoin("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw("e.*, d.department_name"))
            .orderBy("e.employee_id", "desc");

        // Apply filters
        if (filter.search_department) {
            query = query.where("e.department_id", filter.search_department);
        }
        if (filter.search_name) {
            query = query.where("e.employee_name", "like", `%${filter.search_name}%`);
        }

        switch (orderColumn) {
            case 1:
                query = query.orderBy("e.employee_id", orderDir);
                break;
            case 2:
                query = query.orderBy("e.employee_name", orderDir);
                break;
            case 3:
                query = query.orderBy("d.department_name", orderDir);
                break;
            case 4:
                query = query.orderBy("e.created_at", orderDir);
                break;
            default:
                query = query.orderBy("e.employee_id", orderDir);
                break;
        }

        const fullResult = await query.clone();
        const pagination = await query.clone().limit(length).offset(start);
        const result = pagination.map((row, index) => {
            return {
                no: index + 1 + start,
                employee_id: row.employee_id,
                employee_name: row.employee_name,
                department_name: row.department_name,
                created_at: row.created_at
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

const createEmployee = async (data, user) => {
    try {
        if (!data.employee_name || !data.department_id) {
            return { status: "nok", message: "Nama Karyawan dan Departemen wajib diisi." };
        }

        // Check if department exists
        const department = await db("Departments").where("department_id", data.department_id).first();
        if (!department) {
            return { status: "nok", message: "Departemen tidak ditemukan." };
        }

        const [newEmployeeId] = await db("Employees").insert({
            employee_name: data.employee_name,
            department_id: data.department_id,
            created_at: new Date()
        }).returning("employee_id");

        return {
            status: "ok",
            employeeId: typeof newEmployeeId === 'object' ? newEmployeeId.employee_id : newEmployeeId,
            message: "Karyawan berhasil ditambahkan.",
        };
    } catch (error) {
        console.error("Error creating employee:", error);
        return {
            status: "nok",
            message: "Gagal menambahkan karyawan: " + error.message,
        };
    }
};

const getEmployeeById = async (id) => {
    try {
        const employeeData = await db("Employees as e")
            .leftJoin("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw("e.*, d.department_name"))
            .where("e.employee_id", id)
            .first();
        
        if (!employeeData) {
            return { status: "nok", message: "Data Karyawan tidak ditemukan." };
        }
        return { status: "ok", data: employeeData };
    } catch (error) {
        console.error("Error getting employee by ID:", error);
        return {
            status: "nok",
            message: "Gagal mengambil data karyawan: " + error.message,
        };
    }
};

const updateEmployee = async (id, data, user) => {
    try {
        if (!data.employee_name || !data.department_id) {
            return { status: "nok", message: "Nama Karyawan dan Departemen wajib diisi." };
        }

        const existingEmployee = await db("Employees").where("employee_id", id).first();
        if (!existingEmployee) {
            return { status: "nok", message: "Data Karyawan tidak ditemukan." };
        }

        // Check if department exists
        const department = await db("Departments").where("department_id", data.department_id).first();
        if (!department) {
            return { status: "nok", message: "Departemen tidak ditemukan." };
        }

        await db("Employees").where("employee_id", id).update({
            employee_name: data.employee_name,
            department_id: data.department_id,
            updated_at: new Date()
        });

        return {
            status: "ok",
            message: "Karyawan berhasil diperbarui.",
        };
    } catch (error) {
        console.error("Error updating employee:", error);
        return { status: "nok", message: "Gagal memperbarui karyawan: " + error.message };
    }
};

const deleteEmployee = async (id) => {
    try {
        const existingEmployee = await db("Employees").where("employee_id", id).first();
        if (!existingEmployee) {
            return { status: "nok", message: "Data Karyawan tidak ditemukan." };
        }

        await db("Employees").where("employee_id", id).del();

        return {
            status: "ok",
            message: "Karyawan berhasil dihapus.",
        };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return { status: "nok", message: "Gagal menghapus karyawan: " + error.message };
    }
};

const getAllEmployees = async () => {
    try {
        const employees = await db("Employees as e")
            .leftJoin("Departments as d", "e.department_id", "d.department_id")
            .select("e.employee_id", "e.employee_name", "d.department_name")
            .orderBy("e.employee_name", "asc");
        
        return {
            status: "ok",
            data: employees,
            message: "Get Employees Success",
        };
    } catch (error) {
        console.error("Error getting all employees:", error);
        return {
            status: "nok",
            message: "Get Employees Failed",
        };
    }
};

export default {
    setEmployeeTable,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getAllEmployees
};