$(document).ready(function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Load data
    loadDepartments();
    loadSummary();

    // Filter button click
    $('#btn-filter').on('click', function() {
        const departmentId = $('#filter-department').val();
        const employeeId = $('#filter-employee').val();
        const startDate = $('#filter-start-date').val();
        const endDate = $('#filter-end-date').val();
        
        // Update employee filter based on department
        if (departmentId) {
            loadEmployeesByDepartment(departmentId);
        }
        
        loadReportData(departmentId, employeeId, startDate, endDate);
    });

    // Department change event
    $('#filter-department').on('change', function() {
        const deptId = $(this).val();
        loadEmployeesByDepartment(deptId);
    });

    // Export Excel button click
    $('#btn-export-excel').on('click', function() {
        exportToExcel();
    });

    // Export PDF button click
    $('#btn-export-pdf').on('click', function() {
        exportToPDF();
    });

    function loadDepartments() {
        $.ajax({
            url: '/department/all',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    populateDepartmentFilter(response.data);
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        });
    }

    function populateDepartmentFilter(departments) {
        const select = $('#filter-department');
        select.append('<option value="">Semua Departemen</option>');
        departments.forEach(dept => {
            const option = `<option value="${dept.department_id}">${dept.department_name}</option>`;
            select.append(option);
        });
    }

    function loadEmployees() {
        $.ajax({
            url: '/employee/table',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                start: 0,
                length: 1000,
                draw: 1,
                order: [{column: 0, dir: 'asc'}]
            },
            success: function(response) {
                if (response.status === 'ok') {
                    populateEmployeeFilter(response.data);
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        });
    }

    function loadEmployeesByDepartment(departmentId) {
        if (!departmentId) {
            $('#filter-employee').empty();
            $('#filter-employee').append('<option value="">Semua Karyawan</option>');
            return;
        }

        $.ajax({
            url: '/employee/table',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                start: 0,
                length: 1000,
                draw: 1,
                order: [{column: 0, dir: 'asc'}],
                search_department: departmentId
            },
            success: function(response) {
                if (response.status === 'ok') {
                    populateEmployeeFilter(response.data);
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        });
    }

    function populateEmployeeFilter(employees) {
        const select = $('#filter-employee');
        select.empty();
        select.append('<option value="">Semua Karyawan</option>');
        employees.forEach(emp => {
            const option = `<option value="${emp.employee_id}">${emp.employee_name}</option>`;
            select.append(option);
        });
    }

    function loadSummary() {
        $.ajax({
            url: '/report/summary',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {},
            success: function(response) {
                if (response.status === 'ok') {
                    updateSummaryCards(response.data);
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        });
    }

    function updateSummaryCards(data) {
        $('#total-spending').text(formatCurrency(data.total_spending || 0));
        $('#total-departments').text(data.total_departments || 0);
        $('#total-employees').text(data.total_employees || 0);
        $('#total-transactions').text(data.total_transactions || 0);
    }

    function loadReportData(departmentId = '', employeeId = '', startDate = '', endDate = '') {
        const data = {};
        if (departmentId) data.department_id = departmentId;
        if (employeeId) data.employee_id = employeeId;
        if (startDate) data.date_from = startDate;
        if (endDate) data.date_to = endDate;

        $.ajax({
            url: '/report/data',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: data,
            success: function(response) {
                if (response.status === 'ok') {
                    renderReportTable(response.data);
                    updateSummaryCards(response.summary);
                } else {
                    showError(response.message || 'Gagal memuat data laporan');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat memuat data');
                }
            }
        });
    }

    function renderReportTable(spendings) {
        const tbody = $('#report-table tbody');
        tbody.empty();

        if (spendings.length === 0) {
            tbody.html('<tr><td colspan="6" class="text-center">Tidak ada data laporan</td></tr>');
            return;
        }

        spendings.forEach((spending, index) => {
            const row = `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${formatDate(spending.spending_date)}</td>
                    <td>${spending.employee_name}</td>
                    <td>${spending.department_name || '-'}</td>
                    <td class="text-end">${formatCurrency(spending.value)}</td>
                    <td>${spending.description || '-'}</td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    function exportToExcel() {
        const departmentId = $('#filter-department').val();
        const employeeId = $('#filter-employee').val();
        const startDate = $('#filter-start-date').val();
        const endDate = $('#filter-end-date').val();

        const data = {};
        if (departmentId) data.department_id = departmentId;
        if (employeeId) data.employee_id = employeeId;
        if (startDate) data.date_from = startDate;
        if (endDate) data.date_to = endDate;

        $.ajax({
            url: '/report/export/excel',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: data,
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response, status, xhr) {
                const filename = xhr.getResponseHeader('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'report.xlsx';
                const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                link.click();
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat export Excel');
                }
            }
        });
    }

    function exportToPDF() {
        const departmentId = $('#filter-department').val();
        const employeeId = $('#filter-employee').val();
        const startDate = $('#filter-start-date').val();
        const endDate = $('#filter-end-date').val();

        const data = {};
        if (departmentId) data.department_id = departmentId;
        if (employeeId) data.employee_id = employeeId;
        if (startDate) data.date_from = startDate;
        if (endDate) data.date_to = endDate;

        $.ajax({
            url: '/report/export/pdf',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: data,
            xhrFields: {
                responseType: 'blob'
            },
            success: function(response, status, xhr) {
                const filename = xhr.getResponseHeader('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'report.pdf';
                const blob = new Blob([response], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename;
                link.click();
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat export PDF');
                }
            }
        });
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    function formatCurrency(value) {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    }

    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }
});