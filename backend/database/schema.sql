-- RideBazzar Database Schema

CREATE DATABASE IF NOT EXISTS ridebazzar;

USE ridebazzar;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(15),
    location VARCHAR(100),
    profile_picture VARCHAR(255),
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Cars table
CREATE TABLE cars (
    id INT PRIMARY KEY AUTO_INCREMENT,
    seller_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year YEAR NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    mileage INT,
    fuel_type ENUM(
        'Petrol',
        'Diesel',
        'Electric',
        'Hybrid',
        'CNG'
    ) NOT NULL,
    transmission ENUM('Manual', 'Automatic') NOT NULL,
    condition_status ENUM(
        'Excellent',
        'Good',
        'Fair',
        'Poor'
    ) NOT NULL,
    color VARCHAR(30),
    description TEXT,
    images JSON,
    contact VARCHAR(15),
    location VARCHAR(100),
    booking_amount DECIMAL(10, 2) DEFAULT 0,
    emi_amount DECIMAL(10, 2) DEFAULT 0,
    status ENUM('available', 'booked', 'sold') DEFAULT 'available',
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_seller (seller_id),
    INDEX idx_make_model (make, model),
    INDEX idx_price (price),
    INDEX idx_status (status),
    INDEX idx_location (location)
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    car_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    booking_amount DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'cancelled',
        'completed'
    ) DEFAULT 'pending',
    payment_status ENUM(
        'unpaid',
        'paid',
        'refunded'
    ) DEFAULT 'unpaid',
    inspection_date DATE,
    buyer_info JSON,
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_car (car_id),
    INDEX idx_status (status)
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM(
        'card',
        'upi',
        'netbanking',
        'wallet'
    ) NOT NULL,
    payment_status ENUM(
        'pending',
        'success',
        'failed',
        'refunded'
    ) DEFAULT 'pending',
    payment_gateway_response JSON,
    transaction_type ENUM(
        'booking',
        'payment',
        'refund'
    ) DEFAULT 'booking',
    emi_enabled BOOLEAN DEFAULT FALSE,
    emi_details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_user (user_id),
    INDEX idx_status (payment_status)
);

-- Inquiries table (for car inquiries/leads)
CREATE TABLE inquiries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    car_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    message TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    response TEXT,
    status ENUM('pending', 'responded', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_car (car_id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_seller (seller_id),
    INDEX idx_status (status)
);

-- Messages table (for future use)
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    car_id INT,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE SET NULL,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_car (car_id)
);

-- User stats view
CREATE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    COUNT(DISTINCT c.id) as cars_posted,
    COUNT(
        DISTINCT CASE
            WHEN c.status = 'sold' THEN c.id
        END
    ) as cars_sold,
    COUNT(DISTINCT b.id) as bookings_made,
    AVG(
        CASE
            WHEN c.status = 'sold' THEN c.price
        END
    ) as avg_selling_price
FROM users u
    LEFT JOIN cars c ON u.id = c.seller_id
    LEFT JOIN bookings b ON u.id = b.buyer_id
GROUP BY
    u.id,
    u.username;

-- Insert sample data
INSERT INTO
    users (
        username,
        email,
        password,
        full_name,
        phone,
        location
    )
VALUES (
        'admin',
        'admin@ridebazzar.com',
        '$2a$10$example_hashed_password',
        'Admin User',
        '9999999999',
        'Mumbai'
    ),
    (
        'john_doe',
        'john@example.com',
        '$2a$10$example_hashed_password',
        'John Doe',
        '9876543210',
        'Delhi'
    ),
    (
        'jane_smith',
        'jane@example.com',
        '$2a$10$example_hashed_password',
        'Jane Smith',
        '9876543211',
        'Bangalore'
    );

-- Sample cars data
INSERT INTO
    cars (
        seller_id,
        make,
        model,
        year,
        price,
        mileage,
        fuel_type,
        transmission,
        condition_status,
        color,
        description,
        location
    )
VALUES (
        2,
        'Maruti Suzuki',
        'Swift',
        2020,
        650000,
        15000,
        'Petrol',
        'Manual',
        'Excellent',
        'Red',
        'Well maintained car with complete service history',
        'Delhi'
    ),
    (
        2,
        'Hyundai',
        'i20',
        2021,
        750000,
        8000,
        'Petrol',
        'Automatic',
        'Excellent',
        'White',
        'Single owner, barely used',
        'Delhi'
    ),
    (
        3,
        'Tata',
        'Nexon',
        2022,
        1200000,
        5000,
        'Electric',
        'Automatic',
        'Excellent',
        'Blue',
        'Electric vehicle in pristine condition',
        'Bangalore'
    );