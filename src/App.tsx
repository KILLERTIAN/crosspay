import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { AboutPage } from "@/pages/AboutPage";
import { RatesPage } from "@/pages/RatesPage";
import { SendMoneyPage } from "@/pages/SendMoneyPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CrossBorderPaymentDemo } from "@/pages/CrossBorderPaymentDemo";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col overflow-hidden">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/rates" element={<RatesPage />} />
            <Route path="/send-money" element={<SendMoneyPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/demo" element={<CrossBorderPaymentDemo />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
