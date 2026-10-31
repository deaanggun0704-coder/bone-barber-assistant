import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { useTheme } from './hooks/useTheme';
import { AboutPage } from './pages/AboutPage';
import { ChatPage } from './pages/ChatPage';
import { HomePage } from './pages/HomePage';
import { LocationPage } from './pages/LocationPage';
import { ReservationPage } from './pages/ReservationPage';
import { ServicesPage } from './pages/ServicesPage';

function AppLayout() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="app-shell">
      <Navbar theme={theme} onThemeChange={setTheme} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/layanan" element={<ServicesPage />} />
        <Route path="/reservasi" element={<ReservationPage />} />
        <Route path="/lokasi" element={<LocationPage />} />
        <Route path="/tentang" element={<AboutPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>;
}
