import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Banknote, Menu, UserCircle, X, Coins } from "lucide-react";
import { useState } from "react";
import { ConnectButton } from "./WalletProvider";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Banknote className="h-6 w-6" />
          <span>CrossPay</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
            How It Works
          </Link>
          <Link to="/rates" className="text-sm font-medium transition-colors hover:text-primary">
            Exchange Rates
          </Link>
          <Link to="/demo" className="text-sm font-medium transition-colors hover:text-primary">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span>RWA Demo</span>
            </div>
          </Link>
          <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary">
            <div className="flex items-center gap-1">
              <UserCircle className="h-4 w-4" />
              <span>Profile</span>
            </div>
          </Link>
          <Button asChild variant="outline" className="mr-2">
            <Link to="/send-money">Send Money</Link>
          </Button>
          <ConnectButton />
        </nav>

        {/* Mobile Navigation Toggle */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute left-0 top-16 z-50 w-full bg-white p-4 shadow-md md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={toggleMenu}
              >
                How It Works
              </Link>
              <Link
                to="/rates"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={toggleMenu}
              >
                Exchange Rates
              </Link>
              <Link
                to="/demo"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={toggleMenu}
              >
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  <span>RWA Demo</span>
                </div>
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={toggleMenu}
              >
                <div className="flex items-center gap-1">
                  <UserCircle className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              </Link>
              <Button asChild variant="outline" className="w-full" onClick={toggleMenu}>
                <Link to="/send-money">Send Money</Link>
              </Button>
              <div className="pt-2">
                <ConnectButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 