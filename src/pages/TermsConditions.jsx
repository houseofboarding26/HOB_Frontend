import LegalPage, { Section } from '../components/LegalPage'

export default function TermsConditions() {
  return (
    <LegalPage
      title="Terms & Conditions"
      subtitle="Platform Terms of Use for Pet Parents/Customers and Hospitality Partners/Hosts"
      lastUpdated="Effective Date: [Insert Date] · Version 1.0"
    >
      <Section n={1} title="Acceptance of Terms">
        <p>
          These Terms &amp; Conditions ("Terms") constitute a legally binding agreement between you and House of
          Boarding, operating the website houseofboarding.com, a business registered in Nagpur, Maharashtra, India.
          By accessing or using the Platform as a Pet Parent/Customer or a Hospitality Partner/Host, you agree to
          be bound by these Terms, our Privacy Policy, Cookie Policy, Refund &amp; Cancellation Policy, and, if
          applicable, the Hospitality Partner/Host Agreement. If you do not agree, you must not use the Platform.
        </p>
      </Section>

      <Section n={2} title="Definitions">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-medium">"Pet Parent/Customer"</span> means an individual who registers on the Platform to search for and book pet boarding or related services.</li>
          <li><span className="font-medium">"Hospitality Partner/Host"</span> (also referred to as "Host" or "Partner") means an individual or entity that lists a boarding facility or pet-care service on the Platform.</li>
          <li><span className="font-medium">"Booking"</span> means a confirmed reservation made by a Pet Parent/Customer with a Hospitality Partner/Host through the Platform.</li>
          <li><span className="font-medium">"Emergency Booking"</span> means a Booking requested on same day of check-in, the pricing and terms of which are determined by House of Boarding and merged into the total Booking cost.</li>
          <li><span className="font-medium">"Services"</span> means the boarding and any ancillary pet-care services listed by a Hospitality Partner/Host.</li>
          <li><span className="font-medium">"Platform"</span> means houseofboarding.com.</li>
        </ul>
      </Section>

      <Section n={3} title="Nature of the Platform">
        <ul className="list-none space-y-2">
          <li><span className="font-medium">3.1</span> The Platform operates as a marketplace that facilitates interactions and transactions between Pet Parents/Customers and Hospitality Partners/Hosts.</li>
          <li><span className="font-medium">3.2</span> Unless expressly stated otherwise for a particular service, the Platform does not itself provide physical boarding or direct animal-care services. House of Boarding is an intermediary within the meaning of Section 2(1)(w) of the Information Technology Act, 2000, and does not own, operate, or manage any boarding facility listed on the Platform.</li>
          <li><span className="font-medium">3.3</span> A Hospitality Partner/Host is solely responsible for the services, representations, and care standards associated with its listing, subject to the Platform's rules and applicable law.</li>
          <li><span className="font-medium">3.4</span> The Platform may verify Hospitality Partners/Hosts, listings, and submitted information to improve safety and trust. Such verification does not constitute a guarantee that a Hospitality Partner/Host, facility, or pet is completely risk-free, and Pet Parents/Customers are strongly encouraged to conduct their own diligence (including an in-person visit, where possible) before booking.</li>
          <li><span className="font-medium">3.5</span> The Platform may use automated systems, human review, documentation checks, customer feedback, and incident history when evaluating accounts, listings, and Bookings, and reserves the right to suspend, restrict, or remove any account or listing at its sole discretion.</li>
        </ul>
      </Section>

      <Section n={4} title="Eligibility and Account Registration">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>You must be at least 18 years of age and legally competent to contract under the Indian Contract Act, 1872 to register on the Platform. The Platform is not intended for use by minors.</li>
          <li>You must provide accurate, current, and complete information during registration and keep it updated.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</li>
          <li>Hospitality Partners/Hosts must submit identity proof (e.g., Aadhaar), business/ownership proof, and property photographs as part of onboarding, and must promptly update the Platform if any licence, registration, or documentation lapses or changes.</li>
        </ul>
      </Section>

      <Section n={5} title="Pet Eligibility and Species Restrictions">
        <ul className="list-none space-y-2">
          <li><span className="font-medium">5.1</span> The Platform may be used to book boarding and related services for dogs, cats, and such pet birds and small mammals (e.g., rabbits, hamsters, guinea pigs) as are lawfully permitted to be kept as pets/companion animals in India. A reference (non-exhaustive) list of commonly permitted companion birds and small animals is set out in Annexure A. This list is provided for general guidance only and does not constitute legal advice.</li>
          <li><span className="font-medium">5.2</span> The Pet Parent/Customer is solely responsible for ensuring that the pet being boarded is lawfully owned and possessed in accordance with the Wildlife (Protection) Act, 1972, CITES regulations (where applicable to exotic/imported species), and any state or municipal law. House of Boarding does not permit the listing or boarding of any wild animal, native Indian bird species, or any species protected under the Wildlife (Protection) Act, 1972 or its Schedules, and any Pet Parent/Customer found to be in breach of this clause will have their booking cancelled without refund and may be reported to the appropriate authorities.</li>
          <li><span className="font-medium">5.3</span> Hospitality Partners/Hosts may additionally restrict the species, breeds, sizes, or number of pets they accept, as stated on their individual listing.</li>
        </ul>
      </Section>

      <Section n={6} title="Bookings, Emergency Bookings and Fees">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Bookings are confirmed only after completion of payment through the Platform. Hospitality Partners/Hosts have the right to cancel a booking anytime through writing to the House of Boarding authority or support team via email.</li>
          <li>Emergency Bookings are subject to pricing set by House of Boarding, which is merged with and reflected in the total Booking cost shown to the Pet Parent/Customer before confirmation.</li>
          <li>All applicable commission will be based on the agreement between House of Boarding and the Hospitality Partner/Host and calculated on the total value of the Booking, inclusive of any add-on services selected by the Pet Parent/Customer.</li>
          <li>Prices, availability, and service inclusions are set by the Hospitality Partner/Host; House of Boarding is not responsible for pricing errors made by a Hospitality Partner/Host, though we will assist in good-faith resolution of any such disputes.</li>
        </ul>
      </Section>

      <Section n={7} title="Ratings and Reviews">
        <p>
          House of Boarding sends a rating-request email to the Pet Parent/Customer after Booking completion; the
          rating provided in response is used as the primary and authoritative mechanism for calculating a
          Hospitality Partner/Host's average rating and applicable commission slab. House of Boarding reserves
          the right to investigate and disregard ratings it reasonably believes to be fraudulent, coerced, or
          manipulated.
        </p>
      </Section>

      <Section n={8} title="Verification and Trust & Safety">
        <p>
          House of Boarding may use a combination of document checks, automated systems, human review, customer
          feedback, and incident history to evaluate Hospitality Partner/Host accounts and listings before and
          after activation. Verification is a risk-reduction measure only and is not, and must not be understood
          as, a warranty or guarantee of the safety, competence, or conduct of any Hospitality Partner/Host, or
          of the health or safety of any pet boarded.
        </p>
      </Section>

      <Section n={9} title="Pet Safety, Cruelty and Abandonment">
        <ul className="list-none space-y-2">
          <li><span className="font-medium">9.1</span> House of Boarding has zero tolerance for cruelty, neglect, or abandonment of animals. All users must comply with the Prevention of Cruelty to Animals Act, 1960, the rules made thereunder (including the Prevention of Cruelty to Animals (Dog Breeding and Marketing) Rules, 2017, the Prevention of Cruelty to Animals (Pet Shop) Rules, 2018, and the Prevention of Cruelty to Animals (Care and Maintenance of Case Property Animals) Rules, 2017, as applicable), the animal-cruelty provisions of the Bharatiya Nyaya Sanhita, 2023, and the Wildlife (Protection) Act, 1972.</li>
          <li><span className="font-medium">9.2</span> Hospitality Partners/Hosts must provide humane, hygienic, and species-appropriate care, including adequate food, water, shelter, exercise, and veterinary attention where needed.</li>
          <li><span className="font-medium">9.3</span> Pet Parents/Customers must not abandon a pet at a Hospitality Partner/Host's facility. "Abandonment" includes failing to retrieve a pet within a reasonable period after the agreed check-out date without communication or payment of outstanding dues. Abandonment may be reported to the appropriate authorities (including local police and animal welfare organisations) and may result in the pet being handed over by the host to a recognised animal shelter or welfare body or any other person, in accordance with the on-site agreement executed between the Pet Parent/Customer and the Hospitality Partner/Host (see Section 14).</li>
          <li><span className="font-medium">9.4</span> Any user who becomes aware of suspected cruelty, neglect, or abandonment is encouraged to report it immediately to the local police, the State Animal Welfare Board, or the Animal Welfare Board of India.</li>
          <li><span className="font-medium">9.5</span> House of Boarding may suspend or permanently remove any account associated with credible reports of cruelty, neglect, or abandonment, and may cooperate with law enforcement and statutory authorities as required by law.</li>
        </ul>
      </Section>

      <Section n={10} title="User Conduct">
        <p className="mb-2">You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Provide false, misleading, or fraudulent information, documents, or reviews;</li>
          <li>List or board any wild or protected species, or any pet not lawfully owned;</li>
          <li>Use the Platform for any unlawful purpose, or to circumvent the Platform's booking and payment process to avoid applicable commission;</li>
          <li>Harass, threaten, or discriminate against any other user;</li>
          <li>Mistreat, neglect, or abandon any animal.</li>
        </ul>
      </Section>

      <Section n={11} title="Disclaimer of Warranties and Limitation of Liability">
        <ul className="list-none space-y-2">
          <li><span className="font-medium">11.1</span> THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. House of Boarding makes no representation or warranty as to the quality, safety, legality, or suitability of any Hospitality Partner/Host's Services, and disclaims all warranties, express or implied, to the maximum extent permitted by applicable law.</li>
          <li><span className="font-medium">11.2</span> House of Boarding is a facilitator/intermediary only and is NOT responsible or liable for any incident, accident, injury, illness, death, loss, or damage of any kind suffered by a pet, a Pet Parent/Customer, a Hospitality Partner/Host, or any third party, arising out of or in connection with a Booking, the care provided by a Hospitality Partner/Host, or any interaction between a Pet Parent/Customer and a Hospitality Partner/Host. All such risk and responsibility rests solely with the Hospitality Partner/Host providing the Service and, where relevant, the Pet Parent/Customer, as further recorded in the on-site agreement described in Section 14.</li>
          <li><span className="font-medium">11.3</span> To the maximum extent permitted by law, House of Boarding's aggregate liability for any claim arising out of or relating to the Platform or these Terms shall not exceed the commission actually received by House of Boarding in respect of the specific Booking giving rise to the claim.</li>
          <li><span className="font-medium">11.4</span> Nothing in this Section limits liability that cannot be excluded under applicable Indian law, including liability arising from House of Boarding's own fraud or wilful misconduct.</li>
        </ul>
      </Section>

      <Section n={12} title="Indemnification">
        <p>
          You agree to indemnify and hold harmless House of Boarding, its officers, employees, and affiliates
          from any claim, loss, liability, or expense (including reasonable legal fees) arising out of your
          breach of these Terms, your violation of applicable law, your negligence, or any dispute between a
          Pet Parent/Customer and a Hospitality Partner/Host.
        </p>
      </Section>

      <Section n={13} title="Disputes Between Pet Parents/Customers and Hospitality Partners/Hosts">
        <p>
          House of Boarding is not a party to, and is not responsible for resolving, any dispute, legal claim,
          or allegation (including allegations of fraud, negligence, cruelty, or property damage) arising between
          a Pet Parent/Customer and a Hospitality Partner/Host. Such disputes are to be resolved directly between
          the parties, including, where applicable, by reference to the on-site agreement signed between them at
          the Hospitality Partner/Host's property (Section 14). House of Boarding may, at its discretion and on
          a goodwill basis, assist in facilitating communication between the parties, but this does not create
          any obligation or liability on House of Boarding's part.
        </p>
      </Section>

      <Section n={14} title="On-Site Agreement Between Pet Parent/Customer and Hospitality Partner/Host">
        <p>
          At the time of drop-off, the Hospitality Partner/Host may require the Pet Parent/Customer to review
          and sign a separate, short-form agreement directly between the Pet Parent/Customer and the Hospitality
          Partner/Host ("On-Site Care &amp; Safety Agreement"), covering matters such as the pet's
          medical/vaccination history, emergency contact details, consent for emergency veterinary treatment,
          and abandonment terms. House of Boarding is not a party to that agreement, does not draft it on behalf
          of either party beyond providing an optional template, and bears no responsibility for its enforcement
          or outcome.
        </p>
      </Section>

      <Section n={15} title="Intermediary Status, Grievance Redressal">
        <p>
          House of Boarding has appointed a Grievance Officer in accordance with the Information Technology Act,
          2000 and the Consumer Protection (E-Commerce) Rules, 2020. Complaints may be addressed to the Grievance
          Officer, whose details are published in our Privacy Policy. We acknowledge complaints within 2–3 working
          days and endeavour to resolve them within one (1) month of receipt.
        </p>
      </Section>

      <Section n={16} title="Termination and Suspension">
        <p>
          House of Boarding may suspend, restrict, or terminate any account, at its sole discretion, for breach
          of these Terms, fraudulent activity, credible reports of cruelty or abandonment, repeated poor ratings,
          non-compliance with verification requirements, multiple rejections or no-shows, or any conduct that
          poses a risk to the Platform, other users, or animals. Users may close their own account at any time
          by contacting customer support, subject to settlement of any pending Bookings or dues.
        </p>
      </Section>

      <Section n={17} title="Intellectual Property">
        <p>
          All trademarks, logos, content, social media content and software associated with the Platform are the
          property of House of Boarding or its licensors. You may not copy, reproduce, or use them without prior
          written consent.
        </p>
      </Section>

      <Section n={18} title="Amendments">
        <p>
          House of Boarding may amend these Terms from time to time. Material changes will be notified through
          the Platform or by email, and continued use after such notice constitutes acceptance.
        </p>
      </Section>

      <Section n={19} title="Governing Law and Dispute Resolution">
        <p>
          These Terms are governed by the laws of India. Subject to the parties first attempting good-faith
          resolution, any dispute shall be referred to and finally resolved by arbitration under the Arbitration
          and Conciliation Act, 1996. Subject to the foregoing, the courts at Nagpur, Maharashtra shall have
          exclusive jurisdiction. Nothing in this clause prevents either party from approaching a consumer
          forum/commission under the Consumer Protection Act, 2019 where such recourse is available and
          mandatory by law.
        </p>
      </Section>

      <Section n={20} title="Contact Us">
        <p>
          For any questions about these Terms, please contact us at{' '}
          <a href="tel:+919890607240" className="text-secondary font-semibold hover:underline">+91-9890607240</a>{' '}
          or write to{' '}
          <a href="mailto:houseofboarding@gmail.com" className="text-secondary font-semibold hover:underline">houseofboarding@gmail.com</a>.
        </p>
      </Section>

      {/* Annexure A */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Annexure A — Reference List of Pets Permitted for Boarding</h2>
        <p className="text-sm text-gray-600 mb-4">
          This Annexure is provided as general, non-exhaustive guidance to help Pet Parents/Customers and
          Hospitality Partners/Hosts understand which categories of companion animals may typically be boarded
          through the Platform, based on India's Wildlife (Protection) Act, 1972 and related advisories. It is{' '}
          <span className="font-semibold">NOT legal advice</span>, and does not itself authorise possession of
          any species. The Pet Parent/Customer remains solely responsible for confirming the legal status of
          their specific pet, including any required CITES documentation, ownership registration, or
          state-specific rules, before booking.
        </p>

        <div className="space-y-5 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-800 mb-1">A.1 Dogs and Cats</p>
            <p>All domesticated dog and cat breeds are generally permitted, subject to applicable municipal registration/vaccination rules and any breed-specific restrictions imposed by the relevant State or Municipal Corporation (some States/cities restrict or regulate ownership of certain breeds classified as dangerous).</p>
          </div>

          <div>
            <p className="font-semibold text-gray-800 mb-1">A.2 Companion Birds (Non-Native / Exotic Only)</p>
            <p className="mb-2">Native Indian wild bird species (including but not limited to the rose-ringed parakeet, common myna, house sparrow, munias, and all raptors, owls, and migratory species) are <span className="font-semibold">strictly protected</span> under the Wildlife (Protection) Act, 1972 and MUST NOT be kept as pets or boarded on the Platform under any circumstances.</p>
            <p className="mb-1">Commonly kept exotic/non-native companion birds that may be boarded (where the Pet Parent/Customer holds valid proof of lawful acquisition) include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Budgerigars (budgies)</li>
              <li>Cockatiels</li>
              <li>Lovebirds (non-native varieties)</li>
              <li>Zebra finches and society finches</li>
              <li>Canaries</li>
              <li>Domesticated pigeons (non-wild-caught)</li>
              <li>Macaws, cockatoos, African grey parrots and similar CITES-listed exotic parrots — only with valid CITES/import/ownership documentation</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-800 mb-1">A.3 Small Mammals / Rodents</p>
            <p className="mb-1">Commonly kept small mammals generally legal to keep as pets in India include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Rabbits (domesticated breeds)</li>
              <li>Guinea pigs</li>
              <li>Hamsters (Syrian and dwarf varieties)</li>
              <li>Domesticated fancy rats and mice</li>
            </ul>
            <p className="mt-2 text-gray-500 text-xs">Note: some small mammal species are restricted or banned from import/keeping in certain jurisdictions. Hospitality Partners/Hosts and Pet Parents/Customers should independently confirm the legal status of any less-common small mammal before listing or booking.</p>
          </div>

          <div>
            <p className="font-semibold text-gray-800 mb-1">A.4 Strictly Prohibited</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Any native Indian wild animal or bird, or any species listed under Schedules of the Wildlife (Protection) Act, 1972;</li>
              <li>Any CITES Appendix-listed species without valid import/ownership documentation;</li>
              <li>Primates, big cats, elephants, reptiles requiring specialist wildlife permits, and marine mammals;</li>
              <li>Any animal the Pet Parent/Customer cannot demonstrate lawful ownership of, on request.</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">House of Boarding reserves the right to update this Annexure at any time and to refuse or cancel any Booking involving a species it reasonably believes is not lawfully permitted.</p>
      </div>
    </LegalPage>
  )
}
