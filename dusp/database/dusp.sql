CREATE DATABASE IF NOT EXISTS dusp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dusp_db;

CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','lecturer','admin') NOT NULL,
  department_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE students (
  id INT PRIMARY KEY,
  matric_no VARCHAR(30) UNIQUE,
  level VARCHAR(20),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE lecturers (
  id INT PRIMARY KEY,
  staff_no VARCHAR(30) UNIQUE,
  rank_title VARCHAR(50),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(120) NOT NULL,
  unit INT NOT NULL,
  department_id INT,
  lecturer_id INT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_reg (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  approved TINYINT(1) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_result (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','failed') DEFAULT 'pending',
  reference_no VARCHAR(60) UNIQUE,
  paid_at DATETIME NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO departments(name) VALUES ('Computer Science'), ('Business Administration');
INSERT INTO users(full_name,email,password_hash,role,department_id) VALUES
('Admin User','admin@dominion.edu', '$2y$10$YZnq97jU4nPxyFfM6zDh5.4HKWQxwwP0UWJ1zY6Wg5JK7paMjx42W','admin',1),
('Dr. Grace Obi','grace.obi@dominion.edu', '$2y$10$YZnq97jU4nPxyFfM6zDh5.4HKWQxwwP0UWJ1zY6Wg5JK7paMjx42W','lecturer',1),
('John Student','john.student@dominion.edu', '$2y$10$YZnq97jU4nPxyFfM6zDh5.4HKWQxwwP0UWJ1zY6Wg5JK7paMjx42W','student',1);
INSERT INTO students(id,matric_no,level) VALUES (3,'DU/CSC/24/001','200');
INSERT INTO lecturers(id,staff_no,rank_title) VALUES (2,'DU-STF-009','Senior Lecturer');
INSERT INTO courses(code,title,unit,department_id,lecturer_id) VALUES
('CSC401','Web Engineering',3,1,2),('CSC405','Database Systems',3,1,2);
