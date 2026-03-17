import db from "../helper/knex.js";

async function migrate() {
  try {
    console.log("Starting database migration...");

    // Check if tables already exist
    const tables = await db.schema.hasTable('Users');
    
    if (!tables) {
      // Create Users table
      await db.schema.createTable('Users', (table) => {
        table.increments('user_id').primary();
        table.string('username').unique().notNullable();
        table.string('password').notNullable();
        table.string('role').notNullable(); // 'admin' or 'user'
        table.integer('flag').defaultTo(1); // 1 = active, 0 = inactive
        table.timestamps(true, true);
      });
      console.log("✓ Created Users table");

      // Insert default admin user (password: admin123)
      const bcrypt = (await import('bcryptjs')).default;
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await db('Users').insert({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log("✓ Inserted default admin user (username: admin, password: admin123)");

      // Insert default regular user (password: user123)
      const userPassword = bcrypt.hashSync('user123', 10);
      await db('Users').insert({
        username: 'user',
        password: userPassword,
        role: 'user'
      });
      console.log("✓ Inserted default user (username: user, password: user123)");
    } else {
      console.log("- Users table already exists");
    }

    // Create Departments table
    const departmentsTable = await db.schema.hasTable('Departments');
    if (!departmentsTable) {
      await db.schema.createTable('Departments', (table) => {
        table.increments('department_id').primary();
        table.string('department_name').notNullable();
        table.timestamps(true, true);
      });
      console.log("✓ Created Departments table");
    } else {
      console.log("- Departments table already exists");
    }

    // Create Employees table
    const employeesTable = await db.schema.hasTable('Employees');
    if (!employeesTable) {
      await db.schema.createTable('Employees', (table) => {
        table.increments('employee_id').primary();
        table.string('employee_name').notNullable();
        table.integer('department_id').unsigned();
        table.foreign('department_id').references('department_id').inTable('Departments').onDelete('CASCADE');
        table.timestamps(true, true);
      });
      console.log("✓ Created Employees table");
    } else {
      console.log("- Employees table already exists");
    }

    // Create Spendings table
    const spendingsTable = await db.schema.hasTable('Spendings');
    if (!spendingsTable) {
      await db.schema.createTable('Spendings', (table) => {
        table.increments('spending_id').primary();
        table.integer('employee_id').unsigned().notNullable();
        table.foreign('employee_id').references('employee_id').inTable('Employees').onDelete('CASCADE');
        table.date('spending_date').notNullable();
        table.decimal('value', 15, 2).notNullable();
        table.text('description').nullable();
        table.timestamps(true, true);
      });
      console.log("✓ Created Spendings table");
    } else {
      console.log("- Spendings table already exists");
    }

    // Create menu_all table
    const menuAllTable = await db.schema.hasTable('menu_all');
    if (!menuAllTable) {
      await db.schema.createTable('menu_all', (table) => {
        table.increments('menu_id').primary();
        table.string('menu_label').notNullable();
        table.string('menu_icon').notNullable();
        table.string('menu_action').notNullable();
        table.integer('menu_type').defaultTo(0); // 0 = single menu, 1 = dropdown/submenu
        table.integer('menu_order').defaultTo(0);
        table.timestamps(true, true);
      });
      console.log("✓ Created menu_all table");

      // Insert default menus
      await db('menu_all').insert([
        {
          menu_label: 'Department',
          menu_icon: 'mdi mdi-bank',
          menu_action: '/department',
          menu_type: 0,
          menu_order: 1
        },
        {
          menu_label: 'Employee',
          menu_icon: 'mdi mdi-account-group',
          menu_action: '/employee',
          menu_type: 0,
          menu_order: 2
        },
        {
          menu_label: 'Spending',
          menu_icon: 'mdi mdi-cash-multiple',
          menu_action: '/spending',
          menu_type: 0,
          menu_order: 3
        },
        {
          menu_label: 'Report',
          menu_icon: 'mdi mdi-file-chart',
          menu_action: '/report',
          menu_type: 0,
          menu_order: 4
        }
      ]);
      console.log("✓ Inserted default menus");
    } else {
      console.log("- menu_all table already exists");
    }

    // Create menu_matrix table
    const menuMatrixTable = await db.schema.hasTable('menu_matrix');
    if (!menuMatrixTable) {
      await db.schema.createTable('menu_matrix', (table) => {
        table.increments('matrix_id').primary();
        table.integer('role_id').notNullable();
        table.integer('menu_id').unsigned().notNullable();
        table.foreign('menu_id').references('menu_id').inTable('menu_all').onDelete('CASCADE');
        table.integer('menu_parent_id').defaultTo(0);
        table.integer('matrix_order').defaultTo(0);
        table.integer('matrix_status').defaultTo(1); // 1 = active, 0 = inactive
        table.timestamps(true, true);
      });
      console.log("✓ Created menu_matrix table");

      // Insert menu permissions for admin (role_id = 1)
      await db('menu_matrix').insert([
        { role_id: 1, menu_id: 1, menu_parent_id: 0, matrix_order: 1 }, // Department
        { role_id: 1, menu_id: 2, menu_parent_id: 0, matrix_order: 2 }, // Employee
        { role_id: 1, menu_id: 3, menu_parent_id: 0, matrix_order: 3 }, // Spending
        { role_id: 1, menu_id: 4, menu_parent_id: 0, matrix_order: 4 }  // Report
      ]);

      // Insert menu permissions for user (role_id = 2) - only view access
      await db('menu_matrix').insert([
        { role_id: 2, menu_id: 1, menu_parent_id: 0, matrix_order: 1 }, // Department
        { role_id: 2, menu_id: 2, menu_parent_id: 0, matrix_order: 2 }, // Employee
        { role_id: 2, menu_id: 3, menu_parent_id: 0, matrix_order: 3 }, // Spending
        { role_id: 2, menu_id: 4, menu_parent_id: 0, matrix_order: 4 }  // Report
      ]);
      console.log("✓ Inserted menu permissions");
    } else {
      console.log("- menu_matrix table already exists");
    }

    console.log("\n✓ Database migration completed successfully!");
    console.log("\nDefault users:");
    console.log("  Admin - username: admin, password: admin123");
    console.log("  User  - username: user, password: user123");
    
    process.exit(0);
  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  }
}

migrate();