SET search_path TO ehotels;


-- to delete everything, use:

DELETE FROM Renting;
DELETE FROM Booking;
DELETE FROM Room_Amenity;
DELETE FROM Employee_Role;
DELETE FROM Hotel_Phone;
DELETE FROM Hotel_Email;
DELETE FROM Chain_Phone;
DELETE FROM Chain_Email;
DELETE FROM Employee;
DELETE FROM Room;
DELETE FROM Customer;
DELETE FROM Hotel;
DELETE FROM Amenity;
DELETE FROM Role;
DELETE FROM HotelChain;

-- data:

-- HOTEL CHAINS
-- Need 5 hotel chains:

INSERT INTO HotelChain (chainID, chain_name, central_office_address) VALUES
(1, 'Star Gold Hotels', '62 Elm Street, Vancouver, BC, V5K 8P5'),
(2, 'North Stay', '200 Burrard St, Vancouver, BC, V6C 3L6'),
(3, 'Maple Lux', '300 René-Lévesque Blvd, Montreal, QC, H2Z 1A4'),
(4, 'Aurora Hotels', '400 7 Ave SW, Calgary, AB, T2P 0X8'),
(5, 'Urban Peak', '100 King St W, Toronto, ON, M5X 1A9');

-- roles

INSERT INTO Role (role_name) VALUES
('Manager'),
('Receptionist'),
('Clerk'),
('Housekeeping'),
('Maintenance');

-- amenities

INSERT INTO Amenity (amenityID, name) VALUES
(1, 'TV'),
(2, 'WiFi'),
(3, 'Air Conditioning'),
(4, 'Fridge'),
(5, 'Balcony'),
(6, 'Microwave'),
(7, 'Coffee Machine'),
(8, 'Desk');

-- hotels
-- need at least 8 hotels per chain (which belong to at least 3 categories), and 5 chains

INSERT INTO Hotel (hotelID, hotel_name, street, city, province, postal_code, category, chainID) VALUES
-- Chain 1
(1, 'Star Gold Ottawa Central', '101 Wellington St', 'Ottawa', 'ON', 'K1A0A1', 3, 1),
(2, 'Star Gold Byward Market', '102 Rideau St', 'Ottawa', 'ON', 'K1N5X8', 4, 1),
(3, 'Star Gold Toronto Yorkville', '103 Bloor St', 'Toronto', 'ON', 'M4W1A8', 5, 1),
(4, 'Star Gold Vancouver Harbor', '104 Robson St', 'Vancouver', 'BC', 'V6E1B2', 4, 1),
(5, 'Star Gold Montreal Downtown', '105 Sainte-Catherine St', 'Montreal', 'QC', 'H3B1A7', 3, 1),
(6, 'Star Gold Edmonton Square', '106 Jasper Ave', 'Edmonton', 'AB', 'T5J1N9', 2, 1),
(7, 'Star Gold Halifax Atlantic', '107 Spring Garden Rd', 'Halifax', 'NS', 'B3J1X5', 4, 1),
(8, 'Star Gold Winnipeg Forks', '108 Portage Ave', 'Winnipeg', 'MB', 'R3B2B3', 3, 1),

-- Chain 2: North Stay
(9, 'North Stay Parliament', '201 Sparks St', 'Ottawa', 'ON', 'K1P5A5', 5, 2),
(10, 'North Stay Eaton Centre', '202 Yonge St', 'Toronto', 'ON', 'M5B1M4', 4, 2),
(11, 'North Stay English Bay', '203 Granville St', 'Vancouver', 'BC', 'V6C1S4', 3, 2),
(12, 'North Stay Old Montreal', '204 Sherbrooke St', 'Montreal', 'QC', 'H3A2R7', 4, 2),
(13, 'North Stay Calgary Tower', '205 8 Ave SW', 'Calgary', 'AB', 'T2P1G1', 3, 2),
(14, 'North Stay Strathcona', '206 Whyte Ave', 'Edmonton', 'AB', 'T6E1Y6', 2, 2),
(15, 'North Stay Point Pleasant', '207 Barrington St', 'Halifax', 'NS', 'B3J1Z6', 4, 2),
(16, 'North Stay Exchange District', '208 Main St', 'Winnipeg', 'MB', 'R3C1A3', 5, 2),

-- Chain 3: Maple Lux
(17, 'Maple Lux Rockcliffe', '301 St Laurent Blvd', 'Ottawa', 'ON', 'K1K3B8', 3, 3),
(18, 'Maple Lux Beechwood', '302 St Laurent Blvd', 'Ottawa', 'ON', 'K1K3B9', 4, 3),
(19, 'Maple Lux City Hall', '303 Queen St', 'Toronto', 'ON', 'M5H2N2', 5, 3),
(20, 'Maple Lux Waterfront', '304 Granville St', 'Vancouver', 'BC', 'V6C1T2', 4, 3),
(21, 'Maple Lux Plateau', '305 Sherbrooke St', 'Montreal', 'QC', 'H3A2R5', 3, 3),
(22, 'Maple Lux River Valley', '306 Jasper Ave', 'Edmonton', 'AB', 'T5J1N8', 2, 3),
(23, 'Maple Lux Public Gardens', '307 Spring Garden Rd', 'Halifax', 'NS', 'B3J1Y6', 4, 3),
(24, 'Maple Lux Assiniboine', '308 Portage Ave', 'Winnipeg', 'MB', 'R3B2B2', 3, 3),

-- Chain 4: Aurora Hotels
(25, 'Aurora Ottawa Glebe', '401 Bank St', 'Ottawa', 'ON', 'K2P1Y3', 5, 4),
(26, 'Aurora Ottawa Centretown', '402 Bank St', 'Ottawa', 'ON', 'K2P1Y4', 4, 4),
(27, 'Aurora Toronto Distillery', '403 Yonge St', 'Toronto', 'ON', 'M5B1S1', 3, 4),
(28, 'Aurora Vancouver Stanley', '404 Robson St', 'Vancouver', 'BC', 'V6E1B5', 4, 4),
(29, 'Aurora Montreal Mile End', '405 Sainte-Catherine St', 'Montreal', 'QC', 'H3B1A9', 3, 4),
(30, 'Aurora Calgary Stephen Ave', '406 8 Ave SW', 'Calgary', 'AB', 'T2P1G2', 2, 4),
(31, 'Aurora Halifax Seaport', '407 Barrington St', 'Halifax', 'NS', 'B3J1Z5', 4, 4),
(32, 'Aurora Winnipeg North', '408 Main St', 'Winnipeg', 'MB', 'R3C1A4', 5, 4),

-- Chain 5: Urban Peak
(33, 'Urban Peak Sandy Hill', '501 King St', 'Ottawa', 'ON', 'K1N5T5', 3, 5),
(34, 'Urban Peak Lower Town', '502 King St', 'Ottawa', 'ON', 'K1N5T6', 4, 5),
(35, 'Urban Peak Financial Dist', '503 Bloor St', 'Toronto', 'ON', 'M4W1A9', 5, 5),
(36, 'Urban Peak Coal Harbor', '504 Howe St', 'Vancouver', 'BC', 'V6C2X2', 4, 5),
(37, 'Urban Peak Mount Royal', '505 Sherbrooke St', 'Montreal', 'QC', 'H3A2R8', 3, 5),
(38, 'Urban Peak Ice District', '506 Jasper Ave', 'Edmonton', 'AB', 'T5J1N7', 2, 5),
(39, 'Urban Peak Citadel Hill', '507 Spring Garden Rd', 'Halifax', 'NS', 'B3J1X7', 4, 5),
(40, 'Urban Peak St. Boniface', '508 Portage Ave', 'Winnipeg', 'MB', 'R3B2B1', 3, 5);

-- rooms, at least 5 rooms of different capacity

INSERT INTO Room (
    room_number, hotelID, price, capacity, view_type, extendable, problems_damages
) VALUES
-- Hotel 1
(101, 1, 119.99, 1, 'none', FALSE, NULL),
(102, 1, 149.99, 2, 'mountain', TRUE, NULL),
(103, 1, 189.99, 3, 'none', TRUE, NULL),
(104, 1, 209.99, 4, 'sea', FALSE, NULL),
(105, 1, 259.99, 5, 'mountain', TRUE, 'Lamp needs replacement'),

-- Hotel 2
(201, 2, 129.99, 1, 'none', FALSE, NULL),
(202, 2, 159.99, 2, 'mountain', TRUE, NULL),
(203, 2, 199.99, 3, 'sea', TRUE, NULL),
(204, 2, 229.99, 4, 'none', FALSE, NULL),
(205, 2, 279.99, 5, 'mountain', TRUE, NULL),

-- Hotel 3
(301, 3, 199.99, 1, 'none', FALSE, NULL),
(302, 3, 249.99, 2, 'sea', TRUE, NULL),
(303, 3, 299.99, 3, 'mountain', TRUE, NULL),
(304, 3, 349.99, 4, 'sea', FALSE, NULL),
(305, 3, 399.99, 5, 'mountain', TRUE, NULL),

-- Hotel 4
(401, 4, 169.99, 1, 'none', FALSE, NULL),
(402, 4, 219.99, 2, 'mountain', TRUE, NULL),
(403, 4, 269.99, 3, 'sea', TRUE, NULL),
(404, 4, 319.99, 4, 'mountain', FALSE, NULL),
(405, 4, 369.99, 5, 'sea', TRUE, NULL),

-- Hotel 5
(501, 5, 139.99, 1, 'none', FALSE, NULL),
(502, 5, 169.99, 2, 'mountain', TRUE, NULL),
(503, 5, 209.99, 3, 'sea', TRUE, NULL),
(504, 5, 249.99, 4, 'none', FALSE, NULL),
(505, 5, 289.99, 5, 'mountain', TRUE, NULL),

-- Hotel 6
(601, 6, 109.99, 1, 'none', FALSE, NULL),
(602, 6, 139.99, 2, 'mountain', TRUE, NULL),
(603, 6, 179.99, 3, 'sea', TRUE, NULL),
(604, 6, 219.99, 4, 'none', FALSE, NULL),
(605, 6, 259.99, 5, 'mountain', TRUE, 'Minor carpet stain'),

-- Hotel 7
(701, 7, 149.99, 1, 'none', FALSE, NULL),
(702, 7, 179.99, 2, 'mountain', TRUE, NULL),
(703, 7, 219.99, 3, 'sea', TRUE, NULL),
(704, 7, 259.99, 4, 'none', FALSE, NULL),
(705, 7, 299.99, 5, 'mountain', TRUE, NULL),

-- Hotel 8
(801, 8, 129.99, 1, 'none', FALSE, NULL),
(802, 8, 159.99, 2, 'mountain', TRUE, NULL),
(803, 8, 199.99, 3, 'sea', TRUE, NULL),
(804, 8, 239.99, 4, 'none', FALSE, NULL),
(805, 8, 279.99, 5, 'mountain', TRUE, NULL),

-- Hotel 9
(901, 9, 199.99, 1, 'none', FALSE, NULL),
(902, 9, 239.99, 2, 'mountain', TRUE, NULL),
(903, 9, 279.99, 3, 'sea', TRUE, NULL),
(904, 9, 329.99, 4, 'none', FALSE, NULL),
(905, 9, 389.99, 5, 'mountain', TRUE, NULL),

-- Hotel 10
(1001, 10, 169.99, 1, 'none', FALSE, NULL),
(1002, 10, 209.99, 2, 'mountain', TRUE, NULL),
(1003, 10, 249.99, 3, 'sea', TRUE, NULL),
(1004, 10, 299.99, 4, 'none', FALSE, NULL),
(1005, 10, 349.99, 5, 'mountain', TRUE, NULL),

