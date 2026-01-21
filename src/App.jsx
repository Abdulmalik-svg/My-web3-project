// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// 1. Import RainbowKit, Wagmi, and QueryClient
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';

// 2. Configure Wagmi & RainbowKit
const config = getDefaultConfig({
  appName: 'Raise3',
  projectId: 'da58b26d76753c05bd243e4f6134fcf0', // Replace with your ID from https://cloud.reown.com
  chains: [mainnet, sepolia, base],
  ssr: false, 
});

const queryClient = new QueryClient();

function App() {
  return (
    // 3. Wrap the App with Providers
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#06b6d4', // Your Cyan-500
          accentColorForeground: 'black',
          borderRadius: 'large',
        })}>
          
          <Router>
            <div className="min-h-screen bg-[#020408] text-gray-100 font-sans antialiased">
              <Navbar />

              <main className="pt-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create" element={<CreateCampaign />} />
                  <Route path="/campaign/:id" element={<CampaignDetail />} />
                  
                  {/* 404 Page */}
                  <Route
                    path="*"
                    element={
                      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
                        <h1 className="text-8xl md:text-[12rem] font-black text-white/5 mb-4 leading-none">404</h1>
                        <p className="text-xl md:text-2xl text-cyan-500 font-black uppercase tracking-[0.3em] mb-12">
                          Signal Lost
                        </p>
                        <Link
                          to="/"
                          className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-cyan-500 transition-all duration-300"
                        >
                          Return to Terminal
                        </Link>
                      </div>
                    }
                  />
                </Routes>
              </main>
            </div>
          </Router>

        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;