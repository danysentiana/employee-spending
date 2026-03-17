function setAuthHeader(xhr) {
    if (localStorage.token) {
        xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
    }
}

function handleAuthError(error) {
    if (error?.status === 401) {
        localStorage.removeItem("token");
        $(location).attr("href", "/");
    }
}