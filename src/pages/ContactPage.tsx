import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Mail, Phone, Building, CheckCircle2, Send, Loader2, Heart, CreditCard, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { addMessage, addTransaction, updateTransactionStatus } from '../services/db';
import { Transaction } from '../types';

export default function ContactPage() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMess, setErrorMess] = useState('');

  // Donation Specific States
  const [donorName, setDonorName] = useState(profile?.displayName || '');
  const [donorEmail, setDonorEmail] = useState(profile?.email || '');
  const [donationAmount, setDonationAmount] = useState<number | string>(5000); // 5000 Naira default
  const [donationMessage, setDonationMessage] = useState('');
  const [donatingLoading, setDonatingLoading] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donationError, setDonationError] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMess('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMess('');

    try {
      await addMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toISOString(),
        read: false
      });
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setErrorMess('There was an error sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPaystackPop = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonationSubmit = async (e: FormEvent, bypass: boolean = false) => {
    e.preventDefault();
    setDonatingLoading(true);
    setDonationError('');
    setDonationSuccess(false);

    const amountNum = Number(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setDonationError("Please input a valid donation amount.");
      setDonatingLoading(false);
      return;
    }

    const emailToUse = donorEmail || profile?.email || 'philanthropist@okorie.edu.ng';
    const nameToUse = donorName || profile?.displayName || 'Anonymous Supporter';
    const reference = 'don_' + Date.now() + Math.random().toString(36).substring(4);

    // Build the pending transaction record
    const donationTxn: Omit<Transaction, 'id'> = {
      userId: profile?.uid || 'guest_donor',
      userEmail: emailToUse,
      userName: nameToUse,
      type: 'donation',
      amount: amountNum,
      message: donationMessage.trim() || undefined,
      status: 'pending',
      reference: reference,
      date: new Date().toISOString()
    };

    try {
      const addedTxn = await addTransaction(donationTxn);

      if (bypass) {
        // Direct emulator verification (1-click testing)
        await new Promise(resolve => setTimeout(resolve, 1500));
        await updateTransactionStatus(addedTxn.id, 'success');
        
        setDonationSuccess(true);
        setDonationMessage('');
        setDonatingLoading(false);
        return;
      }

      // Real Paystack Inline Setup
      const scriptLoaded = await loadPaystackPop();
      if (!scriptLoaded) {
        throw new Error("Unable to link with Paystack network nodes. Use bypass mode for active browser sandbox preview testing.");
      }

      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_d34bbf335e2365a12ecb7fe8991a2eb345fbc67a', // Sandbox public key
        email: emailToUse,
        amount: amountNum * 100, // converted to kobos
        currency: 'NGN',
        ref: reference,
        callback: async (response: any) => {
          await updateTransactionStatus(addedTxn.id, 'success');
          setDonationSuccess(true);
          setDonationMessage('');
          setDonatingLoading(false);
        },
        onClose: () => {
          setDonationError("Transaction canceled by user.");
          updateTransactionStatus(addedTxn.id, 'failed');
          setDonatingLoading(false);
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error(err);
      setDonationError(err.message || "An unexpected error occurred.");
      setDonatingLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-4 animate-fade-in text-left text-navy">
      
      {/* Page Header */}
      <div className="space-y-2">
        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold flex items-center gap-2">
          <span className="w-6 h-[1px] bg-gold"></span>
          Academic Liaison
        </h3>
        <h1 className="font-serif text-3xl font-bold text-navy uppercase leading-tight">
          Academic <span className="text-gold italic font-light font-normal text-3xl">Contact Portal</span>
        </h1>
        <p className="text-navy/80 max-w-2xl text-xs leading-relaxed font-light mt-2">
          For graduate supervision consults, panel examinations, research collaboration proposals, keynote requests, or community policy advocacy initiatives.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-10 items-stretch font-sans">
        {/* Left Column: Details */}
        <div className="md:col-span-5 bg-navy text-[#fdfcf9] p-8 rounded-none border border-gold/15 select-none flex flex-col justify-between shadow-lg relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute top-10 right-10 w-48 h-48 border border-gold/10 rounded-full pointer-events-none" />
          
          <div className="space-y-8 relative z-10 text-left">
            <h3 className="font-serif font-bold text-xl uppercase tracking-wider text-gold border-b border-white/10 pb-2">
              Inquiry Details
            </h3>
            
            <div className="space-y-6 text-xs">
              <div className="flex gap-4">
                <Building className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-white uppercase tracking-wide">Departmental Office</h4>
                  <p className="text-white/80 font-light mt-1.5 leading-relaxed">
                    Room 304, Faculty of Social Sciences,<br />
                    University of Uyo, Main Campus,<br />
                    Akwa Ibom State, Nigeria.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-white uppercase tracking-wide">Scholarly Email</h4>
                  <p className="text-white/80 font-mono tracking-wide mt-1.5 hover:text-gold transition select-text">
                    ebere.okorie@uniuyo.edu.ng
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-white uppercase tracking-wide">Administrative Liaison</h4>
                  <p className="text-white/80 font-mono tracking-wide mt-1.5 font-light">
                    +234 (0) 803-555-9874
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 mt-8 relative z-10 text-left">
            <h4 className="font-serif font-bold text-[10px] uppercase tracking-widest text-gold font-bold">Response Window</h4>
            <p className="text-[11px] text-white/70 font-light mt-1.5 leading-relaxed">
              Academic correspondences are reviewed weekly. For urgent journal submissions or conference keynote bookings, please mark "URGENT" inside the message subject.
            </p>
          </div>
        </div>

        {/* Right Column: Inquiries Form */}
        <div id="contact-form-section" className="md:col-span-7 bg-white p-8 rounded-none border border-navy/10 shadow-xs">
          {success ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-8 animate-scale-up">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h3 className="font-serif text-2xl font-bold text-navy uppercase">Message Delivered!</h3>
              <p className="text-xs text-navy/70 max-w-sm leading-relaxed font-light">
                Thank you for reaching out. Your academic correspondence has been written to the port message bank. Prof. Okorie or her research assistant will review it.
              </p>
              <button 
                id="reset_contact_form"
                onClick={() => setSuccess(false)}
                className="mt-2 inline-flex items-center justify-between bg-navy hover:bg-navy-hover text-white text-[10px] uppercase tracking-widest font-bold px-6 py-3.5 rounded-none shadow-md transition cursor-pointer gap-4"
              >
                <span>Send another message</span>
                <div className="w-4 h-[1px] bg-gold" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <h3 className="font-serif font-semibold text-lg text-navy uppercase tracking-wider border-b border-navy/10 pb-2">
                Send Correspondence
              </h3>

              {errorMess && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs tracking-wide text-red-700 font-mono">
                  {errorMess}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60">Your Name *</label>
                  <input 
                    id="contact_name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. Jane Smith"
                    className="w-full px-3 py-3 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60">Your Email *</label>
                  <input 
                    id="contact_email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., jane.smith@university.edu"
                    className="w-full px-3 py-3 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60">Academic Subject *</label>
                <input 
                  id="contact_subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Guest Lecture / Research Collaboration Inquiry"
                  className="w-full px-3 py-3 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60">Detailed Message *</label>
                <textarea 
                  id="contact_message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your letter of inquiry here..."
                  className="w-full px-3 py-3 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold focus:bg-white resize-none transition"
                />
              </div>

              <button 
                id="submit_contact_btn"
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full inline-flex items-center justify-between bg-navy hover:bg-navy-hover disabled:bg-slate-300 text-white text-[10px] uppercase tracking-widest font-bold px-6 py-4 rounded-none shadow-md hover:shadow-lg transition"
              >
                {loading ? (
                  <>
                    <span>Transmitting correspondence...</span>
                    <Loader2 className="h-4 w-4 animate-spin text-gold" />
                  </>
                ) : (
                  <>
                    <span>Transmit Letter</span>
                    <Send className="h-4 w-4 text-gold" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ACADEMIC RESEARCH DONATION AND PHILANTHROPY PORTAL */}
      <div id="criminology_don_section" className="bg-[#f0ece3] border border-navy/10 p-8 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-navy/5 transform rotate-45 translate-x-16 -translate-y-16" />
        
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-rose-600 animate-pulse fill-rose-600" />
            <h2 className="font-serif font-black text-xl md:text-2xl text-navy uppercase tracking-tight">
              Support Criminology & Outreach Funds
            </h2>
          </div>
          
          <p className="text-xs text-navy/80 leading-relaxed font-light">
            Your generous financial backing powers critical sociology investigations, field studies in Akwa Ibom correctional safety shelters, youth reform programs, and community-policing workshops. Select an amount or input a customized sum to process secure donations directly via Paystack.
          </p>

          {donationSuccess ? (
            <div className="p-6 bg-white border-2 border-emerald-300 text-center space-y-3 animate-scale-up">
              <Sparkles className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-xl text-emerald-800 uppercase">Philanthropic Receipt Confirmed!</h3>
              <p className="text-xs text-green-700 max-w-md mx-auto leading-relaxed">
                Thank you infinitely for your support. Your financial donation has been processed securely and written directly to the school outreach ledgers. A digital footprint record is logged in your personal scholar dashboard.
              </p>
              <button
                onClick={() => setDonationSuccess(false)}
                className="cursor-pointer font-mono text-[9px] uppercase font-bold py-2 px-6 bg-navy text-gold hover:bg-gold hover:text-navy transition mt-2"
              >
                Contribute Again
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => handleDonationSubmit(e, false)} className="bg-white border border-navy/10 p-6 md:p-8 space-y-5">
              
              {donationError && (
                <div className="p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-800 leading-normal font-sans">
                  {donationError}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Donor name input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60 font-mono">Contributor name</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder={profile?.displayName || "Jane Doe (Optional)"}
                    className="w-full px-3 py-2.5 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold transition"
                  />
                </div>

                {/* Donor email input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60 font-mono font-bold">Email address *</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder={profile?.email || "contributor@scholar.com"}
                    className="w-full px-3 py-2.5 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold transition"
                  />
                </div>
              </div>

              {/* Donation Amount selector */}
              <div className="space-y-2">
                <label className="block text-[9px] uppercase tracking-widest font-bold text-navy/60 font-mono font-bold">Support Tier / Customized Amount (NGN)</label>
                
                {/* Speed amount badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[2500, 5000, 10000, 25000, 50000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`px-3 py-2 text-xs font-mono font-medium border cursor-pointer transition ${
                        Number(donationAmount) === amt 
                          ? 'bg-navy text-gold border-navy font-bold' 
                          : 'bg-[#fdfcf9] text-navy/80 hover:bg-navy/5 border-navy/10'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDonationAmount('')}
                    className={`px-3 py-2 text-xs font-mono font-medium border cursor-pointer transition ${
                      ![2500, 5000, 10000, 25000, 50000].includes(Number(donationAmount)) 
                        ? 'bg-navy text-gold border-navy font-bold' 
                        : 'bg-[#fdfcf9] text-navy/80 hover:bg-navy/5 border-navy/10'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Direct text input */}
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm font-serif font-black text-navy/55">₦</span>
                  <input
                    type="number"
                    min="100"
                    required
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter support amount in Naira"
                    className="w-full pl-7 pr-4 py-3 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dedication message */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] uppercase tracking-widest font-bold text-navy/60 font-mono">Dedication Note / Encouraging remarks (Optional)</label>
                <textarea
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  placeholder="E.g. Keep up the restorative juvenile research efforts in Akwa Ibom State!"
                  rows={2}
                  className="w-full px-3 py-3 border border-navy/15 rounded-none text-xs bg-[#fdfcf9] focus:outline-none focus:border-gold resize-none"
                  maxLength={500}
                />
              </div>

              {/* Donation actions */}
              <div className="grid sm:grid-cols-2 gap-3 pt-3">
                <button
                  type="submit"
                  disabled={donatingLoading}
                  className="cursor-pointer w-full py-3.5 bg-navy text-[#fdfcf9] hover:bg-gold hover:text-navy font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition disabled:opacity-50 border border-navy"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{donatingLoading ? "Processing Support..." : `Support with ₦${Number(donationAmount).toLocaleString()}`}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDonationSubmit(e, true)}
                  disabled={donatingLoading}
                  className="cursor-pointer w-full py-3.5 bg-emerald-700 text-[#fdfcf9] hover:bg-emerald-800 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Interactive Emulator Bypass Send</span>
                </button>
              </div>

              {/* PII security notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-normal flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  All transaction keys are signed and recorded under academic auditing rules. Verified credentials logged onto account dashboard automatically.
                </span>
              </div>

            </form>
          )}

        </div>
      </div>

    </div>
  );
}