-- Hotel 11
(1101, 11, 149.99, 1, 'none', FALSE, NULL),
(1102, 11, 189.99, 2, 'mountain', TRUE, NULL),
(1103, 11, 229.99, 3, 'sea', TRUE, NULL),
(1104, 11, 269.99, 4, 'none', FALSE, NULL),
(1105, 11, 319.99, 5, 'mountain', TRUE, NULL),

-- Hotel 12
(1201, 12, 159.99, 1, 'none', FALSE, NULL),
(1202, 12, 199.99, 2, 'mountain', TRUE, NULL),
(1203, 12, 239.99, 3, 'sea', TRUE, NULL),
(1204, 12, 289.99, 4, 'none', FALSE, NULL),
(1205, 12, 339.99, 5, 'mountain', TRUE, NULL),

-- Hotel 13
(1301, 13, 139.99, 1, 'none', FALSE, NULL),
(1302, 13, 179.99, 2, 'mountain', TRUE, NULL),
(1303, 13, 219.99, 3, 'sea', TRUE, NULL),
(1304, 13, 259.99, 4, 'none', FALSE, NULL),
(1305, 13, 309.99, 5, 'mountain', TRUE, NULL),

-- Hotel 14
(1401, 14, 119.99, 1, 'none', FALSE, NULL),
(1402, 14, 159.99, 2, 'mountain', TRUE, NULL),
(1403, 14, 199.99, 3, 'sea', TRUE, NULL),
(1404, 14, 239.99, 4, 'none', FALSE, NULL),
(1405, 14, 289.99, 5, 'mountain', TRUE, NULL),

-- Hotel 15
(1501, 15, 149.99, 1, 'none', FALSE, NULL),
(1502, 15, 189.99, 2, 'mountain', TRUE, NULL),
(1503, 15, 229.99, 3, 'sea', TRUE, NULL),
(1504, 15, 279.99, 4, 'none', FALSE, NULL),
(1505, 15, 329.99, 5, 'mountain', TRUE, NULL),

-- Hotel 16
(1601, 16, 189.99, 1, 'none', FALSE, NULL),
(1602, 16, 229.99, 2, 'mountain', TRUE, NULL),
(1603, 16, 269.99, 3, 'sea', TRUE, NULL),
(1604, 16, 319.99, 4, 'none', FALSE, NULL),
(1605, 16, 369.99, 5, 'mountain', TRUE, NULL),

-- Hotel 17
(1701, 17, 129.99, 1, 'none', FALSE, NULL),
(1702, 17, 169.99, 2, 'mountain', TRUE, NULL),
(1703, 17, 209.99, 3, 'sea', TRUE, NULL),
(1704, 17, 249.99, 4, 'none', FALSE, NULL),
(1705, 17, 299.99, 5, 'mountain', TRUE, NULL),

-- Hotel 18
(1801, 18, 159.99, 1, 'none', FALSE, NULL),
(1802, 18, 199.99, 2, 'mountain', TRUE, NULL),
(1803, 18, 239.99, 3, 'sea', TRUE, NULL),
(1804, 18, 289.99, 4, 'none', FALSE, NULL),
(1805, 18, 339.99, 5, 'mountain', TRUE, NULL),

-- Hotel 19
(1901, 19, 209.99, 1, 'none', FALSE, NULL),
(1902, 19, 249.99, 2, 'mountain', TRUE, NULL),
(1903, 19, 299.99, 3, 'sea', TRUE, NULL),
(1904, 19, 349.99, 4, 'none', FALSE, NULL),
(1905, 19, 399.99, 5, 'mountain', TRUE, NULL),

-- Hotel 20
(2001, 20, 179.99, 1, 'none', FALSE, NULL),
(2002, 20, 219.99, 2, 'mountain', TRUE, NULL),
(2003, 20, 259.99, 3, 'sea', TRUE, NULL),
(2004, 20, 309.99, 4, 'none', FALSE, NULL),
(2005, 20, 359.99, 5, 'mountain', TRUE, NULL),

-- Hotel 21
(2101, 21, 139.99, 1, 'none', FALSE, NULL),
(2102, 21, 179.99, 2, 'mountain', TRUE, NULL),
(2103, 21, 219.99, 3, 'sea', TRUE, NULL),
(2104, 21, 269.99, 4, 'none', FALSE, NULL),
(2105, 21, 319.99, 5, 'mountain', TRUE, NULL),

-- Hotel 22
(2201, 22, 109.99, 1, 'none', FALSE, NULL),
(2202, 22, 149.99, 2, 'mountain', TRUE, NULL),
(2203, 22, 189.99, 3, 'sea', TRUE, NULL),
(2204, 22, 229.99, 4, 'none', FALSE, NULL),
(2205, 22, 279.99, 5, 'mountain', TRUE, NULL),

-- Hotel 23
(2301, 23, 149.99, 1, 'none', FALSE, NULL),
(2302, 23, 189.99, 2, 'mountain', TRUE, NULL),
(2303, 23, 229.99, 3, 'sea', TRUE, NULL),
(2304, 23, 279.99, 4, 'none', FALSE, NULL),
(2305, 23, 329.99, 5, 'mountain', TRUE, NULL),

-- Hotel 24
(2401, 24, 129.99, 1, 'none', FALSE, NULL),
(2402, 24, 169.99, 2, 'mountain', TRUE, NULL),
(2403, 24, 209.99, 3, 'sea', TRUE, NULL),
(2404, 24, 249.99, 4, 'none', FALSE, NULL),
(2405, 24, 299.99, 5, 'mountain', TRUE, NULL),

-- Hotel 25
(2501, 25, 229.99, 1, 'none', FALSE, NULL),
(2502, 25, 269.99, 2, 'mountain', TRUE, NULL),
(2503, 25, 319.99, 3, 'sea', TRUE, NULL),
(2504, 25, 379.99, 4, 'none', FALSE, NULL),
(2505, 25, 439.99, 5, 'mountain', TRUE, NULL),

-- Hotel 26
(2601, 26, 189.99, 1, 'none', FALSE, NULL),
(2602, 26, 229.99, 2, 'mountain', TRUE, NULL),
(2603, 26, 269.99, 3, 'sea', TRUE, NULL),
(2604, 26, 319.99, 4, 'none', FALSE, NULL),
(2605, 26, 369.99, 5, 'mountain', TRUE, NULL),

-- Hotel 27
(2701, 27, 149.99, 1, 'none', FALSE, NULL),
(2702, 27, 189.99, 2, 'mountain', TRUE, NULL),
(2703, 27, 229.99, 3, 'sea', TRUE, NULL),
(2704, 27, 269.99, 4, 'none', FALSE, NULL),
(2705, 27, 319.99, 5, 'mountain', TRUE, NULL),

-- Hotel 28
(2801, 28, 179.99, 1, 'none', FALSE, NULL),
(2802, 28, 219.99, 2, 'mountain', TRUE, NULL),
(2803, 28, 259.99, 3, 'sea', TRUE, NULL),
(2804, 28, 309.99, 4, 'none', FALSE, NULL),
(2805, 28, 359.99, 5, 'mountain', TRUE, NULL),

-- Hotel 29
(2901, 29, 139.99, 1, 'none', FALSE, NULL),
(2902, 29, 179.99, 2, 'mountain', TRUE, NULL),
(2903, 29, 219.99, 3, 'sea', TRUE, NULL),
(2904, 29, 259.99, 4, 'none', FALSE, NULL),
(2905, 29, 309.99, 5, 'mountain', TRUE, NULL),

-- Hotel 30
(3001, 30, 109.99, 1, 'none', FALSE, NULL),
(3002, 30, 149.99, 2, 'mountain', TRUE, NULL),
(3003, 30, 189.99, 3, 'sea', TRUE, NULL),
(3004, 30, 229.99, 4, 'none', FALSE, NULL),
(3005, 30, 279.99, 5, 'mountain', TRUE, NULL),

-- Hotel 31
(3101, 31, 149.99, 1, 'none', FALSE, NULL),
(3102, 31, 189.99, 2, 'mountain', TRUE, NULL),
(3103, 31, 229.99, 3, 'sea', TRUE, NULL),
(3104, 31, 279.99, 4, 'none', FALSE, NULL),
(3105, 31, 329.99, 5, 'mountain', TRUE, NULL),

-- Hotel 32
(3201, 32, 209.99, 1, 'none', FALSE, NULL),
(3202, 32, 249.99, 2, 'mountain', TRUE, NULL),
(3203, 32, 299.99, 3, 'sea', TRUE, NULL),
(3204, 32, 349.99, 4, 'none', FALSE, NULL),
(3205, 32, 399.99, 5, 'mountain', TRUE, NULL),

-- Hotel 33
(3301, 33, 139.99, 1, 'none', FALSE, NULL),
(3302, 33, 179.99, 2, 'mountain', TRUE, NULL),
(3303, 33, 219.99, 3, 'sea', TRUE, NULL),
(3304, 33, 259.99, 4, 'none', FALSE, NULL),
(3305, 33, 309.99, 5, 'mountain', TRUE, NULL),

-- Hotel 34
(3401, 34, 169.99, 1, 'none', FALSE, NULL),
(3402, 34, 209.99, 2, 'mountain', TRUE, NULL),
(3403, 34, 249.99, 3, 'sea', TRUE, NULL),
(3404, 34, 299.99, 4, 'none', FALSE, NULL),
(3405, 34, 349.99, 5, 'mountain', TRUE, NULL),

-- Hotel 35
(3501, 35, 219.99, 1, 'none', FALSE, NULL),
(3502, 35, 259.99, 2, 'mountain', TRUE, NULL),
(3503, 35, 309.99, 3, 'sea', TRUE, NULL),
(3504, 35, 359.99, 4, 'none', FALSE, NULL),
(3505, 35, 419.99, 5, 'mountain', TRUE, NULL),

-- Hotel 36
(3601, 36, 189.99, 1, 'none', FALSE, NULL),
(3602, 36, 229.99, 2, 'mountain', TRUE, NULL),
(3603, 36, 269.99, 3, 'sea', TRUE, NULL),
(3604, 36, 319.99, 4, 'none', FALSE, NULL),
(3605, 36, 369.99, 5, 'mountain', TRUE, NULL),

-- Hotel 37
(3701, 37, 139.99, 1, 'none', FALSE, NULL),
(3702, 37, 179.99, 2, 'mountain', TRUE, NULL),
(3703, 37, 219.99, 3, 'sea', TRUE, NULL),
(3704, 37, 259.99, 4, 'none', FALSE, NULL),
(3705, 37, 309.99, 5, 'mountain', TRUE, NULL),

-- Hotel 38
(3801, 38, 109.99, 1, 'none', FALSE, NULL),
(3802, 38, 149.99, 2, 'mountain', TRUE, NULL),
(3803, 38, 189.99, 3, 'sea', TRUE, NULL),
(3804, 38, 229.99, 4, 'none', FALSE, NULL),
(3805, 38, 279.99, 5, 'mountain', TRUE, NULL),

-- Hotel 39
(3901, 39, 149.99, 1, 'none', FALSE, NULL),
(3902, 39, 189.99, 2, 'mountain', TRUE, NULL),
(3903, 39, 229.99, 3, 'sea', TRUE, NULL),
(3904, 39, 279.99, 4, 'none', FALSE, NULL),
(3905, 39, 329.99, 5, 'mountain', TRUE, NULL),

-- Hotel 40
(4001, 40, 139.99, 1, 'none', FALSE, NULL),
(4002, 40, 179.99, 2, 'mountain', TRUE, NULL),
(4003, 40, 219.99, 3, 'sea', TRUE, NULL),
(4004, 40, 259.99, 4, 'none', FALSE, NULL),
(4005, 40, 309.99, 5, 'mountain', TRUE, NULL);


