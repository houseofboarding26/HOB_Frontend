import { useState } from 'react'
import { toast } from 'react-hot-toast'
import axios from 'axios'

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

// ── Backend endpoints for the Razorpay flow ──────────────────────────────────
// Adjust these to match your backend if the routes differ.
//   ORDER_URL  → creates a Razorpay order for the booking, returns an order id.
//   VERIFY_URL → verifies the payment signature after a successful payment.
const ORDER_URL  = '/api/payment/create-order'
const VERIFY_URL = '/api/payment/verify-payment'

// Lazy-load the Razorpay checkout SDK; resolves true once window.Razorpay exists.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Renders a button that runs the full Razorpay flow for a booking:
 *   1. create an order on the backend,
 *   2. open the Razorpay checkout with that order,
 *   3. verify the payment signature on the backend,
 *   4. call onSuccess once verified.
 *
 * Props:
 *  - bookingId  booking id returned by /api/bookings/add
 *  - amount     amount in rupees (converted to paise for Razorpay)
 *  - user       { name, email, phone } used to prefill the checkout
 *  - userId     current user id (sent as a query param to the backend)
 *  - disabled   disables the button
 *  - label      button text
 *  - className  button classes
 *  - onSuccess  (verifyData, response) => void   fired after verification
 *  - onFailure  (error?) => void                 dismiss / failure handler
 */
export default function RazorpayPayment({
  bookingId: bookingIdProp, onBeforePay,
  amount, amountSummary, user, userId, disabled, label, className, onSuccess, onFailure,
}) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!key) {
      toast.error('Payment is not configured (missing Razorpay key).')
      return
    }

    // If no bookingId yet, create the booking first (payment-gated creation).
    let bookingId = bookingIdProp
    if (!bookingId && onBeforePay) {
      try {
        bookingId = await onBeforePay()
      } catch {
        return // onBeforePay already shows an error toast
      }
      if (!bookingId) return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

      // 1) Create the order on the backend FIRST and read its order id.
      // Backend expects amount in rupees; it handles the paise conversion internally.
      const amountInRupees = Number(amount)
      const amountInPaise  = Math.round(amountInRupees * 100)
      const orderRes = await axios.post(
        ORDER_URL,
        { bookingId, amount: amountInRupees, amountSummary },
        {
          params: {
            ...(userId ? { userId } : {}),
            amount: amountInRupees,
            amountSummary: JSON.stringify(amountSummary),
          },
          headers: authHeader,
        },
      )
      const order = orderRes.data?.data || orderRes.data || {}
      const orderId  = order.orderId || order.id || order.order_id
      const orderAmt = order.amount ?? amountInPaise
      const currency = order.currency || 'INR'
      if (!orderId) {
        toast.error('Could not start payment (no order id returned).')
        setLoading(false)
        return
      }

      // 2) Only once we have the order id, load the SDK and open the popup.
      const sdkOk = await loadRazorpayScript()
      if (!sdkOk) {
        toast.error('Could not load Razorpay. Please check your connection.')
        setLoading(false)
        return
      }
      const rzp = new window.Razorpay({
        key,
        order_id: orderId,
        amount: orderAmt,
        currency,
        name: 'House of boarding',
        description: `Booking ${bookingId}`,
        notes: { bookingId },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#2d6be4' },
        handler: async (response) => {
          // 3) Verify the signature on the backend before confirming.
          try {
            const verifyRes = await axios.post(
              VERIFY_URL,
              {
                bookingId,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                // Send the exact amount breakdown again so the backend can persist
                // it on the booking at confirmation time (what the customer paid).
                amount: Number(amount),
                amountSummary,
              },
              {
                params: {
                  ...(userId ? { userId } : {}),
                  amount: Number(amount),
                  amountSummary: JSON.stringify(amountSummary),
                },
                headers: authHeader,
              },
            )
            const data = verifyRes.data
            const verified = data?.success !== false && data?.verified !== false
            if (!verified) {
              toast.error('Payment could not be verified. Please contact support.')
              onFailure?.(data)
              return
            }
            onSuccess?.(data, response)
          } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error
            toast.error(typeof msg === 'string' ? msg : 'Payment verification failed.')
            onFailure?.(err)
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            onFailure?.()
          },
        },
      })
      rzp.on('payment.failed', (resp) => {
        setLoading(false)
        toast.error(resp?.error?.description || 'Payment failed. Please try again.')
        onFailure?.(resp)
      })
      rzp.open()
    } catch (err) {
      setLoading(false)
      const msg = err.response?.data?.message || err.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Could not start payment. Please try again.')
      onFailure?.(err)
    }
  }

  return (
    <button type="button" onClick={handlePay} disabled={disabled || loading} className={className}>
      {loading ? 'Opening payment…' : label}
    </button>
  )
}
