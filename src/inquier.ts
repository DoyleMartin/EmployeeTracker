import inquirer from "inquirer"; 
import { pool } from "./connection.js";


function mainMenu() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update an employee role",
                "Exit"
            ]
        }
    ]).then((answers) => {
        switch (answers.action) {
            case "View all departments":
                viewDepartments();
                break;
            case "View all roles":
                viewRoles();
                break;
            case "View all employees":
                viewEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateEmployeeRole();
                break;
            case "Exit":
                process.exit();
        }
    });
    
    async function viewDepartments() {
        const result = await pool.query('SELECT * FROM department') 
        console.table(result.rows);
        mainMenu();
    }

    async function viewRoles() {
        const result = await pool.query('SELECT * FROM role') 
        console.table(result.rows);
        mainMenu();
    }

    async function viewEmployees() {
        const result = await pool.query('SELECT * FROM employee JOIN role ON employee.role_id = role.id') 
        console.table(result.rows);
        mainMenu();
    }

    async function addDepartment() {
        const { departmentName } = await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'Enter the name of the new department:',
            },
        ]);

        try {
            await pool.query('INSERT INTO department (name) VALUES ($1)', [departmentName]);
            console.log('Department added successfully');
        } catch (err) {
            if ((err as any).code === '23505') { // Unique violation error code
                console.error('Error: A department with this name already exists.');
            } else {
                console.error('Error adding department:', err);
            }
        }

        mainMenu();
    }

    async function addRole() {
        // Fetch the list of departments from the database
        const departmentsResult = await pool.query('SELECT id, name FROM department');
        const departments = departmentsResult.rows;

        // Map the departments to a format suitable for inquirer choices
        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id
        }));

        const { title, salary, departmentId } = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Enter the title of the new role:',
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter the salary for the new role:',
            },
            {
                type: 'list',
                name: 'departmentId',
                message: 'Select the department for the new role:',
                choices: departmentChoices,
            },
        ]);

        try {
            await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
            console.log('Role added successfully');
        } catch (err) {
            console.error('Error adding role:', err);
        }

        mainMenu();
    }

    async function addEmployee() {
        // Fetch the list of roles from the database
        const rolesResult = await pool.query('SELECT id, title FROM role');
        const roles = rolesResult.rows;

        // Fetch the list of employees to use as managers from the database
        const managersResult = await pool.query('SELECT id, first_name, last_name FROM employee');
        const managers = managersResult.rows;

        // Map the roles to a format suitable for inquirer choices
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));

        // Map the managers to a format suitable for inquirer choices
        const managerChoices = managers.map(manager => ({
            name: `${manager.first_name} ${manager.last_name}`,
            value: manager.id
        }));

        // Add an option for no manager
        managerChoices.unshift({ name: 'None', value: null });

        const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter the first name of the new employee:',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter the last name of the new employee:',
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the role for the new employee:',
                choices: roleChoices,
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Select the manager for the new employee (if any):',
                choices: managerChoices,
            },
        ]);

        try {
            await pool.query(
                'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
                [firstName, lastName, roleId, managerId]
            );
            console.log('Employee added successfully');
        } catch (err) {
            console.error('Error adding employee:', err);
        }

        mainMenu();
    }

    async function updateEmployeeRole() {
        // Fetch the list of employees from the database
        const employeesResult = await pool.query('SELECT id, first_name, last_name FROM employee');
        const employees = employeesResult.rows;

        // Fetch the list of roles from the database
        const rolesResult = await pool.query('SELECT id, title FROM role');
        const roles = rolesResult.rows;

        // Map the employees to a format suitable for inquirer choices
        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        // Map the roles to a format suitable for inquirer choices
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id
        }));

        const { employeeId, newRoleId } = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee whose role you want to update:',
                choices: employeeChoices,
            },
            {
                type: 'list',
                name: 'newRoleId',
                message: 'Select the new role for the employee:',
                choices: roleChoices,
            },
        ]);

        console.log(`Updating employee ID ${employeeId} to new role ID ${newRoleId}`);

        try {
            const result = await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, employeeId]);
            if (result.rowCount === 0) {
                console.log('No employee found with the given ID.');
            } else {
                console.log('Employee role updated successfully');
            }
        } catch (err) {
            console.error('Error updating employee role:', err);
        }

        mainMenu();
    }
}    



mainMenu();