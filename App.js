import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store/store';
import Toast from 'react-native-toast-message';
import setupInterceptors from './src/api/setupInterceptors';
import { toastConfig } from './src/config/toastConfig';
import { restoreUserSession } from './src/store/authSlice';

// Panggil fungsi setup dengan store sebagai argumen
setupInterceptors(store);

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreUserSession());
  }, [dispatch]);

  return <AppNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}