import { createContext, useContext, useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const addBooking = async (data) => {
    const newBooking = await bookingService.create(data);
    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  };

  const updateBooking = async (id, data) => {
    const updated = await bookingService.update(id, data);
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  };

  const removeBooking = async (id) => {
    await bookingService.remove(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BookingContext.Provider value={{ bookings, loading, addBooking, updateBooking, removeBooking, refetch: fetchBookings }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
};
