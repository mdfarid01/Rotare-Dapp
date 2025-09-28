import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Navbar } from '@/components/layout/navbar';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
import { CreatePot } from '@/pages/CreatePot';
import { Deposit } from '@/pages/Deposit';
import { Liquidity } from '@/pages/Liquidity';
import { Profile } from '@/pages/Profile';
import { Bid } from '@/pages/Bid';
import { Signup } from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import { config } from '@/lib/wagmi';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Router>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-pot" element={<CreatePot />} />
                <Route path="/deposit" element={<Deposit />} />
                <Route path="/liquidity" element={<Liquidity />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/bid" element={<Bid />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
