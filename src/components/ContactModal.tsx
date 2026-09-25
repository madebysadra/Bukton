import React, { useEffect, useState } from 'react';
import { X, Check, Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitted) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitted(true);
    window.setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleBackdropMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !submitted) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-[#1A1816]/65 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-label="ارتباط با کانسیرژ بوکتون"
    >
      <div
        className="bg-[#FAF8F5] border border-[#DDD7CE] rounded-xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[#E7E2DA] bg-[#F7F4EE]">
          <span className="font-serif-brand text-base sm:text-lg font-semibold tracking-widest text-[#1A1816]">
            BUKTON Concierge
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5C564E] hover:text-[#1A1816] hover:bg-[#EAE4DC] rounded-lg transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-[#F2F7F2] text-[#1E7E34] rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-[#1A1816] mb-1">
                پیام شما با موفقیت دریافت شد
              </h4>
              <p className="text-xs text-[#5C564E] leading-relaxed">
                درخواست شما ثبت شد. تیم پشتیبانی بوکتون در اولین فرصت با شما تماس خواهد گرفت.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5">
                <h3 className="text-lg sm:text-xl font-semibold text-[#1A1816] mb-1">
                  ارتباط با کانسیرژ بوکتون
                </h3>
                <p className="text-xs text-[#5C564E] leading-relaxed">
                  سوالی درباره رزروها دارید یا می‌خواهید به عنوان متخصص به پلتفرم بوکتون بپیوندید؟
                </p>
              </div>

              <div className="bg-[#F3EFEA] border border-[#DDD7CE] rounded-lg p-3.5 mb-5 space-y-2.5 text-xs text-[#4A4641]">
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#7C2D32] shrink-0 mt-0.5" />
                  <span dir="rtl">پشتیبانی اختصاصی: ۰۲۱-۲۶۲۰۰۰۸۸ (شنبه تا پنج‌شنبه ۹ الی ۲۱)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#7C2D32] shrink-0 mt-0.5" />
                  <span dir="ltr" className="text-left">concierge@bukton.ir</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#7C2D32] shrink-0 mt-0.5" />
                  <span dir="rtl">استودیو مرکزی: تهران، بلوار فرشته، پلاک ۳۸</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="contact-name" className="text-xs font-medium text-[#2A2724] block mb-1">
                    نام و نام‌خانوادگی
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="نام کامل"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32] focus:ring-1 focus:ring-[#7C2D32]/15 transition-shadow"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="text-xs font-medium text-[#2A2724] block mb-1">
                    شماره تماس یا ایمیل
                  </label>
                  <input
                    id="contact-email"
                    type="text"
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="۰۹۱۲... یا info@..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32] focus:ring-1 focus:ring-[#7C2D32]/15 transition-shadow dir-ltr text-left"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="text-xs font-medium text-[#2A2724] block mb-1">
                    متن پیام
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="پیام یا درخواست خود را بنویسید..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DDD7CE] rounded-lg focus:outline-none focus:border-[#7C2D32] focus:ring-1 focus:ring-[#7C2D32]/15 transition-shadow resize-y min-h-[96px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-[#FAF8F5] bg-[#7C2D32] hover:bg-[#672226] rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال پیام به کانسیرژ</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
