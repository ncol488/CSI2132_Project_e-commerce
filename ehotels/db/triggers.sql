-- make sure "ehotels." so that doesnt mess up app when fetching data

-- Trigger 1: prevent overlapping bookings

CREATE OR REPLACE FUNCTION ehotels.check_booking_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- check overlap with existing bookings
    IF EXISTS (
        SELECT 1
        FROM ehotels.booking b
        WHERE b.room_number = NEW.room_number
          AND b.hotelID = NEW.hotelID
          AND b.start_date <= NEW.end_date
          AND b.end_date >= NEW.start_date
    ) THEN
        RAISE EXCEPTION 'Room is already booked for this time period';
    END IF;

    -- check overlap with existing rentings
    IF EXISTS (
        SELECT 1
        FROM ehotels.renting r
        WHERE r.room_number = NEW.room_number
          AND r.hotelID = NEW.hotelID
          AND r.start_date <= NEW.end_date
          AND r.end_date >= NEW.start_date
    ) THEN
        RAISE EXCEPTION 'Room is already rented for this time period';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_booking_availability ON ehotels.booking;

CREATE TRIGGER trg_check_booking_availability
BEFORE INSERT ON ehotels.booking
FOR EACH ROW
EXECUTE FUNCTION ehotels.check_booking_availability();



-- Trigger 2: prevent overlapping renting

CREATE OR REPLACE FUNCTION ehotels.check_renting_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- check overlap with existing rentings
    IF EXISTS (
        SELECT 1
        FROM ehotels.renting r
        WHERE r.room_number = NEW.room_number
          AND r.hotelID = NEW.hotelID
          AND r.start_date <= NEW.end_date
          AND r.end_date >= NEW.start_date
    ) THEN
        RAISE EXCEPTION 'Room is already rented for this time period';
    END IF;

    -- check overlap with existing bookings
    -- exclude the same booking being converted into this renting
    IF EXISTS (
        SELECT 1
        FROM ehotels.booking b
        WHERE b.room_number = NEW.room_number
          AND b.hotelID = NEW.hotelID
          AND b.start_date <= NEW.end_date
          AND b.end_date >= NEW.start_date
          AND (NEW.bookingID IS NULL OR b.bookingID <> NEW.bookingID)
    ) THEN
        RAISE EXCEPTION 'Room is already booked for this time period';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_renting_availability ON ehotels.renting;

CREATE TRIGGER trg_check_renting_availability
BEFORE INSERT ON ehotels.renting
FOR EACH ROW
EXECUTE FUNCTION ehotels.check_renting_availability();



-- Trigger 3: prevent deleting the last manager from a hotel

CREATE OR REPLACE FUNCTION ehotels.prevent_last_manager_removal()
RETURNS TRIGGER AS $$
DECLARE
    hotel_id INT;
    num_managers INT;
BEGIN
    IF OLD.role_name = 'Manager' THEN

        SELECT e.hotelID
        INTO hotel_id
        FROM ehotels.employee e
        WHERE e.employeeID = OLD.employeeID;

        SELECT COUNT(*)
        INTO num_managers
        FROM ehotels.employee_role er
        JOIN ehotels.employee e ON er.employeeID = e.employeeID
        WHERE er.role_name = 'Manager'
          AND e.hotelID = hotel_id;

        IF num_managers = 1 THEN
            RAISE EXCEPTION 'Cannot remove the last manager from hotel %', hotel_id;
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_last_manager_removal ON ehotels.employee_role;

CREATE TRIGGER trg_prevent_last_manager_removal
BEFORE DELETE ON ehotels.employee_role
FOR EACH ROW
EXECUTE FUNCTION ehotels.prevent_last_manager_removal();