--test management page for employees

SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'ehotels'
  AND table_name = 'employee'
ORDER BY ordinal_position;


-- Employees for each hotel, at least one per each hotel is a manager

INSERT INTO Employee (
    employeeID, first_name, last_name, street, city, province, postal_code, ssn_sin, hotelID
) VALUES
-- Hotel 1
(1, 'Alice', 'Brown', '1 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A1A1', 'EMP10001', 1),
(2, 'David', 'Lee', '2 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A1A2', 'EMP10002', 1),
(3, 'Sarah', 'White', '3 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A1A3', 'EMP10003', 1),
(4, 'James', 'Scott', '4 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A1A4', 'EMP10004', 1),

-- Hotel 2
(5, 'Nora', 'Green', '5 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A2A1', 'EMP10005', 2),
(6, 'Lucas', 'Adams', '6 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A2A2', 'EMP10006', 2),
(7, 'Chloe', 'Young', '7 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A2A3', 'EMP10007', 2),
(8, 'Mason', 'King', '8 Hotel Staff Rd', 'Ottawa', 'ON', 'K1A2A4', 'EMP10008', 2),

-- Hotel 3
(9, 'Ethan', 'Wright', '9 Hotel Staff Rd', 'Toronto', 'ON', 'M5H1A1', 'EMP10009', 3),
(10, 'Sophia', 'Hill', '10 Hotel Staff Rd', 'Toronto', 'ON', 'M5H1A2', 'EMP10010', 3),
(11, 'Daniel', 'Scott', '11 Hotel Staff Rd', 'Toronto', 'ON', 'M5H1A3', 'EMP10011', 3),
(12, 'Ava', 'Green', '12 Hotel Staff Rd', 'Toronto', 'ON', 'M5H1A4', 'EMP10012', 3),

-- Hotel 4
(13, 'Logan', 'Adams', '13 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C1A1', 'EMP10013', 4),
(14, 'Mia', 'Baker', '14 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C1A2', 'EMP10014', 4),
(15, 'Noah', 'Nelson', '15 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C1A3', 'EMP10015', 4),
(16, 'Emma', 'Carter', '16 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C1A4', 'EMP10016', 4),

-- Hotel 5
(17, 'James', 'Mitchell', '17 Hotel Staff Rd', 'Montreal', 'QC', 'H3A1A1', 'EMP10017', 5),
(18, 'Olivia', 'Perez', '18 Hotel Staff Rd', 'Montreal', 'QC', 'H3A1A2', 'EMP10018', 5),
(19, 'Liam', 'Roberts', '19 Hotel Staff Rd', 'Montreal', 'QC', 'H3A1A3', 'EMP10019', 5),
(20, 'Isabella', 'Turner', '20 Hotel Staff Rd', 'Montreal', 'QC', 'H3A1A4', 'EMP10020', 5),

-- Hotel 6
(21, 'Benjamin', 'Phillips', '21 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J1A1', 'EMP10021', 6),
(22, 'Charlotte', 'Campbell', '22 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J1A2', 'EMP10022', 6),
(23, 'Lucas', 'Parker', '23 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J1A3', 'EMP10023', 6),
(24, 'Amelia', 'Evans', '24 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J1A4', 'EMP10024', 6),

-- Hotel 7
(25, 'Henry', 'Edwards', '25 Hotel Staff Rd', 'Halifax', 'NS', 'B3J1A1', 'EMP10025', 7),
(26, 'Harper', 'Collins', '26 Hotel Staff Rd', 'Halifax', 'NS', 'B3J1A2', 'EMP10026', 7),
(27, 'Alexander', 'Stewart', '27 Hotel Staff Rd', 'Halifax', 'NS', 'B3J1A3', 'EMP10027', 7),
(28, 'Evelyn', 'Sanchez', '28 Hotel Staff Rd', 'Halifax', 'NS', 'B3J1A4', 'EMP10028', 7),

-- Hotel 8
(29, 'Michael', 'Morris', '29 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B1A1', 'EMP10029', 8),
(30, 'Abigail', 'Rogers', '30 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B1A2', 'EMP10030', 8),
(31, 'Ethan', 'Reed', '31 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B1A3', 'EMP10031', 8),
(32, 'Emily', 'Cook', '32 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B1A4', 'EMP10032', 8),

-- Hotel 9
(33, 'Jack', 'Morgan', '33 Hotel Staff Rd', 'Ottawa', 'ON', 'K1P1A1', 'EMP10033', 9),
(34, 'Lily', 'Bell', '34 Hotel Staff Rd', 'Ottawa', 'ON', 'K1P1A2', 'EMP10034', 9),
(35, 'Owen', 'Murphy', '35 Hotel Staff Rd', 'Ottawa', 'ON', 'K1P1A3', 'EMP10035', 9),
(36, 'Grace', 'Bailey', '36 Hotel Staff Rd', 'Ottawa', 'ON', 'K1P1A4', 'EMP10036', 9),

-- Hotel 10
(37, 'Leo', 'Rivera', '37 Hotel Staff Rd', 'Toronto', 'ON', 'M5B1A1', 'EMP10037', 10),
(38, 'Chloe', 'Cooper', '38 Hotel Staff Rd', 'Toronto', 'ON', 'M5B1A2', 'EMP10038', 10),
(39, 'Ryan', 'Richardson', '39 Hotel Staff Rd', 'Toronto', 'ON', 'M5B1A3', 'EMP10039', 10),
(40, 'Ella', 'Cox', '40 Hotel Staff Rd', 'Toronto', 'ON', 'M5B1A4', 'EMP10040', 10),

-- Hotel 11
(41, 'Samuel', 'Ward', '41 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C2A1', 'EMP10041', 11),
(42, 'Zoe', 'Gray', '42 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C2A2', 'EMP10042', 11),
(43, 'Aiden', 'Price', '43 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C2A3', 'EMP10043', 11),
(44, 'Layla', 'Bennett', '44 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C2A4', 'EMP10044', 11),

-- Hotel 12
(45, 'Wyatt', 'Wood', '45 Hotel Staff Rd', 'Montreal', 'QC', 'H3A2A1', 'EMP10045', 12),
(46, 'Scarlett', 'Barnes', '46 Hotel Staff Rd', 'Montreal', 'QC', 'H3A2A2', 'EMP10046', 12),
(47, 'Luke', 'Ross', '47 Hotel Staff Rd', 'Montreal', 'QC', 'H3A2A3', 'EMP10047', 12),
(48, 'Aria', 'Henderson', '48 Hotel Staff Rd', 'Montreal', 'QC', 'H3A2A4', 'EMP10048', 12),

-- Hotel 13
(49, 'Julian', 'Coleman', '49 Hotel Staff Rd', 'Calgary', 'AB', 'T2P1A1', 'EMP10049', 13),
(50, 'Penelope', 'Jenkins', '50 Hotel Staff Rd', 'Calgary', 'AB', 'T2P1A2', 'EMP10050', 13),
(51, 'Isaac', 'Perry', '51 Hotel Staff Rd', 'Calgary', 'AB', 'T2P1A3', 'EMP10051', 13),
(52, 'Nora', 'Powell', '52 Hotel Staff Rd', 'Calgary', 'AB', 'T2P1A4', 'EMP10052', 13),

-- Hotel 14
(53, 'Gabriel', 'Long', '53 Hotel Staff Rd', 'Edmonton', 'AB', 'T6E1A1', 'EMP10053', 14),
(54, 'Hazel', 'Patterson', '54 Hotel Staff Rd', 'Edmonton', 'AB', 'T6E1A2', 'EMP10054', 14),
(55, 'Carter', 'Hughes', '55 Hotel Staff Rd', 'Edmonton', 'AB', 'T6E1A3', 'EMP10055', 14),
(56, 'Violet', 'Flores', '56 Hotel Staff Rd', 'Edmonton', 'AB', 'T6E1A4', 'EMP10056', 14),

-- Hotel 15
(57, 'Mateo', 'Washington', '57 Hotel Staff Rd', 'Halifax', 'NS', 'B3J2A1', 'EMP10057', 15),
(58, 'Aurora', 'Butler', '58 Hotel Staff Rd', 'Halifax', 'NS', 'B3J2A2', 'EMP10058', 15),
(59, 'Nathan', 'Simmons', '59 Hotel Staff Rd', 'Halifax', 'NS', 'B3J2A3', 'EMP10059', 15),
(60, 'Riley', 'Foster', '60 Hotel Staff Rd', 'Halifax', 'NS', 'B3J2A4', 'EMP10060', 15),

-- Hotel 16
(61, 'Christopher', 'Gonzales', '61 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C1A1', 'EMP10061', 16),
(62, 'Stella', 'Bryant', '62 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C1A2', 'EMP10062', 16),
(63, 'Andrew', 'Alexander', '63 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C1A3', 'EMP10063', 16),
(64, 'Ellie', 'Russell', '64 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C1A4', 'EMP10064', 16),

-- Hotel 17
(65, 'Joshua', 'Griffin', '65 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1A1', 'EMP10065', 17),
(66, 'Lucy', 'Diaz', '66 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1A2', 'EMP10066', 17),
(67, 'Isaiah', 'Hayes', '67 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1A3', 'EMP10067', 17),
(68, 'Lillian', 'Myers', '68 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1A4', 'EMP10068', 17),

-- Hotel 18
(69, 'Thomas', 'Ford', '69 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1B1', 'EMP10069', 18),
(70, 'Hannah', 'Hamilton', '70 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1B2', 'EMP10070', 18),
(71, 'Charles', 'Graham', '71 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1B3', 'EMP10071', 18),
(72, 'Addison', 'Sullivan', '72 Hotel Staff Rd', 'Ottawa', 'ON', 'K1K1B4', 'EMP10072', 18),

-- Hotel 19
(73, 'Caleb', 'Wallace', '73 Hotel Staff Rd', 'Toronto', 'ON', 'M5H2A1', 'EMP10073', 19),
(74, 'Natalie', 'Woods', '74 Hotel Staff Rd', 'Toronto', 'ON', 'M5H2A2', 'EMP10074', 19),
(75, 'Christian', 'Cole', '75 Hotel Staff Rd', 'Toronto', 'ON', 'M5H2A3', 'EMP10075', 19),
(76, 'Brooklyn', 'West', '76 Hotel Staff Rd', 'Toronto', 'ON', 'M5H2A4', 'EMP10076', 19),

-- Hotel 20
(77, 'Aaron', 'Jordan', '77 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C3A1', 'EMP10077', 20),
(78, 'Leah', 'Owens', '78 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C3A2', 'EMP10078', 20),
(79, 'Adrian', 'Reynolds', '79 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C3A3', 'EMP10079', 20),
(80, 'Audrey', 'Fisher', '80 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C3A4', 'EMP10080', 20),

-- Hotel 21
(81, 'Jonathan', 'Ellis', '81 Hotel Staff Rd', 'Montreal', 'QC', 'H3A3A1', 'EMP10081', 21),
(82, 'Savannah', 'Harrison', '82 Hotel Staff Rd', 'Montreal', 'QC', 'H3A3A2', 'EMP10082', 21),
(83, 'Robert', 'Gibson', '83 Hotel Staff Rd', 'Montreal', 'QC', 'H3A3A3', 'EMP10083', 21),
(84, 'Claire', 'Mcdonald', '84 Hotel Staff Rd', 'Montreal', 'QC', 'H3A3A4', 'EMP10084', 21),

-- Hotel 22
(85, 'Jeremiah', 'Cruz', '85 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J2A1', 'EMP10085', 22),
(86, 'Skylar', 'Marshall', '86 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J2A2', 'EMP10086', 22),
(87, 'Jose', 'Ortiz', '87 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J2A3', 'EMP10087', 22),
(88, 'Paisley', 'Gomez', '88 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J2A4', 'EMP10088', 22),

