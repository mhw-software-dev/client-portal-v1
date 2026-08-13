"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  ["Home", "/"],
  ["Calendar", "/calendar"],
];

const footerLinks = [
  ["What We Do", "https://www.mhwlivemusic.com/hotels-resorts"],
  ["Who We Are", "https://www.mhwlivemusic.com/about"],
  ["Hospitality Insights", "https://www.mhwlivemusic.com/insights"],
  ["Client Stories", "https://www.mhwlivemusic.com/client-stories"],
  ["Career Opportunities", "https://www.mhwlivemusic.com/careers"],
];

const socialLinks = [
  [
    "Facebook",
    "https://www.facebook.com/mhwlivemusic",
    "M8 14.5V9.2H6.2V7H8V5.4C8 3.4 9.2 2.3 11.2 2.3C11.8 2.3 12.4 2.4 12.9 2.5V4.6H11.8C10.9 4.6 10.7 5 10.7 5.7V7H12.8L12.5 9.2H10.7V14.5H8Z",
  ],
  [
    "Instagram",
    "https://www.instagram.com/mhwlivemusic",
    "M7.8 5.7C6.6 5.7 5.7 6.6 5.7 7.8V10.2C5.7 11.4 6.6 12.3 7.8 12.3H10.2C11.4 12.3 12.3 11.4 12.3 10.2V7.8C12.3 6.6 11.4 5.7 10.2 5.7H7.8ZM7.8 4H10.2C12.3 4 14 5.7 14 7.8V10.2C14 12.3 12.3 14 10.2 14H7.8C5.7 14 4 12.3 4 10.2V7.8C4 5.7 5.7 4 7.8 4ZM9 7.2C8 7.2 7.2 8 7.2 9C7.2 10 8 10.8 9 10.8C10 10.8 10.8 10 10.8 9C10.8 8 10 7.2 9 7.2ZM9 5.9C10.7 5.9 12.1 7.3 12.1 9C12.1 10.7 10.7 12.1 9 12.1C7.3 12.1 5.9 10.7 5.9 9C5.9 7.3 7.3 5.9 9 5.9ZM12.2 5.7C12.2 6.1 11.9 6.4 11.5 6.4C11.1 6.4 10.8 6.1 10.8 5.7C10.8 5.3 11.1 5 11.5 5C11.9 5 12.2 5.3 12.2 5.7Z",
  ],
  [
    "YouTube",
    "https://www.youtube.com/@mhwlivemusic",
    "M15.5 6.2C15.3 5.5 14.9 5.1 14.2 4.9C13 4.6 9 4.6 9 4.6C9 4.6 5 4.6 3.8 4.9C3.1 5.1 2.7 5.5 2.5 6.2C2.2 7.4 2.2 9 2.2 9C2.2 9 2.2 10.6 2.5 11.8C2.7 12.5 3.1 12.9 3.8 13.1C5 13.4 9 13.4 9 13.4C9 13.4 13 13.4 14.2 13.1C14.9 12.9 15.3 12.5 15.5 11.8C15.8 10.6 15.8 9 15.8 9C15.8 9 15.8 7.4 15.5 6.2ZM7.7 10.9V7.1L11 9L7.7 10.9Z",
  ],
  [
    "X",
    "https://x.com/mhwlivemusic",
    "M10.2 8.1L15.1 2.5H13.9L9.7 7.3L6.3 2.5H2.4L7.6 9.8L2.4 15.5H3.6L8.1 10.6L11.7 15.5H15.6L10.2 8.1ZM8.6 9.8L8.1 9.1L3.9 3.4H5.7L9 7.8L9.5 8.5L14 14.7H12.2L8.6 9.8Z",
  ],
  [
    "LinkedIn",
    "https://www.linkedin.com/company/mhwlivemusic",
    "M4.1 6.5H6.7V14.5H4.1V6.5ZM5.4 2.5C6.2 2.5 6.8 3.1 6.8 3.9C6.8 4.7 6.2 5.3 5.4 5.3C4.6 5.3 4 4.7 4 3.9C4 3.1 4.6 2.5 5.4 2.5ZM8.2 6.5H10.7V7.6H10.8C11.1 7 12 6.3 13.1 6.3C15.6 6.3 16 7.9 16 10V14.5H13.4V10.5C13.4 9.5 13.4 8.4 12.1 8.4C10.8 8.4 10.6 9.4 10.6 10.4V14.5H8.2V6.5Z",
  ],
];

export function PortalNav({ active = "Home" }: { active?: string }) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <header className="mhw-site-header">
      <div className="mhw-shell mhw-nav">
        <Link className="mhw-brand" href="/">
          <Image
            alt="MHW Live Music"
            height={60}
            priority
            src="/mhw-logo.png"
            width={250}
          />
          <span>Client Portal</span>
        </Link>
        <nav aria-label="Main navigation" className="mhw-nav-links">
          {navItems.map(([item, href]) => (
            <Link
              className={
                item === active ? "mhw-nav-link mhw-nav-link-active" : "mhw-nav-link"
              }
              href={href}
              key={item}
            >
              {item}
            </Link>
          ))}
          <div className="mhw-account-menu">
            <button
              aria-expanded={isAccountOpen}
              aria-label="Open account menu"
              className={
                active === "Profile"
                  ? "mhw-profile-button mhw-nav-link-active"
                  : "mhw-profile-button"
              }
              onClick={() => setIsAccountOpen((current) => !current)}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <path d="M10 10.1C12.1 10.1 13.7 8.5 13.7 6.5C13.7 4.5 12.1 2.9 10 2.9C7.9 2.9 6.3 4.5 6.3 6.5C6.3 8.5 7.9 10.1 10 10.1ZM3.5 17.1C4 14.1 6.6 11.9 10 11.9C13.4 11.9 16 14.1 16.5 17.1C16.6 17.6 16.2 18 15.7 18H4.3C3.8 18 3.4 17.6 3.5 17.1Z" />
              </svg>
            </button>
            {isAccountOpen ? (
              <div className="mhw-account-dropdown" role="menu">
                <Link href="/profile" role="menuitem">
                  My Profile
                </Link>
                <form action="/auth/logout" method="post">
                  <button type="submit" role="menuitem">
                    Log out
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mhw-site-footer">
      <div className="mhw-shell mhw-footer-main">
        <div className="mhw-footer-brand">
          <Image
            alt="MHW Live Music"
            height={52}
            src="/mhw-logo.png"
            width={220}
          />
          <p>The hospitality industry&apos;s leading entertainment advisor and manager.</p>
        </div>
        <div>
          <p className="mhw-kicker">Explore MHW</p>
          <div className="mhw-footer-links">
            {footerLinks.map(([label, href]) => (
              <a href={href} key={label} rel="noreferrer" target="_blank">
                {label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="mhw-kicker">Social</p>
          <div className="mhw-social-links">
            {socialLinks.map(([label, href, iconPath]) => (
              <a
                aria-label={label}
                href={href}
                key={label}
                rel="noreferrer"
                target="_blank"
                title={label}
              >
                <svg aria-hidden="true" viewBox="0 0 18 18">
                  <path d={iconPath} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mhw-footer-bottom">
        <p>© 2026 MHW Live Music, Inc. | 520 Brickell Key Drive Office 305 | Miami, Florida</p>
      </div>
    </footer>
  );
}
