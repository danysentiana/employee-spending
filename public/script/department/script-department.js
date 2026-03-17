$(document).ready(function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Load departments
    loadDepartments();

    // Search functionality
    $('#search-department').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $('#department-table tbody tr').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    function loadDepartments() {
        $.ajax({
            url: '/department/table',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    renderDepartmentTable(response.data);
                } else {
                    showError(response.message || 'Gagal memuat data departemen');
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

    function renderDepartmentTable(departments) {
        const tbody = $('#department-table tbody');
        tbody.empty();

        if (departments.length === 0) {
            tbody.html('<tr><td colspan="5" class="text-center">Tidak ada data departemen</td></tr>');
            return;
        }

        departments.forEach((dept, index) => {
            const row = `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${dept.department_id}</td>
                    <td>${dept.department_name}</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-info btn-edit" data-id="${dept.department_id}">
                            <i class="mdi mdi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger btn-delete" data-id="${dept.department_id}">
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
            $('#editDepartmentModal').modal('show');
        });

        // Delete button click
        $('.btn-delete').on('click', function() {
            const id = $(this).data('id');
            if (confirm('Apakah Anda yakin ingin menghapus departemen ini?')) {
                deleteDepartment(id);
            }
        });
    }

    function deleteDepartment(id) {
        $.ajax({
            url: '/department/delete/' + id,
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Departemen berhasil dihapus');
                    loadDepartments();
                } else {
                    showError(response.message || 'Gagal menghapus departemen');
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

    function showDetail(id) {
        $.ajax({
            url: `/department/detail/${id}`,
            type: "GET",
            beforeSend: function (xhr) {
                if (localStorage.token) {
                    xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
                }
            },
            error: function (error) {
                if (error.status === 401) {
                    localStorage.removeItem("token");
                    $(location).attr("href", "/");
                }
            },
            success: function (res) {
                $("#edit-department-name").val(res.data.department_name);
                $("#edit-department-form").data('id', res.data.department_id);
            },
        });
    }

    // Add department form submission
    $('#add-department-form').on('submit', function(e) {
        e.preventDefault();
        const departmentName = $('#department-name').val();

        if (!departmentName) {
            showError('Nama departemen harus diisi');
            return;
        }

        $.ajax({
            url: '/department/add',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                department_name: departmentName
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Departemen berhasil ditambahkan');
                    $('#addDepartmentModal').modal('hide');
                    $('#department-name').val('');
                    loadDepartments();
                } else {
                    showError(response.message || 'Gagal menambahkan departemen');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat menambahkan data');
                }
            }
        });
    });

    // Edit department form submission
    $('#edit-department-form').on('submit', function(e) {
        e.preventDefault();
        const id = $(this).data('id');
        const departmentName = $('#edit-department-name').val();

        if (!departmentName) {
            showError('Nama departemen harus diisi');
            return;
        }

        $.ajax({
            url: '/department/update/' + id,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                department_name: departmentName
            },
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess('Departemen berhasil diperbarui');
                    $('#editDepartmentModal').modal('hide');
                    loadDepartments();
                } else {
                    showError(response.message || 'Gagal memperbarui departemen');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat memperbarui data');
                }
            }
        });
    });

    function showSuccess(message) {
        alert(message);
    }

    function showError(message) {
        alert(message);
    }
});