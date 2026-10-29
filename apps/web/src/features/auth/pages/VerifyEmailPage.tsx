import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PATHS } from '../../../router/paths';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(PATHS.POS);
      }, 1200);
    }, 600);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
        <Mail className="w-6 h-6" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Verify your staff email</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          We sent a 6-digit confirmation code to your email. (Simulated Demo Code: any 6 numbers)
        </p>
      </div>

      {isSuccess ? (
        <div className="p-4 rounded-[var(--radius-card)] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Email successfully verified! Redirecting to Point of Sale...</span>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex justify-center gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-10 h-12 text-center text-lg font-bold border border-slate-300 rounded-[var(--radius-control)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            ))}
          </div>

          <Button
            className="w-full"
            onClick={handleVerify}
            isLoading={isVerifying}
            disabled={code.some((c) => !c)}
          >
            Verify & Launch POS
          </Button>

          <p className="text-xs text-slate-500">
            Didn't receive code?{' '}
            <button
              type="button"
              onClick={() => alert('Verification code resent (Simulated).')}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Resend Code
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

