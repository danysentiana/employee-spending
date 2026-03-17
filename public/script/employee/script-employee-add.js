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

    // Load departments
    loadDepartments();

    // If edit mode, load employee data
    if (editId) {
        loadEmployeeData(editId);
    }

    // Department change event
    $('#department-select').on('change', function() {
        // Employee selection depends on department, can be enhanced later
    });

    // Save button click
    $('#btn-save-employee').on('click', function() {
        saveEmployee();
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
                    populateDepartmentSelect(response.data);
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

    function populateDepartmentSelect(departments) {
        const select = $('#department-select');
        select.empty();
        select.append('<option value="">Pilih Departemen</option>');
        departments.forEach(dept => {
            select.append(`<option value="${dept.department_id}">${dept.department_name}</option>`);
        });
    }

    function loadEmployeeData(id) {
        $.ajax({
            url: '/employee/all',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                if (response.status === 'ok') {
                    const emp = response.data.find(e => e.employee_id == id);
                    if (emp) {
                        $('input[name="employee_id"]').val(emp.employee_id);
                        $('input[name="employee_name"]').val(emp.employee_name);
                        $('#department-select').val(emp.department_id);
                    } else {
                        showError('Data karyawan tidak ditemukan');
                    }
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

    function saveEmployee() {
        const employeeId = $('input[name="employee_id"]').val();
        const employeeName = $('input[name="employee_name"]').val().trim();
        const departmentId = $('#department-select').val();

        // Validation
        if (!employeeName) {
            showError('Nama karyawan harus diisi');
            return;
        }
        if (!departmentId) {
            showError('Departemen harus dipilih');
            return;
        }

        const data = {
            employee_name: employeeName,
            department_id: departmentId
        };

        // Use correct routes: POST /employee/add for new, POST /employee/update/:id for edit
        const url = employeeId ? '/employee/update/' + employeeId : '/employee/add';
        const method = 'POST';

        if (employeeId) {
            data.employee_id = employeeId;
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
                    showSuccess(employeeId ? 'Karyawan berhasil diupdate' : 'Karyawan berhasil ditambahkan');
                    setTimeout(() => {
                        window.location.href = '/employee';
                    }, 1000);
                } else {
                    showError(response.message || 'Gagal menyimpan karyawan');
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