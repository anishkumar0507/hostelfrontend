
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 200 }) => {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then(setQrSrc)
      .catch(() => setQrSrc(''));
  }, [value, size]);

  if (!qrSrc) return <div className="skeleton rounded-2xl" style={{ width: size, height: size }} />;

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
      <img src={qrSrc} alt="QR Code" className="w-full h-auto" />
    </div>
  );
};
