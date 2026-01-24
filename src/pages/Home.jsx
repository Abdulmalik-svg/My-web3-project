import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { FUNDME_ADDRESS, FUNDME_ABI } from '../constants/contract';

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const [totalEthRaised, setTotalEthRaised] = useState("0");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Window Scroll Function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const fetchCampaigns = async () => {
    try {
      if (!window.ethereum) return setLoading(false);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        setNetworkError(true);
        setLoading(false);
        return;
      }
      const contract = new ethers.Contract(FUNDME_ADDRESS, FUNDME_ABI, provider);
      const countBigInt = await contract.campaignCount(); 
      const count = Number(countBigInt);
      let runningTotal = 0n;
      const campaignsArray = [];

      for (let i = 1; i <= count; i++) {
        const camp = await contract.getCampaign(i);
        const [creator, title, description, image, goal, pledged, deadline, withdrawn] = camp;
        runningTotal += pledged;
        if (!withdrawn) {
          campaignsArray.push({
            id: i,
            title,
            description,
            image: image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
            goal: ethers.formatEther(goal),
            pledged: ethers.formatEther(pledged),
            deadline: Number(deadline),
            progress: goal > 0n ? Number((pledged * 100n) / goal) : 0,
          });
        }
      }
      setTotalEthRaised(ethers.formatEther(runningTotal));
      setCampaigns(campaignsArray.reverse());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCampaigns();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => window.location.reload());
      window.ethereum.on('accountsChanged', () => fetchCampaigns());
    }
  }, []);

  const formatTimeLeft = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadline - now;
    if (diff <= 0) return "FINISHED";
    const days = Math.floor(diff / 86400);
    return days > 0 ? `${days} DAYS REMAINING` : "ENDING SOON";
  };

  return (
    <div className="bg-[#050505] min-h-screen text-[#F5F5F5] font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* --- ADVANCED BACKGROUND MESH --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[160px]"
          animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
          transition={{ type: "spring", damping: 50, stiffness: 100 }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="pt-32 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-md"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">
                Institutional Grade Crowdfunding
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none uppercase italic"
            >
              RAISE<span className="text-emerald-500">3</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed"
            >
              The definitive decentralized funding engine. Deploy capital, track progress, and build the future on <span className="text-white font-medium italic underline decoration-emerald-500/50">Sepolia</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center gap-6 pt-6"
            >
              <Link to="/create" className="px-12 py-5 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-emerald-400 transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                Launch Project
              </Link>
              <button 
                onClick={() => document.getElementById('market').scrollIntoView({ behavior: 'smooth' })} 
                className="px-12 py-5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/5 transition-all"
              >
                View Marketplace
              </button>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-1 mt-32 border border-white/5 bg-white/5 p-1 rounded-[3rem] overflow-hidden backdrop-blur-sm">
            {[
              { label: 'Total Value Locked', val: `${parseFloat(totalEthRaised).toFixed(3)} ETH`, sub: 'Real-time Chain Data' },
              { label: 'Active Deployments', val: campaigns.length, sub: 'Verified Smart Contracts' },
              { label: 'Network Integrity', val: '99.9%', sub: 'Sepolia Testnet v4' }
            ].map((stat, i) => (
              <div key={i} className="bg-[#0A0A0A] p-10 hover:bg-[#0F0F0F] transition-colors">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{stat.label}</p>
                <h3 className="text-4xl font-black italic mb-2 tracking-tight text-emerald-500">{stat.val}</h3>
                <p className="text-xs text-slate-600 font-medium">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- CAMPAIGN LISTINGS --- */}
        <section id="market" className="px-6 md:px-12 py-32 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">
              Active <span className="text-emerald-500">Market</span>
            </h2>
            <div className="h-[1px] flex-grow bg-white/10 mx-10 hidden md:block mb-5"></div>
            <div className="flex gap-4">
               <div className="px-5 py-2 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400">
                 {campaigns.length} Pools Live
               </div>
            </div>
          </div>

          {loading ? (
            <div className="py-32 text-center text-emerald-500 font-black animate-pulse tracking-[1.5em] text-xs">SYNCHRONIZING_BLOCKS...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {campaigns.map((c, idx) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#111] border border-white/5 transition-all duration-500 group-hover:border-emerald-500/40">
                    <img src={c.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale-[50%] group-hover:grayscale-0" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 bg-emerald-500 text-black text-[9px] font-black rounded-full uppercase tracking-tighter">
                            {formatTimeLeft(c.deadline)}
                          </span>
                          <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">ID_{c.id}</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter group-hover:text-emerald-400 transition-colors">{c.title}</h3>
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                          <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Pledged</p>
                            <p className="text-xl font-black italic">{parseFloat(c.pledged).toFixed(2)} ETH</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Target</p>
                            <p className="text-xl font-black italic text-white/30">{c.goal} ETH</p>
                          </div>
                        </div>
                        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min(c.progress, 100)}%` }} transition={{ duration: 1.2, ease: "circOut" }} className="absolute h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                        </div>
                        <Link to={`/campaign/${c.id}`} className="block w-full text-center py-4 bg-[#F5F5F5] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-emerald-500">View Contract</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* --- ULTRA MINIMAL STATUS BAR FOOTER WITH SCROLL --- */}
        <footer className="px-6 md:px-12 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black italic tracking-tighter uppercase cursor-default">
              RAISE<span className="text-emerald-500">3</span>
            </span>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse"></div>
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-none">Protocol_Active</span>
            </div>
          </div>

          {/* Minimal Back to Top Trigger */}
          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 hover:opacity-100 opacity-40 transition-opacity"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white group-hover:text-emerald-500 transition-colors">Return_to_Top</span>
            <div className="w-8 h-[1px] bg-white/20 group-hover:bg-emerald-500/50 transition-colors"></div>
          </button>

          <div className="text-center md:text-right">
            <p className="text-[8px] font-mono text-white/10 uppercase tracking-tighter">
              {FUNDME_ADDRESS}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;