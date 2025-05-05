import { Link } from "react-router-dom";
import { Banknote } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <Banknote className="h-6 w-6" />
              <span>CrossPay</span>
            </Link>
            <p className="text-sm text-slate-600">
              The next-generation payment protocol for fast, secure cross-border transfers with
              near-zero fees.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-slate-600 hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/rates" className="text-sm text-slate-600 hover:text-primary">
                  Exchange Rates
                </Link>
              </li>
              <li>
                <Link to="/fees" className="text-sm text-slate-600 hover:text-primary">
                  Fees & Limits
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="text-sm text-slate-600 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-slate-600 hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-600 hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-slate-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="text-sm text-slate-600 hover:text-primary">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 text-center">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} CrossPay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 