import React from 'react';
import { Home, Compass, Download, Library } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      <div className="flex flex-row justify-between items-center px-4 py-2 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="./cl.svg"
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Nav Items (always shown on mobile) */}
        <ul className="flex flex-row gap-4 sm:gap-6 text-sm sm:text-base font-bold">
          <li className="flex items-center gap-1">
            <Home className="h-5 w-5" /> <span>Home</span>
          </li>
          <li className="flex items-center gap-1">
            <Compass className="h-5 w-5" /> <span>Explore</span>
          </li>
          <li className="flex items-center gap-1">
            <Download className="h-5 w-5" /> <span>Download</span>
          </li>
          <li className="flex items-center gap-1">
            <Library className="h-5 w-5" /> <span>Library</span>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
