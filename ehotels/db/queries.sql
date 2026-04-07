SET search_path TO ehotels;

-- at least 4 queries, at least 1 query with aggregation (computation) and at least 1 with a nested (query in a query) queries

-- Query 1 : Search query, based on city, price and capacity

SELECT r.room_number, r.price, r.capacity
FROM Room r
JOIN Hotel h ON r.hotelID = h.hotelID -- join since hotel has city and room has the price, room number, capacity and hotelid
WHERE h.city = 'Montreal' AND r.capacity >= 2 AND r.price<=220
ORDER BY r.hotelID, r.room_number;

-- Query 2 : Availability, to show available rooms/where rooms arent already booked for given timeframe (here we want may 1 - may 10) (also a nested query)

SELECT r.room_number, r.hotelID
FROM Room r
WHERE NOT EXISTS (
    SELECT 1 -- select 1 bc we care about the row existing or not, not the actual data
    FROM Booking b
    WHERE b.room_number = r.room_number
    AND b.hotelID = r.hotelID
    AND b.start_date <= '2026-05-10'
    AND b.end_date >= '2026-05-01'
)
ORDER BY r.hotelID;

-- Query 3 : Average price per hotel (aggregation)

SELECT hotelID, AVG(price) AS avg_price
FROM Room
GROUP BY hotelID
ORDER BY hotelID;

-- Query 4 : Customer info, those who rented

SELECT first_name, last_name
FROM Customer
WHERE customerID IN (
    SELECT customerID FROM Renting
) ORDER BY last_name, first_name;

-- Query 5 : Customer info, those who booked

SELECT first_name, last_name
FROM Customer
WHERE customerID IN (
    SELECT customerID FROM Booking
) ORDER BY last_name, first_name;

-- Query 6 : Employee, who works where (managers of each hotel)

SELECT e.hotelID, e.first_name, e.last_name
FROM Employee e
JOIN Employee_Role er ON e.employeeID = er.employeeID 
WHERE er.role_name = 'Manager'
ORDER BY e.hotelID;

-- Query 7 : Employees, shows who works in hotels in Ottawa (nested)

SELECT first_name, last_name, hotelID
FROM Employee
WHERE hotelID IN (
    SELECT hotelID
    FROM Hotel
    WHERE city = 'Ottawa'
)
ORDER BY hotelID;

-- Query 8 : Amenities, orders it from most to least amount of amenities (aggregation)

SELECT room_number, hotelID, COUNT(*) AS total_amenities
FROM Room_Amenity
GROUP BY room_number, hotelID
ORDER BY total_amenities DESC, hotelID, room_number;
