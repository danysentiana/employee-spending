import db from "../helper/knex.js";

const setSpendingTable = async (start, length, draw, order, filter, decoded) => {
    try {
        const orderData = Array.isArray(order) && order.length
            ? order
            : [{ column: 0, dir: "asc" }];
        const orderDir = orderData[0].dir ?? "asc";
        const orderColumn = parseInt(orderData[0].column ?? 0, 10);

        let query = db("Spendings as s")
            .leftJoin("Employees as e", "s.employee_id", "e.employee_id")
            .leftJoin("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw("s.*, e.employee_id, e.employee_name, e.department_id, d.department_name"))
            .orderBy("s.value", "desc");

        // Apply filters
        if (filter.search_department) {
            query = query.where("e.department_id", filter.search_department);
        }
        if (filter.search_employee) {
            query = query.where("s.employee_id", filter.search_employee);
        }
        if (filter.search_date_from && filter.search_date_to) {
            query = query.whereBetween("s.spending_date", [filter.search_date_from, filter.search_date_to]);
        }
        if (filter.search_value_min && filter.search_value_max) {
            query = query.whereBetween("s.value", [filter.search_value_min, filter.search_value_max]);
        }

        switch (orderColumn) {
            case 1:
                query = query.orderBy("s.spending_id", orderDir);
                break;
            case 2:
                query = query.orderBy("s.spending_date", orderDir);
                break;
            case 3:
                query = query.orderBy("e.employee_name", orderDir);
                break;
            case 4:
                query = query.orderBy("d.department_name", orderDir);
                break;
            case 5:
                query = query.orderBy("s.value", orderDir);
                break;
            default:
                query = query.orderBy("s.spending_id", orderDir);
                break;
        }

        const fullResult = await query.clone();
        const pagination = await query.clone().limit(length).offset(start);
        const result = pagination.map((row, index) => {
            return {
                no: index + 1 + start,
                spending_id: row.spending_id,
                employee_id: row.employee_id,
                employee_name: row.employee_name,
                department_id: row.department_id,
                department_name: row.department_name,
                spending_date: row.spending_date,
                value: row.value,
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

const createSpending = async (data, user) => {
    try {
        if (!data.employee_id || !data.spending_date || !data.value) {
            return { status: "nok", message: "Karyawan, Tanggal, dan Nilai wajib diisi." };
        }

        // Check if employee exists
        const employee = await db("Employees").where("employee_id", data.employee_id).first();
        if (!employee) {
            return { status: "nok", message: "Karyawan tidak ditemukan." };
        }

        const [newSpendingId] = await db("Spendings").insert({
            employee_id: data.employee_id,
            spending_date: data.spending_date,
            value: data.value
        }).returning("spending_id");

        return {
            status: "ok",
            spendingId: typeof newSpendingId === 'object' ? newSpendingId.spending_id : newSpendingId,
            message: "Pengeluaran berhasil ditambahkan.",
        };
    } catch (error) {
        console.error("Error creating spending:", error);
        return {
            status: "nok",
            message: "Gagal menambahkan pengeluaran: " + error.message,
        };
    }
};

const getSpendingById = async (id) => {
    try {
        const spendingData = await db("Spendings as s")
            .leftJoin("Employees as e", "s.employee_id", "e.employee_id")
            .leftJoin("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw("s.*, e.employee_name, d.department_name, d.department_id"))
            .where("s.spending_id", id)
            .first();
        
        if (!spendingData) {
            return { status: "nok", message: "Data Pengeluaran tidak ditemukan." };
        }
        return { status: "ok", data: spendingData };
    } catch (error) {
        console.error("Error getting spending by ID:", error);
        return {
            status: "nok",
            message: "Gagal mengambil data pengeluaran: " + error.message,
        };
    }
};

const updateSpending = async (id, data, user) => {
    try {
        if (!data.employee_id || !data.spending_date || !data.value) {
            return { status: "nok", message: "Karyawan, Tanggal, dan Nilai wajib diisi." };
        }

        const existingSpending = await db("Spendings").where("spending_id", id).first();
        if (!existingSpending) {
            return { status: "nok", message: "Data Pengeluaran tidak ditemukan." };
        }

        // Check if employee exists
        const employee = await db("Employees").where("employee_id", data.employee_id).first();
        if (!employee) {
            return { status: "nok", message: "Karyawan tidak ditemukan." };
        }

        await db("Spendings").where("spending_id", id).update({
            employee_id: data.employee_id,
            spending_date: data.spending_date,
            value: data.value
        });

        return {
            status: "ok",
            message: "Pengeluaran berhasil diperbarui.",
        };
    } catch (error) {
        console.error("Error updating spending:", error);
        return { status: "nok", message: "Gagal memperbarui pengeluaran: " + error.message };
    }
};

const deleteSpending = async (id) => {
    try {
        const existingSpending = await db("Spendings").where("spending_id", id).first();
        if (!existingSpending) {
            return { status: "nok", message: "Data Pengeluaran tidak ditemukan." };
        }

        await db("Spendings").where("spending_id", id).del();

        return {
            status: "ok",
            message: "Pengeluaran berhasil dihapus.",
        };
    } catch (error) {
        console.error("Error deleting spending:", error);
        return { status: "nok", message: "Gagal menghapus pengeluaran: " + error.message };
    }
};

const getSpendingReportData = async (filter) => {
    try {
        let query = db("Spendings as s")
            .join("Employees as e", "s.employee_id", "e.employee_id")
            .join("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw(`
                s.spending_id,
                s.spending_date,
                s.value,
                e.employee_name,
                d.department_name
            `))
            .whereBetween("s.spending_date", ['2020-01-01', '2025-12-31'])
            .orderBy("s.spending_date", "desc");

        // Apply filters
        if (filter.department_id) {
            query = query.where("e.department_id", filter.department_id);
        }
        if (filter.employee_id) {
            query = query.where("s.employee_id", filter.employee_id);
        }
        if (filter.date_from && filter.date_to) {
            query = query.whereBetween("s.spending_date", [filter.date_from, filter.date_to]);
        }
        if (filter.value_min && filter.value_max) {
            query = query.whereBetween("s.value", [filter.value_min, filter.value_max]);
        }

        const result = await query;
        
        return {
            status: "ok",
            data: result,
            message: "Get Report Data Success",
        };
    } catch (error) {
        console.error("Error getting spending report data:", error);
        return {
            status: "nok",
            message: "Get Report Data Failed",
        };
    }
};

export default {
    setSpendingTable,
    createSpending,
    getSpendingById,
    updateSpending,
    deleteSpending,
    getSpendingReportData
};