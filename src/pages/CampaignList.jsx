import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';

// Fixed Typo: Matches your successful 'cast' transactions
const CONTRACT_ADDRESS = "0x0EFAB53C9D8e713A4E40e4CcB6784de183553Bb6";

const CONTRACT_ABI = [
  "function getCampaignCount() external view returns (uint256)",
  // Fixed order: creator, title, desc, img, target, pledged, deadline, withdrawn, priceFeed
  "function getCampaign(uint256 _id) external view returns (address, string, string, string, uint256, uint256, uint256, bool, address)",
  "function getFundersList(uint256 _id) external view returns (address[] memory)"
];

const CampaignList = () => {
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

          // Correct Destructuring based on your Solidity Struct
          const [
            creator,
            title,
            description,
            image,
            goal,      // target
            pledged,   // amountCollected
            deadline,
            withdrawn, // completed
            priceFeed
          ] = camp;

          const goalEth = ethers.formatEther(goal);
          const pledgedEth = ethers.formatEther(pledged);
          
          // Ethers v6 uses BigInt (0n). Avoids .isZero() errors.
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

      // Show newest first
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
      <div className="bg-[#020408] min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[#0a0c12] rounded-[3rem] border border-white/5">
            <p className="text-xl font-black uppercase tracking-widest text-slate-500">No active protocols detected</p>
          </div>
        ) : (
          campaigns.map((camp) => (
            <div
              key={camp.id}
              className="group relative bg-[#0a0c12] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 shadow-2xl"
            >
              {/* Completed Badge */}
              {camp.completed && (
                <div className="absolute top-6 right-6 z-10 bg-cyan-500 text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Finalized
                </div>
              )}

              {/* Image Container */}
              <div className="relative w-full h-48 rounded-3xl overflow-hidden mb-8">
                <img
                  src={camp.image}
                  alt={camp.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c12] to-transparent opacity-60"></div>
              </div>

              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter line-clamp-1">
                {camp.title}
              </h2>

              {/* Progress */}
              <div className="mb-8 space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-cyan-500">{camp.raised} ETH</span>
                  <span className="text-slate-500">Goal: {camp.goal} ETH</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-1000"
                    style={{ width: `${Math.min(camp.progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Backers & Link */}
              <div className="flex items-center justify-between mt-auto">
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                  {camp.backers} Backers
                </div>
                <Link to={`/campaign/${camp.id}`}>
                  <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-cyan-500 transition-colors">
                    Access
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CampaignList;