SET search_path TO ehotels;

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW 1: Available Rooms Per Area
-- Shows the number of currently available rooms grouped by city.
-- Excludes rooms that are booked or rented today.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW ehotels.AvailableRoomsPerArea AS
SELECT
    h.city          AS area,
    COUNT(*)        AS available_rooms
FROM ehotels.Room r
JOIN ehotels.Hotel h ON r.hotelID = h.hotelID
WHERE
    NOT EXISTS (
        SELECT 1
        FROM ehotels.Booking b
        WHERE b.room_number = r.room_number
          AND b.hotelID     = r.hotelID
          AND b.status     != 'cancelled'
          AND b.start_date <= CURRENT_DATE
          AND b.end_date   >= CURRENT_DATE
    )
    AND NOT EXISTS (
        SELECT 1
        FROM ehotels.Renting rt
        WHERE rt.room_number = r.room_number
          AND rt.hotelID     = r.hotelID
          AND rt.start_date  <= CURRENT_DATE
          AND rt.end_date    >= CURRENT_DATE
    )
GROUP BY h.city
ORDER BY h.city;


-- ─────────────────────────────────────────────────────────────────────────────
-- VIEW 2: Hotel Total Capacity
-- Shows the aggregated (sum) capacity of all rooms for each hotel.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW ehotels.HotelTotalCapacity AS
SELECT
    h.hotelID,
    h.hotel_name,
    h.city,
    COUNT(r.room_number)  AS total_rooms,
    SUM(r.capacity)       AS total_capacity
FROM ehotels.Hotel h
JOIN ehotels.Room r ON h.hotelID = r.hotelID
GROUP BY h.hotelID, h.hotel_name, h.city
ORDER BY h.hotelID;