'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, ArrowUp, Mail, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        toast.error(data.error || 'Subscription failed, please try again later');
      }
    } catch (error) {
      toast.error('An error occurred during subscription');
      console.error('Subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white pt-12 pb-6 mt-auto relative">
      {/* Back to top button */}
      <button 
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
      
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Sprunkin */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">About Sprunkin</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Sprunkin is an online platform dedicated to providing high-quality free games.
              We strive to bring you the best gaming experience. New games are added daily,
              bringing you endless entertainment possibilities.
            </p>
            
            {/* Social media icons */}
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-300">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors duration-300">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="mailto:contact@sprunkin.com" className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/games" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> All Games
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> Categories
                </Link>
              </li>
              <li>
                <Link href="/popular" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> Popular Games
                </Link>
              </li>
              <li>
                <Link href="/new" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> New Games
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">›</span> About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Subscribe */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3">Subscribe</h3>
            <p className="text-gray-300 text-sm mb-3">
              Subscribe to our newsletter to get the latest game updates and exclusive content.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-indigo-800/50 text-white px-3 py-2 rounded-l text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r text-sm font-medium transition disabled:opacity-70"
                >
                  {isSubmitting ? 'Processing...' : 'Subscribe'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                We respect your privacy and will never share your information with third parties.
              </p>
            </form>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-indigo-800/50 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Sprunkin - All rights reserved
          </p>
          <p className="text-gray-400 text-sm mt-2 sm:mt-0 flex items-center">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 mx-1" />
            <span>in USA</span>
          </p>
        </div>
      </div>
    </footer>
  );
} 