// $(document).ready(function(){
//     if ($("#book-table").length) {
//         getBooks();
//     }

//     fetchDashboardSummary();
//     add();
// });

// function getBooks() {
//     $.ajax({
//         url: `/dashboard/book-table`,
//         type: "GET",
//         beforeSend: function (xhr) {
//             if (localStorage.token) {
//                 xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
//             }
//         },
//         error: function (error) {
//             if (error.status === 401) {
//                 localStorage.removeItem("token");
//                 $(location).attr("href", "/");
//             }
//         },
//         success: function (res) {
//             const tbody = $('#book-table-body');
//             tbody.empty();

//             const books = Array.isArray(res.data) ? res.data : [];

//             if (res.status !== "ok" || !books.length) {
//                 tbody.append(`
//                     <tr>
//                         <td colspan="6" class="text-center">Data tidak tersedia</td>
//                     </tr>
//                 `);
//                 return;
//             }

//             books.forEach((book, index) => {
//                 const displayName = book?.name ?? `Buku ${book?.id ?? ""}`;
//                 const hasFile = Boolean(book?.file);
//                 const bookUrl = hasFile
//                     ? `/reff/file?folder=books&file=${encodeURIComponent(book.file)}&token=${encodeURIComponent(localStorage.token || "")}`
//                     : "#";

//                 const detailLink = `<a href="#"
//                         class="book-detail-link"
//                         data-id="${book.id}"
//                         style="color: #BB1018; text-decoration: underline;">
//                         Detail
//                     </a>`;

//                 const fileLink = hasFile
//                     ? `<a href="${bookUrl}"
//                             target="_blank"
//                             rel="noopener"
//                             class="open-book-link"
//                             style="color: #BB1018; text-decoration: underline;">
//                             Open Book
//                         </a>`
//                     : `<a href="#"
//                             class="upload-book-link"
//                             data-id="${book.id}"
//                             data-name="${escapeAttrValue(displayName)}"
//                             style="color: #BB1018; text-decoration: underline;">
//                             Upload File
//                         </a>`;

//                 const actionContent = `${detailLink} &nbsp; ${fileLink}`;

//                 tbody.append(`
//                     <tr>
//                         <td class="py-3">${index + 1}</td>
//                         <td class="py-3 text-start">${book.name ?? "-"}</td>
//                         <td class="py-3">${book.edition ?? "-"}</td>
//                         <td class="py-3 text-start">${book.author ?? "-"}</td>
//                         <td class="py-3">${book.isbn ?? "-"}</td>
//                         <td class="py-3 text-center">${actionContent}</td>
//                     </tr>
//                 `);
//             });
//         }
//     });
// };

// let bookDetailModal = null;

// function formatNumber(value) {
//     const number = Number(value);
//     if (!Number.isFinite(number)) {
//         return value || "0";
//     }
//     return new Intl.NumberFormat("id-ID").format(number);
// }

// function formatPercentage(value) {
//     const number = Number(value);
//     if (!Number.isFinite(number)) {
//         return "0%";
//     }
//     return `${number}%`;
// }

// function escapeAttrValue(value) {
//     if (value === undefined || value === null) {
//         return "";
//     }
//     return String(value)
//         .replace(/&/g, "&amp;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#39;");
// }

// function escapeHtml(value) {
//     if (value === undefined || value === null) {
//         return "";
//     }
//     return String(value)
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#39;");
// }

// function fetchDashboardSummary() {
//     if (!document.getElementById("total-user-count")) {
//         return;
//     }

//     $.ajax({
//         url: "/dashboard/summary",
//         type: "GET",
//         beforeSend: setAuthHeader,
//         error: handleAuthError,
//         success: function (res) {
//             if (res?.status !== "ok" || !res?.data) {
//                 return;
//             }

//             const data = res.data;
            
//             $("#total-user-count").text(formatNumber(data.totalUsers ?? 0));
//             $("#total-user-new").text(formatNumber(data.usersCurrentMonth ?? 0));
//             $("#total-user-percentage").text(formatPercentage(data.totalUsersPercentage));

