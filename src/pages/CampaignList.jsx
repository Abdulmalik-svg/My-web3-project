import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';

const CONTRACT_ADDRESS = "0x0EFAB53C9D8e713A4E40e4CcB6784de183553Bb6";

const CONTRACT_ABI = [
  "function getCampaignCount() external view returns (uint256)",
  "function getCampaign(uint256 _id) external view returns (address, string, string, string, uint256, uint256, uint256, bool, address)",
  "function getFundersList(uint256 _id) external view returns (address[] memory)"
];

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const count = await contract.getCampaignCount();
      const countNumber = Number(count);

      const campaignsArray = [];

      for (let i = 1; i <= countNumber; i++) {
        try {
          const camp = await contract.getCampaign(i);
          const funders = await contract.getFundersList(i);

          const [
            creator,
            title,
            description,
            image,
            goal,
            pledged,
            deadline,
            withdrawn,
            priceFeed
          ] = camp;

          const goalEth = ethers.formatEther(goal);
          const pledgedEth = ethers.formatEther(pledged);
          const progress = goal > 0n ? (Number(pledged * 100n / goal)) : 0;

          campaignsArray.push({
            id: i,
            creator,
            title,
            description,
            image: image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800",
            goal: goalEth,
            raised: pledgedEth,
            progress,
            completed: withdrawn,
            backers: funders.length,
          });
        } catch (err) {
          console.error(`Error loading campaign ${i}:`, err);
        }
      }

      setCampaigns(campaignsArray.reverse());
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Scanning_Blockchain...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black pb-20">
      
      {/* FLOATING BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-32 left-8 z-50 group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all backdrop-blur-xl"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
          Back_To_Terminal
        </span>
      </motion.button>

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        {/* SECTION HEADER */}
        <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Registry_v1.0 // Active_Nodes</span>
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Live <span className="text-emerald-500">Protocols</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.length === 0 ? (
            <div className="col-span-full text-center py-32 bg-[#0A0A0A] rounded-[3rem] border border-white/5 border-dashed">
              <p className="text-xl font-black uppercase tracking-widest text-slate-700">Zero_Protocols_Broadcasted</p>
            </div>
          ) : (
            campaigns.map((camp) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden hover:border-emerald-500/40 transition-all duration-500 shadow-2xl"
              >
                {/* Completed Badge */}
                {camp.completed && (
                  <div className="absolute top-6 right-6 z-10 bg-emerald-500 text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                    Finalized
                  </div>
                )}

                {/* Image Container */}
                <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-8 bg-neutral-900">
                  <img
                    src={camp.image}
                    alt={camp.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60"></div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter line-clamp-1 italic">
                        {camp.title}
                    </h2>
                    
                    <p className="text-slate-500 text-sm line-clamp-2 font-medium">
                        {camp.description}
                    </p>
                </div>

                {/* Progress Section */}
                <div className="mt-8 mb-8 space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-emerald-500">{camp.raised} ETH</span>
                    <span className="text-slate-600">Target: {camp.goal} ETH</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(camp.progress, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-emerald-500 h-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    ></motion.div>
                  </div>
                </div>

                {/* Footer Stats & Button */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-slate-600 text-[8px] font-black uppercase tracking-widest">Backers</span>
                    <span className="text-white font-bold tracking-tighter">{camp.backers} Node_links</span>
                  </div>
                  <Link to={`/campaign/${camp.id}`}>
                    <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95">
                      Access_Data
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignList;