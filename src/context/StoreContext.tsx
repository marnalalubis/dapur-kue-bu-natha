'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StoreSettings } from '@/types';

interface StoreContextType {
  settings: StoreSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Dapur Kue Kering Bu Natha',
  store_tagline: 'Kue Kering Homemade Fresh from The Oven dengan Butter Pilihan',
  store_phone: '081396144777',
  store_address: 'Pardede Onan Kelurahan Pardede Onan Kecmatan Balige Kabupaten Toba Propinsi Sumatera Utara',
  pickup_instructions: 'Pengambilan pesanan tersedia setiap saat',
  delivery_note: 'Pengiriman manual via kurir lokal atau ekspedisi. Biaya ongkir dikonfirmasi via WA.',
  payment_info: 'Pembayaran offline saat ambil di tempat / COD / Transfer BANK SUMUT : 123-456-7890 a/n Lidia Triastuti.',
  is_store_open: true,
  closed_reason: 'Toko sedang dalam masa pemeliharaan oven rutin.',
};

const StoreContext = createContext<StoreContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refreshSettings: async () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/public', {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <StoreContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
