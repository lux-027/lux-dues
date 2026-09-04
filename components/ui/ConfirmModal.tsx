'use client';

import React from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Evet, Onaylıyorum',
  cancelText = 'Vazgeç',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="h-11 w-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}

            {variant === 'warning' && (
              <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            {variant === 'primary' && (
              <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2.5">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            {loading ? 'İşleniyor...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
