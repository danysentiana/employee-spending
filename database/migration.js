import db from "../helper/knex.js";
import bcrypt from "bcryptjs";

async function migrate() {
  try {
    console.log("Starting database migration...");

    // 1. Create Users Table
    const usersTable = await db.schema.hasTable('Users');
    if (!usersTable) {
      await db.schema.createTable('Users', (table) => {
        table.increments('user_id').primary();
        table.string('username').unique().notNullable();
        table.string('password').notNullable();
        table.enum('role', ['admin', 'user']).notNullable();
        table.integer('flag').defaultTo(1);
        table.timestamps(true, true);
      });
      
      const adminHash = bcrypt.hashSync('admin123', 10);
      const userHash = bcrypt.hashSync('user123', 10);
      
      await db('Users').insert([
        { username: 'admin', password: adminHash, role: 'admin', flag: 1 },
        { username: 'user', password: userHash, role: 'user', flag: 1 }
      ]);
      console.log("✓ Created Users table and inserted default accounts");
    }

    // 2. Create Departments Table
    const departmentsTable = await db.schema.hasTable('Departments');
    if (!departmentsTable) {
      await db.schema.createTable('Departments', (table) => {
        table.increments('department_id').primary();
        table.string('department_name', 100).notNullable();
        table.timestamps(true, true);
      });

      await db('Departments').insert([
        { department_name: 'IT Department' },
        { department_name: 'Finance Department' },
        { department_name: 'Human Resources' },
        { department_name: 'Marketing' },
        { department_name: 'Operations' }
      ]);
      console.log("✓ Created Departments table and inserted initial data");
    }

    // 3. Create Employees Table
    const employeesTable = await db.schema.hasTable('Employees');
    if (!employeesTable) {
      await db.schema.createTable('Employees', (table) => {
        table.increments('employee_id').primary();
        table.string('employee_name', 100).notNullable();
        table.integer('department_id').unsigned();
        table.foreign('department_id').references('department_id').inTable('Departments').onDelete('CASCADE');
        table.timestamps(true, true);
      });

      await db('Employees').insert([
        { employee_name: 'John Doe', department_id: 1 },
        { employee_name: 'Jane Smith', department_id: 2 },
        { employee_name: 'Mike Johnson', department_id: 1 },
        { employee_name: 'Sarah Williams', department_id: 3 },
        { employee_name: 'David Brown', department_id: 4 }
      ]);
      console.log("✓ Created Employees table and inserted initial data");
    }

    // 4. Create Spendings Table
    const spendingsTable = await db.schema.hasTable('Spendings');
    if (!spendingsTable) {
      await db.schema.createTable('Spendings', (table) => {
        table.increments('spending_id').primary();
        table.integer('employee_id').unsigned();
        table.foreign('employee_id').references('employee_id').inTable('Employees').onDelete('CASCADE');
        table.date('spending_date').notNullable();
        table.decimal('value', 12, 2).notNullable();
        table.timestamps(true, true);
      });

      await db('Spendings').insert([
        { employee_id: 1, spending_date: '2023-01-15', value: 500.00 },
        { employee_id: 2, spending_date: '2023-02-20', value: 1250.50 },
        { employee_id: 3, spending_date: '2023-03-10', value: 750.00 },
        { employee_id: 4, spending_date: '2023-04-05', value: 300.00 },
        { employee_id: 5, spending_date: '2023-05-12', value: 890.75 },
        { employee_id: 1, spending_date: '2023-06-18', value: 450.00 },
        { employee_id: 2, spending_date: '2023-07-22', value: 1500.00 },
        { employee_id: 3, spending_date: '2023-08-30', value: 620.50 },
        { employee_id: 4, spending_date: '2023-09-15', value: 280.00 },
        { employee_id: 5, spending_date: '2023-10-25', value: 950.00 }
      ]);
      console.log("✓ Created Spendings table and inserted initial data");
    }

    console.log("\n🚀 All migrations and seed data completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

migrate();