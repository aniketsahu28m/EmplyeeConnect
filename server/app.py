from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'ems_db'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM Users WHERE email = %s AND password = %s"
        cursor.execute(query, (email, password))
        user = cursor.fetchone()
        
        if user:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['user_id'],
                    'email': user['email'],
                    'role': user['role'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name']
                }
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Get total employees
        cursor.execute("SELECT COUNT(*) as total FROM Employee")
        total_employees = cursor.fetchone()['total']
        
        # Get total projects
        cursor.execute("SELECT COUNT(*) as total FROM Projects")
        total_projects = cursor.fetchone()['total']
        
        # Get total tasks
        cursor.execute("SELECT COUNT(*) as total FROM Tasks")
        total_tasks = cursor.fetchone()['total']
        
        # Get pending tasks
        cursor.execute("SELECT COUNT(*) as total FROM Tasks WHERE status = 'Pending'")
        pending_tasks = cursor.fetchone()['total']
        
        return jsonify({
            'total_employees': total_employees,
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'pending_tasks': pending_tasks
        })
        
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Employee CRUD endpoints
@app.route('/api/employees', methods=['GET'])
def get_employees():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT e.*, u.first_name, u.last_name, u.email
            FROM Employee e
            JOIN Users u ON e.user_id = u.user_id
        """
        cursor.execute(query)   
        employees = cursor.fetchall()
        return jsonify(employees)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/employees', methods=['POST'])
def create_employee():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()

        # First create the user
        user_query = """
            INSERT INTO Users (first_name, last_name, email, password, role)
            VALUES (%s, %s, %s, %s, 'Employee')
        """
        cursor.execute(user_query, (
            data['first_name'],
            data['last_name'],
            data['email'],
            data['password']
        ))
        user_id = cursor.lastrowid

        # Then create the employee
        employee_query = """
            INSERT INTO Employee (user_id, department, designation, salary, date_of_joining)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(employee_query, (
            user_id,
            data['department'],
            data['designation'],
            data['salary'],
            data['date_of_joining']
        ))
        
        conn.commit()
        return jsonify({'message': 'Employee created successfully', 'id': user_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()

        # Get the user_id for this employee
        cursor.execute("SELECT user_id FROM Employee WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Employee not found'}), 404
        
        user_id = result[0]

        # Update the user information
        user_query = """
            UPDATE Users
            SET first_name = %s, last_name = %s, email = %s
            WHERE user_id = %s
        """
        cursor.execute(user_query, (
            data['first_name'],
            data['last_name'],
            data['email'],
            user_id
        ))

        # Update the employee information
        employee_query = """
            UPDATE Employee
            SET department = %s, designation = %s, salary = %s, date_of_joining = %s
            WHERE employee_id = %s
        """
        cursor.execute(employee_query, (
            data['department'],
            data['designation'],
            data['salary'],
            data['date_of_joining'],
            employee_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Employee updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()

        # Get the user_id for this employee
        cursor.execute("SELECT user_id FROM Employee WHERE employee_id = %s", (employee_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Employee not found'}), 404
        
        user_id = result[0]

        # Delete the employee (this will cascade delete the user due to ON DELETE CASCADE)
        cursor.execute("DELETE FROM Employee WHERE employee_id = %s", (employee_id,))
        
        conn.commit()
        return jsonify({'message': 'Employee deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Attendance endpoints
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT a.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                   e.department,
                   e.designation
            FROM attendance a
            JOIN employee e ON a.employee_id = e.employee_id
            JOIN users u ON e.user_id = u.user_id
            ORDER BY a.date DESC
        """
        cursor.execute(query)
        attendance = cursor.fetchall()
        return jsonify(attendance)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/attendance', methods=['POST'])
def create_attendance():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['employee_id', 'date', 'status']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Validate status
        valid_statuses = ['Present', 'Absent', 'Late', 'Leave']
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400

        cursor = conn.cursor()
        
        # Check if attendance record already exists for this employee and date
        cursor.execute(
            "SELECT attendance_id FROM attendance WHERE employee_id = %s AND date = %s",
            (data['employee_id'], data['date'])
        )
        if cursor.fetchone():
            return jsonify({'error': 'Attendance record already exists for this date'}), 400

        # Insert the attendance record
        query = """
            INSERT INTO attendance (employee_id, date, status)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (
            data['employee_id'],
            data['date'],
            data['status']
        ))
        
        attendance_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Attendance record created successfully', 'id': attendance_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/attendance/<int:attendance_id>', methods=['PUT'])
def update_attendance(attendance_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if attendance record exists
        cursor.execute("SELECT * FROM attendance WHERE attendance_id = %s", (attendance_id,))
        attendance = cursor.fetchone()
        if not attendance:
            return jsonify({'error': 'Attendance record not found'}), 404

        # Validate status if provided
        if 'status' in data:
            valid_statuses = ['Present', 'Absent', 'Late', 'Leave']
            if data['status'] not in valid_statuses:
                return jsonify({'error': 'Invalid status'}), 400

        # Update the attendance record
        query = """
            UPDATE attendance
            SET status = %s
            WHERE attendance_id = %s
        """
        cursor.execute(query, (
            data['status'],
            attendance_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Attendance record updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/attendance/<int:attendance_id>', methods=['DELETE'])
def delete_attendance(attendance_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if attendance record exists
        cursor.execute("SELECT attendance_id FROM attendance WHERE attendance_id = %s", (attendance_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Attendance record not found'}), 404

        cursor.execute("DELETE FROM attendance WHERE attendance_id = %s", (attendance_id,))
        conn.commit()
        return jsonify({'message': 'Attendance record deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Clients endpoints
@app.route('/api/clients', methods=['GET'])
def get_clients():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM clients ORDER BY company_name"
        cursor.execute(query)
        clients = cursor.fetchall()
        return jsonify(clients)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/clients', methods=['POST'])
def create_client():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'company_name', 'address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        cursor = conn.cursor()
        
        # Insert the client
        query = """
            INSERT INTO clients (name, email, phone, company_name, address)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['name'].strip(),
            data['email'].strip(),
            data['phone'].strip(),
            data['company_name'].strip(),
            data['address'].strip()
        ))
        
        client_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Client created successfully', 'id': client_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if client exists
        cursor.execute("SELECT * FROM clients WHERE client_id = %s", (client_id,))
        client = cursor.fetchone()
        if not client:
            return jsonify({'error': 'Client not found'}), 404

        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'company_name', 'address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Update the client
        query = """
            UPDATE clients
            SET name = %s, email = %s, phone = %s, company_name = %s, address = %s
            WHERE client_id = %s
        """
        cursor.execute(query, (
            data['name'].strip(),
            data['email'].strip(),
            data['phone'].strip(),
            data['company_name'].strip(),
            data['address'].strip(),
            client_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Client updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if client exists
        cursor.execute("SELECT client_id FROM clients WHERE client_id = %s", (client_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Client not found'}), 404

        cursor.execute("DELETE FROM clients WHERE client_id = %s", (client_id,))
        conn.commit()
        return jsonify({'message': 'Client deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Office endpoints
@app.route('/api/offices', methods=['GET'])
def get_offices():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT o.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as manager_name
            FROM office o
            LEFT JOIN employee e ON o.manager_id = e.employee_id
            LEFT JOIN users u ON e.user_id = u.user_id
            ORDER BY o.office_name
        """
        cursor.execute(query)
        offices = cursor.fetchall()
        return jsonify(offices)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/offices', methods=['POST'])
def create_office():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['office_name', 'location']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        cursor = conn.cursor()
        
        # Insert the office
        query = """
            INSERT INTO office (office_name, location, manager_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (
            data['office_name'].strip(),
            data['location'].strip(),
            data.get('manager_id')  # Optional field
        ))
        
        office_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Office created successfully', 'id': office_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/offices/<int:office_id>', methods=['PUT'])
def update_office(office_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if office exists
        cursor.execute("SELECT * FROM office WHERE office_id = %s", (office_id,))
        office = cursor.fetchone()
        if not office:
            return jsonify({'error': 'Office not found'}), 404

        # Validate required fields
        required_fields = ['office_name', 'location']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Update the office
        query = """
            UPDATE office
            SET office_name = %s, location = %s, manager_id = %s
            WHERE office_id = %s
        """
        cursor.execute(query, (
            data['office_name'].strip(),
            data['location'].strip(),
            data.get('manager_id'),  # Optional field
            office_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Office updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/offices/<int:office_id>', methods=['DELETE'])
def delete_office(office_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if office exists
        cursor.execute("SELECT office_id FROM office WHERE office_id = %s", (office_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Office not found'}), 404

        cursor.execute("DELETE FROM office WHERE office_id = %s", (office_id,))
        conn.commit()
        return jsonify({'message': 'Office deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Payroll endpoints
@app.route('/api/payroll', methods=['GET'])
def get_payroll():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT p.*, 
                   CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                   e.department,
                   e.designation
            FROM payroll p
            JOIN employee e ON p.employee_id = e.employee_id
            JOIN users u ON e.user_id = u.user_id
            ORDER BY p.salary_month DESC
        """
        cursor.execute(query)
        payroll = cursor.fetchall()
        return jsonify(payroll)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/payroll', methods=['POST'])
def create_payroll():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['employee_id', 'salary_month', 'basic_salary']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        cursor = conn.cursor()
        
        # Check if payroll record already exists for this employee and month
        cursor.execute(
            "SELECT payroll_id FROM payroll WHERE employee_id = %s AND salary_month = %s",
            (data['employee_id'], data['salary_month'])
        )
        if cursor.fetchone():
            return jsonify({'error': 'Payroll record already exists for this month'}), 400

        # Insert the payroll record
        query = """
            INSERT INTO payroll (employee_id, salary_month, basic_salary, deductions, payment_status)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['employee_id'],
            data['salary_month'],
            data['basic_salary'],
            data.get('deductions', 0.00),
            data.get('payment_status', 'Pending')
        ))
        
        payroll_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Payroll record created successfully', 'id': payroll_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/payroll/<int:payroll_id>', methods=['PUT'])
def update_payroll(payroll_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if payroll record exists
        cursor.execute("SELECT * FROM payroll WHERE payroll_id = %s", (payroll_id,))
        payroll = cursor.fetchone()
        if not payroll:
            return jsonify({'error': 'Payroll record not found'}), 404

        # Update the payroll record
        query = """
            UPDATE payroll
            SET basic_salary = %s, deductions = %s, payment_status = %s
            WHERE payroll_id = %s
        """
        cursor.execute(query, (
            data['basic_salary'],
            data.get('deductions', 0.00),
            data.get('payment_status', 'Pending'),
            payroll_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Payroll record updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/payroll/<int:payroll_id>', methods=['DELETE'])
def delete_payroll(payroll_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if payroll record exists
        cursor.execute("SELECT payroll_id FROM payroll WHERE payroll_id = %s", (payroll_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Payroll record not found'}), 404

        cursor.execute("DELETE FROM payroll WHERE payroll_id = %s", (payroll_id,))
        conn.commit()
        return jsonify({'message': 'Payroll record deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Projects endpoints
@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT p.*, CONCAT(u.first_name, ' ', u.last_name) as manager_name
            FROM projects p
            LEFT JOIN employee e ON p.manager_id = e.employee_id
            LEFT JOIN users u ON e.user_id = u.user_id
            ORDER BY p.start_date DESC
        """
        cursor.execute(query)
        projects = cursor.fetchall()
        return jsonify(projects)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/projects', methods=['POST'])
def create_project():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()
        
        # Insert the project
        query = """
            INSERT INTO projects (project_name, description, start_date, end_date, manager_id)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['project_name'],
            data['description'],
            data['start_date'],
            data['end_date'],
            data['manager_id']
        ))
        
        project_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Project created successfully', 'id': project_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()
        
        # Update the project
        query = """
            UPDATE projects
            SET project_name = %s, description = %s, start_date = %s, end_date = %s, manager_id = %s
            WHERE project_id = %s
        """
        cursor.execute(query, (
            data['project_name'],
            data['description'],
            data['start_date'],
            data['end_date'],
            data['manager_id'],
            project_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Project updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if there are any tasks associated with this project
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE project_id = %s", (project_id,))
        task_count = cursor.fetchone()[0]
        
        if task_count > 0:
            return jsonify({'error': 'Cannot delete project with associated tasks'}), 400
        
        cursor.execute("DELETE FROM projects WHERE project_id = %s", (project_id,))
        conn.commit()
        return jsonify({'message': 'Project deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/projects/manager/<int:employee_id>', methods=['GET'])
def get_manager_projects(employee_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT *
            FROM projects 
            WHERE manager_id = %s
            ORDER BY start_date DESC
        """
        cursor.execute(query, (employee_id,))
        projects = cursor.fetchall()
        return jsonify(projects)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Tasks endpoints
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT t.*, 
                   p.project_name,
                   u1.first_name as assigned_to_first_name,
                   u1.last_name as assigned_to_last_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.project_id
            JOIN employee e ON t.assigned_to = e.employee_id
            JOIN users u1 ON e.user_id = u1.user_id
            ORDER BY t.deadline ASC
        """
        cursor.execute(query)
        tasks = cursor.fetchall()
        return jsonify(tasks)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/tasks', methods=['POST'])
def create_task():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['project_id', 'task_name', 'deadline', 'status', 'priority', 'assigned_to']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Validate data types
        try:
            project_id = int(data['project_id'])
            assigned_to = int(data['assigned_to'])
        except ValueError:
            return jsonify({'error': 'Invalid project_id or assigned_to'}), 400

        cursor = conn.cursor()
        
        # Check if project exists
        cursor.execute("SELECT project_id FROM projects WHERE project_id = %s", (project_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Project does not exist'}), 400

        # Check if employee exists
        cursor.execute("SELECT employee_id FROM employee WHERE employee_id = %s", (assigned_to,))
        if not cursor.fetchone():
            return jsonify({'error': 'Employee does not exist'}), 400

        # Insert the task
        query = """
            INSERT INTO tasks (project_id, task_name, description, deadline, status, priority, assigned_to)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            project_id,
            data['task_name'].strip(),
            data.get('description', '').strip(),
            data['deadline'],
            data['status'],
            data['priority'],
            assigned_to
        ))
        
        task_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Task created successfully', 'id': task_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if task exists
        cursor.execute("SELECT * FROM tasks WHERE task_id = %s", (task_id,))
        task = cursor.fetchone()
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        # First check if this is just a status update (employee role)
        if len(data.keys()) == 1 and 'status' in data:
            # This is a status-only update, likely from an employee
            query = """
                UPDATE tasks
                SET status = %s
                WHERE task_id = %s
            """
            cursor.execute(query, (
                data['status'],
                task_id
            ))
            
            conn.commit()
            return jsonify({'message': 'Task status updated successfully'})
        else:
            # Validate required fields for full update
            required_fields = ['project_id', 'task_name', 'deadline', 'status', 'priority', 'assigned_to']
            for field in required_fields:
                if field not in data or not data[field]:
                    return jsonify({'error': f'{field} is required'}), 400

            # Validate data types
            try:
                project_id = int(data['project_id'])
                assigned_to = int(data['assigned_to'])
            except ValueError:
                return jsonify({'error': 'Invalid project_id or assigned_to'}), 400

            # Check if project exists
            cursor.execute("SELECT project_id FROM projects WHERE project_id = %s", (project_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'Project does not exist'}), 400

            # Check if employee exists
            cursor.execute("SELECT employee_id FROM employee WHERE employee_id = %s", (assigned_to,))
            if not cursor.fetchone():
                return jsonify({'error': 'Employee does not exist'}), 400

            # This is a full update (admin or manager)
            query = """
                UPDATE tasks
                SET project_id = %s, task_name = %s, description = %s, 
                    deadline = %s, status = %s, priority = %s, assigned_to = %s
                WHERE task_id = %s
            """
            cursor.execute(query, (
                project_id,
                data['task_name'].strip(),
                data.get('description', '').strip(),
                data['deadline'],
                data['status'],
                data['priority'],
                assigned_to,
                task_id
            ))
            
            conn.commit()
            return jsonify({'message': 'Task updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if task exists
        cursor.execute("SELECT task_id FROM tasks WHERE task_id = %s", (task_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Task not found'}), 404

        cursor.execute("DELETE FROM tasks WHERE task_id = %s", (task_id,))
        conn.commit()
        return jsonify({'message': 'Task deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/tasks/employee/<int:employee_id>', methods=['GET'])
def get_employee_tasks(employee_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT t.*, p.project_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.project_id
            WHERE t.assigned_to = %s
            ORDER BY t.deadline ASC
        """
        cursor.execute(query, (employee_id,))
        tasks = cursor.fetchall()
        return jsonify(tasks)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# User Roles endpoints
@app.route('/api/user-roles', methods=['GET'])
def get_user_roles():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT ur.*, u.first_name, u.last_name, u.email
            FROM user_roles ur
            JOIN users u ON ur.user_id = u.user_id
            ORDER BY ur.role_id
        """
        cursor.execute(query)
        user_roles = cursor.fetchall()
        return jsonify(user_roles)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/user-roles', methods=['POST'])
def create_user_role():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['user_id', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Validate role
        valid_roles = ['Admin', 'Manager', 'Employee']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400

        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (data['user_id'],))
        if not cursor.fetchone():
            return jsonify({'error': 'User does not exist'}), 400

        # Check if user already has a role
        cursor.execute("SELECT role_id FROM user_roles WHERE user_id = %s", (data['user_id'],))
        if cursor.fetchone():
            return jsonify({'error': 'User already has a role assigned'}), 400

        # Insert the user role
        query = """
            INSERT INTO user_roles (user_id, role)
            VALUES (%s, %s)
        """
        cursor.execute(query, (
            data['user_id'],
            data['role']
        ))
        
        role_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'User role created successfully', 'id': role_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/user-roles/<int:role_id>', methods=['PUT'])
def update_user_role(role_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if role exists
        cursor.execute("SELECT * FROM user_roles WHERE role_id = %s", (role_id,))
        role = cursor.fetchone()
        if not role:
            return jsonify({'error': 'Role not found'}), 404

        # Validate role
        valid_roles = ['Admin', 'Manager', 'Employee']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400

        # Update the role
        query = """
            UPDATE user_roles
            SET role = %s
            WHERE role_id = %s
        """
        cursor.execute(query, (
            data['role'],
            role_id
        ))
        
        conn.commit()
        return jsonify({'message': 'User role updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/user-roles/<int:role_id>', methods=['DELETE'])
def delete_user_role(role_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if role exists
        cursor.execute("SELECT role_id FROM user_roles WHERE role_id = %s", (role_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Role not found'}), 404

        cursor.execute("DELETE FROM user_roles WHERE role_id = %s", (role_id,))
        conn.commit()
        return jsonify({'message': 'User role deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Vendors endpoints
@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM vendors ORDER BY company_name"
        cursor.execute(query)
        vendors = cursor.fetchall()
        return jsonify(vendors)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/vendors', methods=['POST'])
def create_vendor():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'company_name', 'address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        cursor = conn.cursor()
        
        # Insert the vendor
        query = """
            INSERT INTO vendors (name, email, phone, company_name, address)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['name'].strip(),
            data['email'].strip(),
            data['phone'].strip(),
            data['company_name'].strip(),
            data['address'].strip()
        ))
        
        vendor_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Vendor created successfully', 'id': vendor_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/vendors/<int:vendor_id>', methods=['PUT'])
def update_vendor(vendor_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        cursor = conn.cursor(dictionary=True)
        
        # Check if vendor exists
        cursor.execute("SELECT * FROM vendors WHERE vendor_id = %s", (vendor_id,))
        vendor = cursor.fetchone()
        if not vendor:
            return jsonify({'error': 'Vendor not found'}), 404

        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'company_name', 'address']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Update the vendor
        query = """
            UPDATE vendors
            SET name = %s, email = %s, phone = %s, company_name = %s, address = %s
            WHERE vendor_id = %s
        """
        cursor.execute(query, (
            data['name'].strip(),
            data['email'].strip(),
            data['phone'].strip(),
            data['company_name'].strip(),
            data['address'].strip(),
            vendor_id
        ))
        
        conn.commit()
        return jsonify({'message': 'Vendor updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/vendors/<int:vendor_id>', methods=['DELETE'])
def delete_vendor(vendor_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Check if vendor exists
        cursor.execute("SELECT vendor_id FROM vendors WHERE vendor_id = %s", (vendor_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Vendor not found'}), 404

        cursor.execute("DELETE FROM vendors WHERE vendor_id = %s", (vendor_id,))
        conn.commit()
        return jsonify({'message': 'Vendor deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Team Collaboration endpoints
@app.route('/api/messages', methods=['GET'])
def get_messages():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        sender_id = request.args.get('sender_id')
        receiver_id = request.args.get('receiver_id')
        
        cursor = conn.cursor(dictionary=True)
        
        # If both sender and receiver are provided, get their conversation
        if sender_id and receiver_id:
            query = """
                SELECT m.*, 
                    s.first_name as sender_first_name, s.last_name as sender_last_name,
                    r.first_name as receiver_first_name, r.last_name as receiver_last_name
                FROM messages m
                JOIN employee se ON m.sender_id = se.employee_id
                JOIN users s ON se.user_id = s.user_id
                JOIN employee re ON m.receiver_id = re.employee_id
                JOIN users r ON re.user_id = r.user_id
                WHERE (m.sender_id = %s AND m.receiver_id = %s)
                   OR (m.sender_id = %s AND m.receiver_id = %s)
                ORDER BY m.timestamp ASC
            """
            cursor.execute(query, (sender_id, receiver_id, receiver_id, sender_id))
        # If only sender is provided, get all their sent messages
        elif sender_id:
            query = """
                SELECT m.*, 
                    s.first_name as sender_first_name, s.last_name as sender_last_name,
                    r.first_name as receiver_first_name, r.last_name as receiver_last_name
                FROM messages m
                JOIN employee se ON m.sender_id = se.employee_id
                JOIN users s ON se.user_id = s.user_id
                JOIN employee re ON m.receiver_id = re.employee_id
                JOIN users r ON re.user_id = r.user_id
                WHERE m.sender_id = %s
                ORDER BY m.timestamp DESC
            """
            cursor.execute(query, (sender_id,))
        # If only receiver is provided, get all their received messages
        elif receiver_id:
            query = """
                SELECT m.*, 
                    s.first_name as sender_first_name, s.last_name as sender_last_name,
                    r.first_name as receiver_first_name, r.last_name as receiver_last_name
                FROM messages m
                JOIN employee se ON m.sender_id = se.employee_id
                JOIN users s ON se.user_id = s.user_id
                JOIN employee re ON m.receiver_id = re.employee_id
                JOIN users r ON re.user_id = r.user_id
                WHERE m.receiver_id = %s
                ORDER BY m.timestamp DESC
            """
            cursor.execute(query, (receiver_id,))
        # If neither are provided, return recent messages (e.g., for admin)
        else:
            query = """
                SELECT m.*, 
                    s.first_name as sender_first_name, s.last_name as sender_last_name,
                    r.first_name as receiver_first_name, r.last_name as receiver_last_name
                FROM messages m
                JOIN employee se ON m.sender_id = se.employee_id
                JOIN users s ON se.user_id = s.user_id
                JOIN employee re ON m.receiver_id = re.employee_id
                JOIN users r ON re.user_id = r.user_id
                ORDER BY m.timestamp DESC
                LIMIT 100
            """
            cursor.execute(query)
            
        messages = cursor.fetchall()
        return jsonify(messages)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/messages', methods=['POST'])
def send_message():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO messages (sender_id, receiver_id, message, timestamp)
            VALUES (%s, %s, %s, NOW())
        """
        cursor.execute(query, (
            data['sender_id'],
            data['receiver_id'],
            data['message']
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Message sent successfully', 'id': message_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/teams', methods=['GET'])
def get_teams():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT t.*, CONCAT(u.first_name, ' ', u.last_name) as team_lead_name
            FROM teams t
            LEFT JOIN employee e ON t.team_lead_id = e.employee_id
            LEFT JOIN users u ON e.user_id = u.user_id
            ORDER BY t.team_name
        """
        cursor.execute(query)
        teams = cursor.fetchall()
        return jsonify(teams)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/teams', methods=['POST'])
def create_team():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO teams (team_name, description, team_lead_id)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (
            data['team_name'],
            data['description'],
            data['team_lead_id']
        ))
        
        team_id = cursor.lastrowid
        
        # If members are provided, add them to the team
        if 'members' in data and data['members']:
            for member_id in data['members']:
                query = """
                    INSERT INTO team_members (team_id, employee_id)
                    VALUES (%s, %s)
                """
                cursor.execute(query, (team_id, member_id))
        
        conn.commit()
        return jsonify({'message': 'Team created successfully', 'id': team_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/shared_files', methods=['GET'])
def get_shared_files():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT sf.*, CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
            FROM shared_files sf
            JOIN employee e ON sf.uploaded_by = e.employee_id
            JOIN users u ON e.user_id = u.user_id
            ORDER BY sf.uploaded_at DESC
        """
        cursor.execute(query)
        files = cursor.fetchall()
        return jsonify(files)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/shared_files', methods=['POST'])
def upload_file():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO shared_files (file_name, file_url, file_type, description, uploaded_by, uploaded_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(query, (
            data['file_name'],
            data['file_url'],
            data['file_type'],
            data['description'],
            data['uploaded_by']
        ))
        
        file_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'File uploaded successfully', 'id': file_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/tasks/<int:task_id>/verify-assignment/<int:employee_id>', methods=['GET'])
def verify_task_assignment(task_id, employee_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Check if the task is assigned to this employee
        query = """
            SELECT COUNT(*) as assigned
            FROM tasks
            WHERE task_id = %s AND assigned_to = %s
        """
        cursor.execute(query, (task_id, employee_id))
        result = cursor.fetchone()
        
        if result and result['assigned'] > 0:
            return jsonify({'assigned': True})
        else:
            return jsonify({'assigned': False}), 403
            
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/user/employee-id', methods=['GET'])
def get_employee_id_for_user():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Get the user ID from the request
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        cursor = conn.cursor(dictionary=True)
        
        # Get the employee ID for this user
        query = """
            SELECT employee_id
            FROM employee
            WHERE user_id = %s
        """
        cursor.execute(query, (user_id,))
        employee = cursor.fetchone()
        
        if employee:
            return jsonify({'employee_id': employee['employee_id']})
        else:
            return jsonify({'error': 'Employee not found for this user'}), 404
            
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

# Users endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT user_id, first_name, last_name, email FROM users ORDER BY first_name, last_name"
        cursor.execute(query)
        users = cursor.fetchall()
        return jsonify(users)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

@app.route('/api/signup', methods=['POST'])
def signup():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400

        # Validate role
        valid_roles = ['Employee', 'Manager']
        if data['role'] not in valid_roles:
            return jsonify({'error': 'Invalid role'}), 400

        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            return jsonify({'error': 'Email already exists'}), 400

        # Insert the user
        query = """
            INSERT INTO users (first_name, last_name, email, password, role)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            data['first_name'].strip(),
            data['last_name'].strip(),
            data['email'].strip(),
            data['password'],
            data['role']
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'User created successfully', 'id': user_id})
    except Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn.is_connected():
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            conn.close()

if __name__ == '__main__':
    app.run(debug=True) 
