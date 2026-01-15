// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import FundMeMultiABI from './FundMeMultiABI.json';

const CONTRACT_ADDRESS = "0xB1a316775eadfb4795a053B29567c21330CDb3fa";
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

      if (network.chainId.toString() !== "11155111") {
        setNetworkError(true);
        setLoading(false);
        return;
      }

      setNetworkError(false);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, FundMeMultiABI, provider);
      const count = Number(await contract.getCampaignCount());

      let runningTotal = 0n;
      const campaignsArray = [];

      for (let i = 1; i <= count; i++) {
        const camp = await contract.getCampaign(i);
        const [creator, title, description, image, goal, pledged, deadline, completed] = camp;

        runningTotal += pledged;

        if (!completed) {
          campaignsArray.push({
            id: i,
            title,
            description,
            image: image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800",
            goal: ethers.formatEther(goal),
            pledged: ethers.formatEther(pledged),
            deadline: Number(deadline),
            progress: Number(goal) > 0 ? (Number(pledged) * 100 / Number(goal)) : 0,
          });
        }
      }

      setTotalEthRaised(ethers.formatEther(runningTotal));
      setCampaigns(campaignsArray.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    window.ethereum?.on('chainChanged', () => window.location.reload());
  }, []);

  const formatTimeLeft = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / 86400);
    return days > 0 ? `${days}d left` : "Ends Today";
  };

  return (
    <div className="bg-[#020408] min-h-screen text-white font-sans">

      {/* HERO */}
      <section className="pt-32 pb-28 text-center">
        <h1 className="text-6xl md:text-[110px] font-black tracking-tighter mb-6">
          Raise3<span className="text-cyan-500">.</span>
        </h1>

        <p className="text-slate-400 max-w-xl mx-auto mb-10">
          Fund ideas without intermediaries. Transparent, secure, and fully on-chain.
        </p>

        <div className="flex justify-center gap-6">
          <Link to="/create" className="px-10 py-5 bg-cyan-500 text-black font-black rounded-3xl">
            Launch Project
          </Link>
          <button
            onClick={() => document.getElementById('marketplace').scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 border border-white/10 rounded-3xl font-black"
          >
            Explore Projects
          </button>
        </div>

        <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          Transparent {PLATFORM_FEE_PERCENT}% protocol fee • Fully on-chain
        </p>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-4 gap-4">

          <div className="md:col-span-2 bg-white/[0.02] p-12 rounded-[3rem] border border-white/5">
            <p className="text-slate-500 uppercase text-xs font-black mb-6">
              Total Volume Raised
            </p>
            <h3 className="text-6xl font-black">
              {parseFloat(totalEthRaised).toFixed(3)} ETH
            </h3>
          </div>

          <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 text-center">
            <p className="text-4xl font-black text-purple-500">
              {campaigns.length}
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Active Campaigns
            </p>
          </div>

          <div className="bg-cyan-500 p-10 rounded-[3rem] text-center text-black">
            <p className="text-4xl font-black">
              {PLATFORM_FEE_PERCENT}%
            </p>
            <p className="text-xs uppercase tracking-widest font-black">
              Platform Fee
            </p>
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="marketplace" className="max-w-7xl mx-auto px-6 pb-32">
        {networkError && (
          <button
            onClick={switchToSepolia}
            className="mb-10 px-6 py-3 border border-red-500/40 rounded-xl text-red-500 uppercase text-xs font-black"
          >
            Switch to Sepolia
          </button>
        )}

        {loading ? (
          <p className="text-center text-slate-500">Loading campaigns…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-center text-slate-500">No active campaigns</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {campaigns.map(c => (
              <div key={c.id} className="bg-[#0a0c12] border border-white/10 rounded-[3rem] overflow-hidden">
                <img src={c.image} alt={c.title} className="h-60 w-full object-cover" />
                <div className="p-8">
                  <h3 className="font-black text-xl mb-2">{c.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{c.description}</p>

                  <div className="flex justify-between mb-3">
                    <span>{c.pledged} ETH</span>
                    <span className="text-slate-500">{c.goal} ETH</span>
                  </div>

                  <div className="h-1 bg-white/10 rounded-full mb-4">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${Math.min(c.progress, 100)}%` }}
                    />
                  </div>

                  <Link
                    to={`/campaign/${c.id}`}
                    className="block text-center py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    View Campaign
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
       