-- Hotel 23
(89, 'Easton', 'Murray', '89 Hotel Staff Rd', 'Halifax', 'NS', 'B3J3A1', 'EMP10089', 23),
(90, 'Anna', 'Freeman', '90 Hotel Staff Rd', 'Halifax', 'NS', 'B3J3A2', 'EMP10090', 23),
(91, 'Colton', 'Wells', '91 Hotel Staff Rd', 'Halifax', 'NS', 'B3J3A3', 'EMP10091', 23),
(92, 'Caroline', 'Webb', '92 Hotel Staff Rd', 'Halifax', 'NS', 'B3J3A4', 'EMP10092', 23),

-- Hotel 24
(93, 'Connor', 'Simpson', '93 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B2A1', 'EMP10093', 24),
(94, 'Genesis', 'Stevens', '94 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B2A2', 'EMP10094', 24),
(95, 'Angel', 'Tucker', '95 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B2A3', 'EMP10095', 24),
(96, 'Kennedy', 'Porter', '96 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B2A4', 'EMP10096', 24),

-- Hotel 25
(97, 'Roman', 'Hunter', '97 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P1A1', 'EMP10097', 25),
(98, 'Sarah', 'Hicks', '98 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P1A2', 'EMP10098', 25),
(99, 'Jordan', 'Crawford', '99 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P1A3', 'EMP10099', 25),
(100, 'Alice', 'Henry', '100 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P1A4', 'EMP10100', 25),

-- Hotel 26
(101, 'Ian', 'Boyd', '101 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P2A1', 'EMP10101', 26),
(102, 'Eva', 'Mason', '102 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P2A2', 'EMP10102', 26),
(103, 'Adam', 'Morales', '103 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P2A3', 'EMP10103', 26),
(104, 'Ruby', 'Kennedy', '104 Hotel Staff Rd', 'Ottawa', 'ON', 'K2P2A4', 'EMP10104', 26),

-- Hotel 27
(105, 'Jason', 'Warren', '105 Hotel Staff Rd', 'Toronto', 'ON', 'M5B2A1', 'EMP10105', 27),
(106, 'Bella', 'Dixon', '106 Hotel Staff Rd', 'Toronto', 'ON', 'M5B2A2', 'EMP10106', 27),
(107, 'Eli', 'Ramos', '107 Hotel Staff Rd', 'Toronto', 'ON', 'M5B2A3', 'EMP10107', 27),
(108, 'Autumn', 'Reyes', '108 Hotel Staff Rd', 'Toronto', 'ON', 'M5B2A4', 'EMP10108', 27),

-- Hotel 28
(109, 'Xavier', 'Burns', '109 Hotel Staff Rd', 'Vancouver', 'BC', 'V6E1A1', 'EMP10109', 28),
(110, 'Madelyn', 'Gordon', '110 Hotel Staff Rd', 'Vancouver', 'BC', 'V6E1A2', 'EMP10110', 28),
(111, 'Cooper', 'Shaw', '111 Hotel Staff Rd', 'Vancouver', 'BC', 'V6E1A3', 'EMP10111', 28),
(112, 'Naomi', 'Holmes', '112 Hotel Staff Rd', 'Vancouver', 'BC', 'V6E1A4', 'EMP10112', 28),

-- Hotel 29
(113, 'Asher', 'Rice', '113 Hotel Staff Rd', 'Montreal', 'QC', 'H3B1A1', 'EMP10113', 29),
(114, 'Elena', 'Robertson', '114 Hotel Staff Rd', 'Montreal', 'QC', 'H3B1A2', 'EMP10114', 29),
(115, 'Dominic', 'Hunt', '115 Hotel Staff Rd', 'Montreal', 'QC', 'H3B1A3', 'EMP10115', 29),
(116, 'Sadie', 'Black', '116 Hotel Staff Rd', 'Montreal', 'QC', 'H3B1A4', 'EMP10116', 29),

-- Hotel 30
(117, 'Jace', 'Daniels', '117 Hotel Staff Rd', 'Calgary', 'AB', 'T2P2A1', 'EMP10117', 30),
(118, 'Ariana', 'Palmer', '118 Hotel Staff Rd', 'Calgary', 'AB', 'T2P2A2', 'EMP10118', 30),
(119, 'Parker', 'Mills', '119 Hotel Staff Rd', 'Calgary', 'AB', 'T2P2A3', 'EMP10119', 30),
(120, 'Kaylee', 'Nichols', '120 Hotel Staff Rd', 'Calgary', 'AB', 'T2P2A4', 'EMP10120', 30),

-- Hotel 31
(121, 'Greyson', 'Grant', '121 Hotel Staff Rd', 'Halifax', 'NS', 'B3J4A1', 'EMP10121', 31),
(122, 'Eva', 'Knight', '122 Hotel Staff Rd', 'Halifax', 'NS', 'B3J4A2', 'EMP10122', 31),
(123, 'Miles', 'Ferguson', '123 Hotel Staff Rd', 'Halifax', 'NS', 'B3J4A3', 'EMP10123', 31),
(124, 'Willow', 'Rose', '124 Hotel Staff Rd', 'Halifax', 'NS', 'B3J4A4', 'EMP10124', 31),

-- Hotel 32
(125, 'Axel', 'Stone', '125 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C2A1', 'EMP10125', 32),
(126, 'Sophie', 'Dunn', '126 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C2A2', 'EMP10126', 32),
(127, 'Maverick', 'Hawkins', '127 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C2A3', 'EMP10127', 32),
(128, 'Camila', 'Arnold', '128 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3C2A4', 'EMP10128', 32),

-- Hotel 33
(129, 'Sawyer', 'Pierce', '129 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5A1', 'EMP10129', 33),
(130, 'Kinsley', 'Payne', '130 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5A2', 'EMP10130', 33),
(131, 'Jason', 'Berry', '131 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5A3', 'EMP10131', 33),
(132, 'Allison', 'Matthews', '132 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5A4', 'EMP10132', 33),

-- Hotel 34
(133, 'Declan', 'Arnold', '133 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5B1', 'EMP10133', 34),
(134, 'Valentina', 'Wagner', '134 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5B2', 'EMP10134', 34),
(135, 'Weston', 'Willis', '135 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5B3', 'EMP10135', 34),
(136, 'Clara', 'Ray', '136 Hotel Staff Rd', 'Ottawa', 'ON', 'K1N5B4', 'EMP10136', 34),

-- Hotel 35
(137, 'Micah', 'Watkins', '137 Hotel Staff Rd', 'Toronto', 'ON', 'M4W1A1', 'EMP10137', 35),
(138, 'Vivian', 'Olson', '138 Hotel Staff Rd', 'Toronto', 'ON', 'M4W1A2', 'EMP10138', 35),
(139, 'Ryder', 'Carroll', '139 Hotel Staff Rd', 'Toronto', 'ON', 'M4W1A3', 'EMP10139', 35),
(140, 'Julia', 'Duncan', '140 Hotel Staff Rd', 'Toronto', 'ON', 'M4W1A4', 'EMP10140', 35),

-- Hotel 36
(141, 'Kingston', 'Snyder', '141 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C4A1', 'EMP10141', 36),
(142, 'Brielle', 'Hart', '142 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C4A2', 'EMP10142', 36),
(143, 'George', 'Cunningham', '143 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C4A3', 'EMP10143', 36),
(144, 'Faith', 'Bradley', '144 Hotel Staff Rd', 'Vancouver', 'BC', 'V6C4A4', 'EMP10144', 36),

-- Hotel 37
(145, 'Kaiden', 'Lane', '145 Hotel Staff Rd', 'Montreal', 'QC', 'H3A4A1', 'EMP10145', 37),
(146, 'Rose', 'Andrews', '146 Hotel Staff Rd', 'Montreal', 'QC', 'H3A4A2', 'EMP10146', 37),
(147, 'Ayden', 'Ruiz', '147 Hotel Staff Rd', 'Montreal', 'QC', 'H3A4A3', 'EMP10147', 37),
(148, 'Emery', 'Harper', '148 Hotel Staff Rd', 'Montreal', 'QC', 'H3A4A4', 'EMP10148', 37),

-- Hotel 38
(149, 'Thiago', 'Fox', '149 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J3A1', 'EMP10149', 38),
(150, 'Molly', 'Riley', '150 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J3A2', 'EMP10150', 38),
(151, 'Ivan', 'Armstrong', '151 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J3A3', 'EMP10151', 38),
(152, 'Ada', 'Carpenter', '152 Hotel Staff Rd', 'Edmonton', 'AB', 'T5J3A4', 'EMP10152', 38),

-- Hotel 39
(153, 'Beau', 'Weaver', '153 Hotel Staff Rd', 'Halifax', 'NS', 'B3J5A1', 'EMP10153', 39),
(154, 'Delilah', 'Greene', '154 Hotel Staff Rd', 'Halifax', 'NS', 'B3J5A2', 'EMP10154', 39),
(155, 'Maxwell', 'Lawrence', '155 Hotel Staff Rd', 'Halifax', 'NS', 'B3J5A3', 'EMP10155', 39),
(156, 'Piper', 'Elliott', '156 Hotel Staff Rd', 'Halifax', 'NS', 'B3J5A4', 'EMP10156', 39),

-- Hotel 40
(157, 'Damian', 'Chavez', '157 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B3A1', 'EMP10157', 40),
(158, 'Sloane', 'Goodman', '158 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B3A2', 'EMP10158', 40),
(159, 'Jasper', 'Bates', '159 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B3A3', 'EMP10159', 40),
(160, 'June', 'Donovan', '160 Hotel Staff Rd', 'Winnipeg', 'MB', 'R3B3A4', 'EMP10160', 40);

-- shows 4 employees per hotel
SELECT hotelID, COUNT(*) AS employee_count
FROM Employee
GROUP BY hotelID
ORDER BY hotelID;


-- employee roles, assign all 160
INSERT INTO Employee_Role (employeeID, role_name) VALUES
(1, 'Manager'),
(2, 'Receptionist'),
(3, 'Clerk'),
(4, 'Housekeeping'),

(5, 'Manager'),
(6, 'Receptionist'),
(7, 'Clerk'),
(8, 'Housekeeping'),

(9, 'Manager'),
(10, 'Receptionist'),
(11, 'Clerk'),
(12, 'Housekeeping'),

(13, 'Manager'),
(14, 'Receptionist'),
(15, 'Clerk'),
(16, 'Housekeeping'),

(17, 'Manager'),
(18, 'Receptionist'),
(19, 'Clerk'),
(20, 'Housekeeping'),

(21, 'Manager'),
(22, 'Receptionist'),
(23, 'Clerk'),
(24, 'Housekeeping'),

(25, 'Manager'),
(26, 'Receptionist'),
(27, 'Clerk'),
(28, 'Housekeeping'),

(29, 'Manager'),
(30, 'Receptionist'),
(31, 'Clerk'),
(32, 'Housekeeping'),

(33, 'Manager'),
(34, 'Receptionist'),
(35, 'Clerk'),
(36, 'Housekeeping'),

(37, 'Manager'),
(38, 'Receptionist'),
(39, 'Clerk'),
(40, 'Housekeeping'),

(41, 'Manager'),
(42, 'Receptionist'),
(43, 'Clerk'),
(44, 'Housekeeping'),

(45, 'Manager'),
(46, 'Receptionist'),
(47, 'Clerk'),
(48, 'Housekeeping'),

(49, 'Manager'),
(50, 'Receptionist'),
(51, 'Clerk'),
(52, 'Housekeeping'),

