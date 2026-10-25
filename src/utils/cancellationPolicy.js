export function calculateRefund(booking) {
  const now = new Date()
  const bookedAt = new Date(booking.bookedAt || Date.now())
  const hoursSinceBooking = (now - bookedAt) / (1000 * 60 * 60)
  const checkIn8AM = new Date(booking.checkIn + 'T08:00:00')

  if (booking.hasCancellationPolicy && now < checkIn8AM) {
    return {
      refundAmount: booking.total,
      percent: 100,
      reason: 'Cancellation Protection active — cancelled before 8 AM on check-in day',
    }
  }

  if (hoursSinceBooking <= 24) {
    const amount = Math.round(booking.total * 0.9)
    return {
      refundAmount: amount,
      percent: 90,
      reason: 'Cancelled before 24 hours of check-in',
    }
  }

  return {
    refundAmount: 0,
    percent: 0,
    reason: 'Cancelled after 24 hours of booking — no refund applicable',
  }
}
