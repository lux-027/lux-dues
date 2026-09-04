'use client';

import { useEffect, useRef, useState } from 'react';
import { formatPhoneNumber } from '@/lib/phone';
import { formatAccountNumber } from '@/lib/userId';
import { Button } from '@/components/ui';

interface SessionUnit {
  id: string;
  blockName: string;
  doorNo: string;
  floor: string;
  buildingId: string;
  buildingName: string;
}

interface SessionUser {
  id: string;
  accountNumber: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string | null;
  role: 'SUPER_ADMIN' | 'BLOCK_ADMIN' | 'RESIDENT';
  buildingName?: string | null;
  blockName?: string | null;
  units?: SessionUnit[];
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Ana Yönetici',
  BLOCK_ADMIN: 'Blok Yöneticisi',
  RESIDENT: 'Sakin',
};

// Resizes/compresses an image file client-side and returns a JPEG data URL.
function resizeImageToDataUrl(file: File, maxSize = 256, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel yüklenemedi'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas desteklenmiyor'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ProfileMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setPhone(formatPhoneNumber(user.phone));
      setEditing(false);
      setError('');
      setSuccess('');
    }
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setEditing(false);
        setSuccess('Profil bilgileri güncellendi');
      } else {
        setError(data.error || 'Güncelleme sırasında bir hata oluştu');
      }
    } catch (err) {
      setError('Güncelleme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const saveAvatarDataUrl = async (dataUrl: string | null) => {
    setUploadingAvatar(true);
    setError('');
    setSuccess('');
    setShowPhotoOptions(false);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setSuccess(dataUrl ? 'Profil fotoğrafı güncellendi' : 'Profil fotoğrafı kaldırıldı');
      } else {
        setError(data.error || 'İşlem sırasında bir hata oluştu');
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin');
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await saveAvatarDataUrl(dataUrl);
    } catch (err) {
      setError('Fotoğraf işlenirken bir hata oluştu');
    }
  };

  const handleRemoveAvatar = async () => {
    await saveAvatarDataUrl(null);
  };

  const startWebcam = async () => {
    setShowPhotoOptions(false);
    setError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        });
        setCameraStream(stream);
        setShowCameraModal(true);
      } else {
        // Fallback to mobile native camera input
        cameraInputRef.current?.click();
      }
    } catch (err) {
      console.warn('Webcam permission or device error, falling back to camera input:', err);
      cameraInputRef.current?.click();
    }
  };

  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Center crop to square
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      stopWebcam();
      await saveAvatarDataUrl(dataUrl);
    }
  };

  useEffect(() => {
    if (showCameraModal && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCameraModal, cameraStream]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Hidden file input for gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarSelect}
      />

      {/* Hidden file input for native camera capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleAvatarSelect}
      />

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
        )}
        <span className="text-sm font-medium text-zinc-700 max-w-[120px] truncate">
          {user.name}
        </span>
        <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setOpen(false);
              setShowPhotoOptions(false);
            }}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-zinc-50 border-b border-zinc-200 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <span className="w-14 h-14 rounded-full bg-zinc-800 text-white text-lg font-semibold flex items-center justify-center">
                    {initials}
                  </span>
                )}

                {/* Camera / Photo Edit Button */}
                <button
                  type="button"
                  title="Fotoğrafı değiştir"
                  onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center border-2 border-white hover:bg-zinc-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </button>

                {/* Photo Action Popup / Dropdown */}
                {showPhotoOptions && (
                  <div className="absolute left-0 top-16 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-20 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhotoOptions(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-700 hover:bg-zinc-100 flex items-center gap-2.5 transition-colors"
                    >
                      <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Fotoğraf Yükle</span>
                    </button>

                    <button
                      type="button"
                      onClick={startWebcam}
                      className="w-full px-3 py-2 text-left text-zinc-700 hover:bg-zinc-100 flex items-center gap-2.5 transition-colors"
                    >
                      <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                      <span>Kameradan Çek</span>
                    </button>

                    {user.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-t border-zinc-100 mt-1 pt-1.5"
                      >
                        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Fotoğrafı Kaldır</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-base font-semibold text-zinc-900 truncate">{user.name}</p>
                <span className="inline-block mt-1 text-[11px] font-medium text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded">
                  {roleLabels[user.role] || user.role}
                </span>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-zinc-400 hover:text-zinc-600 transition-colors self-start"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                  {success}
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">Kullanıcı ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-zinc-700 tracking-wider">
                    {formatAccountNumber(user.accountNumber)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const idStr = formatAccountNumber(user.accountNumber);
                      navigator.clipboard.writeText(idStr);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded border border-zinc-200 transition-colors"
                    title="Kullanıcı ID'sini kopyala"
                  >
                    {copiedId ? (
                      <>
                        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-emerald-700 text-[11px]">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[11px]">Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Ad Soyad</p>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-zinc-800">{user.name}</p>
                )}
              </div>

              {user.email && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">E-posta</p>
                  <p className="text-sm text-zinc-700 truncate">{user.email}</p>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Telefon</p>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5XX XXX XX XX"
                  />
                ) : (
                  <p className="text-sm text-zinc-800">{user.phone ? formatPhoneNumber(user.phone) : '-'}</p>
                )}
              </div>

              {user.buildingName && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">Bina</p>
                  <p className="text-sm text-zinc-700 truncate">
                    {user.buildingName}
                    {user.blockName ? ` · ${user.blockName}` : ''}
                  </p>
                </div>
              )}

              {user.units && user.units.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 mb-1">Bağlı Dairelerim</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {user.units.map((u) => (
                      <div
                        key={u.id}
                        className="p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-zinc-800 truncate">{u.buildingName}</span>
                        <span className="text-zinc-500 flex-shrink-0">
                          {u.blockName} · No: {u.doorNo} (Kat: {u.floor})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200 flex items-center gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Webcam Live Capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={stopWebcam} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 flex flex-col items-center p-5">
            <div className="w-full flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-zinc-900">Fotoğraf Çek</h4>
              <button onClick={stopWebcam} className="text-zinc-400 hover:text-zinc-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="relative w-64 h-64 rounded-full overflow-hidden bg-black border-4 border-zinc-200 shadow-inner mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-3 w-full">
              <Button variant="secondary" className="flex-1 text-xs py-2" onClick={stopWebcam}>
                Vazgeç
              </Button>
              <Button
                className="flex-1 text-xs py-2"
                onClick={capturePhoto}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                }
              >
                Çek ve Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
