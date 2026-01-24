import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from "wagmi";

const Navbar = () => {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount(); 
  const { disconnect } = useDisconnect(); 
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center z-[100] px-6 py-6 pointer-events-none">
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          pointer-events-auto
          flex items-center justify-between
          w-full max-w-[1200px] px-6 py-3
          rounded-full border transition-all duration-500
          ${scrolled 
            ? 'bg-black/70 backdrop-blur-2xl border-emerald-500/30 shadow-2xl' 
            : 'bg-white/5 backdrop-blur-md border-white/10'
          }
        `}
      >
        {/* LEFT: BRANDING */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <span className="text-black font-black italic text-lg leading-none">R3</span>
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase">
            RAISE<span className="text-emerald-500">3</span>
          </span>
        </Link>

        {/* RIGHT: WALLET & DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          {!isConnected ? (
            <button
              onClick={openConnectModal}
              className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`
                flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all
                ${showDropdown 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                  : 'border-white/10 bg-white/5 hover:border-emerald-500/50'
                }
              `}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-mono text-[11px] font-bold tracking-wider">
                {formatAddress(address)}
              </span>
              <svg 
                className={`w-4 h-4 text-emerald-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}

          {/* DISCONNECT DROPDOWN */}
          <AnimatePresence>
            {showDropdown && isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-[#0A0A0A] border border-emerald-500/20 rounded-[1.5rem] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.7)] backdrop-blur-3xl"
              >
                <div className="p-4 border-b border-white/5">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Active Network</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <p className="text-xs text-white font-bold tracking-tight">Ethereum Sepolia</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center justify-between p-4 text-left group hover:bg-red-500/10 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Disconnect</span>
                  <svg className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;