import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Store } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PATHS } from '../../../router/paths';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, status, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Grocery & Foodstuff');
  const [terms, setTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      alert('Please accept terms of service to proceed.');
      return;
    }
    const success = await register({
      name,
      email,
      password,
      businessName,
      businessType,
    });
    if (success) {
      navigate(PATHS.ONBOARDING);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight text-center">
          Create business account
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1">
          Set up ShelfAware POS for your retail store in Nigeria.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-[var(--radius-control)] bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Adeola Adeleke"
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Business / Store Name"
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Adeola Supermart & Groceries"
          leftIcon={<Store className="w-4 h-4" />}
        />

        <Select
          label="Business Category"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        >
          <option value="Grocery & Foodstuff">Foodstuff, Grains & Provisions</option>
          <option value="Supermarket">Supermarket & Minimart</option>
          <option value="Frozen Foods">Frozen Foods & Cold Storage</option>
          <option value="Wholesale Wholesale">Wholesale Commodities Trader</option>
        </Select>

        <Input
          label="Business Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="store@domain.com"
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Create Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="flex items-start gap-2 text-xs pt-1 text-slate-600">
          <input
            type="checkbox"
            required
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span>
            I agree to the Terms of Service and Privacy Policy for point of sale operations.
          </span>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={status === 'loading'}
        >
          Get Started
        </Button>
      </form>

      <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-600">
        Already have an account?{' '}
        <Link to={PATHS.LOGIN} className="font-semibold text-emerald-600 hover:text-emerald-500">
          Sign In
        </Link>
      </div>
    </div>
  );
};