(53, 'Manager'),
(54, 'Receptionist'),
(55, 'Clerk'),
(56, 'Housekeeping'),

(57, 'Manager'),
(58, 'Receptionist'),
(59, 'Clerk'),
(60, 'Housekeeping'),

(61, 'Manager'),
(62, 'Receptionist'),
(63, 'Clerk'),
(64, 'Housekeeping'),

(65, 'Manager'),
(66, 'Receptionist'),
(67, 'Clerk'),
(68, 'Housekeeping'),

(69, 'Manager'),
(70, 'Receptionist'),
(71, 'Clerk'),
(72, 'Housekeeping'),

(73, 'Manager'),
(74, 'Receptionist'),
(75, 'Clerk'),
(76, 'Housekeeping'),

(77, 'Manager'),
(78, 'Receptionist'),
(79, 'Clerk'),
(80, 'Housekeeping'),

(81, 'Manager'),
(82, 'Receptionist'),
(83, 'Clerk'),
(84, 'Housekeeping'),

(85, 'Manager'),
(86, 'Receptionist'),
(87, 'Clerk'),
(88, 'Housekeeping'),

(89, 'Manager'),
(90, 'Receptionist'),
(91, 'Clerk'),
(92, 'Housekeeping'),

(93, 'Manager'),
(94, 'Receptionist'),
(95, 'Clerk'),
(96, 'Housekeeping'),

(97, 'Manager'),
(98, 'Receptionist'),
(99, 'Clerk'),
(100, 'Housekeeping'),

(101, 'Manager'),
(102, 'Receptionist'),
(103, 'Clerk'),
(104, 'Housekeeping'),

(105, 'Manager'),
(106, 'Receptionist'),
(107, 'Clerk'),
(108, 'Housekeeping'),

(109, 'Manager'),
(110, 'Receptionist'),
(111, 'Clerk'),
(112, 'Housekeeping'),

(113, 'Manager'),
(114, 'Receptionist'),
(115, 'Clerk'),
(116, 'Housekeeping'),

(117, 'Manager'),
(118, 'Receptionist'),
(119, 'Clerk'),
(120, 'Housekeeping'),

(121, 'Manager'),
(122, 'Receptionist'),
(123, 'Clerk'),
(124, 'Housekeeping'),

(125, 'Manager'),
(126, 'Receptionist'),
(127, 'Clerk'),
(128, 'Housekeeping'),

(129, 'Manager'),
(130, 'Receptionist'),
(131, 'Clerk'),
(132, 'Housekeeping'),

(133, 'Manager'),
(134, 'Receptionist'),
(135, 'Clerk'),
(136, 'Housekeeping'),

(137, 'Manager'),
(138, 'Receptionist'),
(139, 'Clerk'),
(140, 'Housekeeping'),

(141, 'Manager'),
(142, 'Receptionist'),
(143, 'Clerk'),
(144, 'Housekeeping'),

(145, 'Manager'),
(146, 'Receptionist'),
(147, 'Clerk'),
(148, 'Housekeeping'),

(149, 'Manager'),
(150, 'Receptionist'),
(151, 'Clerk'),
(152, 'Housekeeping'),

(153, 'Manager'),
(154, 'Receptionist'),
(155, 'Clerk'),
(156, 'Housekeeping'),

(157, 'Manager'),
(158, 'Receptionist'),
(159, 'Clerk'),
(160, 'Housekeeping');


-- Room Amenity

INSERT INTO Room_Amenity (room_number, hotelID, amenityID) VALUES

-- HOTEL 1
(101, 1, 1), (101, 1, 2), (101, 1, 8),
(102, 1, 1), (102, 1, 2), (102, 1, 3), (102, 1, 4),
(103, 1, 1), (103, 1, 2), (103, 1, 3), (103, 1, 4), (103, 1, 7),
(104, 1, 1), (104, 1, 2), (104, 1, 3), (104, 1, 4), (104, 1, 5), (104, 1, 7),
(105, 1, 1), (105, 1, 2), (105, 1, 3), (105, 1, 4), (105, 1, 5), (105, 1, 6), (105, 1, 7), (105, 1, 8),

-- HOTEL 2
(201, 2, 1), (201, 2, 2), (201, 2, 8),
(202, 2, 1), (202, 2, 2), (202, 2, 3), (202, 2, 4),
(203, 2, 1), (203, 2, 2), (203, 2, 3), (203, 2, 4), (203, 2, 7),
(204, 2, 1), (204, 2, 2), (204, 2, 3), (204, 2, 4), (204, 2, 5), (204, 2, 7),
(205, 2, 1), (205, 2, 2), (205, 2, 3), (205, 2, 4), (205, 2, 5), (205, 2, 6), (205, 2, 7), (205, 2, 8),

-- HOTEL 3
(301, 3, 1), (301, 3, 2), (301, 3, 8),
(302, 3, 1), (302, 3, 2), (302, 3, 3), (302, 3, 4),
(303, 3, 1), (303, 3, 2), (303, 3, 3), (303, 3, 4), (303, 3, 7),
(304, 3, 1), (304, 3, 2), (304, 3, 3), (304, 3, 4), (304, 3, 5), (304, 3, 7),
(305, 3, 1), (305, 3, 2), (305, 3, 3), (305, 3, 4), (305, 3, 5), (305, 3, 6), (305, 3, 7), (305, 3, 8),

-- HOTEL 4
(401, 4, 1), (401, 4, 2), (401, 4, 8),
(402, 4, 1), (402, 4, 2), (402, 4, 3), (402, 4, 4),
(403, 4, 1), (403, 4, 2), (403, 4, 3), (403, 4, 4), (403, 4, 7),
(404, 4, 1), (404, 4, 2), (404, 4, 3), (404, 4, 4), (404, 4, 5), (404, 4, 7),
(405, 4, 1), (405, 4, 2), (405, 4, 3), (405, 4, 4), (405, 4, 5), (405, 4, 6), (405, 4, 7), (405, 4, 8),

-- HOTEL 5
(501, 5, 1), (501, 5, 2), (501, 5, 8),
(502, 5, 1), (502, 5, 2), (502, 5, 3), (502, 5, 4),
(503, 5, 1), (503, 5, 2), (503, 5, 3), (503, 5, 4), (503, 5, 7),
(504, 5, 1), (504, 5, 2), (504, 5, 3), (504, 5, 4), (504, 5, 5), (504, 5, 7),
(505, 5, 1), (505, 5, 2), (505, 5, 3), (505, 5, 4), (505, 5, 5), (505, 5, 6), (505, 5, 7), (505, 5, 8),

-- HOTEL 6
(601, 6, 1), (601, 6, 2), (601, 6, 8),
(602, 6, 1), (602, 6, 2), (602, 6, 3), (602, 6, 4),
(603, 6, 1), (603, 6, 2), (603, 6, 3), (603, 6, 4), (603, 6, 7),
(604, 6, 1), (604, 6, 2), (604, 6, 3), (604, 6, 4), (604, 6, 5), (604, 6, 7),
(605, 6, 1), (605, 6, 2), (605, 6, 3), (605, 6, 4), (605, 6, 5), (605, 6, 6), (605, 6, 7), (605, 6, 8),

-- HOTEL 7
(701, 7, 1), (701, 7, 2), (701, 7, 8),
(702, 7, 1), (702, 7, 2), (702, 7, 3), (702, 7, 4),
(703, 7, 1), (703, 7, 2), (703, 7, 3), (703, 7, 4), (703, 7, 7),
(704, 7, 1), (704, 7, 2), (704, 7, 3), (704, 7, 4), (704, 7, 5), (704, 7, 7),
(705, 7, 1), (705, 7, 2), (705, 7, 3), (705, 7, 4), (705, 7, 5), (705, 7, 6), (705, 7, 7), (705, 7, 8),

-- HOTEL 8
(801, 8, 1), (801, 8, 2), (801, 8, 8),
(802, 8, 1), (802, 8, 2), (802, 8, 3), (802, 8, 4),
(803, 8, 1), (803, 8, 2), (803, 8, 3), (803, 8, 4), (803, 8, 7),
(804, 8, 1), (804, 8, 2), (804, 8, 3), (804, 8, 4), (804, 8, 5), (804, 8, 7),
(805, 8, 1), (805, 8, 2), (805, 8, 3), (805, 8, 4), (805, 8, 5), (805, 8, 6), (805, 8, 7), (805, 8, 8),

-- HOTEL 9
(901, 9, 1), (901, 9, 2), (901, 9, 8),
(902, 9, 1), (902, 9, 2), (902, 9, 3), (902, 9, 4),
(903, 9, 1), (903, 9, 2), (903, 9, 3), (903, 9, 4), (903, 9, 7),
(904, 9, 1), (904, 9, 2), (904, 9, 3), (904, 9, 4), (904, 9, 5), (904, 9, 7),
(905, 9, 1), (905, 9, 2), (905, 9, 3), (905, 9, 4), (905, 9, 5), (905, 9, 6), (905, 9, 7), (905, 9, 8),

-- HOTEL 10
(1001, 10, 1), (1001, 10, 2), (1001, 10, 8),
(1002, 10, 1), (1002, 10, 2), (1002, 10, 3), (1002, 10, 4),
(1003, 10, 1), (1003, 10, 2), (1003, 10, 3), (1003, 10, 4), (1003, 10, 7),
(1004, 10, 1), (1004, 10, 2), (1004, 10, 3), (1004, 10, 4), (1004, 10, 5), (1004, 10, 7),
(1005, 10, 1), (1005, 10, 2), (1005, 10, 3), (1005, 10, 4), (1005, 10, 5), (1005, 10, 6), (1005, 10, 7), (1005, 10, 8),

-- HOTEL 11
(1101, 11, 1), (1101, 11, 2), (1101, 11, 8),
(1102, 11, 1), (1102, 11, 2), (1102, 11, 3), (1102, 11, 4),
(1103, 11, 1), (1103, 11, 2), (1103, 11, 3), (1103, 11, 4), (1103, 11, 7),
(1104, 11, 1), (1104, 11, 2), (1104, 11, 3), (1104, 11, 4), (1104, 11, 5), (1104, 11, 7),
(1105, 11, 1), (1105, 11, 2), (1105, 11, 3), (1105, 11, 4), (1105, 11, 5), (1105, 11, 6), (1105, 11, 7), (1105, 11, 8),

-- HOTEL 12
(1201, 12, 1), (1201, 12, 2), (1201, 12, 8),
(1202, 12, 1), (1202, 12, 2), (1202, 12, 3), (1202, 12, 4),
(1203, 12, 1), (1203, 12, 2), (1203, 12, 3), (1203, 12, 4), (1203, 12, 7),
(1204, 12, 1), (1204, 12, 2), (1204, 12, 3), (1204, 12, 4), (1204, 12, 5), (1204, 12, 7),
(1205, 12, 1), (1205, 12, 2), (1205, 12, 3), (1205, 12, 4), (1205, 12, 5), (1205, 12, 6), (1205, 12, 7), (1205, 12, 8),

-- HOTEL 13
(1301, 13, 1), (1301, 13, 2), (1301, 13, 8),
(1302, 13, 1), (1302, 13, 2), (1302, 13, 3), (1302, 13, 4),
(1303, 13, 1), (1303, 13, 2), (1303, 13, 3), (1303, 13, 4), (1303, 13, 7),
(1304, 13, 1), (1304, 13, 2), (1304, 13, 3), (1304, 13, 4), (1304, 13, 5), (1304, 13, 7),
(1305, 13, 1), (1305, 13, 2), (1305, 13, 3), (1305, 13, 4), (1305, 13, 5), (1305, 13, 6), (1305, 13, 7), (1305, 13, 8),

