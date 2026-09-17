import React, { useState } from 'react';
import {
  Mail,
  Send,
  Check,
  Copy,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { portfolioData } from '../data/portfolioData';
import { ScrollReveal } from './ScrollReveal';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceInterest: 'User Research',
    message: '',
  });

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(portfolioData.contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (formError) setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // Simulate clean dispatch with visual feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      serviceInterest: 'User Research',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <section id="contact" className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Contact
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Let’s discuss your research or analysis project.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Have a project in mind, need guidance on survey sampling, or want to audit your product’s usability? Send a message through the form or reach out directly.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Info & Socials (5 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-8"
          >
            {/* Direct Email Card */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Direct Email
                  </h3>
                  <span className="text-sm sm:text-base font-bold text-slate-900 break-all">
                    {portfolioData.contact.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/70">
                <button
                  type="button"
                  id="copy-email-btn"
                  onClick={handleCopyEmail}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Email Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${portfolioData.contact.email}?subject=Research%20Inquiry`}
                  id="mailto-link-btn"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-2xs"
                >
                  <span>Open Mailer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Availability & Location */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Turnaround Time
                  </h4>
                  <p className="text-sm text-slate-700 font-medium">
                    {portfolioData.contact.responseTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location & Timezones
                  </h4>
                  <p className="text-sm text-slate-700 font-medium">
                    {portfolioData.contact.location} — {portfolioData.contact.availability}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Profiles & Social Links
              </h4>
              <div className="flex flex-col gap-2">
                {portfolioData.contact.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                  >
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-600">
                      {social.platform}
                    </span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-700 flex items-center gap-1">
                      {social.handle}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form (7 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-2xs">
              {submitted ? (
                <div id="contact-success-card" className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Message Received!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out, <span className="font-semibold text-slate-800">{formData.name}</span>. I have received your message and will review your inquiry within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="mt-4 px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form id="portfolio-contact-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      Send a Message
                    </h3>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Name <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Email <span className="text-blue-600">*</span>
                      </label>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="jane@company.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-service" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Service of Interest
                    </label>
                    <select
                      id="contact-service"
                      name="serviceInterest"
                      value={formData.serviceInterest}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="User Research">Qualitative User Research & Interviews</option>
                      <option value="Surveys & Polling">Survey Architecture & Sampling</option>
                      <option value="Usability Testing">Usability Testing & Friction Audit</option>
                      <option value="Data Analysis">Quantitative Data Analysis & Reporting</option>
                      <option value="General Inquiry">General / Advisory Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Project Details or Message <span className="text-blue-600">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me a bit about your product, timeline, or research questions..."
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    id="contact-submit-btn"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center pt-2">
                    No spam. Your email and project details are held strictly confidential.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
