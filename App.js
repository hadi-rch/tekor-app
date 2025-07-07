import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store/store';
import Toast from 'react-native-toast-message';
import setupInterceptors from './src/api/setupInterceptors';
import { toastConfig } from './src/config/toastConfig';
import { restoreUserSession } from './src/store/authSlice';
import { useFonts } from 'expo-font';

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
  const [fontsLoaded] = useFonts({
    // Pastikan nama file ini cocok dengan file di assets/font/
    'Montserrat': require('./assets/font/Montserrat/static/Montserrat-Regular.ttf'),
    'OpenSans': require('./assets/font/Open_Sans/static/OpenSans-Regular.ttf'),
    // Anda bisa menambahkan bobot font yang berbeda di sini
    // 'Montserrat-Bold': require('./assets/font/Montserrat-Bold.ttf'),
  });

  // Tampilkan layar loading atau null jika font belum dimuat
  if (!fontsLoaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}