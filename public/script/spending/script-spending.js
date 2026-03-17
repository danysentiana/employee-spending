$(document).ready(function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Load departments, employees and spendings
    loadDepartments();
    loadEmployees();
    loadSpendings();

    // Filter button click
    $('#btn-filter').on('click', function() {
        const departmentId = $('#filter-department').val();
        const employeeId = $('#filter-employee').val();
        const date = $('#filter-date').val();
        const valueMin = $('#filter-value-min').val();
        const valueMax = $('#filter-value-max').val();
        loadSpendings(departmentId, employeeId, date, valueMin, valueMax);
    });

    // Value range slider display updates
    $('#filter-value-min').on('input', function() {
        const value = $(this).val();
        $('#value-min-display').text(formatCurrency(value));
    });

    $('#filter-value-max').on('input', function() {
        const value = $(this).val();
        $('#value-max-display').text(formatCurrency(value));
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
        departments.forEach(dept => {
            const option = `<option value="${dept.department_id}">${dept.department_name}</option>`;
            select.append(option);
        });

        // Department change event - load employees for selected department
        select.on('change', function() {
            const deptId = $(this).val();
            loadEmployeesByDepartment(deptId);
        });
    }

    function loadEmployees() {
        $.ajax({
            url: '/employee/all',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
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
        $.ajax({
            url: '/employee/table',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                start: 0,
                length: 1000,
                draw:1,
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

    function loadSpendings(departmentId = '', employeeId = '', date = '', valueMin = '', valueMax = '') {
        $.ajax({
            url: '/spending/table',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                start: 0,
                length: 1000,
                draw:1,
                order: [{column: 0, dir: 'asc'}],
                search_department: departmentId,
                search_employee: employeeId,
                search_date_from: date,
                search_date_to: date,
                search_value_min: valueMin,
                search_value_max: valueMax
            },
            success: function(response) {
                if (response.status === 'ok') {
                    renderSpendingTable(response.data);
                } else {
                    showError(response.message || 'Gagal memuat data pengeluaran');
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

    function renderSpendingTable(spendings) {
        const tbody = $('#spending-table tbody');
        tbody.empty();

        if (spendings.length === 0) {
            tbody.html('<tr><td colspan="8" class="text-center">Tidak ada data pengeluaran</td></tr>');
            return;
        }

        spendings.forEach((spending, index) => {
            const row = `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${spending.spending_id}</td>
                    <td>${spending.employee_name}</td>
                    <td>${spending.department_name || '-'}</td>
                    <td class="text-center">${formatDate(spending.spending_date)}</td>
                    <td class="text-end">${formatCurrency(spending.value)}</td>
                    <td>${spending.description || '-'}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-info btn-edit" data-id="${spending.spending_id}">
                            <i class="mdi mdi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger btn-delete" data-id="${spending.spending_id}">
                            <i class="mdi mdi-delete"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Edit button click
        $('.btn-edit').on('click', function() {
            const id = $(this).data('id');
            window.location.href = `/spending/add?id=${id}`;
        });

        // Delete button click
        $('.btn-delete').on('click', function() {
            const id = $(this).data('id');
            if (confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) {
                deleteSpending(id);
            }
        });
    }

    function deleteSpending(id) {
        $.ajax({
            url: '/spending/delete/' + id,
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Pengeluaran berhasil dihapus');
                    loadSpendings();
                } else {
                    showError(response.message || 'Gagal menghapus pengeluaran');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat menghapus data');
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