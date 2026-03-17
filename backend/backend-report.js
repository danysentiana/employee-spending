import db from "../helper/knex.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const exportToExcel = async (filter) => {
    try {
        // Get current year
        const currentYear = new Date().getFullYear();
        
        const spendingsResult = await db("Spendings as s")
            .join("Employees as e", "s.employee_id", "e.employee_id")
            .join("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw(`
                s.spending_id,
                s.spending_date,
                s.value,
                e.employee_name,
                d.department_name
            `))
            .whereBetween("s.spending_date", ['2020-01-01', `${currentYear}-12-31`]);

        let query = spendingsResult;

        // Apply filters
        if (filter.department_id) {
            query = query.filter(row => row.department_id == filter.department_id);
        }
        if (filter.employee_id) {
            query = query.filter(row => row.employee_id == filter.employee_id);
        }
        if (filter.date_from && filter.date_to) {
            query = query.filter(row => {
                const date = new Date(row.spending_date);
                return date >= new Date(filter.date_from) && date <= new Date(filter.date_to);
            });
        }
        if (filter.value_min && filter.value_max) {
            query = query.filter(row => row.value >= filter.value_min && row.value <= filter.value_max);
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Laporan Pengeluaran');

        // Set columns
        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Tanggal', key: 'spending_date', width: 15 },
            { header: 'Nama Karyawan', key: 'employee_name', width: 25 },
            { header: 'Departemen', key: 'department_name', width: 20 },
            { header: 'Nilai (IDR)', key: 'value', width: 20 }
        ];

        // Add header style
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data
        query.forEach((row, index) => {
            worksheet.addRow({
                no: index + 1,
                spending_date: new Date(row.spending_date).toLocaleDateString('id-ID'),
                employee_name: row.employee_name,
                department_name: row.department_name,
                value: row.value
            });
        });

        // Format value column as currency
        worksheet.getColumn('value').numFmt = '#,##0.00';

        const buffer = await workbook.xlsx.writeBuffer();

        return {
            status: "ok",
            data: buffer,
            filename: `laporan_pengeluaran_${new Date().toISOString().split('T')[0]}.xlsx`
        };
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        return {
            status: "nok",
            message: "Gagal export ke Excel: " + error.message
        };
    }
};

const exportToPDF = async (filter) => {
    try {
        // Get current year
        const currentYear = new Date().getFullYear();
        
        const spendingsResult = await db("Spendings as s")
            .join("Employees as e", "s.employee_id", "e.employee_id")
            .join("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw(`
                s.spending_id,
                s.spending_date,
                s.value,
                e.employee_name,
                d.department_name
            `))
            .whereBetween("s.spending_date", ['2020-01-01', `${currentYear}-12-31`]);

        let query = spendingsResult;

        // Apply filters
        if (filter.department_id) {
            query = query.filter(row => row.department_id == filter.department_id);
        }
        if (filter.employee_id) {
            query = query.filter(row => row.employee_id == filter.employee_id);
        }
        if (filter.date_from && filter.date_to) {
            query = query.filter(row => {
                const date = new Date(row.spending_date);
                return date >= new Date(filter.date_from) && date <= new Date(filter.date_to);
            });
        }
        if (filter.value_min && filter.value_max) {
            query = query.filter(row => row.value >= filter.value_min && row.value <= filter.value_max);
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        
        // Helper to convert to Promise
        const pdfPromise = new Promise((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
        });

        // Header
        doc.fontSize(20).text('Laporan Pengeluaran', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown();

        // Calculate total
        const total = query.reduce((sum, row) => sum + parseFloat(row.value), 0);

        // Table setup
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [30, 80, 100, 80, 80];
        const rowHeight = 25;

        // Table header
        const headers = ['No', 'Tanggal', 'Nama Karyawan', 'Departemen', 'Nilai'];
        let xPos = tableLeft;

        // Draw header background
        doc.fillColor('#E0E0E0').rect(tableLeft, tableTop, 370, rowHeight).fill();
        
        // Draw header text
        doc.fillColor('black').fontSize(9);
        headers.forEach((header, i) => {
            doc.text(header, xPos, tableTop + 8, { width: colWidths[i] });
            xPos += colWidths[i];
        });

        // Draw table rows
        doc.y = tableTop + rowHeight;
        let yPos = doc.y;
        xPos = tableLeft;

        query.forEach((row, index) => {
            // Reset y position if page is full
            if (yPos > doc.page.height - 80) {
                doc.addPage();
                yPos = 50;
            }

            // Draw row border
            doc.strokeColor('#CCCCCC').lineWidth(0.5)
                .rect(tableLeft, yPos, 370, rowHeight).stroke();

            // Draw cell content
            xPos = tableLeft;
            const cells = [
                (index + 1).toString(),
                new Date(row.spending_date).toLocaleDateString('id-ID'),
                row.employee_name || '-',
                row.department_name || '-',
                `Rp ${row.value.toLocaleString('id-ID')}`
            ];

            cells.forEach((cell, i) => {
                doc.text(cell, xPos + 5, yPos + 8, { width: colWidths[i] - 10, ellipsis: true });
                xPos += colWidths[i];
            });

            yPos += rowHeight;
        });

        // Draw total
        doc.moveDown();
        doc.fontSize(12).text(`Total: Rp ${total.toLocaleString('id-ID')}`, { align: 'right' });

        doc.end();

        const buffer = await pdfPromise;

        return {
            status: "ok",
            data: buffer,
            filename: `laporan_pengeluaran_${new Date().toISOString().split('T')[0]}.pdf`
        };
    } catch (error) {
        console.error("Error exporting to PDF:", error);
        return {
            status: "nok",
            message: "Gagal export ke PDF: " + error.message
        };
    }
};

const getReportSummary = async (filter) => {
    try {
        // Get current year
        const currentYear = new Date().getFullYear();
        
        let query = db("Spendings as s")
            .join("Employees as e", "s.employee_id", "e.employee_id")
            .join("Departments as d", "e.department_id", "d.department_id")
            .select(db.raw(`
                COUNT(s.spending_id) as total_transactions,
                SUM(s.value) as total_value,
                AVG(s.value) as average_value
            `))
            .whereBetween("s.spending_date", ['2020-01-01', `${currentYear}-12-31`]);

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

        const result = await query.first();
        
        return {
            status: "ok",
            data: result,
            message: "Get Report Summary Success",
        };
    } catch (error) {
        console.error("Error getting report summary:", error);
        return {
            status: "nok",
            message: "Get Report Summary Failed",
        };
    }
};

const getReportData = async (filter) => {
    try {
        // Get current year
        const currentYear = new Date().getFullYear();
        
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
            .whereBetween("s.spending_date", ['2020-01-01', `${currentYear}-12-31`])
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
        
        // Calculate summary
        const totalValue = result.reduce((sum, row) => sum + parseFloat(row.value), 0);
        const totalTransactions = result.length;
        
        // Get unique departments and employees count
        const uniqueDepartments = new Set(result.map(r => r.department_name)).size;
        const uniqueEmployees = new Set(result.map(r => r.employee_name)).size;
        
        return {
            status: "ok",
            data: result,
            summary: {
                total_spending: totalValue,
                total_departments: uniqueDepartments,
                total_employees: uniqueEmployees,
                total_transactions: totalTransactions
            },
            message: "Get Report Data Success",
        };
    } catch (error) {
        console.error("Error getting report data:", error);
        return {
            status: "nok",
            message: "Get Report Data Failed",
        };
    }
};

export default {
    exportToExcel,
    exportToPDF,
    getReportSummary,
    getReportData
};
