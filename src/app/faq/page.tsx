import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions - Sprunkin',
  description: 'Find answers to common questions about the Sprunkin gaming platform'
}

export default function FAQPage() {
  const faqs = [
    {
      question: 'How do I start playing games?',
      answer: 'Browse games on the home page or games page, click on a game that interests you, then click the "Play Now" button to start playing. No downloads or installations are required; all games can be played directly in your browser.'
    },
    {
      question: 'Are all games completely free?',
      answer: 'Yes, all games on Sprunkin are completely free. We maintain our platform through advertisements and sponsorships to ensure all users can enjoy games for free.'
    },
    {
      question: 'How do I save my game progress?',
      answer: 'To save your game progress, you need to create an account and log in. Most games will automatically save your progress, and you can continue where you left off the next time you log in.'
    },
    {
      question: 'Can I play games on mobile devices?',
      answer: 'Yes, most games on Sprunkin support mobile devices. Our website uses responsive design to automatically adapt to different screen sizes, providing a good gaming experience on phones and tablets as well.'
    },
    {
      question: 'How can I report issues or bugs?',
      answer: 'If you encounter issues or bugs in a game, please contact our support team through the "Contact Us" page or leave a comment in the review section below the game. We\'ll address your feedback as soon as possible.'
    }
  ];
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">Have more questions? Feel free to contact us.</p>
        <Link href="/contact" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          Contact Us
        </Link>
      </div>
    </div>
  );
} 