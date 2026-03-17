getPKS();
getBankList();
getStatusList();

function attachEventHandlers() {
    // PKS change handler
    $(".pks-list").on("change", function () {
        const pksId = $(this).val();
        
        // Reset all dependent dropdowns
        $(".service-list").html('<option value="">--Pilih Layanan--</option>');
        $(".step-list").html('<option value="">--Pilih Tahap--</option>');
        $(".batch-list").html('<option value="">--Pilih Batch--</option>');
        
        $(".service-list").prop("disabled", !pksId);
        $(".step-list").prop("disabled", true);
        $(".batch-list").prop("disabled", true);

        if (pksId) {
            getServiceList(pksId);
        }
    });

    // Service change handler
    $(".service-list").on("change", function () {
        const serviceId = $(this).val();
        const pksId = $(".pks-list").val();

        // Reset dependent dropdowns
        $(".step-list").html('<option value="">--Pilih Tahap--</option>');
        $(".batch-list").html('<option value="">--Pilih Batch--</option>');
        
        $(".step-list").prop("disabled", !(serviceId && pksId));
        $(".batch-list").prop("disabled", true);

        if (serviceId && pksId) {
            getStepList(pksId);
        }
    });

    // Step change handler
    $(".step-list").on("change", function () {
        const step = $(this).val();
        const serviceId = $(".service-list").val();
        const pksId = $(".pks-list").val();
        
        // Reset batch dropdown
        $(".batch-list").html('<option value="">--Pilih Batch--</option>');
        
        $(".batch-list").prop("disabled", !(step && serviceId && pksId));

        if (step && serviceId && pksId) {
            getBatchList(pksId, serviceId);
        }
    });
}

function getPKS() {
    $.ajax({
        url: "/reff/pks",
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
            $(".pks-list").html('');
            $(".pks-list").append('<option value="">--Pilih PKS--</option>');
            $.each(res.data, function (key, value) {
                $(".pks-list").append(`<option value="${value.id}">${value.nama_pks}</option>`);
            });

            // Initialize all dropdowns to disabled state
            $(".service-list").html('<option value="">--Pilih Layanan--</option>');
            $(".step-list").html('<option value="">--Pilih Tahap--</option>');
            $(".batch-list").html('<option value="">--Pilih Batch--</option>');
            $(".service-list").prop("disabled", true);
            $(".step-list").prop("disabled", true);
            $(".batch-list").prop("disabled", true);

            // Attach all event handlers once
            attachEventHandlers();
        }
    });
}

function getServiceList(id) {
    $.ajax({
        url: `/reff/service-list-by-pks`,
        data: { pksId: id },
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
            $(".service-list").html('');
            $(".service-list").append('<option value="">--Pilih Layanan--</option>');
            $.each(res.data, function (key, value) {
                $(".service-list").append(`<option value="${value.id}">${value.nama_layanan}</option>`);
            });
        }
    });
}

function getStepList(id) {
    $.ajax({
        url: `/reff/step-list-by-pks`,
        data: { pksId: id },
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
            $(".step-list").html('');
            $(".step-list").append('<option value="">--Pilih Tahap--</option>');
            $.each(res.data, function (key, value) {
                $(".step-list").append(`<option value="${value.tahap}">${value.tahap}</option>`);
            });
        }
    });
}

function getBatchList(pksId, serviceId) {
    $.ajax({
        url: `/reff/batch-list-by-pks-and-service?pksId=${pksId}&serviceId=${serviceId}`,
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
            $(".batch-list").html('');
            $(".batch-list").append('<option value="">--Pilih Batch--</option>');
            $.each(res.data, function (key, value) {
                $(".batch-list").append(`<option value="${value.batch}">${value.batch}</option>`);
            });
        }
    });
}

function getStatusList() {
    $.ajax({
        url: "/reff/loan-status",
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
            $(".status-list").html('');
            $(".status-list").append('<option value="">--Pilih Status--</option>');
            $.each(res.data, function (key, value) {
                $(".status-list").append(`<option value="${value.id}">${value.status}</option>`);
            });
        }
    });
}

// $('#modal-loan').on('show.bs.modal', function() {
//     $('#tipe_peminjam').val('1');
//     getMemberListType('1');
// });

function getMemberListType(type) {
    // console.log("fetching member list for type: ", type);
    $.ajax({
        url: "/reff/member-list",
        type: "GET",
        data: { type: type },
        beforeSend: function (xhr) {
            if (localStorage.token) {
                xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
            }
        },
        error: function (error) {
            if (error.status === 401) {
                localStorage.removeItem("token");
                $(location).attr("href", "/");
            } else {
                console.error("Error fetching member list:", error);
                $(".member-list").html('<option value="">--Pilih Nama--</option>');
            }
        },
        success: function (res) {
            $(".member-list").html('');
            $(".member-list").append('<option value="">--Pilih Nama--</option>');
            $.each(res.data, function (key, value) {
                $(".member-list").append(`<option value="${value.nik}">${value.nama}</option>`);
            });
        }
    });
}

function getBankList() {
    $.ajax({
        url: "/reff/bank-list",
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
            $(".bank-list").html('');
            $(".bank-list").append('<option value="">--Pilih Bank--</option>');
            $.each(res.data, function (key, value) {
                $(".bank-list").append(`<option value="${value.name}">${value.name}</option>`);
            });
        }
    });
}

