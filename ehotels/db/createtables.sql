SET search_path TO ehotels;

SHOW search_path;

-- NOTE: tables have been altered, to change add:

ALTER TABLE HotelChain ADD COLUMN chain_name VARCHAR(150);
ALTER TABLE Hotel ADD COLUMN hotel_name VARCHAR(150);
ALTER TABLE Customer ADD COLUMN email VARCHAR(150);
ALTER TABLE Employee ADD COLUMN email VARCHAR(150);

ALTER TABLE HotelChain ALTER COLUMN chain_name SET NOT NULL;
ALTER TABLE Hotel ALTER COLUMN hotel_name SET NOT NULL;

-- to check
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'HotelChain';

SELECT * FROM Hotel;

-- HotelChain first, must keep in mind order of creation so that each table is created only after everything it depends on exists 

CREATE TABLE HotelChain (
    chainID INT PRIMARY KEY,
    central_office_address TEXT NOT NULL
);
    
-- Role, since the Employee Role depends on Role, Role must exist first.

CREATE TABLE Role (
	role_name VARCHAR(50) PRIMARY KEY
);

-- Amenity

CREATE TABLE Amenity (
    amenityID INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Hotel

CREATE TABLE Hotel (
    hotelID INT PRIMARY KEY,
    street VARCHAR(150) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(30) NOT NULL,
    category INT NOT NULL CHECK (category BETWEEN 1 AND 5),
    chainID INT NOT NULL,
    FOREIGN KEY (chainID) REFERENCES HotelChain(chainID)
);

-- Customer

CREATE TABLE Customer (
    customerID INT PRIMARY KEY,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    street VARCHAR(150) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(30) NOT NULL,
    id_type VARCHAR(30) NOT NULL
        CHECK (id_type IN ('SSN', 'SIN', 'DRIVING_LICENSE', 'PASSPORT')),
    id_value VARCHAR(150) NOT NULL,
    registration_date DATE NOT NULL
);

-- Room

CREATE TABLE Room (
    room_number INT NOT NULL,
    hotelID INT NOT NULL,
    price NUMERIC(15,2) NOT NULL CHECK (price > 0),
    capacity INT NOT NULL CHECK (capacity > 0),
    view_type VARCHAR(50) NOT NULL CHECK (view_type IN ('sea', 'mountain', 'none')),
    extendable BOOLEAN NOT NULL,
    problems_damages TEXT,
    PRIMARY KEY (room_number, hotelID),
    FOREIGN KEY (hotelID) REFERENCES Hotel(hotelID)
);

-- EMployee

CREATE TABLE Employee (
    employeeID INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    street VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    ssn_sin VARCHAR(30) NOT NULL UNIQUE,
    hotelID INT NOT NULL,
    FOREIGN KEY (hotelID) REFERENCES Hotel(hotelID)
);

-- chain email

CREATE TABLE Chain_Email (
    chainID INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (chainID, email),
    FOREIGN KEY (chainID) REFERENCES HotelChain(chainID)
);

-- chain phone

CREATE TABLE Chain_Phone (
    chainID INT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    PRIMARY KEY (chainID, phone_number),
    FOREIGN KEY (chainID) REFERENCES HotelChain(chainID)
);

-- hotel email

CREATE TABLE Hotel_Email (
    hotelID INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    PRIMARY KEY (hotelID, email),
    FOREIGN KEY (hotelID) REFERENCES Hotel(hotelID)
);

-- hotel phone

CREATE TABLE Hotel_Phone (
    hotelID INT NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    PRIMARY KEY (hotelID, phone_number),
    FOREIGN KEY (hotelID) REFERENCES Hotel(hotelID)
);

-- employee role

CREATE TABLE Employee_Role (
    employeeID INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (employeeID, role_name),
    FOREIGN KEY (employeeID) REFERENCES Employee(employeeID),
    FOREIGN KEY (role_name) REFERENCES Role(role_name)
);

-- room amenity

CREATE TABLE Room_Amenity (
    room_number INT NOT NULL,
    hotelID INT NOT NULL,
    amenityID INT NOT NULL,
    PRIMARY KEY (room_number, hotelID, amenityID),
    FOREIGN KEY (room_number, hotelID) REFERENCES Room(room_number, hotelID),
    FOREIGN KEY (amenityID) REFERENCES Amenity(amenityID)
);

-- booking

CREATE TABLE Booking (
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
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (room_number, hotelID) REFERENCES Room(room_number, hotelID)
);


-- renting (last because it depends on Customer, Room, Employee, and optionally Booking)

CREATE TABLE Renting (
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
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (room_number, hotelID) REFERENCES Room(room_number, hotelID),
    FOREIGN KEY (employeeID) REFERENCES Employee(employeeID),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID)
);


-- NEW ADDED TABLE to be able to SAVE payment records + associate it to a renting!!

CREATE TABLE Payment (
    paymentID INT PRIMARY KEY,
    rentingID INT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    FOREIGN KEY (rentingID) REFERENCES Renting(rentingID)
);