//             $("#login-user-count").text(formatNumber(data.loginCurrentMonth ?? 0));
//             $("#login-user-percentage").text(formatPercentage(data.loginPercentage));
//         }
//     });
// }

// function setAuthHeader(xhr) {
//     if (localStorage.token) {
//         xhr.setRequestHeader("Authorization", "Bearer " + localStorage.token);
//     }
// }

// function handleAuthError(error) {
//     if (error.status === 401) {
//         localStorage.removeItem("token");
//         $(location).attr("href", "/");
//     }
// }

// function add() {
//     const modalElement = document.getElementById("bookUploadModal");
//     if (!modalElement) {
//         return;
//     }

//     let bookUploadModal = null;
//     if (typeof bootstrap !== "undefined" && bootstrap?.Modal) {
//         bookUploadModal = new bootstrap.Modal(modalElement);
//     }

//     $(document).off("click", ".upload-book-link");
//     $(document).on("click", ".upload-book-link", function (event) {
//         event.preventDefault();
//         const bookId = $(this).data("id");
//         const bookName = $(this).data("name") || "-";

//         resetBookUploadForm();
//         $("#book-upload-id").val(bookId);
//         $("#book-upload-selected-name").text(bookName);
//         if (bookUploadModal) {
//             bookUploadModal.show();
//         }
//     });

//     $("#book-upload-form").off("submit");
//     $("#book-upload-form").on("submit", function (event) {
//         event.preventDefault();

//         const bookId = $("#book-upload-id").val();
//         const files = $("#book-upload-file").prop("files") || [];
//         const formElement = event.currentTarget;

//         if (!bookId) {
//             Swal.fire({
//                 title: "Pilih Buku",
//                 text: "Silakan pilih buku yang ingin diperbarui",
//                 icon: "warning",
//                 confirmButtonColor: "#3085d6",
//             });
//             return;
//         }

//         if (!files.length) {
//             Swal.fire({
//                 title: "File belum dipilih",
//                 text: "Silakan pilih file buku yang akan diunggah",
//                 icon: "warning",
//                 confirmButtonColor: "#3085d6",
//             });
//             return;
//         }

//         Swal.fire({
//             title: "Upload file buku?",
//             text: "Pastikan file yang dipilih sudah benar.",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#3085d6",
//             cancelButtonColor: "#d33",
//             confirmButtonText: "Ya, upload"
//         }).then((result) => {
//             if (!result.isConfirmed) {
//                 return;
//             }

//             const formData = new FormData(formElement);

//             $.ajax({
//                 url: "/dashboard/upload-book",
//                 type: "POST",
//                 data: formData,
//                 contentType: false,
//                 cache: false,
//                 processData: false,
//                 beforeSend: setAuthHeader,
//                 error: handleAuthError,
//                 success: function (res) {
//                     if (res?.status !== "ok") {
//                         Swal.fire({
//                             title: "Gagal",
//                             text: res?.message || "Gagal mengunggah buku",
//                             icon: "error",
//                             confirmButtonColor: "#3085d6",
//                         });
//                         return;
//                     }

//                     Swal.fire({
//                         title: "Berhasil",
//                         text: res?.message || "File buku berhasil diunggah",
//                         icon: "success",
//                         confirmButtonColor: "#3085d6",
//                     }).then(() => {
//                         if (bookUploadModal) {
//                             bookUploadModal.hide();
//                         }
//                         resetBookUploadForm();
//                         getBooks();
//                     });
//                 }
//             });
//         });
//     });

//     $(document).off("click", ".book-detail-link");
//     $(document).on("click", ".book-detail-link", function (event) {
//         event.preventDefault();
//         const bookId = $(this).data("id");
//         if (!bookId) {
//             return;
//         }

//         openBookDetailModal(bookId);
//     });

//     const detailModalElement = document.getElementById("bookDetailModal");
//     if (detailModalElement) {
//         if (!bookDetailModal && typeof bootstrap !== "undefined" && bootstrap?.Modal) {
//             bookDetailModal = new bootstrap.Modal(detailModalElement);
//         }

