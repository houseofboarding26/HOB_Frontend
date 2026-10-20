import LegalPage, { Section } from '../components/LegalPage'

export default function SafetyPolicy() {
  return (
    <LegalPage
      title="Safety & Responsibilities Policy"
      subtitle="Detailed obligations of the Pet Parent/Customer, the Hospitality Partner/Host, and House of Boarding"
      lastUpdated="houseofboarding.com | Nagpur, Maharashtra, India"
    >
      <p className="text-gray-600 text-sm leading-relaxed mb-7">
        This Policy sets out, in detail, the safety-related responsibilities of each party involved in a booking
        made through House of Boarding: the Pet Parent/Customer, the Hospitality Partner/Host, and House of
        Boarding itself. It is intended to be read alongside, and does not replace, the Terms &amp; Conditions,
        Privacy Policy, Refund &amp; Cancellation Policy, and the On-Site Care &amp; Safety Agreement signed at check-in.
      </p>

      <Section n={1} title="Information Collected for Safety Purposes">
        <p className="font-semibold text-gray-800 mb-2">1.1 From Pet Parents/Customers</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Contact details: name, address, contact number, email address</li>
          <li>Pet identity details: pet type, pet name, age (in months), colour and markings, breed, gender, weight (kg), size</li>
          <li>Vaccination details, including date (day/month/year) of last vaccination</li>
          <li>Whether tick treatment has previously been done</li>
          <li>Health issues in the last 30 days</li>
          <li>Medical history</li>
          <li>Behavioural issues</li>
          <li>Spayed or neutered</li>
          <li>Tamed or untamed</li>
        </ul>
        <p className="text-sm text-gray-600 mb-5">
          This information helps the Hospitality Partner/Host understand and prepare for the specific needs of
          the pet, and is shared with them for this purpose only for the duration of, and strictly in connection
          with, the relevant booking.
        </p>

        <p className="font-semibold text-gray-800 mb-2">1.2 From Hospitality Partners/Hosts</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <li>Business owner name, street address, area/locality, city, state, pin code</li>
          <li>Stay type (Homestay or Professional) and property type (Owned or Rented)</li>
          <li>Optional profile description shown to customers</li>
          <li>Pets accepted (Dogs, Cats, Birds, Small Pets) with pet-specific details for each</li>
          <li>Services offered (Single Day/Multiday Boarding, Emergency/Hourly Boarding)</li>
          <li>Business details: name of business, stay-limitation policy (if any), property area size, number of caretakers at the property, years of experience, property rules and guest information, amenities, and property photographs</li>
          <li>Verification documents: Aadhaar Card (front and back), address proof (electricity bill, Aadhaar, rent agreement or similar), No-Objection Certificate from neighbours/landlord, and Business Proof (any of Gomasta Licence, Udyam Registration, GST Certificate, as applicable)</li>
        </ul>
        <p className="text-sm text-gray-600">
          All verification documents are encrypted and accessible only to the House of Boarding Trust &amp; Safety team, used solely for host verification.
        </p>
      </Section>

      <Section n={2} title="Pet Parent/Customer Responsibilities">
        <p className="font-semibold text-gray-800 mb-2">2.1 Accuracy of Information</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Provide true, complete and current details about yourself and your pet at the time of registration and booking, including contact details, address, and all pet-identity fields (type, name, age, breed, gender, weight, size, colour/markings).</li>
          <li>Disclose vaccination status and date accurately, and provide physical/digital proof at check-in where requested.</li>
          <li>Disclose any tick treatment history, spayed or neutered, tamed or untamed, health issues in the last 30 days, ongoing medical conditions, medication needs, and behavioural issues (e.g., anxiety, aggression, resource-guarding, fear of other animals) truthfully and in full.</li>
          <li>Update your pet's information before a new booking if anything has materially changed since the last stay (e.g., a new diagnosis, a recent injury, a new medication, vaccinations).</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">2.2 Before and At Check-In</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Confirm the pet being boarded is of a species lawful to keep/board in India, per the Terms &amp; Conditions and applicable Wildlife (Protection) Act, 1972 provisions.</li>
          <li>Carry original or certified copies of vaccination records, and any current medication with clear dosage instructions.</li>
          <li>Provide a valid ID proof and at least one emergency contact (in addition to yourself) who can be reached if you are unavailable.</li>
          <li>Read and sign the On-Site Care &amp; Safety Agreement with the Hospitality Partner/Host, and cooperate with any reasonable document checks the Host performs.</li>
          <li>Disclose any known compatibility issues (e.g., your pet does not get along with other dogs/cats) so the Host can plan accordingly.</li>
          <li>Drop your pet on the agreed check-in date/time; if you anticipate a delay, inform the Host to avoid being treated as a no-show.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">2.3 During the Booking</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Remain reachable via the contact details provided for the full duration of the boarding period, especially in case of a medical emergency requiring your authorisation.</li>
          <li>Respond promptly to any communication from the Hospitality Partner/Host regarding your pet's condition, behaviour, or an incident.</li>
          <li>Collect your pet on the agreed check-out date/time; if you anticipate a delay, inform the Host as early as possible to avoid being treated as non-contactable under the Abandonment Clause of the On-Site Care &amp; Safety Agreement.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">2.4 Prohibited Conduct</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Do not misrepresent your pet's health, vaccination status, temperament, or species.</li>
          <li>Do not abandon your pet with a Hospitality Partner/Host, and do not use the Platform for any pet you do not have lawful custody of.</li>
          <li>Do not attempt to pressure, bribe, or coerce a Host into giving a favourable rating, and do not submit a false or malicious review.</li>
        </ul>
      </Section>

      <Section n={3} title="Hospitality Partner/Host Responsibilities">
        <p className="font-semibold text-gray-800 mb-2">3.1 Onboarding &amp; Verification</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Keep your listing accurate and updated — pets accepted, services offered, capacity, amenities, and photographs must reflect your actual facility at all times.</li>
          <li>Cooperate with House of Boarding's verification process, including providing clarifications or additional documents if requested, and understand that your listing will remain inactive until verification is complete.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">3.2 Standard of Care</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Hosts must provide care only for the pet types and species for which their listing has been verified and approved, and only for species that are lawful to keep, accommodate, or board in India.</li>
          <li>The Host must provide the Pet Parent with at least three (3) real-time, timestamped videos, each of a minimum duration of 30 seconds, showing the pet’s activities, upon the Pet Parent’s request, for each day of the boarding period. This requirement applies throughout the pet’s stay at the Host’s facility.</li>
          <li>Review each pet's vaccination, medical, and behavioural information at the time of check-in.</li>
          <li>Provide adequate food, clean water, shelter, rest space, hygiene, and species-appropriate exercise/enrichment for the full duration of the stay, consistent with your declared property size, caretaker count, and experience.</li>
          <li>Never use physical punishment or any method that causes unnecessary fear, pain, or suffering to a boarded animal.</li>
          <li>Where multiple pets or species are boarded together, take reasonable steps to prevent fights, stress, or disease transmission (e.g., appropriate segregation).</li>
          <li>Maintain basic first-aid readiness and have a clear plan for prompt access to veterinary care in an emergency.</li>
          <li>Administer only the medication and care instructed by the Pet Parent/Customer, and do not administer any medication, treatment, or grooming procedure not agreed to.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">3.3 At Check-In</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Collect the signed On-Site Care &amp; Safety Agreement, along with a copy of ID proof, vaccination record, and any relevant medical/behavioural documentation, from every Pet Parent/Customer before accepting their pet.</li>
          <li>Record the emergency contact details and, where the Pet Parent/Customer has provided one, veterinary emergency authorisation.</li>
          <li>Conduct a basic health/condition check of the pet at hand-over and note any pre-existing marks, injuries, or conditions to avoid later disputes.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">3.4 During the Booking &amp; Incident Reporting</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Monitor boarded pets appropriately throughout the stay, consistent with your declared caretaker capacity.</li>
          <li>Notify the Pet Parent/Customer immediately of any injury, illness, escape, behavioural incident, or emergency involving their pet, and seek prompt veterinary care where needed (using any emergency authorisation provided).</li>
          <li>Follow the Abandonment Clause set out in the On-Site Care &amp; Safety Agreement if a Pet Parent/Customer cannot be reached after the agreed check-out date — this includes attempting the emergency contact, notifying local police and/or a recognised animal welfare organisation, and never unilaterally selling, harming, abandoning, or euthanising the pet.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">3.5 Compliance &amp; Prohibited Conduct</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Comply at all times with the Prevention of Cruelty to Animals Act, 1960 and related rules, the Wildlife (Protection) Act, 1972, and other applicable central/state/municipal law.</li>
          <li>Do not accept, board, breed, or trade in any species prohibited under the Wildlife (Protection) Act, 1972.</li>
          <li>Do not misrepresent your facility, staff qualifications, experience, or care standards to Pet Parents/Customers.</li>
          <li>Do not solicit a Pet Parent/Customer introduced via the Platform to book directly off-platform to avoid commission.</li>
          <li>Do not attempt to manipulate ratings through incentives, coercion, or fake bookings.</li>
        </ul>
      </Section>

      <Section n={4} title="House of Boarding's Role & Limits">
        <p className="font-semibold text-gray-800 mb-2">4.1 What We Do</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-5">
          <li>Review Hospitality Partner/Host documents and listing information before activation, using a combination of automated checks and human review.</li>
          <li>Facilitate the booking, payment, and rating process between Pet Parents/Customers and Hospitality Partners/Hosts.</li>
          <li>Collect post-booking ratings directly from Pet Parents/Customers via email as the primary, tamper-resistant mechanism for authentic feedback.</li>
          <li>Monitor incident history, ratings, and credible safety reports as part of our ongoing Trust &amp; Safety evaluation of listings.</li>
          <li>Keep checking credible reports of cruelty, neglect, abandonment, fraud, or serious safety incidents, in order to suspend or remove a listing pending review where warranted.</li>
        </ul>

        <p className="font-semibold text-gray-800 mb-2">4.2 What We Do Not Do</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>We do not provide physical boarding or direct animal-care services ourselves.</li>
          <li>Verification of a Hospitality Partner/Host's documents and listing does not constitute a guarantee that the Host, hospitality partner, facility, or a specific pet-care outcome is risk-free.</li>
          <li>We are not a party to, and bear no responsibility for, disputes, injuries, illness, death, or losses arising directly between a Pet Parent/Customer and a Hospitality Partner/Host — these are governed by the On-Site Care &amp; Safety Agreement signed between those two parties, and by the liability terms of our Terms &amp; Conditions.</li>
          <li>We do not adjudicate individual care disputes; our review process is limited to trust-and-safety evaluation of the Platform (e.g., suspending a listing), not compensating or resolving a specific incident between users.</li>
        </ul>
      </Section>

      <Section n={5} title="Relationship to Other Documents">
        <p>
          This Policy works together with, and should be read alongside: the Terms &amp; Conditions (governing
          the overall platform relationship, liability, and prohibited/permitted pet species), the Privacy Policy
          (governing how personal and pet data is stored, used and protected), the Refund &amp; Cancellation
          Policy, and the On-Site Care &amp; Safety Agreement (the direct agreement signed between the Pet
          Parent/Customer and the Hospitality Partner/Host at check-in). In the event of any conflict between
          this Policy and the Terms &amp; Conditions on a legal or liability matter, the Terms &amp; Conditions
          shall prevail.
        </p>
      </Section>
    </LegalPage>
  )
}
