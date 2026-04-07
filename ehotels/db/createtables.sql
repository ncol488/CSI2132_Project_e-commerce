-- 1. Ensure the schema exists
CREATE SCHEMA IF NOT EXISTS ehotels;
SET search_path TO ehotels;

-- 2. HotelChain (The Grandparent)
CREATE TABLE ehotels.HotelChain (
    chainID INT PRIMARY KEY,
    chain_name VARCHAR(150) NOT NULL,
    central_office_address TEXT NOT NULL
);
    
-- 3. Role
CREATE TABLE ehotels.Role (
  role_name VARCHAR(50) PRIMARY KEY
);

-- 4. Amenity
CREATE TABLE ehotels.Amenity (
    amenityID INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 5. Hotel (Depends on HotelChain)
CREATE TABLE ehotels.Hotel (
    hotelID INT PRIMARY KEY,
    hotel_name VARCHAR(150) NOT NULL,
    street VARCHAR(150) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(30) NOT NULL,
    category INT NOT NULL CHECK (category BETWEEN 1 AND 5),
    chainID INT NOT NULL,
    FOREIGN KEY (chainID) REFERENCES ehotels.HotelChain(chainID)
);

-- 6. Customer
CREATE TABLE ehotels.Customer (
    customerID INT PRIMARY KEY,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    street VARCHAR(150) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(30) NOT NULL,
    id_type VARCHAR(30) NOT NULL
        CHECK (id_type IN ('SSN', 'SIN', 'DRIVING_LICENSE', 'PASSPORT')),
    id_value VARCHAR(150) NOT NULL,
    registration_date DATE NOT NULL
);

-- 7. Room (Depends on Hotel)
CREATE TABLE ehotels.Room (
    room_number INT NOT NULL,
    hotelID INT NOT NULL,
    price NUMERIC(15,2) NOT NULL CHECK (price > 0),
    capacity INT NOT NULL CHECK (capacity > 0),
    view_type VARCHAR(50) NOT NULL CHECK (view_type IN ('sea', 'mountain', 'none')),
    extendable BOOLEAN NOT NULL,
    problems_damages TEXT,
    PRIMARY KEY (room_number, hotelID),
    FOREIGN KEY (hotelID) REFERENCES ehotels.Hotel(hotelID)
);

-- 8. Employee (Depends on Hotel)
CREATE TABLE ehotels.Employee (
    employeeID INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    ssn_sin VARCHAR(30) NOT NULL UNIQUE,
    hotelID INT NOT NULL,
    FOREIGN KEY (hotelID) REFERENCES ehotels.Hotel(hotelID)
);

-- 9. Relationship Tables
CREATE TABLE ehotels.Chain_Email (
    chainID INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (chainID, email),
    FOREIGN KEY (chainID) REFERENCES ehotels.HotelChain(chainID)
);

CREATE TABLE ehotels.Chain_Phone (
    chainID INT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    PRIMARY KEY (chainID, phone_number),
    FOREIGN KEY (chainID) REFERENCES ehotels.HotelChain(chainID)
);

CREATE TABLE ehotels.Hotel_Email (
    hotelID INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (hotelID, email),
    FOREIGN KEY (hotelID) REFERENCES ehotels.Hotel(hotelID)
);

CREATE TABLE ehotels.Hotel_Phone (
    hotelID INT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    PRIMARY KEY (hotelID, phone_number),
    FOREIGN KEY (hotelID) REFERENCES ehotels.Hotel(hotelID)
);

CREATE TABLE ehotels.Employee_Role (
    employeeID INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (employeeID, role_name),
    FOREIGN KEY (employeeID) REFERENCES ehotels.Employee(employeeID),
    FOREIGN KEY (role_name) REFERENCES ehotels.Role(role_name)
);

CREATE TABLE ehotels.Room_Amenity (
    room_number INT NOT NULL,
    hotelID INT NOT NULL,
    amenityID INT NOT NULL,
    PRIMARY KEY (room_number, hotelID, amenityID),
    FOREIGN KEY (room_number, hotelID) REFERENCES ehotels.Room(room_number, hotelID),
    FOREIGN KEY (amenityID) REFERENCES ehotels.Amenity(amenityID)
);

-- 10. Booking
CREATE TABLE ehotels.Booking (
    bookingID INT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    customerID INT,
    room_number INT,
    hotelID INT,
    customer_name_snapshot VARCHAR(120) NOT NULL,
    customer_id_snapshot VARCHAR(80) NOT NULL,
    room_snapshot TEXT NOT NULL,
    hotel_snapshot TEXT NOT NULL,
    chain_name_snapshot VARCHAR(120) NOT NULL,
    CHECK (start_date < end_date),
    FOREIGN KEY (customerID) REFERENCES ehotels.Customer(customerID),
    FOREIGN KEY (room_number, hotelID) REFERENCES ehotels.Room(room_number, hotelID)
);

-- 11. Renting
CREATE TABLE ehotels.Renting (
    rentingID INT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    checkin_datetime TIMESTAMP NOT NULL,
    checkout_datetime TIMESTAMP,
    customerID INT,
    room_number INT,
    hotelID INT,
    employeeID INT,
    bookingID INT,
    customer_name_snapshot VARCHAR(120) NOT NULL,
    customer_id_snapshot VARCHAR(80) NOT NULL,
    room_snapshot TEXT NOT NULL,
    hotel_snapshot TEXT NOT NULL,
    chain_name_snapshot VARCHAR(120) NOT NULL,
    CHECK (start_date < end_date),
    CHECK (checkout_datetime IS NULL OR checkin_datetime < checkout_datetime),
    FOREIGN KEY (customerID) REFERENCES ehotels.Customer(customerID),
    FOREIGN KEY (room_number, hotelID) REFERENCES ehotels.Room(room_number, hotelID),
    FOREIGN KEY (employeeID) REFERENCES ehotels.Employee(employeeID),
    FOREIGN KEY (bookingID) REFERENCES ehotels.Booking(bookingID)
);

-- 12. Payment
CREATE TABLE ehotels.Payment (
    paymentID INT PRIMARY KEY,
    rentingID INT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    FOREIGN KEY (rentingID) REFERENCES ehotels.Renting(rentingID)
);