$(document).ready(function () {
    resetPassword()
    updatePassword()
});

function loadingButtonStart(id) {
    document.getElementById(id).setAttribute("disabled", true);
    $("#"+id).html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Loading...');
}

function loadingButtonEnd(id, label) {
    document.getElementById(id).removeAttribute("disabled");
    $("#"+id).html(label);
}

function sendMessage(){
    loadingButtonStart("send_message_button")
    setTimeout(function() {$(location).attr('href', "/confirm-mail");loadingButtonEnd("send_message_button", "Send a Message");}, 2000); 
}

function resetPassword(){
    $("#form_reset_password").submit(function (e) {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, reset it!"
          }).then((result) => {
            if (result.isConfirmed) {
                loadingButtonStart("reset_password_button")
                e.preventDefault();
                $.ajax({
                url: "/reset-password",
                type: "POST",
                data: new FormData(this),
                contentType: false,
                cache: false,
                processData: false,
                success: function (res) {
                    console.log(res.status)
                    if (res.status === "nok") {
                        loadingButtonEnd("reset_password_button", "Reset Password");
                        Swal.fire({
                            title: "Failed!",
                            text: res.message,
                            confirmButtonColor: "#3085d6",
                            icon: "error"
                        }).then((result) => {
                            $(location).attr('href', "/reset-password");
                        });
                    } else {
                        loadingButtonEnd("reset_password_button", "Reset Password");
                        Swal.fire({
                            title: "Success!",
                            text: res.message,
                            confirmButtonColor: "#3085d6",
                            icon: "success"
                        }).then((result) => {
                            $(location).attr('href', "/");
                        });
                    }
                },
                });
            }
          });
    });
}

function updatePassword(){
        url = new URLSearchParams(window.location.search);
        $("#form_update_password").submit(function (e) {
            console.log($('#new_password').val())
        if($('#new_password').val() !== "" && $('#confirm_password').val() !== ""){
            if($('#new_password').val() === $('#confirm_password').val()){
                Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, submit it!"
                  }).then((result) => {
                    if (result.isConfirmed) {
                        $('#email').val(url.get('email'))
                        $('#key').val(url.get('key'))
                        loadingButtonStart("update_password_button")
                        e.preventDefault();
                        $.ajax({
                        url: "/reset-password/update",
                        type: "POST",
                        data: new FormData(this),
                        contentType: false,
                        cache: false,
                        processData: false,
                        success: function (res) {
                            console.log(res)
                            if (res.status === "nok") {
                                loadingButtonEnd("update_password_button", "Submit");
                                Swal.fire({
                                    title: "Failed!",
                                    text: res.message,
                                    confirmButtonColor: "#3085d6",
                                    icon: "error"
                                }).then(() => {
                                    $(location).attr('href', "/reset-password/update");
                                });
                            } else {
                                loadingButtonEnd("update_password_button", "Submit");
                                Swal.fire({
                                    title: "Success!",
                                    text: res.message,
                                    confirmButtonColor: "#3085d6",
                                    icon: "success"
                                }).then(() => {
                                    $(location).attr('href', "/");
                                });
                            }
                        },
                        });
                    }
                  });
            }else{
                Swal.fire({
                    title: "Failed!",
                    text: "Password not match!",
                    confirmButtonColor: "#3085d6",
                    icon: "warning"
                });
            }
        }
    });
}
