// frontend/src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const navLinks = [
  { path: "/", label: "Dashboard", icon: "⊞" },
  { path: "/candidates", label: "Candidates", icon: "◈" },
  { path: "/match", label: "Match", icon: "◎" },
  { path: "/ai", label: "AI Shortlist", icon: "✦" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-display font-bold text-sm">
              TL
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Talent<span className="text-brand-400">Lens</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-surface-hover"
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side — user info + logout */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                {/* User avatar + name */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-display font-bold">
                    {initials}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-white leading-tight">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-red-400 border border-surface-border hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-card border-t border-surface-border px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "bg-brand-500/15 text-brand-400" : "text-gray-400 hover:text-gray-200"
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          {user && (
            <div className="pt-3 border-t border-surface-border">
              <div className="px-4 py-2 text-sm text-gray-400">{user.name} ({user.role})</div>
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