-- HOTEL 14
(1401, 14, 1), (1401, 14, 2), (1401, 14, 8),
(1402, 14, 1), (1402, 14, 2), (1402, 14, 3), (1402, 14, 4),
(1403, 14, 1), (1403, 14, 2), (1403, 14, 3), (1403, 14, 4), (1403, 14, 7),
(1404, 14, 1), (1404, 14, 2), (1404, 14, 3), (1404, 14, 4), (1404, 14, 5), (1404, 14, 7),
(1405, 14, 1), (1405, 14, 2), (1405, 14, 3), (1405, 14, 4), (1405, 14, 5), (1405, 14, 6), (1405, 14, 7), (1405, 14, 8),

-- HOTEL 15
(1501, 15, 1), (1501, 15, 2), (1501, 15, 8),
(1502, 15, 1), (1502, 15, 2), (1502, 15, 3), (1502, 15, 4),
(1503, 15, 1), (1503, 15, 2), (1503, 15, 3), (1503, 15, 4), (1503, 15, 7),
(1504, 15, 1), (1504, 15, 2), (1504, 15, 3), (1504, 15, 4), (1504, 15, 5), (1504, 15, 7),
(1505, 15, 1), (1505, 15, 2), (1505, 15, 3), (1505, 15, 4), (1505, 15, 5), (1505, 15, 6), (1505, 15, 7), (1505, 15, 8),

-- HOTEL 16
(1601, 16, 1), (1601, 16, 2), (1601, 16, 8),
(1602, 16, 1), (1602, 16, 2), (1602, 16, 3), (1602, 16, 4),
(1603, 16, 1), (1603, 16, 2), (1603, 16, 3), (1603, 16, 4), (1603, 16, 7),
(1604, 16, 1), (1604, 16, 2), (1604, 16, 3), (1604, 16, 4), (1604, 16, 5), (1604, 16, 7),
(1605, 16, 1), (1605, 16, 2), (1605, 16, 3), (1605, 16, 4), (1605, 16, 5), (1605, 16, 6), (1605, 16, 7), (1605, 16, 8),

-- HOTEL 17
(1701, 17, 1), (1701, 17, 2), (1701, 17, 8),
(1702, 17, 1), (1702, 17, 2), (1702, 17, 3), (1702, 17, 4),
(1703, 17, 1), (1703, 17, 2), (1703, 17, 3), (1703, 17, 4), (1703, 17, 7),
(1704, 17, 1), (1704, 17, 2), (1704, 17, 3), (1704, 17, 4), (1704, 17, 5), (1704, 17, 7),
(1705, 17, 1), (1705, 17, 2), (1705, 17, 3), (1705, 17, 4), (1705, 17, 5), (1705, 17, 6), (1705, 17, 7), (1705, 17, 8),

-- HOTEL 18
(1801, 18, 1), (1801, 18, 2), (1801, 18, 8),
(1802, 18, 1), (1802, 18, 2), (1802, 18, 3), (1802, 18, 4),
(1803, 18, 1), (1803, 18, 2), (1803, 18, 3), (1803, 18, 4), (1803, 18, 7),
(1804, 18, 1), (1804, 18, 2), (1804, 18, 3), (1804, 18, 4), (1804, 18, 5), (1804, 18, 7),
(1805, 18, 1), (1805, 18, 2), (1805, 18, 3), (1805, 18, 4), (1805, 18, 5), (1805, 18, 6), (1805, 18, 7), (1805, 18, 8),

-- HOTEL 19
(1901, 19, 1), (1901, 19, 2), (1901, 19, 8),
(1902, 19, 1), (1902, 19, 2), (1902, 19, 3), (1902, 19, 4),
(1903, 19, 1), (1903, 19, 2), (1903, 19, 3), (1903, 19, 4), (1903, 19, 7),
(1904, 19, 1), (1904, 19, 2), (1904, 19, 3), (1904, 19, 4), (1904, 19, 5), (1904, 19, 7),
(1905, 19, 1), (1905, 19, 2), (1905, 19, 3), (1905, 19, 4), (1905, 19, 5), (1905, 19, 6), (1905, 19, 7), (1905, 19, 8),

-- HOTEL 20
(2001, 20, 1), (2001, 20, 2), (2001, 20, 8),
(2002, 20, 1), (2002, 20, 2), (2002, 20, 3), (2002, 20, 4),
(2003, 20, 1), (2003, 20, 2), (2003, 20, 3), (2003, 20, 4), (2003, 20, 7),
(2004, 20, 1), (2004, 20, 2), (2004, 20, 3), (2004, 20, 4), (2004, 20, 5), (2004, 20, 7),
(2005, 20, 1), (2005, 20, 2), (2005, 20, 3), (2005, 20, 4), (2005, 20, 5), (2005, 20, 6), (2005, 20, 7), (2005, 20, 8),

-- HOTEL 21
(2101, 21, 1), (2101, 21, 2), (2101, 21, 8),
(2102, 21, 1), (2102, 21, 2), (2102, 21, 3), (2102, 21, 4),
(2103, 21, 1), (2103, 21, 2), (2103, 21, 3), (2103, 21, 4), (2103, 21, 7),
(2104, 21, 1), (2104, 21, 2), (2104, 21, 3), (2104, 21, 4), (2104, 21, 5), (2104, 21, 7),
(2105, 21, 1), (2105, 21, 2), (2105, 21, 3), (2105, 21, 4), (2105, 21, 5), (2105, 21, 6), (2105, 21, 7), (2105, 21, 8),

-- HOTEL 22
(2201, 22, 1), (2201, 22, 2), (2201, 22, 8),
(2202, 22, 1), (2202, 22, 2), (2202, 22, 3), (2202, 22, 4),
(2203, 22, 1), (2203, 22, 2), (2203, 22, 3), (2203, 22, 4), (2203, 22, 7),
(2204, 22, 1), (2204, 22, 2), (2204, 22, 3), (2204, 22, 4), (2204, 22, 5), (2204, 22, 7),
(2205, 22, 1), (2205, 22, 2), (2205, 22, 3), (2205, 22, 4), (2205, 22, 5), (2205, 22, 6), (2205, 22, 7), (2205, 22, 8),

-- HOTEL 23
(2301, 23, 1), (2301, 23, 2), (2301, 23, 8),
(2302, 23, 1), (2302, 23, 2), (2302, 23, 3), (2302, 23, 4),
(2303, 23, 1), (2303, 23, 2), (2303, 23, 3), (2303, 23, 4), (2303, 23, 7),
(2304, 23, 1), (2304, 23, 2), (2304, 23, 3), (2304, 23, 4), (2304, 23, 5), (2304, 23, 7),
(2305, 23, 1), (2305, 23, 2), (2305, 23, 3), (2305, 23, 4), (2305, 23, 5), (2305, 23, 6), (2305, 23, 7), (2305, 23, 8),

-- HOTEL 24
(2401, 24, 1), (2401, 24, 2), (2401, 24, 8),
(2402, 24, 1), (2402, 24, 2), (2402, 24, 3), (2402, 24, 4),
(2403, 24, 1), (2403, 24, 2), (2403, 24, 3), (2403, 24, 4), (2403, 24, 7),
(2404, 24, 1), (2404, 24, 2), (2404, 24, 3), (2404, 24, 4), (2404, 24, 5), (2404, 24, 7),
(2405, 24, 1), (2405, 24, 2), (2405, 24, 3), (2405, 24, 4), (2405, 24, 5), (2405, 24, 6), (2405, 24, 7), (2405, 24, 8),

-- HOTEL 25
(2501, 25, 1), (2501, 25, 2), (2501, 25, 8),
(2502, 25, 1), (2502, 25, 2), (2502, 25, 3), (2502, 25, 4),
(2503, 25, 1), (2503, 25, 2), (2503, 25, 3), (2503, 25, 4), (2503, 25, 7),
(2504, 25, 1), (2504, 25, 2), (2504, 25, 3), (2504, 25, 4), (2504, 25, 5), (2504, 25, 7),
(2505, 25, 1), (2505, 25, 2), (2505, 25, 3), (2505, 25, 4), (2505, 25, 5), (2505, 25, 6), (2505, 25, 7), (2505, 25, 8),

-- HOTEL 26
(2601, 26, 1), (2601, 26, 2), (2601, 26, 8),
(2602, 26, 1), (2602, 26, 2), (2602, 26, 3), (2602, 26, 4),
(2603, 26, 1), (2603, 26, 2), (2603, 26, 3), (2603, 26, 4), (2603, 26, 7),
(2604, 26, 1), (2604, 26, 2), (2604, 26, 3), (2604, 26, 4), (2604, 26, 5), (2604, 26, 7),
(2605, 26, 1), (2605, 26, 2), (2605, 26, 3), (2605, 26, 4), (2605, 26, 5), (2605, 26, 6), (2605, 26, 7), (2605, 26, 8),

-- HOTEL 27
(2701, 27, 1), (2701, 27, 2), (2701, 27, 8),
(2702, 27, 1), (2702, 27, 2), (2702, 27, 3), (2702, 27, 4),
(2703, 27, 1), (2703, 27, 2), (2703, 27, 3), (2703, 27, 4), (2703, 27, 7),
(2704, 27, 1), (2704, 27, 2), (2704, 27, 3), (2704, 27, 4), (2704, 27, 5), (2704, 27, 7),
(2705, 27, 1), (2705, 27, 2), (2705, 27, 3), (2705, 27, 4), (2705, 27, 5), (2705, 27, 6), (2705, 27, 7), (2705, 27, 8),

-- HOTEL 28
(2801, 28, 1), (2801, 28, 2), (2801, 28, 8),
(2802, 28, 1), (2802, 28, 2), (2802, 28, 3), (2802, 28, 4),
(2803, 28, 1), (2803, 28, 2), (2803, 28, 3), (2803, 28, 4), (2803, 28, 7),
(2804, 28, 1), (2804, 28, 2), (2804, 28, 3), (2804, 28, 4), (2804, 28, 5), (2804, 28, 7),
(2805, 28, 1), (2805, 28, 2), (2805, 28, 3), (2805, 28, 4), (2805, 28, 5), (2805, 28, 6), (2805, 28, 7), (2805, 28, 8),

-- HOTEL 29
(2901, 29, 1), (2901, 29, 2), (2901, 29, 8),
(2902, 29, 1), (2902, 29, 2), (2902, 29, 3), (2902, 29, 4),
(2903, 29, 1), (2903, 29, 2), (2903, 29, 3), (2903, 29, 4), (2903, 29, 7),
(2904, 29, 1), (2904, 29, 2), (2904, 29, 3), (2904, 29, 4), (2904, 29, 5), (2904, 29, 7),
(2905, 29, 1), (2905, 29, 2), (2905, 29, 3), (2905, 29, 4), (2905, 29, 5), (2905, 29, 6), (2905, 29, 7), (2905, 29, 8),

-- HOTEL 30
(3001, 30, 1), (3001, 30, 2), (3001, 30, 8),
(3002, 30, 1), (3002, 30, 2), (3002, 30, 3), (3002, 30, 4),
(3003, 30, 1), (3003, 30, 2), (3003, 30, 3), (3003, 30, 4), (3003, 30, 7),
(3004, 30, 1), (3004, 30, 2), (3004, 30, 3), (3004, 30, 4), (3004, 30, 5), (3004, 30, 7),
(3005, 30, 1), (3005, 30, 2), (3005, 30, 3), (3005, 30, 4), (3005, 30, 5), (3005, 30, 6), (3005, 30, 7), (3005, 30, 8),

