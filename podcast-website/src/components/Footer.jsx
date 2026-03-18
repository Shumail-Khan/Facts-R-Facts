import React from "react";
import { Link } from "react-router-dom";
import { Mic, Radio, Headphones, Copyright } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-red-950 text-gray-300 py-6">
      <div className="container mx-auto px-4">
        {/* Main Footer Content - Smaller grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {/* Logo and Description */}
          <div>
            <Link to="/" className="inline-block mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mic className="text-red-400" size={20} />
                <span>Facts Are Facts</span>
              </h2>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your daily dose of truth, insights, and engaging conversations.
            </p>
            <div className="mt-2 text-xs text-red-400/70 flex items-center gap-1">
              <Copyright size={10} />
              <span>All rights reserved</span>
            </div>
          </div>

          {/* Categories - Compact */}
          <div>
            <h3 className="text-white font-medium mb-2 text-sm border-b border-red-800 pb-1">Categories</h3>
            <ul className="space-y-1.5">
              <li>
                <span
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Radio size={12} />
                  The Red Mic
                </span>
              </li>
              <li>
                <span 
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Headphones size={12} />
                  PUKHTUN CHRONICLES
                </span>
              </li>
              <li>
                <span 
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Mic size={12} />
                  رشتیا رشتیا وی
    
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links - Compact */}
          <div>
            <h3 className="text-white font-medium mb-2 text-sm border-b border-red-800 pb-1">Quick Links</h3>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="text-xs text-gray-300 hover:text-red-400 transition-colors">
                  Home
                </Link>
              </li>
              
            </ul>
          </div>
        </div>

        {/* Divider - Thinner */}
        <div className="border-t border-red-800 pt-3">
          {/* Copyright and Legal - Compact */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs">
            <div className="mb-2 md:mb-0 flex items-center gap-2 text-gray-400">
              <Copyright size={12} className="text-red-400" />
              <span>© {currentYear} Facts Are Facts. All rights reserved.</span>
            </div>

            {/* Legal Links - Compact */}
            <div className="flex gap-4">
              <span className="text-gray-400 hover:text-red-400 transition-colors text-xs">
                Privacy
              </span>
              <span className="text-gray-400 hover:text-red-400 transition-colors text-xs">
                Terms
              </span>
              <span className="text-gray-400 hover:text-red-400 transition-colors text-xs">
                Cookies
              </span>
            </div>
          </div>

          {/* Bottom Bar - Minimal */}
          <div className="mt-2 text-center">
            <p className="text-[10px] text-gray-600">
              Facts Are Facts™. Made with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;