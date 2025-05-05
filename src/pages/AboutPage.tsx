import React, { useEffect, useState } from "react";
import { ArrowRight, Building as Bank, BarChart4, Hourglass, PiggyBank, RefreshCw, Send, Shield, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/ui/FadeIn";

// TransferAnimation component
const TransferAnimation = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      {/* Information badge */}
      {/* <div className="absolute top-2 right-2 text-xs text-white bg-primary/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
        Powered by Pharos Network
      </div> */}
      
      {/* Main process flow */}
      <div className="w-full px-2 md:px-8 mb-6 md:mb-10">
        {/* Step indicators above cards (desktop only) */}
        {/* <div className="hidden md:flex justify-evenly mb-1">
          <div className="text-center w-16">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 h-5 w-5 flex items-center justify-center mx-auto">
              <span className="text-[10px] font-bold text-blue-600">1</span>
            </div>
          </div>
          <div className="text-center w-16">
            <div className="rounded-full bg-primary/10 dark:bg-primary/20 h-5 w-5 flex items-center justify-center mx-auto">
              <span className="text-[10px] font-bold text-primary">2</span>
            </div>
          </div>
          <div className="text-center w-16">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 h-5 w-5 flex items-center justify-center mx-auto">
              <span className="text-[10px] font-bold text-green-600">3</span>
            </div>
          </div>
        </div> */}
        
        {/* Process flow cards */}
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
          {/* Connection line (desktop only) */}
          <div className="absolute top-1/2 left-0 w-full hidden md:block z-0 px-14">
            <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-primary to-green-400 rounded-full opacity-20"></div>
            {/* Animated dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-primary shadow-lg shadow-primary/30 animate-dot"
            />
          </div>
          
          {/* Your Bank */}
          
            <div 
              className="bg-white md:gap-10 dark:bg-zinc-800 p-4 md:p-5 rounded-xl shadow-md flex flex-col md:flex-row items-center w-full md:w-1/4 border border-zinc-200 dark:border-zinc-700 z-10 hover:-translate-y-3 transition-transform duration-300"
            >
              {/* Number indicator - always visible in desktop view */}
              <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4 shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">1</span>
              </div>
              
              {/* Content container */}
              <div className="flex flex-col items-center md:items-start ">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-3 md:hidden">
                  <Bank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="hidden md:block mb-2">
                  <Bank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-medium text-sm md:text-base">Your Bank</p>
                <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center md:text-left">Starting point</p>
                <div className="mt-3 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">Funds Sent</p>
                </div>
              </div>
            </div>
          
          
          {/* CrossPay */}
          
            <div 
              className="bg-gradient-to-b  md:gap-10 from-primary/90 to-primary dark:from-primary/80 dark:to-primary/70 p-4 md:p-5 rounded-xl shadow-lg flex flex-col md:flex-row items-center w-full md:w-1/4 border border-primary/20 z-10 hover:-translate-y-3 transition-transform duration-300"
            >
              {/* Number indicator - always visible in desktop view */}
              <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-white/20 mr-4 shrink-0">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              
              {/* Content container */}
              <div className="flex flex-col items-center md:items-start flex-1">
                <div className="rounded-full bg-white/20 p-3 mb-3 md:hidden">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="hidden md:block mb-2">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-sm md:text-base text-white">CrossPay</p>
                <p className="text-[10px] md:text-xs text-white/80 mt-1 text-center md:text-left">Blockchain transfer</p>
                <div className="mt-3 px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 text-white animate-spin" style={{ animationDuration: '3s' }} />
                  <p className="text-[10px] text-white font-medium">Processing</p>
                </div>
              </div>
            </div>
          
          
          {/* Recipient Bank */}
          
            <div 
              className="bg-white md:gap-10 dark:bg-zinc-800 p-4 md:p-5 rounded-xl shadow-md flex flex-col md:flex-row items-center w-full md:w-1/4 border border-zinc-200 dark:border-zinc-700 z-10 hover:-translate-y-3 transition-transform duration-300"
            >
              {/* Number indicator - always visible in desktop view */}
              <div className="hidden md:flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mr-4 shrink-0">
                <span className="text-green-600 dark:text-green-400 font-bold text-xl">3</span>
              </div>
              
              {/* Content container */}
              <div className="flex flex-col items-center md:items-start flex-1">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-3 md:hidden">
                  <Bank className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="hidden md:block mb-2">
                  <Bank className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium text-sm md:text-base">Recipient Bank</p>
                <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center md:text-left">Destination</p>
                <div className="mt-3 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <p className="text-[10px] text-green-700 dark:text-green-300 font-medium">Funds Received</p>
                </div>
              </div>
            </div>
          
        </div>
        
        {/* Step labels - desktop only */}
        <div className="hidden md:flex justify-between mt-2 px-32">
          <div className="text-center w-16">
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Instant</p>
          </div>
          <div className="text-center w-16">
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Seconds</p>
          </div>
          <div className="text-center w-16">
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Complete</p>
          </div>
        </div>
      </div>
      
      {/* Mobile process explainer */}
      <div className="md:hidden w-full mb-4">
        <div className="flex flex-col space-y-2 px-4">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1.5 flex-1">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Funds instantly sent from your bank</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg px-3 py-1.5 flex-1">
              <p className="text-xs font-medium text-primary">CrossPay processes in seconds with Pharos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-xs font-bold text-green-600">3</span>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-1.5 flex-1">
              <p className="text-xs font-medium text-green-700 dark:text-green-300">Recipient gets funds in local currency</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tech explainer card */}
      <div className="w-full px-4">
        <FadeIn direction="up" delay={1}>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Powered by Pharos Network</h4>
            <p className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400">
              Near-instant transfers with 1000+ TPS & subsecond finality
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

