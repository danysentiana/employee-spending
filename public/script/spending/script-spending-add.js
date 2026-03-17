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

    // Load departments and employees (only for add mode)
    if (!editId) {
        loadDepartments();
    }

    // If edit mode, load spending data
    if (editId) {
        loadSpendingData(editId);
    }

    // Department change event (only for add mode)
    $('#department-select').on('change', function() {
        const deptId = $(this).val();
        loadEmployeesByDepartment(deptId);
    });

    // Save button click
    $('#btn-save-spending').on('click', function() {
        saveSpending();
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

    function populateDepartmentInput(departmentName) {
        // Hide select and show readonly input for edit mode
        $('#department-select-container').hide();
        
        // Check if input already exists
        if ($('#department-input').length === 0) {
            $('#department-select-container').after(`
                <input type="text" id="department-input" class="form-control" 
                       value="${departmentName}" readonly>
            `);
        } else {
            $('#department-input').val(departmentName);
        }
    }

    function loadEmployeesByDepartment(departmentId, selectedEmpId = null) {
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
                    populateEmployeeSelect(response.data, selectedEmpId);
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

    function populateEmployeeSelect(employees, selectedEmpId = null) {
        const select = $('#employee-select');
        select.empty();
        select.append('<option value="">Pilih Karyawan</option>');
        
        console.log('Employees to populate:', employees.length);
        employees.forEach(emp => {
            select.append(`<option value="${emp.employee_id}">${emp.employee_name}</option>`);
        });
        
        // Select employee if provided with setTimeout to ensure DOM is updated
        if (selectedEmpId) {
            setTimeout(function() {
                const empSelect = $('#employee-select');
                empSelect.val(selectedEmpId);
                console.log('Employee ID to select:', selectedEmpId);
                console.log('Employee selected value:', empSelect.val());
            }, 150);
        }
    }

    function populateEmployeeInput(employeeName) {
        // Hide select and show readonly input for edit mode
        $('#employee-select-container').hide();
        
        // Check if input already exists
        if ($('#employee-input').length === 0) {
            $('#employee-select-container').after(`
                <input type="text" id="employee-input" class="form-control" 
                       value="${employeeName}" readonly>
            `);
        } else {
            $('#employee-input').val(employeeName);
        }
    }

    function loadSpendingData(id) {
        console.log('Loading spending data for ID:', id);
        
        $.ajax({
            url: '/spending/table',
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
                    const spending = response.data.find(s => s.spending_id == id);
                    if (spending) {
                        console.log('Spending data found:', spending);
                        
                        // Store spending data temporarily with IDs
                        window.currentSpendingData = spending;
                        
                        $('input[name="spending_id"]').val(spending.spending_id);
                        
                        // Format date for input field (YYYY-MM-DD)
                        if (spending.spending_date) {
                            const date = new Date(spending.spending_date);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            $('input[name="spending_date"]').val(`${year}-${month}-${day}`);
                        }
                        
                        $('input[name="value"]').val(spending.value);
                        $('textarea[name="description"]').val(spending.description || '');
                        
                        console.log('Department Name from spending:', spending.department_name);
                        console.log('Employee Name from spending:', spending.employee_name);
                        console.log('Department ID from spending:', spending.department_id);
                        console.log('Employee ID from spending:', spending.employee_id);
                        
                        // Use readonly inputs instead of dropdowns in edit mode
                        if (spending.department_name && spending.employee_name) {
                            populateDepartmentInput(spending.department_name);
                            populateEmployeeInput(spending.employee_name);
                        } else {
                            showError('Data department atau karyawan tidak lengkap');
                        }
                    } else {
                        showError('Data pengeluaran tidak ditemukan');
                    }
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

    function saveSpending() {
        const spendingId = $('input[name="spending_id"]').val();
        let departmentId, employeeId;
        
        // In edit mode, get IDs from stored data
        if (spendingId && window.currentSpendingData) {
            departmentId = window.currentSpendingData.department_id;
            employeeId = window.currentSpendingData.employee_id;
        } else {
            // In add mode, get IDs from dropdowns
            departmentId = $('#department-select').val();
            employeeId = $('#employee-select').val();
        }
        
        const spendingDate = $('input[name="spending_date"]').val();
        const value = $('input[name="value"]').val();
        const description = $('textarea[name="description"]').val();

        // Validation
        if (!departmentId) {
            showError('Departemen harus dipilih');
            return;
        }
        if (!employeeId) {
            showError('Karyawan harus dipilih');
            return;
        }
        if (!spendingDate) {
            showError('Tanggal harus diisi');
            return;
        }
        if (!value) {
            showError('Nilai harus diisi');
            return;
        }

        // Parse value from formatted currency
        const numericValue = parseFloat(value.replace(/[Rp\s.,]/g, ''));
        if (isNaN(numericValue) || numericValue <= 0) {
            showError('Nilai harus lebih dari 0');
            return;
        }

        const data = {
            employee_id: employeeId,
            spending_date: spendingDate,
            value: numericValue,
            description: description
        };

        // Use correct routes: POST /spending/add for new, POST /spending/update/:id for edit
        const url = spendingId ? '/spending/update/' + spendingId : '/spending/add';
        const method = 'POST';

        if (spendingId) {
            data.spending_id = spendingId;
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
                    showSuccess(spendingId ? 'Pengeluaran berhasil diupdate' : 'Pengeluaran berhasil ditambahkan');
                    setTimeout(() => {
                        window.location.href = '/spending';
                    }, 1000);
                } else {
                    showError(response.message || 'Gagal menyimpan pengeluaran');
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