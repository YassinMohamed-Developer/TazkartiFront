import React, { createContext, useContext, useState, useEffect } from 'react';
import { createBooking } from '../services/authService';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(() => {
    const saved = localStorage.getItem('tazkarti_current_booking');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('tazkarti_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "TKT-2026-9812",
        bookingOrderId: 89,
        type: "match",
        title: "Al Ahly SC vs Zamalek SC",
        competition: "Egyptian Premier League",
        round: "Round 10",
        homeTeam: "Al Ahly SC",
        awayTeam: "Zamalek SC",
        subtitle: "Egyptian Premier League - Round 10",
        date: "15 Oct 2026",
        time: "20:00 CLT",
        venue: "Cairo International Stadium",
        block: "Category 1 - Block 102",
        gate: "Gate 4",
        seats: ["Row B, Seat 14"],
        price: 600.00,
        fanId: "TZK-378584",
        currentFanId: "Fan Id : TZK-378584",
        holderName: "HamedMohamed",
        nationalId: "29012345678901",
        qrCode: "https://lh3.googleusercontent.com/aida-public/AB6AXuBer5HRCfR9UYy3WLm51yAkpxZEfvYzGP5J27c1CJMSJ7S0LLcbfSYef9s-yCbtOqiB1eG3R_yzDhpV4NX7N4hMJ3Q68SV6w_IZ_KD0lAfimhgv47pQk_8Jo2p7vyWugSEYnVQUd4Bijl6tDUfsyJt4YljoOQICaCcEfiDeQQtx4aWrg9Wd5V6k4c3fBEorNqG9CAMqFrcxCWJQY_uUAuV0o3lv_wviFWDu8xfQG9gPUitQd9jWeZaLkw",
        status: 1,
        bookingDate: "12 Aug 2026"
      }
    ];
  });

  useEffect(() => {
    if (currentBooking) {
      localStorage.setItem('tazkarti_current_booking', JSON.stringify(currentBooking));
    }
  }, [currentBooking]);

  useEffect(() => {
    localStorage.setItem('tazkarti_tickets', JSON.stringify(tickets));
  }, [tickets]);

  const selectMatchBooking = (match, category, selectedSeats) => {
    const total = selectedSeats.reduce((sum, seat) => sum + (seat.price || category.price), 0);
    const booking = {
      type: "match",
      item: match,
      category,
      seats: selectedSeats,
      totalAmount: total,
      timestamp: new Date().toISOString()
    };
    setCurrentBooking(booking);
    return booking;
  };

  const selectEventBooking = (event, tier, quantity) => {
    const total = tier.price * quantity;
    const booking = {
      type: "event",
      item: event,
      tier,
      quantity,
      seats: Array.from({ length: quantity }).map((_, i) => ({
        seatNumber: `GA-${i + 1}`,
        row: tier.name,
        price: tier.price
      })),
      totalAmount: total,
      timestamp: new Date().toISOString()
    };
    setCurrentBooking(booking);
    return booking;
  };

  const completePayment = async (paymentMethod, paymentRef = null) => {
    if (!currentBooking) {
      throw new Error('Your booking session has expired. Please select your tickets again.');
    }

    // The backend is the source of truth for availability, price and the
    // booking limit. Do not issue a local ticket until it confirms the order.
    const bookingResponse = await createBooking(currentBooking, paymentMethod);
    const serverMessage = bookingResponse?.message || '';
    const serverReference = typeof bookingResponse?.data === 'string'
      ? bookingResponse.data
      : serverMessage.match(/Reference:\s*([^\s.]+)/i)?.[1];

    const newTicketId = `TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingOrderId = Math.floor(100 + Math.random() * 900);
    const newTicket = {
      id: newTicketId,
      bookingOrderId: newBookingOrderId,
      type: currentBooking.type,
      title: currentBooking.item.title,
      competition: currentBooking.item.league || currentBooking.item.competition || (currentBooking.type === 'match' ? 'Egyptian Premier League' : 'Entertainment Event'),
      round: currentBooking.item.round || null,
      homeTeam: currentBooking.item.homeTeam?.name || currentBooking.item.homeTeamName || currentBooking.item.homeTeam || null,
      awayTeam: currentBooking.item.awayTeam?.name || currentBooking.item.awayTeamName || currentBooking.item.awayTeam || null,
      subtitle: currentBooking.type === 'match' ? currentBooking.item.round : currentBooking.item.category,
      date: currentBooking.item.date,
      time: currentBooking.item.time,
      venue: currentBooking.item.venue,
      city: currentBooking.item.city,
      gate: currentBooking.item.gateOpen ? `Gate ${Math.floor(Math.random() * 8) + 1}` : "Gate 4",
      block: currentBooking.type === 'match' ? currentBooking.category.name : currentBooking.tier.name,
      seats: currentBooking.seats.map(s => s.seatNumber ? `${s.row || ''} ${s.seatNumber}`.trim() : `Seat ${s}`),
      price: currentBooking.totalAmount,
      fanId: "TZK-378584",
      currentFanId: "Fan Id : TZK-378584",
      holderName: "HamedMohamed",
      nationalId: "29012345678901",
      paymentMethod,
      paymentRef: paymentRef || `EGP-${Date.now().toString().slice(-8)}`,
      bookingReference: serverReference || null,
      qrCode: "https://lh3.googleusercontent.com/aida-public/AB6AXuBer5HRCfR9UYy3WLm51yAkpxZEfvYzGP5J27c1CJMSJ7S0LLcbfSYef9s-yCbtOqiB1eG3R_yzDhpV4NX7N4hMJ3Q68SV6w_IZ_KD0lAfimhgv47pQk_8Jo2p7vyWugSEYnVQUd4Bijl6tDUfsyJt4YljoOQICaCcEfiDeQQtx4aWrg9Wd5V6k4c3fBEorNqG9CAMqFrcxCWJQY_uUAuV0o3lv_wviFWDu8xfQG9gPUitQd9jWeZaLkw",
      status: 1,
      bookingDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setTickets(prev => [newTicket, ...prev]);
    setCurrentBooking(null);
    localStorage.removeItem('tazkarti_current_booking');
    return newTicket;
  };

  const transferTicket = (ticketId, targetFanId) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, fanId: targetFanId, holderName: `Transferred Fan (${targetFanId})`, transferred: true }
          : t
      )
    );
  };

  return (
    <BookingContext.Provider
      value={{
        currentBooking,
        tickets,
        selectMatchBooking,
        selectEventBooking,
        completePayment,
        transferTicket,
        setCurrentBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
