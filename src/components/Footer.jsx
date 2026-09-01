import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full mt-auto bg-surface-container-lowest border-t border-outline-variant/40 py-12 px-margin-mobile md:px-margin-desktop transition-colors duration-200">
      <div className="max-w-max-width mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Brand / Copyright */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="font-headline-md text-headline-md text-primary font-bold">
            Tazkarti
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">
            © 2026 Tazkarti Egypt. All Rights Reserved. Secure National Platform for Sports & Cultural Events.
          </p>
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="material-symbols-outlined text-[16px] text-pitch-green">verified_user</span>
            <span>Official Ticketing Authority of Egypt</span>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="flex flex-col gap-3">
          <span className="font-label-sm font-semibold uppercase text-secondary tracking-wider text-xs">Legal & Compliance</span>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#terms">Terms of Service</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#privacy">Privacy Policy</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#security">Security Standards</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#fanid-policy">Fan ID Regulations</a>
        </div>

        {/* Links Column 2 */}
        <div className="flex flex-col gap-3">
          <span className="font-label-sm font-semibold uppercase text-secondary tracking-wider text-xs">Help & Outlets</span>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#outlets">Authorized Retail Outlets (WE Stores)</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#sponsorships">Sponsorships & Organizers</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#contact">Contact Support (15355)</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#faq">Frequently Asked Questions</a>
        </div>
      </div>
    </footer>
  );
};
