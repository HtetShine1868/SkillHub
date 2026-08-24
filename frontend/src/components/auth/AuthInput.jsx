import { useState } from 'react'

export default function AuthInput({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = true,
    minLength
}) {
    const isPassword = type === 'password'
    const [showPassword, setShowPassword] = useState(false)
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="input-group">
            <label>{label}</label>
            <div className="input-wrapper">
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    minLength={minLength}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}