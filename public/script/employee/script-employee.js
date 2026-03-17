$(document).ready(function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Load departments and employees
    loadDepartments();
    loadEmployees();

    // Filter button click
    $('#btn-filter').on('click', function() {
        const departmentId = $('#filter-department').val();
        const employeeName = $('#filter-name').val();
        loadEmployees(departmentId, employeeName);
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
    }

    function loadEmployees(departmentId = '', name = '') {
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
                search_department: departmentId,
                search_name: name
            },
            success: function(response) {
                if (response.status === 'ok') {
                    renderEmployeeTable(response.data);
                } else {
                    showError(response.message || 'Gagal memuat data karyawan');
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

    function renderEmployeeTable(employees) {
        const tbody = $('#employee-table tbody');
        tbody.empty();

        if (employees.length === 0) {
            tbody.html('<tr><td colspan="6" class="text-center">Tidak ada data karyawan</td></tr>');
            return;
        }

        employees.forEach((emp, index) => {
            const row = `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${emp.employee_id}</td>
                    <td>${emp.employee_name}</td>
                    <td>${emp.department_name || '-'}</td>
                    <td class="text-center">${formatDate(emp.created_at)}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-info btn-edit" data-id="${emp.employee_id}">
                            <i class="mdi mdi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger btn-delete" data-id="${emp.employee_id}">
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
            window.location.href = `/employee/add?id=${id}`;
        });

        // Delete button click
        $('.btn-delete').on('click', function() {
            const id = $(this).data('id');
            if (confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
                deleteEmployee(id);
            }
        });
    }

    function deleteEmployee(id) {
        $.ajax({
            url: '/employee/delete/' + id,
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Karyawan berhasil dihapus');
                    loadEmployees();
                } else {
                    showError(response.message || 'Gagal menghapus karyawan');
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

    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }
});