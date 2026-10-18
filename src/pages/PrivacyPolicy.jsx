import LegalPage, { Section } from '../components/LegalPage'

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Governing the collection, use and disclosure of personal data on the House of Boarding platform"
      lastUpdated="Effective Date: [Insert Date] · Version 1.0"
    >
      <p className="text-gray-600 text-sm leading-relaxed mb-7">
        House of Boarding ("House of Boarding", "Platform", "we", "us", "our") operates the website{' '}
        <span className="font-medium">houseofboarding.com</span>, which connects Pet Parents/Customers seeking
        boarding and related pet-care services with independent Hospitality Partners/Hosts who list such services.
        This Privacy Policy explains what personal data we collect, why we collect it, how it is used, stored,
        shared and protected, and the rights available to you as a "Data Principal" under the Digital Personal
        Data Protection Act, 2023 and the Digital Personal Data Protection Rules, 2025 (together, the "DPDP Act"),
        and other applicable Indian laws including the Information Technology Act, 2000 and rules made thereunder.
      </p>
      <p className="text-gray-600 text-sm leading-relaxed mb-7">
        By creating an account, browsing, or using any part of the Platform, you consent to the collection and
        processing of your personal data as described in this Policy. If you do not agree, please do not use the Platform.
      </p>

      <Section n={1} title="Introduction">
        <p>This Policy applies to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Pet Parents/Customers who register, browse, book, or transact on the Platform;</li>
          <li>Hospitality Partners/Hosts who list boarding facilities or services on the Platform;</li>
          <li>Visitors who browse houseofboarding.com without creating an account; and</li>
          <li>Any other individual whose personal data we receive in connection with the operation of the Platform (e.g., emergency contacts provided by a Pet Parent).</li>
        </ul>
      </Section>

      <Section n={2} title="Who This Policy Applies To">
        <p>This Policy applies to all persons described in Section 1 above who interact with the Platform in any capacity.</p>
      </Section>

      <Section n={3} title="Information We Collect">
        <p className="font-semibold text-gray-800 mb-2">3.1 Information You Provide Directly</p>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <li><span className="font-medium">Identity and contact details:</span> full name, email address, phone number, residential/billing address.</li>
          <li><span className="font-medium">Government-issued identification:</span> Aadhaar card, address proof or other proof of identity (primarily collected from Hospitality Partners/Hosts for verification, and may be collected from Pet Parents/Customers for safety/identity confirmation at a Hospitality Partner/Host's property).</li>
          <li><span className="font-medium">Business documentation:</span> business registration/ownership proof, property photographs, licences and related documentation submitted by Hospitality Partners/Hosts during onboarding.</li>
          <li><span className="font-medium">Payment information:</span> bank account/UPI details, payment card details processed through our payment gateway partners Razorpay (we do not store full card numbers on our own servers). We may ask for bank details via House of Boarding authorised email id to process refunds to Pet Parents/Customers. We also ask for bank details to the Hospitality Partner/Host for payouts.</li>
          <li><span className="font-medium">Pet details:</span> species, breed, age, weight, colour and marking, unique identification number (if any), medical and behavioural history, deworming and vaccination records, tick/flea treatment history, dietary (if any) and temperament information.</li>
          <li><span className="font-medium">Communications:</span> messages exchanged through the Platform, correspondence with customer support, ratings and reviews you submit.</li>
        </ul>
        <p className="font-semibold text-gray-800 mb-2">3.2 Information Collected Automatically</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Cookies and similar tracking technologies (see our separate Cookie Policy).</li>
          <li>Device and usage data: IP address, browser type, device identifiers, pages visited, time spent, referring URLs, and general analytics data.</li>
        </ul>
      </Section>

      <Section n={4} title="How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To create and manage your account and to verify identity and build trust on the platform (KYC);</li>
          <li>To enable bookings, process payments, calculate commissions, and facilitate payouts to Hospitality Partners/Hosts;</li>
          <li>To verify Hospitality Partners/Hosts, listings, and the documentation submitted, in order to improve safety and trust on the Platform;</li>
          <li>To match Pet Parents/Customers with nearby or relevant Hospitality Partners/Hosts and pet type;</li>
          <li>To send booking confirmations, service updates, invoices, and the post-booking rating request email described in our Terms &amp; Conditions;</li>
          <li>To provide customer support and resolve complaints or grievances;</li>
          <li>
            By uploading photos to your listing, you grant House of Boarding a non-exclusive, royalty-free licence to display those photos on the House of Boarding platform and to use them for promotional and marketing purposes across our website, social media channels, and paid advertising.
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The photos you upload of your home may be used on House of Boarding's Instagram, in Meta/Google ads, on the House of Boarding website, and in promotional materials.</li>
              <li>Please upload only photos that are safe to share publicly. Do not upload photos showing your full home address, house number board, or clearly identifiable exterior of the building; photos of other people (family members, neighbours, children) without their consent; photos of documents, ID cards, keys, or anything sensitive; or photos of valuables or security-relevant details.</li>
              <li>You can request removal of any of your photos from marketing use at any time by writing to <a href="mailto:houseofboarding@gmail.com" className="text-secondary font-semibold hover:underline">houseofboarding@gmail.com</a>.</li>
            </ul>
          </li>
          <li>For marketing and promotional communications, where you have not opted out;</li>
          <li>For internal analytics, fraud prevention, safety investigations, and improvement of the Platform;</li>
          <li>To comply with applicable law, regulatory requests, and to enforce our Terms &amp; Conditions and partner agreements.</li>
        </ul>
      </Section>

      <Section n={5} title="Legal Basis for Processing">
        <p>
          We process your personal data primarily on the basis of your consent, given at the time of account creation, booking, or document submission. Where applicable, we may also process personal data for "legitimate uses" recognised under the DPDP Act, such as compliance with law, responding to a medical emergency involving a pet, or fraud/safety investigations. You may withdraw consent at any time, subject to Section 10 below; withdrawal does not affect processing carried out before withdrawal and may result in our inability to continue providing certain services.
        </p>
      </Section>

      <Section n={6} title="Sharing and Disclosure of Information">
        <p className="mb-2">We do not sell your personal data. We share personal data only in the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>With payment gateway providers, solely to process payments and payouts;</li>
          <li>With cloud hosting and infrastructure providers, solely to store and operate the Platform securely;</li>
          <li>Between a Pet Parent and a Hospitality Partner/Host, to the extent necessary to complete a booking, after the booking is confirmed (e.g., pet details, vaccination records, emergency contact, identity information and more are shared with the Hospitality Partner/Host handling that booking, and vice versa);</li>
          <li>With law enforcement, courts, regulators, or government authorities where required by law, or to protect the safety of a person or animal;</li>
          <li>With professional advisors (legal, accounting) bound by confidentiality obligations;</li>
          <li>In connection with a merger, acquisition, or sale of assets, subject to equivalent privacy protections.</li>
        </ul>
      </Section>

      <Section n={7} title="Data Storage, Security and Retention">
        <p className="mb-2">
          We store collected data on secure cloud infrastructure and apply reasonable technical and organisational security measures, including access controls and encryption in transit, to protect it against unauthorised access, alteration, disclosure or destruction. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
        <p>
          We retain collected data for as long as necessary to fulfil the purposes described in this Policy, to comply with our legal, accounting, or reporting obligations, or as otherwise required under the DPDP Rules, 2025. Pet medical/vaccination records and identity documents collected for a specific booking are retained only as long as reasonably needed for that booking, safety investigations, or legal compliance, after which they are deleted or anonymised.
        </p>
      </Section>

      <Section n={8} title="Cross-Border Data Transfer">
        <p>
          Where our service providers (such as cloud hosting or payment infrastructure) process data outside India, we take reasonable steps to ensure such transfers are conducted in a manner consistent with the DPDP Act and any restrictions notified by the Central Government from time to time.
        </p>
      </Section>

      <Section n={9} title="Children's Data">
        <p>
          The Platform is intended for use only by individuals who are 18 years of age or older. We do not knowingly collect personal data from minors. If we become aware that we have inadvertently collected personal data from a minor without verifiable parental/guardian consent, we will take steps to delete such data promptly.
        </p>
      </Section>

      <Section n={10} title="Your Rights as a Data Principal">
        <p className="mb-2">Subject to the DPDP Act, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Access a summary of the collected data we hold about you and the processing activities undertaken;</li>
          <li>Correct, complete, or update inaccurate or misleading collected data;</li>
          <li>Request erasure of collected data that is no longer necessary for the purpose for which it was collected, subject to our legal retention obligations;</li>
          <li>Withdraw consent at any time, as easily as it was given;</li>
          <li>Nominate another individual to exercise these rights on your behalf in the event of death or incapacity;</li>
          <li>Lodge a grievance with our Grievance Officer (Section 12), and thereafter with the Data Protection Board of India, if unresolved.</li>
        </ul>
        <p className="mt-2">We will endeavour to respond to and resolve verified requests and grievances within a reasonable time, and in any event not exceeding ninety (90) days.</p>
      </Section>

      <Section n={11} title="Cookies">
        <p>
          The Platform uses cookies and similar technologies to operate, secure, and improve your experience. Details of the categories of cookies used, their purpose, and how to manage your preferences are set out in our separate Cookie Policy, which forms part of this Privacy Policy by reference. You can control cookies through your browser settings.
        </p>
      </Section>

      <Section n={12} title="Grievance Officer / Contact Us">
        <p className="mb-3">If you have questions, requests, or grievances relating to this Privacy Policy or the processing of your personal data, please contact our Grievance Officer:</p>
        <ul className="space-y-1.5 text-sm text-gray-700">
          <li><span className="font-medium">Name:</span> Shrikant Wadhi</li>
          <li><span className="font-medium">Designation:</span> Grievance Officer, House of Boarding</li>
          <li><span className="font-medium">Email:</span>{' '}
            <a href="mailto:houseofboarding@gmail.com" className="text-secondary font-semibold hover:underline">
              houseofboarding@gmail.com
            </a>
          </li>
          <li><span className="font-medium">Phone:</span> 9890607240</li>
          <li><span className="font-medium">Address:</span> 155, Adhyapak Nagar, Manewada, Nagpur, Maharashtra, India</li>
        </ul>
        <p className="mt-3">We will acknowledge complaints within 2–3 working days and endeavour to resolve them within one (1) month, in line with the Consumer Protection (E-Commerce) Rules, 2020.</p>
      </Section>

      <Section n={13} title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in law, our practices, or the Platform's features. Material changes will be notified to you via the Platform or by email, and the "Last Updated" date above will be revised. Continued use of the Platform after such changes constitutes acceptance of the updated Policy.
        </p>
      </Section>

      <Section n={14} title="Governing Law">
        <p>
          This Policy is governed by the laws of India. Any disputes arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the courts at Nagpur, Maharashtra, subject to Section 18 (Dispute Resolution) of our Terms &amp; Conditions. Before initiating any legal proceedings, users must first contact House of Boarding support in writing or via email within 15 days of the incident and give us a reasonable opportunity to resolve the matter.
        </p>
      </Section>
    </LegalPage>
  )
}
