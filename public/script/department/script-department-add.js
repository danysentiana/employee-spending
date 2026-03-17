$(document).ready(function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    // If edit mode, load department data
    if (editId) {
        loadDepartmentData(editId);
    }

    // Save button click
    $('#btn-save-department').on('click', function() {
        saveDepartment();
    });

    function loadDepartmentData(id) {
        $.ajax({
            url: '/department/all',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    const dept = response.data.find(d => d.department_id == id);
                    if (dept) {
                        $('input[name="department_id"]').val(dept.department_id);
                        $('input[name="department_name"]').val(dept.department_name);
                    } else {
                        showError('Data departemen tidak ditemukan');
                    }
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

    function saveDepartment() {
        const departmentId = $('input[name="department_id"]').val();
        const departmentName = $('input[name="department_name"]').val().trim();

        // Validation
        if (!departmentName) {
            showError('Nama departemen harus diisi');
            return;
        }

        const data = {
            department_name: departmentName
        };

        // Use correct routes: POST /department/add for new, POST /department/update/:id for edit
        const url = departmentId ? '/department/update/' + departmentId : '/department/add';
        const method = 'POST';

        if (departmentId) {
            data.department_id = departmentId;
        }

        $.ajax({
            url: url,
            type: method,
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: data,
            success: function(response) {
                if (response.status === 'ok') {
                    showSuccess(departmentId ? 'Departemen berhasil diupdate' : 'Departemen berhasil ditambahkan');
                    setTimeout(() => {
                        window.location.href = '/department';
                    }, 1000);
                } else {
                    showError(response.message || 'Gagal menyimpan departemen');
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    showError('Terjadi kesalahan saat menyimpan data');
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