-- HOTEL 31
(3101, 31, 1), (3101, 31, 2), (3101, 31, 8),
(3102, 31, 1), (3102, 31, 2), (3102, 31, 3), (3102, 31, 4),
(3103, 31, 1), (3103, 31, 2), (3103, 31, 3), (3103, 31, 4), (3103, 31, 7),
(3104, 31, 1), (3104, 31, 2), (3104, 31, 3), (3104, 31, 4), (3104, 31, 5), (3104, 31, 7),
(3105, 31, 1), (3105, 31, 2), (3105, 31, 3), (3105, 31, 4), (3105, 31, 5), (3105, 31, 6), (3105, 31, 7), (3105, 31, 8),

-- HOTEL 32
(3201, 32, 1), (3201, 32, 2), (3201, 32, 8),
(3202, 32, 1), (3202, 32, 2), (3202, 32, 3), (3202, 32, 4),
(3203, 32, 1), (3203, 32, 2), (3203, 32, 3), (3203, 32, 4), (3203, 32, 7),
(3204, 32, 1), (3204, 32, 2), (3204, 32, 3), (3204, 32, 4), (3204, 32, 5), (3204, 32, 7),
(3205, 32, 1), (3205, 32, 2), (3205, 32, 3), (3205, 32, 4), (3205, 32, 5), (3205, 32, 6), (3205, 32, 7), (3205, 32, 8),

-- HOTEL 33
(3301, 33, 1), (3301, 33, 2), (3301, 33, 8),
(3302, 33, 1), (3302, 33, 2), (3302, 33, 3), (3302, 33, 4),
(3303, 33, 1), (3303, 33, 2), (3303, 33, 3), (3303, 33, 4), (3303, 33, 7),
(3304, 33, 1), (3304, 33, 2), (3304, 33, 3), (3304, 33, 4), (3304, 33, 5), (3304, 33, 7),
(3305, 33, 1), (3305, 33, 2), (3305, 33, 3), (3305, 33, 4), (3305, 33, 5), (3305, 33, 6), (3305, 33, 7), (3305, 33, 8),

-- HOTEL 34
(3401, 34, 1), (3401, 34, 2), (3401, 34, 8),
(3402, 34, 1), (3402, 34, 2), (3402, 34, 3), (3402, 34, 4),
(3403, 34, 1), (3403, 34, 2), (3403, 34, 3), (3403, 34, 4), (3403, 34, 7),
(3404, 34, 1), (3404, 34, 2), (3404, 34, 3), (3404, 34, 4), (3404, 34, 5), (3404, 34, 7),
(3405, 34, 1), (3405, 34, 2), (3405, 34, 3), (3405, 34, 4), (3405, 34, 5), (3405, 34, 6), (3405, 34, 7), (3405, 34, 8),

-- HOTEL 35
(3501, 35, 1), (3501, 35, 2), (3501, 35, 8),
(3502, 35, 1), (3502, 35, 2), (3502, 35, 3), (3502, 35, 4),
(3503, 35, 1), (3503, 35, 2), (3503, 35, 3), (3503, 35, 4), (3503, 35, 7),
(3504, 35, 1), (3504, 35, 2), (3504, 35, 3), (3504, 35, 4), (3504, 35, 5), (3504, 35, 7),
(3505, 35, 1), (3505, 35, 2), (3505, 35, 3), (3505, 35, 4), (3505, 35, 5), (3505, 35, 6), (3505, 35, 7), (3505, 35, 8),

-- HOTEL 36
(3601, 36, 1), (3601, 36, 2), (3601, 36, 8),
(3602, 36, 1), (3602, 36, 2), (3602, 36, 3), (3602, 36, 4),
(3603, 36, 1), (3603, 36, 2), (3603, 36, 3), (3603, 36, 4), (3603, 36, 7),
(3604, 36, 1), (3604, 36, 2), (3604, 36, 3), (3604, 36, 4), (3604, 36, 5), (3604, 36, 7),
(3605, 36, 1), (3605, 36, 2), (3605, 36, 3), (3605, 36, 4), (3605, 36, 5), (3605, 36, 6), (3605, 36, 7), (3605, 36, 8),

-- HOTEL 37
(3701, 37, 1), (3701, 37, 2), (3701, 37, 8),
(3702, 37, 1), (3702, 37, 2), (3702, 37, 3), (3702, 37, 4),
(3703, 37, 1), (3703, 37, 2), (3703, 37, 3), (3703, 37, 4), (3703, 37, 7),
(3704, 37, 1), (3704, 37, 2), (3704, 37, 3), (3704, 37, 4), (3704, 37, 5), (3704, 37, 7),
(3705, 37, 1), (3705, 37, 2), (3705, 37, 3), (3705, 37, 4), (3705, 37, 5), (3705, 37, 6), (3705, 37, 7), (3705, 37, 8),

-- HOTEL 38
(3801, 38, 1), (3801, 38, 2), (3801, 38, 8),
(3802, 38, 1), (3802, 38, 2), (3802, 38, 3), (3802, 38, 4),
(3803, 38, 1), (3803, 38, 2), (3803, 38, 3), (3803, 38, 4), (3803, 38, 7),
(3804, 38, 1), (3804, 38, 2), (3804, 38, 3), (3804, 38, 4), (3804, 38, 5), (3804, 38, 7),
(3805, 38, 1), (3805, 38, 2), (3805, 38, 3), (3805, 38, 4), (3805, 38, 5), (3805, 38, 6), (3805, 38, 7), (3805, 38, 8),

-- HOTEL 39
(3901, 39, 1), (3901, 39, 2), (3901, 39, 8),
(3902, 39, 1), (3902, 39, 2), (3902, 39, 3), (3902, 39, 4),
(3903, 39, 1), (3903, 39, 2), (3903, 39, 3), (3903, 39, 4), (3903, 39, 7),
(3904, 39, 1), (3904, 39, 2), (3904, 39, 3), (3904, 39, 4), (3904, 39, 5), (3904, 39, 7),
(3905, 39, 1), (3905, 39, 2), (3905, 39, 3), (3905, 39, 4), (3905, 39, 5), (3905, 39, 6), (3905, 39, 7), (3905, 39, 8),

-- HOTEL 40
(4001, 40, 1), (4001, 40, 2), (4001, 40, 8),
(4002, 40, 1), (4002, 40, 2), (4002, 40, 3), (4002, 40, 4),
(4003, 40, 1), (4003, 40, 2), (4003, 40, 3), (4003, 40, 4), (4003, 40, 7),
(4004, 40, 1), (4004, 40, 2), (4004, 40, 3), (4004, 40, 4), (4004, 40, 5), (4004, 40, 7),
(4005, 40, 1), (4005, 40, 2), (4005, 40, 3), (4005, 40, 4), (4005, 40, 5), (4005, 40, 6), (4005, 40, 7), (4005, 40, 8);


-- Customers

INSERT INTO Customer (
    customerID, first_name, last_name, email,
    street, city, province, postal_code,
    id_type, id_value, registration_date
) VALUES
(1,  'Hannah', 'Smith',   'hannah@example.com',  '11 Pine St',   'Ottawa',    'ON', 'K1A1A1', 'SIN',             '123456789', '2026-03-01'),
(2,  'Liam',   'Brown',   'liam@example.com',    '22 Maple Ave', 'Toronto',   'ON', 'M4B1B3', 'PASSPORT',        'P1002003',  '2026-03-02'),
(3,  'Emma',   'Wilson',  'emma@example.com',    '33 Oak Dr',    'Montreal',  'QC', 'H2X1Y4', 'DRIVING_LICENSE', 'DL-90001',  '2026-03-03'),
(4,  'Noah',   'Taylor',  'noah@example.com',    '44 King Rd',   'Vancouver', 'BC', 'V6B2K1', 'SIN',             '234567891', '2026-03-05'),
(5,  'Olivia', 'Martin',  'olivia@example.com',  '55 Queen St',  'Calgary',   'AB', 'T2P2M5', 'PASSPORT',        'P1002004',  '2026-03-06'),
(6,  'Ava',    'Lee',     'ava@example.com',     '66 Elm St',    'Halifax',   'NS', 'B3H2Y7', 'DRIVING_LICENSE', 'DL-90002',  '2026-03-07'),
(7,  'Ethan',  'Clark',   'ethan@example.com',   '77 Cedar Ave', 'Edmonton',  'AB', 'T5J3A2', 'SIN',             '345678912', '2026-03-08'),
(8,  'Mia',    'Hall',    'mia@example.com',     '88 River Rd',  'Winnipeg',  'MB', 'R3C3L1', 'PASSPORT',        'P1002005',  '2026-03-09'),
(9,  'Aiden',  'Moore',   'aiden@example.com',   '99 Cedar St',  'Ottawa',    'ON', 'K1A2B2', 'SIN',             '456789123', '2026-03-10'),
(10, 'Sofia',  'Taylor',  'sofia@example.com',   '101 Lake Rd',  'Toronto',   'ON', 'M5V2T6', 'PASSPORT',        'P1002006',  '2026-03-11'),
(11, 'Jacob',  'Anderson','jacob@example.com',   '202 Hill Ave', 'Vancouver', 'BC', 'V6B3K4', 'DRIVING_LICENSE', 'DL-90003',  '2026-03-12'),
(12, 'Ella',   'Thomas',  'ella@example.com',    '303 Pine Rd',  'Montreal',  'QC', 'H2Y2W1', 'SIN',             '567891234', '2026-03-13'),
(13, 'Matthew','Jackson', 'matthew@example.com', '404 River St', 'Calgary',   'AB', 'T2P3C4', 'PASSPORT',        'P1002007',  '2026-03-14'),
(14, 'Avery',  'Martin',  'avery@example.com',   '505 Birch Dr', 'Edmonton',  'AB', 'T5J4M1', 'DRIVING_LICENSE', 'DL-90004',  '2026-03-15'),
(15, 'Sebastian','White', 'sebastian@example.com','606 Ocean Ave','Halifax',  'NS', 'B3H4R2', 'SIN',             '678912345', '2026-03-16'),
(16, 'Camila', 'Harris',  'camila@example.com',  '707 Maple St', 'Winnipeg',  'MB', 'R3C4P2', 'PASSPORT',        'P1002008',  '2026-03-17'),
(17, 'Owen',   'Thompson','owen@example.com',    '808 Elm St',   'Ottawa',    'ON', 'K2P1X1', 'SIN',             '789123456', '2026-03-18'),
(18, 'Luna',   'Garcia',  'luna@example.com',    '909 Queen St', 'Toronto',   'ON', 'M4B1L1', 'PASSPORT',        'P1002009',  '2026-03-19'),
(19, 'William','Martinez','william@example.com', '111 Robson St','Vancouver', 'BC', 'V6E2A9', 'DRIVING_LICENSE', 'DL-90005',  '2026-03-20'),
(20, 'Grace',  'Robinson','grace@example.com',   '222 King St',  'Montreal',  'QC', 'H3A1N1', 'SIN',             '891234567', '2026-03-21');

-- test database connection to app, API side 
-- changed all statuses to confirmed since we do not require pending or cancelled states

UPDATE ehotels.booking
SET status = 'confirmed'
WHERE bookingID = 12;

-- Booking

INSERT INTO Booking (
    bookingID, start_date, end_date, status, customerID, room_number, hotelID,
    customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot
) VALUES
(1, '2026-04-10', '2026-04-14', 'confirmed',
 1, 102, 1,
 'Hannah Smith',
 'SIN: 123456789',
 'Room 102, capacity 2, mountain view, extendable',
 '101 Wellington St, Ottawa, ON, K1A0A1, category 3',
 'Star Gold Hotels'),

(2, '2026-04-12', '2026-04-15', 'pending',
 2, 302, 3,
 'Liam Brown',
 'PASSPORT: P1002003',
 'Room 302, capacity 2, sea view, extendable',
 '103 Bloor St, Toronto, ON, M4W1A8, category 5',
 'Star Gold Hotels'),

