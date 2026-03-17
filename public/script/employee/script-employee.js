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

    // Load departments for modal when add modal is shown
    $('#addEmployeeModal').on('show.bs.modal', function() {
        loadModalDepartments('department-select');
    });

    // Load departments for modal when edit modal is shown
    $('#editEmployeeModal').on('show.bs.modal', function() {
        loadModalDepartments('edit-department-select');
    });

    // Filter button click
    $('#btn-filter').on('click', function() {
        const departmentId = $('#filter-department').val();
        const employeeName = $('#filter-name').val();
        loadEmployees(departmentId, employeeName);
    });

    // Add employee form submission
    $('#add-employee-form').on('submit', function(e) {
        e.preventDefault();
        const employeeName = $('#employee-name').val().trim();
        const departmentId = $('#department-select').val();

        if (!employeeName) {
            showError('Nama karyawan harus diisi');
            return;
        }
        if (!departmentId) {
            showError('Departemen harus dipilih');
            return;
        }

        $.ajax({
            url: '/employee/add',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                employee_name: employeeName,
                department_id: departmentId
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Karyawan berhasil ditambahkan');
                    $('#addEmployeeModal').modal('hide');
                    $('#employee-name').val('');
                    $('#department-select').val('');
                    loadEmployees();
                } else {
                    showError(response.message || 'Gagal menambahkan karyawan');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else if (xhr.status === 403) {
                    showError('Anda tidak memiliki izin untuk melakukan aksi ini');
                } else {
                    showError('Terjadi kesalahan saat menambahkan data');
                }
            }
        });
    });

    // Edit employee form submission
    $('#edit-employee-form').on('submit', function(e) {
        e.preventDefault();
        const id = $(this).data('id');
        const employeeName = $('#edit-employee-name').val().trim();
        const departmentId = $('#edit-department-select').val();

        if (!employeeName) {
            showError('Nama karyawan harus diisi');
            return;
        }
        if (!departmentId) {
            showError('Departemen harus dipilih');
            return;
        }

        $.ajax({
            url: '/employee/update/' + id,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                employee_name: employeeName,
                department_id: departmentId,
                employee_id: id
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Karyawan berhasil diperbarui');
                    $('#editEmployeeModal').modal('hide');
                    loadEmployees();
                } else {
                    showError(response.message || 'Gagal memperbarui karyawan');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else if (xhr.status === 403) {
                    showError('Anda tidak memiliki izin untuk melakukan aksi ini');
                } else {
                    showError('Terjadi kesalahan saat memperbarui data');
                }
            }
        });
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

    function loadModalDepartments(selectId) {
        const select = $('#' + selectId);
        select.empty();
        select.append('<option value="">Pilih Departemen</option>');
        
        $.ajax({
            url: '/department/all',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    response.data.forEach(dept => {
                        select.append(`<option value="${dept.department_id}">${dept.department_name}</option>`);
                    });
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

    function showDetail(id) {
        $.ajax({
            url: `/employee/detail/${id}`,
            type: "GET",
            headers: {
                'Authorization': 'Bearer ' + token
            },
            error: function (error) {
                if (error.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = '/login';
                }
            },
            success: function (res) {
                if (res.status === 'ok') {
                    $('#edit-employee-name').val(res.data.employee_name);
                    $('#edit-department-select').val(res.data.department_id);
                    $('#edit-employee-form').data('id', res.data.employee_id);
                } else {
                    showError('Gagal memuat data karyawan');
                }
            },
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
            showDetail(id);
            $('#editEmployeeModal').modal('show');
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

    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }
});