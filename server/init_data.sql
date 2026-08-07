-- Create default users
INSERT INTO users (first_name, last_name, email, password, role) VALUES 
('Admin', 'User', 'admin@example.com', 'admin123', 'Admin'),
('Manager', 'User', 'manager@example.com', 'manager123', 'Manager'),
('Employee', 'User', 'employee@example.com', 'employee123', 'Employee');

-- Create employee records for the users
INSERT INTO employee (user_id, department, designation, salary, date_of_joining) VALUES 
(2, 'Management', 'Project Manager', 85000.00, '2022-01-15'),
(3, 'Development', 'Software Developer', 65000.00, '2022-02-20');

-- Add a default office
INSERT INTO office (office_name, location, manager_id) VALUES 
('Main Office', '123 Business Ave, New York, NY 10001', 1);

-- Add a default project
INSERT INTO projects (project_name, description, start_date, end_date, manager_id) VALUES 
('Website Redesign', 'Redesign the company website with modern UI/UX', '2023-01-01', '2023-06-30', 1);

-- Add a default task
INSERT INTO tasks (project_id, task_name, description, deadline, status, priority, assigned_to) VALUES 
(1, 'Homepage Design', 'Create new homepage mockups', '2023-02-15', 'Completed', 'High', 2);

-- Add a default client
INSERT INTO clients (name, email, phone, company_name, address) VALUES 
('John Smith', 'john@clientcompany.com', '555-123-4567', 'Client Company Inc.', '456 Client St, Boston, MA 02101');

-- Add a default vendor
INSERT INTO vendors (name, email, phone, company_name, address) VALUES 
('Jane Doe', 'jane@vendorcompany.com', '555-987-6543', 'Vendor Supplies Ltd.', '789 Vendor Ave, Chicago, IL 60601');

-- Add attendance records
INSERT INTO attendance (employee_id, date, status) VALUES 
(2, CURDATE(), 'Present'),
(1, CURDATE(), 'Present');

-- Add payroll records
INSERT INTO payroll (employee_id, salary_month, basic_salary, deductions) VALUES 
(2, CONCAT(YEAR(CURDATE()),'-',MONTH(CURDATE())), 7083.33, 1000.00),
(1, CONCAT(YEAR(CURDATE()),'-',MONTH(CURDATE())), 5416.67, 800.00);

-- Create default teams
INSERT INTO teams (team_name, description, team_lead_id) VALUES 
('Development Team', 'Software development team', 1);

-- Add team members
INSERT INTO team_members (team_id, employee_id) VALUES 
(1, 2);

-- Add sample shared files
INSERT INTO shared_files (file_name, file_url, file_type, description, uploaded_by) VALUES 
('Project Plan', 'https://example.com/files/project-plan.pdf', 'PDF', 'Website redesign project plan', 1);

-- Add sample messages
INSERT INTO messages (sender_id, receiver_id, message, timestamp) VALUES 
(1, 2, 'Hello, I need the project report by tomorrow.', NOW()); 