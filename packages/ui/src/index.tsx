import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, X, Info } from 'lucide-react';

// --- PREMIUM WINDOWS 11 FLUENT CARD ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`border border-white/5 bg-[#202026]/90 backdrop-blur-2xl p-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// --- NATIVE WINDOWS 11 FLUENT BUTTON ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "font-sans font-medium rounded-[4px] transition-all duration-150 select-none focus:outline-none flex items-center justify-center gap-2 border active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-4.5 py-2 text-xs",
    lg: "px-6 py-2.5 text-sm"
  };

  const variantStyles = {
    // Windows 11 Primary Accent Blue Button
    primary: "border-transparent bg-[#0078d4] hover:bg-[#106ebe] text-white active:bg-[#005a9e] shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:ring-2 focus:ring-[#60cdff]/40",
    // Windows 11 Command Button (Secondary dark)
    secondary: "border-[#3e3e42] bg-[#2d2d30] hover:bg-[#353538] hover:border-[#4c4c50] text-[#f3f3f5] active:bg-[#202022] focus:ring-2 focus:ring-white/10",
    // Windows 11 Success Accent (Emerald/Teal)
    accent: "border-transparent bg-[#107c41] hover:bg-[#0b5930] text-white active:bg-[#094827] shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:ring-2 focus:ring-emerald-400/40",
    // Windows 11 Delete/Danger Button
    danger: "border-transparent bg-[#a80000] hover:bg-[#b31412] text-white active:bg-[#7a0000] shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:ring-2 focus:ring-red-400/40"
  };

  const disabledStyle = "opacity-35 cursor-not-allowed transform-none shadow-none pointer-events-none";

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? disabledStyle : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- NATIVE WINDOWS 11 FLUENT TEXTBOX (INPUT) ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-medium text-neutral-300 mb-1.5 tracking-wide select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`w-full bg-[#202024] border border-white/10 border-b-neutral-400 rounded-[4px] px-3 py-2 text-xs text-white placeholder-neutral-500 transition-all outline-none hover:border-white/20 hover:border-b-neutral-350 focus:bg-[#1a1a1d] focus:border-white/10 focus:border-b-2 focus:border-b-[#60cdff] ${
            error ? 'border-red-500 focus:border-b-2 focus:border-b-red-500' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );
};

// --- SLEEK FLOATING GLASS TOAST DRAWER ---
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`border rounded-lg p-4 bg-[#2d2d34]/95 backdrop-blur-xl shadow-2xl flex items-start gap-3 justify-between ${
              toast.type === 'error' 
                ? 'border-red-500/20' 
                : toast.type === 'success' 
                  ? 'border-[#107c41]/35' 
                  : 'border-white/10'
            }`}
          >
            <div className="flex gap-3">
              {toast.type === 'error' ? (
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="text-[#60cdff] shrink-0 mt-0.5" size={16} />
              ) : (
                <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
              )}
              <div>
                <h4 className="font-semibold text-xs text-neutral-100 select-none">
                  {toast.title}
                </h4>
                <p className="text-neutral-400 text-[11px] mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onRemove(toast.id)} 
              className="text-neutral-500 hover:text-white transition-colors p-0.5 hover:bg-white/5 rounded"
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
