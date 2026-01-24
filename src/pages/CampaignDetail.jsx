import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import FundMeMultiABI from '../constants/FundMeMultiAbi.json';

const CONTRACT_ADDRESS = "0x0EFAB53C9D8e713A4E40e4CcB6784de183553Bb6";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [account, setAccount] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', body: '', type: 'success' });

  // Window Scroll Function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const triggerModal = (title, body, type = 'success') => {
    setModalMessage({ title, body, type });
    setShowModal(true);
  };

  const fetchCampaign = async () => {
    try {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (network.chainId.toString() !== "11155111") {
        setLoading(false);
        return;
      }

      const signer = await provider.getSigner();
      const userAccount = await signer.getAddress();
      setAccount(userAccount);
      
      const actualABI = FundMeMultiABI.abi ? FundMeMultiABI.abi : FundMeMultiABI;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, actualABI, provider);
      
      const camp = await contract.getCampaign(id);
      const [creator, title, description, image, goal, pledged, deadline, withdrawn] = camp;

      setCampaign({
        id: Number(id),
        creator,
        title,
        description,
        image: image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800",
        goal: ethers.formatEther(goal),
        pledged: ethers.formatEther(pledged),
        deadline: Number(deadline),
        completed: withdrawn,
        progress: Number(goal) > 0 ? (Number(pledged) * 100 / Number(goal)) : 0,
        isCreator: userAccount.toLowerCase() === creator.toLowerCase()
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // Auto-scroll to top when campaign ID changes
    window.scrollTo(0, 0);
  }, [id]);

  const handleFund = async () => {
    if (!fundAmount || Number(fundAmount) <= 0) return;
    try {
      setFunding(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const actualABI = FundMeMultiABI.abi ? FundMeMultiABI.abi : FundMeMultiABI;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, actualABI, signer);

      const tx = await contract.fundCampaign(id, { value: ethers.parseEther(fundAmount) });
      await tx.wait();
      
      setFundAmount('');
      fetchCampaign();
      triggerModal('TRANSMISSION SUCCESSFUL', 'Contribution verified on the blockchain.', 'success');
    } catch (error) {
      console.error('Funding error:', error);
      triggerModal('TRANSMISSION FAILED', error.reason || 'Transaction rejected.', 'error');
    } finally {
      setFunding(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setFunding(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const actualABI = FundMeMultiABI.abi ? FundMeMultiABI.abi : FundMeMultiABI;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, actualABI, signer);

      const tx = await contract.withdraw(id);
      await tx.wait();

      triggerModal('CAPITAL ROUTED', 'Funds successfully withdrawn from the protocol.', 'success');
      fetchCampaign();
    } catch (error) {
      triggerModal('ACCESS DENIED', 'Withdrawal conditions not met.', 'error');
    } finally {
      setFunding(false);
    }
  };

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Accessing_Data_Node...</span>
    </div>
  );

  if (!campaign) return (
    <div className="bg-[#050505] min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl font-black uppercase tracking-widest mb-6">Node_Not_Found</h1>
      <button onClick={() => navigate('/')} className="text-emerald-500 font-bold uppercase tracking-widest text-[10px] border border-emerald-500/30 px-10 py-4 rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
        Return_To_Nexus
      </button>
    </div>
  );

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500 selection:text-black pb-1 relative">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }} />
      </div>

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
          Back_To_Registry
        </span>
      </motion.button>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-6 ${modalMessage.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                {modalMessage.type === 'error' ? '!' : '✓'}
              </div>
              <h2 className={`text-xl font-black italic uppercase tracking-tighter mb-4 ${modalMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                {modalMessage.title}
              </h2>
              <p className="text-slate-400 text-sm mb-8">{modalMessage.body}</p>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-500 transition-colors"
              >
                Acknowledge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-8 space-y-12">
            <div className="relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-neutral-900 group">
              <img src={campaign.image} alt={campaign.title} className="w-full h-[550px] object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
              <div className="absolute bottom-12 left-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest mb-6 italic">
                  Protocol_ID: #{campaign.id}
                </div>
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                  {campaign.title}
                </h1>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/5 p-12 rounded-[3rem]">
              <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.3em] mb-8 italic">// Mission_Objectives</p>
              <p className="text-slate-300 text-xl leading-relaxed font-medium whitespace-pre-wrap italic">
                {campaign.description}
              </p>
            </div>
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[3.5rem] sticky top-32 shadow-2xl space-y-10">
              
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8 italic">Aggregate_Capital</p>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-6xl font-black italic tracking-tighter text-white">{campaign.pledged}</h3>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">ETH_RAISED</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-xl italic tracking-tighter">{campaign.goal} ETH</p>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">TARGET</p>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                  />
                </div>
                <div className="flex justify-between">
                    <span className="text-emerald-500/50 text-[10px] font-black uppercase">{campaign.progress.toFixed(2)}% COMPLETE</span>
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Live_Sync</span>
                </div>
              </div>

              {!campaign.completed ? (
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="space-y-4">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-2">CONTRIBUTION_INPUT</label>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={fundAmount} 
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white font-black italic text-2xl focus:outline-none focus:border-emerald-500 transition-all placeholder:text-white/5"
                      />
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-emerald-500 font-black italic text-xs">ETH</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleFund}
                    disabled={funding || !fundAmount}
                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic rounded-2xl uppercase tracking-[0.3em] text-[14px] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    {funding ? 'TRANSMITTING...' : 'INITIATE_FUNDING'}
                  </button>
                </div>
              ) : (
                <div className="py-12 border border-emerald-500/20 bg-emerald-500/5 rounded-3xl text-center">
                   <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] italic">PROTOCOL_FINALIZED</p>
                   <p className="text-white/40 text-[9px] font-medium uppercase tracking-widest mt-2">Capital_Asset_Dispersed</p>
                </div>
              )}

              {campaign.isCreator && !campaign.completed && (
                <div className="pt-8 border-t border-white/5">
                  <button 
                    onClick={handleWithdraw}
                    disabled={funding}
                    className="w-full py-5 bg-transparent border border-white/10 text-white hover:border-emerald-500/50 hover:text-emerald-500 font-black italic rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all"
                  >
                    {funding ? 'PROCESSING...' : 'WITHDRAW_CAPITAL'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- CONSISTENT MINIMAL FOOTER --- */}
        <footer className="mt-24 px-6 py-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="flex items-center gap-4">
            <span className="text-xl font-black italic tracking-tighter uppercase cursor-default">
              RAISE<span className="text-emerald-500">3</span>
            </span>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse"></div>
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-none">Node_Connection_Secure</span>
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
    </div>
  );
};

export default CampaignDetail;