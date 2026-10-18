import LegalPage, { Section } from '../components/LegalPage'

export default function CancellationPolicy() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      subtitle="Applicable to all Bookings made through the House of Boarding platform"
      lastUpdated="Effective Date: 18 October 2026 · Version 1.0"
    >
      <Section n={1} title="Scope">
        <p>
          This Refund &amp; Cancellation Policy ("Policy") applies to all Bookings made by Pet Parents/Customers
          with Hospitality Partners/Hosts through houseofboarding.com. It forms part of, and should be read
          together with, our Terms &amp; Conditions. Because House of Boarding is an intermediary marketplace,
          the specific inclusions of a Booking (services, dates, pricing) are set by the Hospitality Partner/Host,
          but refund and cancellation processing is administered centrally by House of Boarding to keep the
          experience consistent for all users.
        </p>
      </Section>

      <Section n={2} title="Cancellation Protection">
        <p>
          Cancellation Protection is a policy under which the Pet Parent/Customer can add Cancellation Protection
          at checkout and become eligible for a full 100% refund (excluding the cancellation protection amount),
          as long as the Pet Parent/Customer cancels before 8:00 AM on the check-in day.
        </p>
      </Section>

      <Section n={3} title="Cancellation by a Pet Parent/Customer">
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse border border-gray-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Time of Cancellation (before check-in)</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Refund</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">24 hours or more before check-in</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">90% refund of amount paid.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-gray-700">Less than 24 hours before check-in</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">No refund (Hospitality Partner/Host has blocked the slot and prepared for the pet's arrival).</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">Cancelled before 8:00 AM on check-in day with Cancellation Protection</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">100% refund of amount paid, excluding the cancellation protection amount.</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 text-gray-700">Cancelled after 8:00 AM on check-in day with Cancellation Protection</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">No refund (Hospitality Partner/Host has blocked the slot and prepared for the pet's arrival).</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">No-show (Pet Parent/Customer does not arrive)</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">No refund.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600">
          Emergency Bookings, being confirmed on short notice at the Hospitality Partner/Host's discretion, are
          non-refundable once confirmed.
        </p>
      </Section>

      <Section n={4} title="Cancellation by a Hospitality Partner/Host">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>If a Hospitality Partner/Host cancels a confirmed Booking for any reason, the Pet Parent/Customer is entitled to a full refund of the amount paid.</li>
          <li>Where reasonably possible, House of Boarding will attempt to help the Pet Parent/Customer find an alternative Hospitality Partner/Host for the same dates.</li>
          <li>Repeated cancellations by a Hospitality Partner/Host without valid cause may result in a lower internal trust score, removal of verification and other badges, additional review, or suspension from the Platform, independent of the rating-based commission slab.</li>
        </ul>
      </Section>

      <Section n={5} title="Early Pick-Up / Reduced Stay">
        <p>
          If a Pet Parent/Customer picks up a pet earlier than the originally booked check-out date, refunds for
          the unused portion of the stay are at the sole discretion of the Hospitality Partner/Host. House of
          Boarding will not be a part of any decision made by the Hospitality Partner/Host.
        </p>
      </Section>

      <Section n={6} title="Service Quality Disputes">
        <p>
          If a Pet Parent/Customer believes the Services provided materially differed from what was represented
          on the listing, or that their pet was not cared for appropriately, they can give a poor rating and real
          review with supporting evidence, and also report this to House of Boarding with supporting evidence
          (photos, messages, veterinary records, etc.) as a review report. House of Boarding may suspend or cancel
          the payout for that particular booking of the Hospitality Partner/Host. This review process does not
          make House of Boarding a guarantor of Service quality or liable for the underlying dispute.
        </p>
      </Section>

      <Section n={7} title="Extenuating Circumstances / Force Majeure">
        <p>
          Where a Booking cannot be honoured due to circumstances beyond either party's reasonable control
          (natural disaster, government-ordered lockdown, medical emergency affecting the Pet Parent/Customer or
          their pet, verified death in family, etc.), House of Boarding may, at its discretion, waive standard
          cancellation charges and facilitate a full or partial refund, on submission of reasonable supporting
          documentation.
        </p>
      </Section>

      <Section n={8} title="Refund Processing">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Approved refunds are processed to the original payment method used for the Booking, or House of Boarding may ask for necessary bank details (e.g., bank account number, IFSC code) via email for processing the refund. <span className="font-medium">(Note: House of Boarding will never ask for any OTP, password, card details, CVV, etc.)</span></li>
          <li>Refunds are typically initiated within 5–7 working days of approval and may take further time to reflect in your account, depending on your bank or payment provider.</li>
          <li>Payment-gateway transaction charges, where non-refundable to House of Boarding by the gateway provider, may be deducted from the refund amount.</li>
        </ul>
      </Section>

      <Section n={9} title="Non-Refundable Situations">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>No-shows, as described in Section 3;</li>
          <li>Cancellations made after the Service/boarding period has commenced, except as described in Section 5;</li>
          <li>Bookings cancelled due to the Pet Parent/Customer providing false information about the pet (species, vaccination status, temperament) that would have made the pet ineligible for boarding;</li>
          <li>Any amount already paid out to a Hospitality Partner/Host in cases of confirmed pet abandonment by the Pet Parent/Customer.</li>
        </ul>
      </Section>

      <Section n={10} title="How to Request a Cancellation or Refund">
        <p>
          Cancellations can be initiated from your account on the Platform. Go to <span className="font-medium">My Bookings</span>, open
          the booking you want to cancel, and select <span className="font-medium">"Cancel Booking"</span>. You'll be shown the exact
          refund amount before you confirm. Hospitality Partners/Hosts can request cancellation via email at{' '}
          <a href="mailto:support@houseofboarding.com" className="text-secondary font-semibold hover:underline">support@houseofboarding.com</a>{' '}
          or by contacting the Business Development Manager (BDM) directly at{' '}
          <a href="tel:+917498959039" className="text-secondary font-semibold hover:underline">+91-7498959039</a>.
        </p>
      </Section>

      <Section n={11} title="Changes to This Policy">
        <p>
          House of Boarding may revise this Policy from time to time. The revised Policy will apply to Bookings
          made after the date of the update; Bookings made prior to an update will continue to be governed by
          the Policy in force at the time of booking, unless the change is required by law.
        </p>
      </Section>
    </LegalPage>
  )
}
