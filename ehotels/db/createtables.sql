SET search_path TO ehotels;

-- 1. RESET
TRUNCATE TABLE HotelChain, Role, Amenity, Customer, Hotel, Room, Employee
  RESTART IDENTITY CASCADE;

-- 2. Roles (must exist before Employee_Role)
INSERT INTO Role (role_name) VALUES
  ('Manager'),
  ('Receptionist'),
  ('Housekeeper');

-- 3. Amenities (must exist before Room_Amenity)
INSERT INTO Amenity (amenityID, name) VALUES
  (1, 'TV'),
  (2, 'Air Conditioning'),
  (3, 'Fridge'),
  (4, 'WiFi');

-- 4. Hotel Chain
INSERT INTO HotelChain (chainID, chain_name, central_office_address)
VALUES (1, 'Star Gold Hotels', '62 Elm Street, Vancouver, BC, V5K 8P5');

-- 5. Hotel
INSERT INTO Hotel (hotelID, hotel_name, street, city, province, postal_code, category, chainID)
VALUES (1, 'Star Gold Ottawa Central', '200 Wellington St', 'Ottawa', 'ON', 'K1A0A1', 4, 1);

-- 6. Customers (id_type + id_value now included)
INSERT INTO Customer (
  customerID, first_name, last_name, street, city, province, postal_code,
  registration_date, email, id_type, id_value
)
VALUES
  (101, 'Hannah', 'Smith', '12 Rideau St', 'Ottawa', 'ON', 'K1N5X8',
   '2026-03-20', 'hannah@smith.com', 'SIN', 'SIN-101-HANNAH'),
  (102, 'Customer', 'Dummy', '123 Fake St', 'Ottawa', 'ON', 'K1P5M7',
   '2026-04-02', 'customer@customer.com', 'SIN', 'SIN-102-DUMMY');

-- 7. Employee
INSERT INTO Employee (
  employeeID, first_name, last_name, street, city, province,
  postal_code, ssn_sin, hotelID, email
)
VALUES
  (1, 'Alice', 'Brown', '55 Elgin St', 'Ottawa', 'ON',
   'K2P1L5', 'EMP-001', 1, 'alice@restly.com');

-- 8. Rooms
INSERT INTO Room (room_number, hotelID, price, capacity, view_type, extendable, problems_damages)
VALUES
  (101, 1, 149.99, 1, 'none',     FALSE, NULL),
  (102, 1, 189.99, 2, 'mountain', TRUE,  NULL);

-- 9. Relationship tables
INSERT INTO Chain_Email  (chainID, email)        VALUES (1, 'info@stargoldhotels.com');
INSERT INTO Chain_Phone  (chainID, phone_number) VALUES (1, '613-555-1000');
INSERT INTO Hotel_Email  (hotelID, email)        VALUES (1, 'ottawa@stargoldhotels.com');
INSERT INTO Hotel_Phone  (hotelID, phone_number) VALUES (1, '613-555-2000');

-- 10. Employee Role (Role 'Manager' must already exist — inserted in step 2)
INSERT INTO Employee_Role (employeeID, role_name) VALUES (1, 'Manager');

-- 11. Room Amenities (Amenities 1-4 must already exist — inserted in step 3)
INSERT INTO Room_Amenity (room_number, hotelID, amenityID)
VALUES
  (101, 1, 1), (101, 1, 2),
  (102, 1, 1), (102, 1, 2), (102, 1, 3), (102, 1, 4);

-- 12. Booking
INSERT INTO Booking (
  bookingID, start_date, end_date, status,
  customerID, room_number, hotelID,
  customer_name_snapshot, customer_id_snapshot,
  room_snapshot, hotel_snapshot, chain_name_snapshot
)
VALUES (
  1, '2026-04-10', '2026-04-14', 'confirmed',
  101, 102, 1,
  'Hannah Smith',
  'SIN: SIN-101-HANNAH',
  'Room 102, capacity 2, mountain view, extendable',
  '200 Wellington St, Ottawa, ON, K1A0A1, category 4',
  'Star Gold Hotels'
);

-- 13. Renting
INSERT INTO Renting (
  rentingID, start_date, end_date,
  checkin_datetime, checkout_datetime,
  customerID, room_number, hotelID, employeeID, bookingID,
  customer_name_snapshot, customer_id_snapshot,
  room_snapshot, hotel_snapshot, chain_name_snapshot
)
VALUES (
  1, '2026-04-10', '2026-04-14',
  '2026-04-10 15:00:00', NULL,
  101, 102, 1, 1, 1,
  'Hannah Smith',
  'SIN: SIN-101-HANNAH',
  'Room 102, capacity 2, mountain view, extendable',
  '200 Wellington St, Ottawa, ON, K1A0A1, category 4',
  'Star Gold Hotels'
);

-- Verify
SELECT * FROM Booking;
SELECT * FROM Renting;