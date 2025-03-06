/c employee_db;

INSERT INTO department (name) VALUES
    ('Engineering'),
    ('Sales'),
    ('Marketing'),
    ('Finance'),
    ('Human Resources');

INSERT INTO role (title, salary, department_id) VALUES
    ('Software Engineer', 100000, 1),
    ('Salesperson', 80000, 2),
    ('Marketing Manager', 120000, 3),
    ('Accountant', 90000, 4),
    ('HR Manager', 110000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('Alice', 'Smith', 1, NULL),
    ('Bob', 'Jones', 2, 1),
    ('Charlie', 'Brown', 3, 1),
    ('David', 'White', 4, 1),
    ('Eve', 'Black', 5, 1);