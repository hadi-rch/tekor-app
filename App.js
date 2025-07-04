import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import Toast from 'react-native-toast-message';

// Impor fungsi setup interceptor
import setupInterceptors from './src/api/setupInterceptors';
// Impor konfigurasi toast
import { toastConfig } from './src/config/toastConfig';

// Panggil fungsi setup dengan store sebagai argumen
setupInterceptors(store);

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}