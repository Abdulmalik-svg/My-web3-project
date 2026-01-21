// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { FUNDME_ADDRESS, FUNDME_ABI } from '../constants/contract';

const PLATFORM_FEE_PERCENT = 10;

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [totalEthRaised, setTotalEthRaised] = useState("0");

  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            rpcUrls: ['https://rpc.sepolia.org'],
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      }
    }
  };

  const fetchCampaigns = async () => {
    try {
      if (!window.ethereum) return setLoading(false);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Ensure we are on Sepolia (Chain ID 11155111)
      if (network.chainId !== 11155111n) {
        setNetworkError(true);
        setLoading(false);
        return;
      }

      // Check if code exists at address
      const bytecode = await provider.getCode(FUNDME_ADDRESS);
      if (bytecode === "0x") {
        console.error("Contract not deployed at this address on Sepolia");
        setLoading(false);
        return;
      }

      setNetworkError(false);
      const contract = new ethers.Contract(FUNDME_ADDRESS, FUNDME_ABI, provider);
      
      // FIX 1: campaignCount (matches ABI exactly)
      const countBigInt = await contract.campaignCount(); 
      const count = Number(countBigInt);

      let runningTotal = 0n;
      const campaignsArray = [];

      for (let i = 1; i <= count; i++) {
        const camp = await contract.getCampaign(i);
        
        // FIX 2: Destructure all 9 items from your ABI output
        // creator, title, description, image, goal, pledged, deadline, withdrawn, priceFeed
        const [
          creator, 
          title, 
          description, 
          image, 
          goal, 
          pledged, 
          deadline, 
          withdrawn
        ] = camp;

        runningTotal += pledged;

        // Display campaigns that haven't been withdrawn yet
        if (!withdrawn) {
          campaignsArray.push({
            id: i,
            title,
            description,
            image: image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800",
            goal: ethers.formatEther(goal),
            pledged: ethers.formatEther(pledged),
            deadline: Number(deadline),
            // Progress calculation using BigInt for precision
            progress: goal > 0n ? Number((pledged * 100n) / goal) : 0,
          });
        }
      }

      setTotalEthRaised(ethers.formatEther(runningTotal));
      // Show newest campaigns first
      setCampaigns(campaignsArray.reverse());
    } catch (err) {
      console.error("Home fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', () => fetchCampaigns());
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  const formatTimeLeft = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400);
    return days > 0 ? `${days}d left` : "Ends Today";
  };

  return (
    <div className="bg-[#020408] min-h-screen text-white font-sans selection:bg-cyan-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-purple-500/20 blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="pt-32 pb-28 text-center px-6">
          <h1 className="text-6xl md:text-[110px] font-black tracking-tighter mb-6 uppercase">
            Raise3<span className="text-cyan-500">.</span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">
            Decentralized funding protocol. Transparent, secure, and powered by Sepolia.
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Link to="/create" className="w-full md:w-auto px-12 py-6 bg-cyan-500 text-black font-black rounded-3xl hover:bg-white transition-all shadow-xl shadow-cyan-500/10 uppercase tracking-widest text-sm">
              Launch Project
            </Link>
            <button
              onClick={() => document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto px-12 py-6 border border-white/10 rounded-3xl font-black hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
            >
              Explore Projects
            </button>
          </div>

          <p className="mt-12 text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
            Transparent {PLATFORM_FEE_PERCENT}% fee • fully on-chain
          </p>
        </section>

        {/* STATISTICS */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-white/[0.02] p-12 rounded-[3.5rem] border border-white/5 backdrop-blur-sm">
              <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest mb-6">
                Total Protocol Volume
              </p>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter">
                {parseFloat(totalEthRaised).toFixed(4)} <span className="text-cyan-500">ETH</span>
              </h3>
            </div>

            <div className="bg-white/[0.02] p-10 rounded-[3.5rem] border border-white/5 text-center flex flex-col justify-center">
              <p className="text-5xl font-black text-purple-500 mb-2">
                {campaigns.length}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Active Projects
              </p>
            </div>

            <div className="bg-cyan-500 p-10 rounded-[3.5rem] text-center text-black flex flex-col justify-center shadow-lg shadow-cyan-500/10">
              <p className="text-5xl font-black mb-2">
                {PLATFORM_FEE_PERCENT}%
              </p>
              <p className="text-[10px] uppercase tracking-widest font-black">
                Protocol Fee
              </p>
            </div>
          </div>
        </section>

        {/* CAMPAIGN GRID */}
        <section id="marketplace" className="max-w-7xl mx-auto px-6 pb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">Live Projects</h2>
              <p className="text-slate-500 text-sm">Real-time ledger updates</p>
            </div>
            {networkError && (
              <button
                onClick={switchToSepolia}
                className="px-6 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-500 uppercase text-[10px] font-black tracking-widest animate-pulse"
              >
                Switch to Sepolia
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest tracking-[0.2em]">Syncing Blockchain...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-20 border-2 border-dashed border-white/5 rounded-[4rem] text-center">
              <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">No active campaigns found</p>
              <Link to="/create" className="text-cyan-500 text-xs font-bold mt-4 block underline">Be the first to create one</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {campaigns.map(c => (
                <div key={c.id} className="group bg-[#0a0c12] border border-white/5 rounded-[3.5rem] overflow-hidden hover:border-cyan-500/30 transition-all duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <img src={c.image} alt={c.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">
                        {formatTimeLeft(c.deadline)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-10">
                    <h3 className="font-black text-2xl mb-3 uppercase tracking-tight line-clamp-1">{c.title}</h3>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2 min-h-[2.5rem]">{c.description}</p>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Raised</p>
                          <p className="text-xl font-black">{parseFloat(c.pledged).toFixed(3)} ETH</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">Goal</p>
                          <p className="text-xl font-black text-white/40">{c.goal} ETH</p>
                        </div>
                      </div>

                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(c.progress, 100)}%` }}
                        />
                      </div>

                      <Link
                        to={`/campaign/${c.id}`}
                        className="block text-center py-5 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-white/5 mt-6"
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;