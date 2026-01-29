'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle, FileText, Shield } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 ml-auto">Help Center</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        
        {/* FAQ Section */}
        <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><HelpCircle size={24} /></div>
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            <details className="group p-4 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold text-gray-900 list-none flex justify-between items-center">
                How long does delivery take?
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-600">We aim to deliver within 45 minutes for locations within 5km of our branches. Upcountry deliveries may take 24 hours.</p>
            </details>

            <details className="group p-4 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold text-gray-900 list-none flex justify-between items-center">
                Is M-Pesa payment secure?
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-600">Yes! All payments are processed directly through Safaricom's secure Daraja API. We do not store your PIN.</p>
            </details>

            <details className="group p-4 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold text-gray-900 list-none flex justify-between items-center">
                Can I return a product?
                <span className="transform group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-gray-600">Returns are accepted for damaged or incorrect items at the point of delivery only. Please check your goods upon receipt.</p>
            </details>
          </div>
        </section>

        {/* Terms Section */}
        <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><FileText size={24} /></div>
            <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
          </div>
          <div className="prose text-gray-600">
            <p className="mb-4">By using SuperMart, you agree to the following terms:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be of legal age to purchase specific beverages if applicable.</li>
              <li>Delivery fees are non-refundable once the rider has been dispatched.</li>
              <li>We reserve the right to cancel orders in case of stock unavailability.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}