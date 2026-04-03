SET search_path TO ehotels;

-- HotelChain
INSERT INTO HotelChain (chainID, central_office_address)
VALUES
(1, '62 Elm Street, Vancouver, BC, V5K 8P5');

-- Role
INSERT INTO Role (role_name)
VALUES
('Manager'),
('Receptionist'),
('Clerk');


-- Amenity
INSERT INTO Amenity (amenityID, name)
VALUES
(1, 'TV'),
(2, 'WiFi'),
(3, 'Air Conditioning'),
(4, 'Fridge');


-- Hotel
INSERT INTO Hotel (hotelID, street, city, province, postal_code, category, chainID)
VALUES
(1, '200 Wellington St', 'Ottawa', 'ON', 'K1A0A1', 4, 1);


-- Customer
INSERT INTO Customer (
    customerID, first_name, last_name, street, city, province, postal_code,
    id_type, id_value, registration_date
)
VALUES
(1, 'Hannah', 'Smith', '12 Rideau St', 'Ottawa', 'ON', 'K1N5X8',
 'SIN', '123456789', '2026-03-20');


-- Room
INSERT INTO Room (
    room_number, hotelID, price, capacity, view_type, extendable, problems_damages
)
VALUES
(101, 1, 149.99, 1, 'none', FALSE, NULL),
(102, 1, 189.99, 2, 'mountain', TRUE, NULL);


-- Employee
INSERT INTO Employee (
    employeeID, first_name, last_name, street, city, province, postal_code, ssn_sin, hotelID
)
VALUES
(1, 'Alice', 'Brown', '55 Elgin St', 'Ottawa', 'ON', 'K2P1L5', 'EMP10001', 1);


-- Chain_Email
INSERT INTO Chain_Email (chainID, email)
VALUES
(1, 'info@stargoldhotels.com');

-- Chain_Phone
INSERT INTO Chain_Phone (chainID, phone_number)
VALUES
(1, '613-555-1000');

-- Hotel_Email
INSERT INTO Hotel_Email (hotelID, email)
VALUES
(1, 'ottawa@stargoldhotels.com');

-- Hotel_Phone
INSERT INTO Hotel_Phone (hotelID, phone_number)
VALUES
(1, '613-555-2000');

-- Employee_Role
INSERT INTO Employee_Role (employeeID, role_name)
VALUES
(1, 'Manager');

-- Room_Amenity
INSERT INTO Room_Amenity (room_number, hotelID, amenityID)
VALUES
(101, 1, 1),
(101, 1, 2),
(102, 1, 1),
(102, 1, 2),
(102, 1, 3),
(102, 1, 4);


-- Booking
INSERT INTO Booking (
    bookingID, start_date, end_date, status, customerID, room_number, hotelID,
    customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot
)
VALUES
(1, '2026-04-10', '2026-04-14', 'confirmed',
 1, 102, 1,
 'Hannah Smith',
 'SIN: 123456789',
 'Room 102, capacity 2, mountain view, extendable',
 '200 Wellington St, Ottawa, ON, K1A0A1, category 4',
 'Star Gold Hotels');


-- Renting
INSERT INTO Renting (
    rentingID, start_date, end_date, checkin_datetime, checkout_datetime,
    customerID, room_number, hotelID, employeeID, bookingID,
    customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot
)
VALUES
(1, '2026-04-10', '2026-04-14',
 '2026-04-10 15:00:00', NULL,
 1, 102, 1, 1, 1,
 'Hannah Smith',
 'SIN: 123456789',
 'Room 102, capacity 2, mountain view, extendable',
 '200 Wellington St, Ottawa, ON, K1A0A1, category 4',
 'Star Gold Hotels');

SELECT * FROM Booking;
SELECT * FROM Renting;
