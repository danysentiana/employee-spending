# Employee Spending Report APP

Aplikasi web untuk manajemen data pengeluaran karyawan dengan fitur laporan dan kontrol akses berbasis peran.

## Fitur Utama

- **Manajemen Departemen**: CRUD data departemen
- **Manajemen Karyawan**: CRUD data karyawan
- **Manajemen Pengeluaran**: CRUD data pengeluaran
- **Laporan**: Export laporan ke Excel dan PDF dengan filter
- **Role-Based Access Control**: 
  - **Admin**: Full CRUD access
  - **User**: Create dan Read access saja
- **Authentication**: JWT token-based authentication

## Teknologi

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Bootstrap 5, jQuery
- **Database**: MySQL 8+
- **Authentication**: JWT (JSON Web Token)
- **File Processing**: Excel (ExcelJS), PDF (PDFKit)
- **Security**: Bcrypt untuk password hashing

## Prerequisites

1. **Node.js** version >= 20.15.0
2. **MySQL** version >= 8
3. **npm** version >= 10.7.0

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/danysentiana/employee-spending.git
cd employee-spending
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

Buat database baru di MySQL:

```sql
CREATE DATABASE employee_spending;
```

### 4. Setup Environment Variables

Copy file `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi database Anda:

```env
APP_PORT=3000
APP_ADDRESS=0.0.0.0

DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=employee_spending
DB_POOL=20
DB_PORT=3306

JWT_SECRET="$2a$10$8JH91ED/iO7OqG2nPCh38Ov51XRArxZZSxd6MB9seyG0Nd5JYEWTm"
JWT_EXPIRED=28800000
```

### 5. Jalankan Migration

Migration akan membuat semua tabel yang diperlukan:

```bash
npm run migrate
```

### 6. Jalankan Aplikasi

Mode development (dengan auto-reload):

```bash
npm run dev
```

Mode production:

```bash
npm start
```

### 7. Akses Aplikasi

Buka browser dan akses:

```
http://localhost:3000
```

## Akun Default

Saat pertama kali running, Anda perlu membuat akun di database manual atau menggunakan API registration.

**Admin Account** (jika ada di database seeding):
- Username: admin
- Password: admin123

## Struktur Database

### Tables

1. **Users** - Data user login
   - user_id, username, password, role (admin/user)

2. **Departments** - Data departemen
   - department_id, department_name

3. **Employees** - Data karyawan
   - employee_id, employee_name, department_id

4. **Spendings** - Data pengeluaran
   - spending_id, employee_id, spending_date, value, description

## Role & Permissions

### Admin Role
- **Departemen**: Create, Read, Update, Delete
- **Karyawan**: Create, Read, Update, Delete
- **Pengeluaran**: Create, Read, Update, Delete
- **Laporan**: Export Excel, Export PDF

### User Role
- **Departemen**: Create, Read
- **Karyawan**: Create, Read
- **Pengeluaran**: Create, Read
- **Laporan**: Export Excel, Export PDF

**Catatan**: User role akan menerima pesan error "Akses ditolak: Hanya Admin yang dapat melakukan aksi ini." saat mencoba melakukan Update atau Delete.

## API Endpoints

### Authentication
- `POST /` - Login
- `GET /logout` - Logout

### Departments
- `GET /department` - Halaman departemen
- `GET /department/all` - Get all departments
- `GET /department/table` - Get departments for datatable
- `GET /department/detail/:id` - Get department detail
- `POST /department/add` - Add new department
- `POST /department/update/:id` - Update department
- `DELETE /department/delete/:id` - Delete department

### Employees
- `GET /employee` - Halaman karyawan
- `GET /employee/all` - Get all employees
- `GET /employee/table` - Get employees for datatable
- `GET /employee/detail/:id` - Get employee detail
- `POST /employee/add` - Add new employee
- `POST /employee/update/:id` - Update employee
- `DELETE /employee/delete/:id` - Delete employee

### Spendings
- `GET /spending` - Halaman pengeluaran
- `GET /spending/table` - Get spendings for datatable
- `GET /spending/detail/:id` - Get spending detail
- `GET /spending/add` - Halaman tambah pengeluaran
- `POST /spending/add` - Add new spending
- `POST /spending/update/:id` - Update spending
- `DELETE /spending/delete/:id` - Delete spending

### Reports
- `GET /report` - Halaman laporan
- `POST /report/data` - Get report data
- `POST /report/summary` - Get report summary
- `POST /report/export/excel` - Export Excel
- `POST /report/export/pdf` - Export PDF

## Script npm

- `npm install` - Install semua dependencies
- `npm start` - Jalankan aplikasi di mode production
- `npm run dev` - Jalankan aplikasi di mode development (dengan nodemon)
- `npm run migrate` - Jalankan database migration

## Troubleshooting

### Migration Error

Jika terjadi error saat running migration:

1. Pastikan MySQL service berjalan
2. Cek koneksi database di `.env`
3. Pastikan database sudah dibuat

### Login Error

Jika tidak bisa login:

1. Cek apakah user ada di tabel `Users`
2. Verifikasi password hashing
3. Cek JWT_SECRET di `.env`

### Port Already in Use

Jika port sudah digunakan:

1. Ubah `APP_PORT` di `.env`
2. Atau kill proses yang menggunakan port:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Development

Untuk development dengan auto-reload:

```bash
npm run dev
```

Nodemon akan otomatis restart server ketika ada perubahan file.

## Production

Untuk production:

1. Set `NODE_ENV=production` di environment variables
2. Gunakan process manager seperti PM2:
```bash
npm install -g pm2
pm2 start bin/employee-spending.js --name "employee-spending"
pm2 save
pm2 startup
```

## License

ISC

## Author

testing