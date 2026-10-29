import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, MapPin, Phone } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PATHS } from '../../../router/paths';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { business, user, completeOnboarding } = useAuthStore();
  const [step, setStep] = useState(1);

  // Form states
  const [businessName, setBusinessName] = useState(business?.name || 'Adeola Foods & Provisions');
  const businessType = 'Foodstuff & Retail';
  const [ownerName, setOwnerName] = useState(user?.name || 'Adeola Adeleke');
  const [phone, setPhone] = useState('+234 802 345 6789');
  const email = user?.email || 'adeola@adeolafoods.ng';
  const [address, setAddress] = useState('14 Broad Street, Lagos Island');
  const [currency] = useState('NGN (₦)');
  const [locale] = useState('en-NG (Nigeria)');

  const handleFinish = async () => {
    await completeOnboarding({
      businessName,
      businessType,
      ownerName,
      phone,
      email,
      address,
      currency: 'NGN',
      locale: 'en-NG',
    });
    navigate(PATHS.VERIFY_EMAIL);
  };

  return (
    <div className="space-y-6">
      {/* Progress steps */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </span>
          <span className="text-xs font-semibold text-slate-800">Store Profile</span>
        </div>
        <div className="w-8 h-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <span className="text-xs font-semibold text-slate-800">Review & Launch</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configure Your Store</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set up your business contact and location in Nigeria.
            </p>
          </div>

          <Input
            label="Trading / Store Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            leftIcon={<Store className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Manager / Owner Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Physical Store Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Operating Currency" value={currency} disabled />
            <Input label="Regional Locale" value={locale} disabled />
          </div>

          <Button className="w-full mt-2" onClick={() => setStep(2)}>
            Continue to Review
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Review Setup</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm your store details before launching the workspace.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-[var(--radius-card)] border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-semibold text-slate-900">{businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Store Category:</span>
              <span className="font-medium text-slate-800">{businessType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Person:</span>
              <span className="font-medium text-slate-800">{ownerName} ({phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Address:</span>
              <span className="font-medium text-slate-800 text-right max-w-xs">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Default Currency:</span>
              <span className="font-medium text-emerald-700">Nigerian Naira (₦)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="w-2/3" onClick={handleFinish} leftIcon={<CheckCircle className="w-4 h-4" />}>
              Complete Onboarding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
