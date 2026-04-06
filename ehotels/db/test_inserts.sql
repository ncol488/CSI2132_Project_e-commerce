SET search_path TO ehotels;

-- 1. RESET
TRUNCATE TABLE HotelChain, Role, Amenity, Customer, Hotel, Room, Employee
  RESTART IDENTITY CASCADE;

-- 2. Hotel Chain & Hotel
INSERT INTO HotelChain (chainID, chain_name, central_office_address)
VALUES (1, 'Star Gold Hotels', '62 Elm Street, Vancouver, BC, V5K 8P5');

INSERT INTO Hotel (hotelID, hotel_name, street, city, province, postal_code, category, chainID)
VALUES (1, 'Star Gold Ottawa Central', '200 Wellington St', 'Ottawa', 'ON', 'K1A0A1', 4, 1);

-- 3. Customers
INSERT INTO Customer (customerID, first_name, last_name, street, city, province, postal_code, registration_date, email)
VALUES
  (101, 'Hannah', 'Smith', '12 Rideau St', 'Ottawa', 'ON', 'K1N5X8', '2026-03-20', 'hannah@smith.com'),
  (102, 'Customer', 'Dummy', '123 Fake St', 'Ottawa', 'ON', 'K1P5M7', '2026-04-02', 'customer@customer.com');

-- 4. Employees
INSERT INTO Employee (employeeID, first_name, last_name, street, city, province, postal_code, ssn_sin, hotelID, email)
VALUES
  (1, 'Alice', 'Brown', '55 Elgin St', 'Ottawa', 'ON', 'K2P1L5', 'EMP-001', 1, 'alice@restly.com');

-- 5. Room
INSERT INTO Room (room_number, hotelID, price, capacity, view_type, extendable, problems_damages)
VALUES
  (101, 1, 149.99, 1, 'none', FALSE, NULL),
  (102, 1, 189.99, 2, 'mountain', TRUE, NULL);

-- 6. Relationship Tables
INSERT INTO Chain_Email (chainID, email) VALUES (1, 'info@stargoldhotels.com');
INSERT INTO Chain_Phone (chainID, phone_number) VALUES (1, '613-555-1000');
INSERT INTO Hotel_Email (hotelID, email) VALUES (1, 'ottawa@stargoldhotels.com');
INSERT INTO Hotel_Phone (hotelID, phone_number) VALUES (1, '613-555-2000');
INSERT INTO Employee_Role (employeeID, role_name) VALUES (1, 'Manager');

-- 7. Room Amenities
INSERT INTO Room_Amenity (room_number, hotelID, amenityID)
VALUES (101, 1, 1), (101, 1, 2), (102, 1, 1), (102, 1, 2), (102, 1, 3), (102, 1, 4);

-- 8. Booking
INSERT INTO Booking (
  bookingID, start_date, end_date, status, customerID, room_number, hotelID,
  customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot
)
VALUES (
  1, '2026-04-10', '2026-04-14', 'confirmed', 101, 102, 1,
  'Hannah Smith',
  'Login: hannah@restly.com',
  'Room 102, capacity 2, mountain view, extendable',
  '200 Wellington St, Ottawa, ON, K1A0A1, category 4',
  'Star Gold Hotels'
);

-- 9. Renting
INSERT INTO Renting (
  rentingID, start_date, end_date, checkin_datetime, checkout_datetime,
  customerID, room_number, hotelID, employeeID, bookingID,
  customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot
)
VALUES (
  1, '2026-04-10', '2026-04-14', '2026-04-10 15:00:00', NULL,
  101, 102, 1, 1, 1,
  'Hannah Smith',
  'Login: hannah@restly.com',
  'Room 102, capacity 2, mountain view, extendable',
  '200 Wellington St, Ottawa, ON, K1A0A1, category 4',
  'Star Gold Hotels'
);

SELECT * FROM Booking;
SELECT * FROM Renting;