// Animated Feature component for the Solution section
const AnimatedFeature = ({ 
  icon, 
  title, 
  description,
  delay = 0
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay?: number;
}) => {
  return (
    <FadeIn direction="up" delay={delay}>
      <div className="flex flex-col bg-white dark:bg-zinc-800/80 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
        <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </FadeIn>
  );
};

// Animated counter for statistics
const AnimatedCounter = ({ 
  value, 
  suffix = "", 
  prefix = "" 
}: { 
  value: number; 
  suffix?: string; 
  prefix?: string;
}) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000; // ms
    const frameDuration = 1000 / 60; // ms per frame for 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(value * progress);
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(value);
      } else {
        setCount(currentCount);
      }
    }, frameDuration);
    
    return () => clearInterval(counter);
  }, [value]);
  
  return (
    <span className="text-4xl font-bold">{prefix}{count}{suffix}</span>
  );
};

export function AboutPage() {
  // Gradient background style
  const gradientStyle = {
    background: "linear-gradient(135deg, #4f46e5, #0ea5e9, #0ea5e9, #4f46e5)",
    backgroundSize: "400% 400%",
    animation: "gradient 15s ease infinite",
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .float {
          animation: float 6s ease-in-out infinite;
        }
        
        .float-delayed {
          animation: float 6s ease-in-out 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes dot-move {
          0% { left: 0%; }
          100% { left: 100%; }
        }
        
        .animate-dot {
          animation: dot-move 3s ease-in-out infinite;
        }
      `}} />
      
      {/* Hero Section */}
      <section style={gradientStyle} className="py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="right">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  How CrossPay Works
                </h1>
                <p className="text-xl mb-8 text-white/90">
                  Our revolutionary platform uses blockchain technology to make international transfers faster, cheaper, and more transparent than traditional banking.
                </p>
                <FadeIn delay={0.5}>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 transform transition-all duration-300 hover:scale-105">
                      Start Sending <ArrowRight className="ml-2" />
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 transform transition-all duration-300 hover:scale-105">
                      Learn More
                    </Button>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>
            
            <FadeIn direction="left" delay={0.3}>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div 
                    className="bg-white/10 p-4 rounded-xl transform transition-all duration-300 hover:bg-white/20 hover:scale-105"
                  >
                    <AnimatedCounter value={90} suffix="%" />
                    <p className="text-white/90">Lower Fees</p>
                  </div>
                  <div 
                    className="bg-white/10 p-4 rounded-xl transform transition-all duration-300 hover:bg-white/20 hover:scale-105"
                  >
                    <AnimatedCounter value={200} prefix="+" suffix="" />
                    <p className="text-white/90">Countries</p>
                  </div>
                  <div 
                    className="bg-white/10 p-4 rounded-xl transform transition-all duration-300 hover:bg-white/20 hover:scale-105"
                  >
                    <AnimatedCounter value={24} suffix="h" />
                    <p className="text-white/90">Availability</p>
                  </div>
                  <div 
                    className="bg-white/10 p-4 rounded-xl transform transition-all duration-300 hover:bg-white/20 hover:scale-105"
                  >
                    <AnimatedCounter value={1000} suffix="+" />
                    <p className="text-white/90">TPS Capacity</p>
                  </div>
                </div>
                <div className="pulse text-center text-sm text-white/80 bg-white/10 p-2 rounded-md">
                  Real-time processing and status updates
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">The Problem With Traditional Banking</h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                International money transfers have been stuck in the past, with outdated systems that hurt your wallet and waste your time.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeIn direction="up" delay={0.1}>
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 w-fit mb-4">
                  <Hourglass className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Slow Transfers</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Traditional bank transfers can take 3-5 business days to complete, leaving you and your recipients waiting.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.3}>
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 w-fit mb-4">
                  <PiggyBank className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hidden Fees</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Banks charge high fees and offer poor exchange rates, sometimes taking up to 7% of your transfer amount.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.5}>
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 w-fit mb-4">
                  <Users className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Lack of Transparency</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Limited tracking capabilities and poor communication leave you guessing about where your money is.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      
      {/* Interactive Transfer Animation */}
      <section className="py-16 md:py-20 w-full">
        <div className="container mx-auto px-4 max-w-none">
          <FadeIn direction="up">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">How Money Moves With CrossPay</h2>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                Our platform leverages Pharos blockchain technology for near-instant, secure transfers with 1000+ TPS capacity.
              </p>
            </div>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.3}>
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl p-6 md:p-8 shadow-lg border border-zinc-100 dark:border-zinc-800 backdrop-blur-sm w-full">
              <TransferAnimation />
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12 md:mt-16">
            <FadeIn direction="up">
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 flex flex-col h-full transform transition hover:shadow-xl hover:-translate-y-1">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-fit mb-4">
                  <span className="text-blue-500 font-bold text-lg">1</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Send Money</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-auto">
                  Initiate your transfer easily from your bank or card in your local currency.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.2}>
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 flex flex-col h-full transform transition hover:shadow-xl hover:-translate-y-1">
                <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-3 w-fit mb-4">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="text-lg font-medium mb-2">We Convert</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-auto">
                  CrossPay processes the transfer in seconds using Pharos blockchain's 1000+ TPS capacity.
                </p>
              </div>
            </FadeIn>
            
            <FadeIn direction="up" delay={0.4}>
              <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 flex flex-col h-full transform transition hover:shadow-xl hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 w-fit mb-4">
                  <span className="text-green-500 font-bold text-lg">3</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Recipient Gets Paid</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-auto">
                  Funds arrive in the recipient's local currency in seconds, not days like traditional banking.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      
      {/* Solution Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">The CrossPay Solution</h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                We've reimagined international money transfers from the ground up to make them work for you.
              </p>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatedFeature 
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Lightning Fast"
              description="Transfers complete in minutes instead of days, letting recipients access funds almost instantly."
              delay={0.1}
            />
            
            <AnimatedFeature 
              icon={<PiggyBank className="h-6 w-6 text-primary" />}
              title="Save Up To 90%"
              description="Our rates are transparent with fees up to 90% lower than traditional banks and other services."
              delay={0.2}
            />
            
            <AnimatedFeature 
              icon={<Shield className="h-6 w-6 text-primary" />}
              title="Bank-Level Security"
              description="Advanced encryption and security protocols protect your money and personal information."
              delay={0.3}
            />
            
            <AnimatedFeature 
              icon={<BarChart4 className="h-6 w-6 text-primary" />}
              title="Real-Time Tracking"
              description="Track your transfer every step of the way with instant notifications and updates."
              delay={0.4}
            />
            
            <AnimatedFeature 
              icon={<Send className="h-6 w-6 text-primary" />}
              title="Global Reach"
              description="Send money to over 200 countries and territories worldwide at competitive rates."
              delay={0.5}
            />
            
            <AnimatedFeature 
              icon={<Trophy className="h-6 w-6 text-primary" />}
              title="Award-Winning Service"
              description="Our 24/7 customer support team is ready to assist you in multiple languages."
              delay={0.6}
            />
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 text-white" style={gradientStyle}>
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Experience the Future of Money Transfers?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of satisfied customers who are saving time and money with CrossPay.
              </p>
              <div className="transform transition-all duration-300 hover:scale-105">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Start Your First Transfer <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}