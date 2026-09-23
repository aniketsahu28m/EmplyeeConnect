CREATE DATABASE IF NOT EXISTS ems_db;
USE ems_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Manager', 'Employee') NOT NULL DEFAULT 'Employee',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Employee table
CREATE TABLE IF NOT EXISTS employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    salary DECIMAL(12,2),
    date_of_joining DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Office table
CREATE TABLE IF NOT EXISTS office (
    office_id INT AUTO_INCREMENT PRIMARY KEY,
    office_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(150),
    address VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(150),
    address VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    task_name VARCHAR(150) NOT NULL,
    description TEXT,
    deadline DATE,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    assigned_to INT,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Leave') DEFAULT 'Present',
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    salary_month VARCHAR(10) NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    deductions DECIMAL(12,2) DEFAULT 0.00,
    payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    description TEXT,
    team_lead_id INT,
    FOREIGN KEY (team_lead_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    team_member_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    employee_id INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id),
    UNIQUE KEY unique_team_member (team_id, employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Shared Files table
CREATE TABLE IF NOT EXISTS shared_files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    description TEXT,
    uploaded_by INT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES employee(employee_id),
    FOREIGN KEY (receiver_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- File Sharing Permissions table
CREATE TABLE IF NOT EXISTS file_permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    team_id INT,
    employee_id INT,
    permission_type ENUM('View', 'Edit', 'Admin') DEFAULT 'View',
    FOREIGN KEY (file_id) REFERENCES shared_files(file_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Task Comments table
CREATE TABLE IF NOT EXISTS task_comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    employee_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Project Reports table
CREATE TABLE IF NOT EXISTS project_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (created_by) REFERENCES employee(employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('Admin', 'Manager', 'Employee') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 