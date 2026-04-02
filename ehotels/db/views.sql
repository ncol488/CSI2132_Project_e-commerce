SET search_path TO ehotels;

-- make views, important to present useful information as if it were a table without storing duplicate data.

-- View 1 : number of available rooms per area (currently available and grouped by city, excludes the already booked and rented rooms of that city)

CREATE OR REPLACE VIEW AvailableRoomsPerArea AS
SELECT h.city AS area, COUNT(*) AS available_rooms
FROM Room r
JOIN Hotel h ON r.hotelID = h.hotelID -- join to get city
WHERE NOT EXISTS (
    SELECT 1
    FROM Booking b
    WHERE b.room_number = r.room_number -- removes rooms that are booked today 
      AND b.hotelID = r.hotelID
      AND b.start_date <= CURRENT_DATE
      AND b.end_date >= CURRENT_DATE
)
AND NOT EXISTS (
    SELECT 1
    FROM Renting rt
    WHERE rt.room_number = r.room_number -- removes rooms that are rented today
      AND rt.hotelID = r.hotelID
      AND rt.start_date <= CURRENT_DATE
      AND rt.end_date >= CURRENT_DATE
)
GROUP BY h.city -- counts the remaining rooms per city
ORDER BY h.city;

SELECT * FROM AvailableRoomsPerArea; -- run to use

-- View 2 : aggregated capacity of all the rooms of a specific hotel (adds up the capacity values of all rooms in a hotel)

CREATE OR REPLACE VIEW HotelTotalCapacity AS
SELECT h.hotelID, h.city, SUM(r.capacity) AS total_capacity -- add all room capacity for each hotel
FROM Hotel h
JOIN Room r ON h.hotelID = r.hotelID 
GROUP BY h.hotelID, h.city
ORDER BY h.hotelID;

SELECT * FROM HotelTotalCapacity; -- run to use

SELECT * 						-- run for specific hotelID numbers 
FROM HotelTotalCapacity
WHERE hotelID = 10;



