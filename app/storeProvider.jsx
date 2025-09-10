
'use client'; 
/* eslint-disable */
import React from 'react';
import { Provider } from 'react-redux';
import { store, persistor } from '@/app/lib/store/store';
import { PersistGate } from 'redux-persist/integration/react'; // Import PersistGate

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      {/* PersistGate delays rendering until the persisted state is rehydrated */}
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