//         $("#book-detail-form").off("submit");
//         $("#book-detail-form").on("submit", function (event) {
//             event.preventDefault();
//             submitBookDetail();
//         });

//         $(detailModalElement).off("hidden.bs.modal.bookDetail");
//         $(detailModalElement).on("hidden.bs.modal.bookDetail", function () {
//             resetBookDetailForm();
//         });
//     }
// }

// function resetBookUploadForm() {
//     const form = document.getElementById("book-upload-form");
//     if (!form) {
//         return;
//     }

//     form.reset();
//     $("#book-upload-id").val("");
//     $("#book-upload-selected-name").text("-");
// }

// function openBookDetailModal(bookId) {
//     $.ajax({
//         url: `/dashboard/book/${bookId}`,
//         type: "GET",
//         beforeSend: setAuthHeader,
//         error: handleAuthError,
//         success: function (res) {
//             if (res?.status !== "ok" || !res?.data) {
//                 Swal.fire({
//                     title: "Gagal",
//                     text: res?.message || "Data buku tidak ditemukan",
//                     icon: "error",
//                     confirmButtonColor: "#3085d6",
//                 });
//                 return;
//             }

//             populateBookDetailModal(res.data);
//             if (bookDetailModal) {
//                 bookDetailModal.show();
//             }
//         }
//     });
// }

// function populateBookDetailModal(data) {
//     $("#book-detail-id").val(data.id ?? "");
//     $("#book-detail-title").val(data.name ?? "");
//     $("#book-detail-edition").val(data.edition ?? "");
//     $("#book-detail-isbn").val(data.isbn ?? "");
//     $("#book-detail-author").val(data.author ?? "");
//     $("#book-detail-foreword").val(data.foreword ?? "");
// }

// function submitBookDetail() {
//     const bookId = $("#book-detail-id").val();
//     if (!bookId) {
//         Swal.fire({
//             title: "Gagal",
//             text: "ID buku tidak ditemukan",
//             icon: "error",
//             confirmButtonColor: "#3085d6",
//         });
//         return;
//     }

//     const payload = {
//         name: $("#book-detail-title").val()?.trim() ?? "",
//         edition: $("#book-detail-edition").val()?.trim() ?? "",
//         isbn: $("#book-detail-isbn").val()?.trim() ?? "",
//         author: $("#book-detail-author").val()?.trim() ?? "",
//         foreword: $("#book-detail-foreword").val()?.trim() ?? "",
//     };

//     if (!payload.name) {
//         Swal.fire({
//             title: "Gagal",
//             text: "Judul buku wajib diisi",
//             icon: "error",
//             confirmButtonColor: "#3085d6",
//         });
//         return;
//     }

//     $.ajax({
//         url: `/dashboard/book/${bookId}`,
//         type: "PUT",
//         contentType: "application/json",
//         data: JSON.stringify(payload),
//         beforeSend: setAuthHeader,
//         error: handleAuthError,
//         success: function (res) {
//             if (res?.status !== "ok") {
//                 Swal.fire({
//                     title: "Gagal",
//                     text: res?.message || "Gagal memperbarui data buku",
//                     icon: "error",
//                     confirmButtonColor: "#3085d6",
//                 });
//                 return;
//             }

//             Swal.fire({
//                 title: "Berhasil",
//                 text: res?.message || "Data buku berhasil diperbarui",
//                 icon: "success",
//                 confirmButtonColor: "#3085d6",
//             }).then(() => {
//                 if (bookDetailModal) {
//                     bookDetailModal.hide();
//                 }
//                 getBooks();
//             });
//         }
//     });
// }

// function resetBookDetailForm() {
//     $("#book-detail-id").val("");
//     $("#book-detail-title").val("");
//     $("#book-detail-edition").val("");
//     $("#book-detail-isbn").val("");
//     $("#book-detail-author").val("");
//     $("#book-detail-foreword").val("");
// }
