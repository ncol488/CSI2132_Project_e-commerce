SET search_path TO ehotels;


-- indexes, to help with easier lookup

-- Index 1 : be able to search rooms by city by joining Room to Hotel and filtering on Hotel.city.
	-- This index speeds up searches for hotels by city/area, which is one of the main search criteria in the application.

CREATE INDEX idx_hotel_city
ON Hotel(city);


-- Index 2 : booking date range
	-- This index speeds up availability queries and booking-overlap trigger checks, since both rely on comparing booking date ranges.

CREATE INDEX idx_booking_dates
ON Booking(start_date, end_date);

-- Index 3 : renting date range (same idea as index 2 but for renting)
	-- This index speeds up availability queries and renting-overlap trigger checks, since both rely on comparing renting date ranges.

CREATE INDEX idx_brenting_dates
ON Renting(start_date, end_date);

-- Index 4 : index on room hotelID
	-- room and hotel are consistently joined, so this would be useful to speed up getting all rooms of a hotel

CREATE INDEX idx_room_hotelID
ON Room(hotelID);

-- Index 5 : speed up room filtering by price
	-- This index supports room filtering by price, which is one of the user search criteria required by the application.

CREATE INDEX idx_room_price
ON Room(price);
