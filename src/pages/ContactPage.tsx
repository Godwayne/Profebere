import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Mail, Phone, Building, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { addMessage } from '../services/db';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMess, setErrorMess] = useState('');

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
      // Real database integration!
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

  return (
    <div className="space-y-12 py-4 animate-fade-in text-left text-navy">
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
          
          <div className="space-y-8 relative z-10">
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

          <div className="border-t border-white/10 pt-6 mt-8 relative z-10">
            <h4 className="font-serif font-bold text-[10px] uppercase tracking-widest text-gold font-bold">Response Window</h4>
            <p className="text-[11px] text-white/70 font-light mt-1.5 leading-relaxed">
              Academic correspondences are reviewed weekly. For urgent journal submissions or conference keynote bookings, please mark "URGENT" inside the message subject.
            </p>
          </div>
        </div>

        {/* Right Column: Inquiries Form */}
        <div className="md:col-span-7 bg-white p-8 rounded-none border border-navy/10 shadow-xs">
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full inline-flex items-center justify-between bg-navy hover:bg-navy-hover disabled:bg-slate-300 text-white text-[10px] uppercase tracking-widest font-bold px-6 py-4 rounded-none shadow-md hover:shadow-lg transition cursor-pointer"
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
    </div>
  );
}
