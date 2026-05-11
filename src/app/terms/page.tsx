export const metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms and conditions for renting a car from Mok Car Rental in Johor Bahru.',
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-300">
            Please read our rental terms and conditions carefully
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">Last updated: January 2024</p>

              <h2 className="text-2xl font-bold mb-4">1. Rental Agreement</h2>
              <p className="text-gray-700 mb-6">
                By renting a vehicle from Mok Car Rental, you agree to these terms and conditions.
                The rental agreement begins when you take possession of the vehicle and ends when
                the vehicle is returned to us.
              </p>

              <h2 className="text-2xl font-bold mb-4">2. Driver Requirements</h2>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Minimum age of 21 years old</li>
                <li>Valid driving license held for at least 1 year</li>
                <li>Singapore driving licenses are accepted</li>
                <li>International driving permits are accepted</li>
                <li>Additional documentation may be required</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">3. Rental Rates & Payments</h2>
              <p className="text-gray-700 mb-4">
                Our rental rates include:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Basic insurance coverage</li>
                <li>Unlimited passengers (up to vehicle capacity)</li>
                <li>24/7 roadside assistance</li>
                <li>200km daily mileage allowance</li>
              </ul>
              <p className="text-gray-700 mb-6">
                Additional charges apply for: extra mileage (RM0.30-0.50/km), fuel, tolls,
                traffic violations, and vehicle damage.
              </p>

              <h2 className="text-2xl font-bold mb-4">4. Security Deposit</h2>
              <p className="text-gray-700 mb-6">
                A security deposit of RM200-500 is required at pickup, depending on the vehicle
                type. The deposit is fully refundable within 7 business days upon return of the
                vehicle in good condition.
              </p>

              <h2 className="text-2xl font-bold mb-4">5. Fuel Policy</h2>
              <p className="text-gray-700 mb-6">
                We operate on a full-to-full policy. You will receive the vehicle with a full
                tank and must return it with a full tank. If returned empty, refueling charges
                will apply at RM2.50 per liter.
              </p>

              <h2 className="text-2xl font-bold mb-4">6. Vehicle Condition & Inspection</h2>
              <p className="text-gray-700 mb-6">
                A thorough vehicle inspection is conducted before and after each rental. Any
                existing damage will be documented. You are responsible for reporting any new
                damage during your rental period.
              </p>

              <h2 className="text-2xl font-bold mb-4">7. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">
                The vehicle must not be used for:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Any illegal activities</li>
                <li>Racing or speed tests</li>
                <li>Towing or pushing other vehicles</li>
                <li>Off-road driving (unless specifically permitted)</li>
                <li>Transporting hazardous materials</li>
                <li>Sub-letting or unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">8. Insurance & Liability</h2>
              <p className="text-gray-700 mb-6">
                Basic insurance is included in the rental rate. You are liable for any damage
                not covered by insurance, including damage caused by negligence, intoxication,
                or unauthorized drivers.
              </p>

              <h2 className="text-2xl font-bold mb-4">9. Cancellations & Refunds</h2>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Free cancellation up to 48 hours before pickup</li>
                <li>50% charge for cancellations within 24-48 hours</li>
                <li>Full day's rate for no-shows or same-day cancellations</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">10. Late Returns</h2>
              <p className="text-gray-700 mb-6">
                A grace period of 1 hour is allowed. Returns more than 1 hour late will incur
                additional rental charges. Returns more than 24 hours late may be reported to
                authorities.
              </p>

              <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-6">
                For any questions about these terms, please contact us:
                <br />
                <strong>Mok Car Rental</strong><br />
                Taman Molek, Johor Bahru, Malaysia<br />
                WhatsApp: +60 12-345 6789<br />
                Email: info@mokcarrental.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
