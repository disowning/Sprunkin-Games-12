import Image from 'next/image';
import Link from 'next/link';
import { Users, Award, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'About Us - Sprunkin',
  description: 'Learn about the Sprunkin gaming platform, our story, mission and team'
}

export default function AboutPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-12">
      {/* 顶部banner区域 */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-16">
        <Image
          src="/images/about-banner.jpg"
          alt="About Sprunkin"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/80 to-blue-900/50"></div>
        <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">About Sprunkin</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            We're dedicated to providing players with the best online gaming experience and building a vibrant gaming community
          </p>
        </div>
      </div>
      
      {/* 我们的使命 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Connect Players</h3>
            <p className="text-gray-600">
              Create an active gaming community where players can share gaming experiences and strategies, enjoying games together
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Award size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Provide Quality Games</h3>
            <p className="text-gray-600">
              Carefully select high-quality games to ensure smooth and enjoyable gaming experiences
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Clock size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Continuous Innovation</h3>
            <p className="text-gray-600">
              Continuously explore new technologies and game types to bring fresh gaming experiences and innovative features
            </p>
          </div>
        </div>
      </div>
      
      {/* 我们的故事 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Our Story</h2>
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="prose prose-lg max-w-none">
            <p>
              Sprunkin was founded in 2020 by a group of passionate game developers and designers. We noticed that many quality small games 
              struggled to gain exposure, while players often had to search different platforms for games, creating an inconvenient experience.
            </p>
            <p>
              So, we decided to create a platform that collects various quality games, allowing players to discover and play interesting games in one place, 
              while providing independent game developers with a stage to showcase their work.
            </p>
            <p>
              Starting with just a few dozen games, our platform now features hundreds of curated games covering action, puzzle, strategy, simulation, and more, 
              attracting players from around the globe. Our team has also grown from the initial few to a multinational team today.
            </p>
            <p>
              Looking ahead, we will continue to expand our game library, enhance community features, and continuously optimize user experience 
              to create greater value for both players and developers.
            </p>
          </div>
        </div>
      </div>
      
      {/* 为什么选择我们 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Why Choose Sprunkin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex">
            <div className="mr-4 mt-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield size={24} className="text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Safe & Reliable</h3>
              <p className="text-gray-600">
                We strictly review all games to ensure there is no malware or fraudulent content, providing you with a safe gaming environment.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex">
            <div className="mr-4 mt-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award size={24} className="text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Quality Games</h3>
              <p className="text-gray-600">
                Our games are carefully selected and tested to ensure high-quality and fun gameplay.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex">
            <div className="mr-4 mt-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Regular Updates</h3>
              <p className="text-gray-600">
                We regularly add new games and host events to keep you entertained.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md flex">
            <div className="mr-4 mt-1">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Active Community</h3>
              <p className="text-gray-600">
                Join our community to share game experiences, make new friends, and enjoy gaming together.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 联系我们 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          If you have any questions, suggestions, or partnership opportunities, feel free to contact us. We look forward to hearing from you!
        </p>
        <Link 
          href="/contact"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
} 