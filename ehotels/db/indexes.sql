SET search_path TO ehotels;

CREATE INDEX idx_hotel_city
ON Hotel(city);

CREATE INDEX idx_booking_dates
ON Booking(start_date, end_date);

CREATE INDEX idx_brenting_dates
ON Renting(start_date, end_date);

CREATE INDEX idx_room_hotelID
ON Room(hotelID);

CREATE INDEX idx_room_price
ON Room(price);