(3, '2026-04-20', '2026-04-23', 'cancelled',
 3, 202, 2,
 'Emma Wilson',
 'DRIVING_LICENSE: DL-90001',
 'Room 202, capacity 2, mountain view, extendable',
 '102 Rideau St, Ottawa, ON, K1N5X8, category 4',
 'Star Gold Hotels'),

(4, '2026-04-18', '2026-04-21', 'confirmed',
 4, 401, 4,
 'Noah Taylor',
 'SIN: 234567891',
 'Room 401, capacity 1, none view, not extendable',
 '104 Robson St, Vancouver, BC, V6E1B2, category 4',
 'Star Gold Hotels'),

(5, '2026-04-22', '2026-04-25', 'pending',
 5, 1302, 13,
 'Olivia Martin',
 'PASSPORT: P1002004',
 'Room 1302, capacity 2, mountain view, extendable',
 '205 8 Ave SW, Calgary, AB, T2P1G1, category 3',
 'North Stay'),

(6, '2026-04-24', '2026-04-28', 'confirmed',
 6, 1503, 15,
 'Ava Lee',
 'DRIVING_LICENSE: DL-90002',
 'Room 1503, capacity 3, sea view, extendable',
 '207 Barrington St, Halifax, NS, B3J1Z6, category 4',
 'North Stay'),

(7, '2026-05-01', '2026-05-04', 'cancelled',
 7, 1804, 18,
 'Ethan Clark',
 'SIN: 345678912',
 'Room 1804, capacity 4, none view, not extendable',
 '302 St Laurent Blvd, Ottawa, ON, K1K3B9, category 4',
 'Maple Lux'),

(8, '2026-05-03', '2026-05-07', 'confirmed',
 8, 2005, 20,
 'Mia Hall',
 'PASSPORT: P1002005',
 'Room 2005, capacity 5, mountain view, extendable',
 '304 Granville St, Vancouver, BC, V6C1T2, category 4',
 'Maple Lux'),

(9, '2026-05-06', '2026-05-09', 'pending',
 9, 2502, 25,
 'Aiden Moore',
 'SIN: 456789123',
 'Room 2502, capacity 2, mountain view, extendable',
 '401 Bank St, Ottawa, ON, K2P1Y3, category 5',
 'Aurora Hotels'),

(10, '2026-05-08', '2026-05-12', 'confirmed',
 10, 2803, 28,
 'Sofia Taylor',
 'PASSPORT: P1002006',
 'Room 2803, capacity 3, sea view, extendable',
 '404 Robson St, Vancouver, BC, V6E1B5, category 4',
 'Aurora Hotels'),

(11, '2026-05-10', '2026-05-13', 'confirmed',
 11, 3301, 33,
 'Jacob Anderson',
 'DRIVING_LICENSE: DL-90003',
 'Room 3301, capacity 1, none view, not extendable',
 '501 King St, Ottawa, ON, K1N5T5, category 3',
 'Urban Peak'),

(12, '2026-05-12', '2026-05-16', 'pending',
 12, 3504, 35,
 'Ella Thomas',
 'SIN: 567891234',
 'Room 3504, capacity 4, none view, not extendable',
 '503 Bloor St, Toronto, ON, M4W1A9, category 5',
 'Urban Peak'),

(13, '2026-05-15', '2026-05-18', 'confirmed',
 13, 3802, 38,
 'Matthew Jackson',
 'PASSPORT: P1002007',
 'Room 3802, capacity 2, mountain view, extendable',
 '506 Jasper Ave, Edmonton, AB, T5J1N7, category 2',
 'Urban Peak');


-- testing to remove  

DELETE FROM ehotels.payment
WHERE rentingID = 1;

-- testing to see info

SELECT * 
FROM ehotels.customer
WHERE customerID = 20;

-- to show renting exists

SELECT * FROM ehotels.renting WHERE bookingID = 1;

-- Renting (note bookingID = NULL means a walk-in renting)
 
 INSERT INTO Renting (
    rentingID, start_date, end_date, checkin_datetime, checkout_datetime,
    customerID, room_number, hotelID, employeeID, bookingID,
    customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot
) VALUES
(1, '2026-04-10', '2026-04-14',
 '2026-04-10 15:00:00', NULL,
 1, 102, 1, 1, 1,
 'Hannah Smith',
 'SIN: 123456789',
 'Room 102, capacity 2, mountain view, extendable',
 '101 Wellington St, Ottawa, ON, K1A0A1, category 3',
 'Star Gold Hotels'),

-- Walk-in renting OF SAME PERSON AS RENTING 2, DIFFERENT DATE AND PLACE!!
(2, '2026-04-25', '2026-04-27',
 '2026-04-25 13:30:00', NULL,
 14, 402, 4, 14, NULL,
 'Avery Martin',
 'DRIVING_LICENSE: DL-90004',
 'Room 402, capacity 2, mountain view, extendable',
 '104 Robson St, Vancouver, BC, V6E1B2, category 4',
 'Star Gold Hotels'),

(3, '2026-04-18', '2026-04-21',
 '2026-04-18 14:30:00', NULL,
 4, 401, 4, 13, 4,
 'Noah Taylor',
 'SIN: 234567891',
 'Room 401, capacity 1, none view, not extendable',
 '104 Robson St, Vancouver, BC, V6E1B2, category 4',
 'Star Gold Hotels'),

(4, '2026-04-24', '2026-04-28',
 '2026-04-24 16:00:00', NULL,
 6, 1503, 15, 57, 6,
 'Ava Lee',
 'DRIVING_LICENSE: DL-90002',
 'Room 1503, capacity 3, sea view, extendable',
 '207 Barrington St, Halifax, NS, B3J1Z6, category 4',
 'North Stay'),

(5, '2026-05-03', '2026-05-07',
 '2026-05-03 13:15:00', NULL,
 8, 2005, 20, 77, 8,
 'Mia Hall',
 'PASSPORT: P1002005',
 'Room 2005, capacity 5, mountain view, extendable',
 '304 Granville St, Vancouver, BC, V6C1T2, category 4',
 'Maple Lux'),

(6, '2026-05-08', '2026-05-12',
 '2026-05-08 15:45:00', NULL,
 10, 2803, 28, 109, 10,
 'Sofia Taylor',
 'PASSPORT: P1002006',
 'Room 2803, capacity 3, sea view, extendable',
 '404 Robson St, Vancouver, BC, V6E1B5, category 4',
 'Aurora Hotels'),

(7, '2026-05-10', '2026-05-13',
 '2026-05-10 12:00:00', NULL,
 11, 3301, 33, 129, 11,
 'Jacob Anderson',
 'DRIVING_LICENSE: DL-90003',
 'Room 3301, capacity 1, none view, not extendable',
 '501 King St, Ottawa, ON, K1N5T5, category 3',
 'Urban Peak'),

-- Walk-in renting
(8, '2026-05-20', '2026-05-22',
 '2026-05-20 11:20:00', NULL,
 14, 3402, 34, 133, NULL,
 'Avery Martin',
 'DRIVING_LICENSE: DL-90004',
 'Room 3402, capacity 2, mountain view, extendable',
 '502 King St, Ottawa, ON, K1N5T6, category 4',
 'Urban Peak'),

-- Another walk-in renting
(9, '2026-05-25', '2026-05-27',
 '2026-05-25 14:10:00', NULL,
 15, 3901, 39, 153, NULL,
 'Sebastian White',
 'SIN: 678912345',
 'Room 3901, capacity 1, none view, not extendable',
 '507 Spring Garden Rd, Halifax, NS, B3J1X7, category 4',
 'Urban Peak');

 
-- chain email and phone

INSERT INTO Chain_Email (chainID, email) VALUES
(1, 'info1@stargoldhotels.com'),
(1, 'support1@stargoldhotels.com'),
(2, 'info2@northstay.com'),
(2, 'support2@northstay.com'),
(3, 'info3@maplelux.com'),
(4, 'info4@aurorahotels.com'),
(5, 'info5@urbanpeak.com');

INSERT INTO Chain_Phone (chainID, phone_number) VALUES
(1, '613-555-1000'),
(1, '613-555-1001'),
(2, '604-555-2000'),
(3, '514-555-3000'),
(4, '403-555-4000'),
(5, '212-555-5000');

-- hotel email and phone

INSERT INTO Hotel_Email (hotelID, email) VALUES
(1, 'hotel1@stargoldhotels.com'),
(2, 'hotel2@stargoldhotels.com'),
(3, 'hotel3@stargoldhotels.com'),
(4, 'hotel4@stargoldhotels.com'),
(5, 'hotel5@stargoldhotels.com'),
(6, 'hotel6@stargoldhotels.com'),
(7, 'hotel7@stargoldhotels.com'),
(8, 'hotel8@stargoldhotels.com'),
(9, 'hotel9@northstay.com'),
(10, 'hotel10@northstay.com'),
(11, 'hotel11@northstay.com'),
(12, 'hotel12@northstay.com'),
(13, 'hotel13@northstay.com'),
(14, 'hotel14@northstay.com'),
(15, 'hotel15@northstay.com'),
(16, 'hotel16@northstay.com'),
(17, 'hotel17@maplelux.com'),
(18, 'hotel18@maplelux.com'),
(19, 'hotel19@maplelux.com'),
(20, 'hotel20@maplelux.com'),
(21, 'hotel21@maplelux.com'),
(22, 'hotel22@maplelux.com'),
(23, 'hotel23@maplelux.com'),
(24, 'hotel24@maplelux.com'),
(25, 'hotel25@aurorahotels.com'),
(26, 'hotel26@aurorahotels.com'),
(27, 'hotel27@aurorahotels.com'),
(28, 'hotel28@aurorahotels.com'),
(29, 'hotel29@aurorahotels.com'),
(30, 'hotel30@aurorahotels.com'),
(31, 'hotel31@aurorahotels.com'),
(32, 'hotel32@aurorahotels.com'),
(33, 'hotel33@urbanpeak.com'),
(34, 'hotel34@urbanpeak.com'),
(35, 'hotel35@urbanpeak.com'),
(36, 'hotel36@urbanpeak.com'),
(37, 'hotel37@urbanpeak.com'),
(38, 'hotel38@urbanpeak.com'),
(39, 'hotel39@urbanpeak.com'),
(40, 'hotel40@urbanpeak.com');



INSERT INTO Hotel_Phone (hotelID, phone_number) VALUES
(1, '613-555-2101'),
(2, '613-555-2102'),
(3, '416-555-2103'),
(4, '604-555-2104'),
(5, '514-555-2105'),
(6, '780-555-2106'),
(7, '902-555-2107'),
(8, '204-555-2108'),
(9, '613-555-2109'),
(10, '416-555-2110'),
(11, '604-555-2111'),
(12, '514-555-2112'),
(13, '403-555-2113'),
(14, '780-555-2114'),
(15, '902-555-2115'),
(16, '204-555-2116'),
(17, '613-555-2117'),
(18, '613-555-2118'),
(19, '416-555-2119'),
(20, '604-555-2120'),
(21, '514-555-2121'),
(22, '780-555-2122'),
(23, '902-555-2123'),
(24, '204-555-2124'),
(25, '613-555-2125'),
(26, '613-555-2126'),
(27, '416-555-2127'),
(28, '604-555-2128'),
(29, '514-555-2129'),
(30, '403-555-2130'),
(31, '902-555-2131'),
(32, '204-555-2132'),
(33, '613-555-2133'),
(34, '613-555-2134'),
(35, '416-555-2135'),
(36, '604-555-2136'),
(37, '514-555-2137'),
(38, '780-555-2138'),
(39, '902-555-2139'),
(40, '204-555-2140');