import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FundMeMultiABI from '../constants/FundMeMultiAbi.json';

const CONTRACT_ADDRESS = "0x0EFAB53C9D8e713A4E40e4CcB6784de183553Bb6";
const SEPOLIA_PRICEFEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    image: '',
    durationInDays: '30'
  });

  // Ensure page starts at top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.ethereum) {
      setStatus('error');
      setErrorMessage('Please install MetaMask!');
      return;
    }

    try {
      setLoading(true);
      setStatus('confirming');

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const actualABI = FundMeMultiABI.abi ? FundMeMultiABI.abi : FundMeMultiABI;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, actualABI, signer);

      const goalInWei = ethers.parseEther(formData.goal);
      const duration = BigInt(formData.durationInDays);
      const imageUrl = formData.image.trim() || "https://picsum.photos/800/600";

      const tx = await contract.createCampaign(
        formData.title.trim(),
        formData.description.trim(),
        goalInWei,
        imageUrl,
        duration,
        SEPOLIA_PRICEFEED
      );

      setStatus('mining');
      await tx.wait();

      setStatus('success');
      setTimeout(() => navigate('/'), 2500);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.reason || error.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black relative">
      
      {/* FLOATING BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-32 left-8 z-50 group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all backdrop-blur-xl"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
          <svg 
            className="w-4 h-4 text-white group-hover:text-black transition-colors" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors">
          Back to campaigns
        </span>
      </motion.button>

      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Protocol_v1.0 // Deployer</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-6">
            NEW <span className="text-emerald-500">CAMPAIGN</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed italic">
            Initialize a new funding primitive on the blockchain. Set your parameters and deploy to the network.
          </p>
        </motion.div>

        {/* FORM CONTAINER */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <span className="text-9xl font-black italic">R3</span>
            </div>

            <div className="relative z-10 space-y-10">
              {/* TITLE */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 ml-2">Campaign_Identifier</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. PROJECT_GENESIS"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold italic focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 ml-2">Mission_Data</label>
                <textarea
                  name="description"
                  placeholder="Input mission objectives and funding utilization strategy..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-slate-300 focus:outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-white/10"
                />
              </div>

              {/* GRID: GOAL & DURATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 ml-2">Target_Capital (ETH)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="goal"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.goal}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-3xl font-black text-emerald-400 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 ml-2">Temporal_Window (Days)</label>
                  <input
                    type="number"
                    name="durationInDays"
                    value={formData.durationInDays}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-3xl font-black text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* IMAGE */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 ml-2">Visual_Asset_URL</label>
                <input
                  type="url"
                  name="image"
                  placeholder="https://ipfs.io/ipfs/..."
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-emerald-500/60 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-white/10"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-emerald-500/50 text-black font-black italic uppercase tracking-widest py-6 rounded-2xl transition-all hover:scale-[1.01] active:scale-95 text-lg shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
              {loading ? "INITIALIZING_NODE..." : "DEPLOY CAMPAIGN"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-10 py-6 bg-transparent border border-white/10 hover:border-white/30 text-white font-black italic uppercase tracking-widest rounded-2xl transition-all"
            >
              Abort
            </button>
          </div>
        </motion.form>

        {/* ULTRA MINIMAL FOOTER WITH SCROLL */}
        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
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

          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 hover:opacity-100 opacity-40 transition-opacity"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white group-hover:text-emerald-500 transition-colors">Return_to_Top</span>
            <div className="w-8 h-[1px] bg-white/20 group-hover:bg-emerald-500/50 transition-colors"></div>
          </button>

          <div className="text-center md:text-right">
            <p className="text-[8px] font-mono text-white/10 uppercase tracking-tighter">
              {CONTRACT_ADDRESS}
            </p>
          </div>
        </footer>
      </div>

      {/* STATUS MODAL OVERLAY */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-emerald-500/30 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl"
            >
              {status === 'confirming' && (
                <div className="space-y-6">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-emerald-500">Awaiting Signature</h2>
                  <p className="text-slate-400 text-sm">Please verify the deployment in your wallet.</p>
                </div>
              )}
              {status === 'mining' && (
                <div className="space-y-6">
                   <div className="w-16 h-16 bg-emerald-500 rounded-full animate-pulse mx-auto flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                   </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-emerald-500">Mining Blocks</h2>
                  <p className="text-slate-400 text-sm">Validating transaction on Sepolia Chain...</p>
                </div>
              )}
              {status === 'success' && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-emerald-500">Deployment Live</h2>
                  <p className="text-slate-400 text-sm">Campaign successfully broadcasted.</p>
                </div>
              )}
              {status === 'error' && (
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full mx-auto flex items-center justify-center font-black text-2xl">!</div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Deploy_Failed</h2>
                  <p className="text-slate-400 text-xs break-all px-2">{errorMessage}</p>
                  <button onClick={() => setStatus('')} className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-white underline">Dismiss</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCampaign;