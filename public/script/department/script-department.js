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
                console.log(response);
                
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
                    <td class="text-center">${formatDate(dept.created_at)}</td>
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
            window.location.href = `/department/add?id=${id}`;
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