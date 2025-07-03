import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider } from 'react-redux';
import { store } from './src/store/store';

// Impor fungsi setup interceptor
import setupInterceptors from './src/api/setupInterceptors';

// Panggil fungsi setup dengan store sebagai argumen
setupInterceptors(store);

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}