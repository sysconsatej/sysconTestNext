// lib/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import counterReducer from '@/app/counterSlice.js';   // <-- your file

// 1) persist config: only persist this slice
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['counter'],   // <-- matches the key below
};

// 2) wrap your reducer
const persistedCounter = persistReducer(persistConfig, counterReducer);

// 3) create store
export const store = configureStore({
  reducer: {
    counter: persistedCounter,  // <-- state.counter.isRedirection
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 4) create persistor
export const persistor = persistStore(store);
