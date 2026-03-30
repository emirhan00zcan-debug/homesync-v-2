import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    assistantText?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, assistantText, icon, ...props }, ref) => {

        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-medium text-slate-300">
                        {label}
                        {props.required && <span className="text-[#FFBF00] ml-1">*</span>}
                    </label>
                )}

                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3 text-slate-400">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full h-10 px-3 rounded-lg bg-white/5 border text-white
              placeholder:text-slate-500 focus:outline-none focus:ring-2 
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5'
                                : 'border-white/10 focus:border-[#FFBF00]/50 focus:ring-[#FFBF00]/20 hover:border-white/20'
                            }
              ${props.disabled ? 'opacity-50 cursor-not-allowed bg-white/5' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>

                {error && (
                    <span className="text-xs text-red-500 mt-1">{error}</span>
                )}

                {assistantText && !error && (
                    <span className="text-xs text-slate-400 mt-1">{assistantText}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
