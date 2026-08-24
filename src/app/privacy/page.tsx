import LegalContactInfo from '@/components/LegalContactInfo';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Mok Car Rental collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300">
            Your privacy matters to us
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">Last updated: January 2024</p>

              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-6">
                Mok Car Rental ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your
                information when you use our car rental services.
              </p>

              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Personal identification information (name, email, phone number)</li>
                <li>Driving license details</li>
                <li>Payment information</li>
                <li>Rental preferences and history</li>
                <li>Communication preferences</li>
                <li>Device and usage information when you visit our website</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Process and manage your car rental bookings</li>
                <li>Communicate with you about your reservations</li>
                <li>Provide customer support</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our services and website</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-6">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Service providers who assist in our operations</li>
                <li>Insurance companies for rental coverage</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-6">
                We implement appropriate security measures to protect your personal information
                from unauthorized access, alteration, disclosure, or destruction. However, no
                method of transmission over the Internet is 100% secure.
              </p>

              <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-6">
                We retain your personal information for as long as necessary to fulfill the
                purposes outlined in this policy, unless a longer retention period is required
                by law.
              </p>

              <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent where applicable</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">8. Cookies & Tracking</h2>
              <p className="text-gray-700 mb-6">
                Our website may use cookies and similar technologies to enhance your browsing
                experience. You can control cookie preferences through your browser settings.
              </p>

              <h2 className="text-2xl font-bold mb-4">9. Third-Party Links</h2>
              <p className="text-gray-700 mb-6">
                Our website may contain links to third-party websites. We are not responsible
                for the privacy practices of these external sites. We encourage you to review
                their privacy policies.
              </p>

              <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-6">
                Our services are not intended for individuals under 21 years of age. We do not
                knowingly collect personal information from minors.
              </p>

              <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 mb-6">
                We may update this Privacy Policy from time to time. Any changes will be posted
                on this page with an updated "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <LegalContactInfo />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
