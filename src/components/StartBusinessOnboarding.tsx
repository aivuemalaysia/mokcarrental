'use client';

import { useMemo, useState } from 'react';
import { FiCheck, FiUpload, FiX } from 'react-icons/fi';

type StepId = 'contact' | 'car' | 'review';

type FormState = {
  ownerName: string;
  contactNumber: string;
  email: string;
  businessName: string;
  carMake: string;
  carModel: string;
  carYear: string;
  notes: string;
  files: File[];
};

const steps: { id: StepId; label: string; description: string }[] = [
  { id: 'contact', label: 'Contact', description: 'Owner details' },
  { id: 'car', label: 'Car', description: 'Car info + photos' },
  { id: 'review', label: 'Review', description: 'Confirm & submit' },
];

function normalizePhone(input: string) {
  return input.replace(/[^\d+]/g, '').trim();
}

export default function StartBusinessOnboarding() {
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    ownerName: '',
    contactNumber: '',
    email: '',
    businessName: '',
    carMake: '',
    carModel: '',
    carYear: '',
    notes: '',
    files: [],
  });

  const currentStep = steps[stepIndex]?.id || 'contact';

  const previews = useMemo(() => {
    return form.files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [form.files]);

  const cleanupPreview = (url: string) => {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  };

  const validateStep = (target: StepId): string => {
    if (target === 'contact') {
      if (!form.ownerName.trim()) return 'Owner full name is required.';
      if (!form.contactNumber.trim()) return 'Contact number is required.';
      return '';
    }

    if (target === 'car') {
      if (!form.files.length) return 'Please upload at least 1 car photo.';
      return '';
    }

    if (target === 'review') {
      const contactError = validateStep('contact');
      if (contactError) return contactError;
      const carError = validateStep('car');
      if (carError) return carError;
      return '';
    }

    return '';
  };

  const goNext = () => {
    setError('');
    const nextIndex = Math.min(stepIndex + 1, steps.length - 1);
    const nextStep = steps[nextIndex]?.id;
    if (!nextStep) return;
    const validation = validateStep(currentStep);
    if (validation) {
      setError(validation);
      return;
    }
    setStepIndex(nextIndex);
  };

  const goBack = () => {
    setError('');
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const removeFile = (idx: number) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));
  };

  const submit = async () => {
    setError('');
    const validation = validateStep('review');
    if (validation) {
      setError(validation);
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.set('ownerName', form.ownerName.trim());
      data.set('contactNumber', normalizePhone(form.contactNumber));
      data.set('email', form.email.trim());
      data.set('businessName', form.businessName.trim());
      data.set('carMake', form.carMake.trim());
      data.set('carModel', form.carModel.trim());
      data.set('carYear', form.carYear.trim());
      data.set('notes', form.notes.trim());
      for (const file of form.files) data.append('files', file);

      const res = await fetch('/api/business-applications', { method: 'POST', body: data });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.ok === false) {
        setError(json?.error || 'Failed to submit application.');
        setSubmitting(false);
        return;
      }

      setSuccessId(String(json?.data?.id || ''));
      setSubmitting(false);
    } catch {
      setError('Failed to submit application.');
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="flex items-center gap-3 text-green-700">
          <FiCheck className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Submitted</h2>
        </div>
        <p className="mt-4 text-gray-700">
          Your business application has been submitted. Our team will review it and contact you after approval.
        </p>
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          Reference ID: <span className="font-semibold">{successId}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="border-b bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Start Your Car Rental Business</h2>
        <p className="mt-1 text-gray-600">Submit your info and car photos. After admin approval, we will list your cars.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((s, idx) => {
            const done = idx < stepIndex;
            const active = idx === stepIndex;
            return (
              <div
                key={s.id}
                className={`rounded-xl border p-4 ${active ? 'border-gold-500 bg-white' : 'border-gray-200 bg-white'} ${
                  done ? 'opacity-90' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{s.label}</div>
                  {done && <FiCheck className="h-5 w-5 text-green-600" />}
                </div>
                <div className="text-sm text-gray-600">{s.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {currentStep === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner Full Name *</label>
              <input
                className="input-field"
                value={form.ownerName}
                onChange={(e) => setForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                placeholder="e.g. Tan Ah Beng"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
              <input
                className="input-field"
                value={form.contactNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="+60..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="name@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name (optional)</label>
              <input
                className="input-field"
                value={form.businessName}
                onChange={(e) => setForm((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="e.g. ABC Car Rental"
              />
            </div>
          </div>
        )}

        {currentStep === 'car' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Car Make (optional)</label>
                <input
                  className="input-field"
                  value={form.carMake}
                  onChange={(e) => setForm((prev) => ({ ...prev, carMake: e.target.value }))}
                  placeholder="e.g. Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Car Model (optional)</label>
                <input
                  className="input-field"
                  value={form.carModel}
                  onChange={(e) => setForm((prev) => ({ ...prev, carModel: e.target.value }))}
                  placeholder="e.g. Vios"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Car Year (optional)</label>
                <input
                  className="input-field"
                  value={form.carYear}
                  onChange={(e) => setForm((prev) => ({ ...prev, carYear: e.target.value }))}
                  placeholder="e.g. 2020"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Car Photos * (min 1, max 6)</label>
              <div className="rounded-xl border border-dashed border-gray-300 p-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiUpload className="h-5 w-5" />
                  <div className="font-medium">Upload car photos</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-4"
                  onChange={(e) => {
                    const next = Array.from(e.target.files || []).slice(0, 6);
                    setForm((prev) => ({ ...prev, files: next }));
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">Images only. Recommended: clear exterior photos.</div>
              </div>
            </div>

            {form.files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((p, idx) => (
                  <div key={p.url} className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="relative">
                      <img
                        src={p.url}
                        alt={p.name}
                        className="h-40 w-full object-cover"
                        onLoad={() => cleanupPreview(p.url)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/70"
                        aria-label="Remove photo"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-3 text-xs text-gray-600 truncate">{p.name}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                rows={4}
                className="input-field"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Any extra info (location, pricing, availability)..."
              />
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-6">
              <div className="font-semibold text-gray-900 mb-3">Contact</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div><span className="text-gray-500">Owner:</span> {form.ownerName || '-'}</div>
                <div><span className="text-gray-500">Phone:</span> {normalizePhone(form.contactNumber) || '-'}</div>
                <div><span className="text-gray-500">Email:</span> {form.email || '-'}</div>
                <div><span className="text-gray-500">Business:</span> {form.businessName || '-'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-6">
              <div className="font-semibold text-gray-900 mb-3">Car</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                <div><span className="text-gray-500">Make:</span> {form.carMake || '-'}</div>
                <div><span className="text-gray-500">Model:</span> {form.carModel || '-'}</div>
                <div><span className="text-gray-500">Year:</span> {form.carYear || '-'}</div>
              </div>
              <div className="mt-4 text-sm text-gray-700">
                <span className="text-gray-500">Photos:</span> {form.files.length}
              </div>
              {form.notes && (
                <div className="mt-4 text-sm text-gray-700">
                  <span className="text-gray-500">Notes:</span> {form.notes}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || submitting}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep !== 'review' ? (
            <button
              type="button"
              onClick={goNext}
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

