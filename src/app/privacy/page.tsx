export const metadata = {
  title: 'Privacy Policy - Sprunkin',
  description: 'Learn how Sprunkin collects, uses and protects your personal information'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information Collection</h2>
        <p>
          We may collect the following types of information:
        </p>
        <ul>
          <li><strong>Personal Information</strong>: Such as name, email address, username, etc.</li>
          <li><strong>Usage Data</strong>: Such as pages visited, links clicked, gaming time, etc.</li>
          <li><strong>Device Information</strong>: Such as IP address, browser type, operating system, etc.</li>
        </ul>
        
        <h2>2. Information Usage</h2>
        <p>
          We use the collected information to:
        </p>
        <ul>
          <li>Provide, maintain and improve our services</li>
          <li>Process your requests and transactions</li>
          <li>Send service-related notifications</li>
          <li>Provide customer support</li>
          <li>Monitor and analyze usage trends and activities</li>
        </ul>
        
        <h2>3. Information Sharing</h2>
        <p>
          We do not sell your personal information. However, we may share your information in specific circumstances:
        </p>
        <ul>
          <li>With your consent</li>
          <li>With our service providers</li>
          <li>To comply with legal requirements</li>
          <li>To protect our rights and safety</li>
        </ul>
        
        <h2>4. Data Security</h2>
        <p>
          We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure.
          However, please note that no electronic transmission or storage method is 100% secure.
        </p>
        
        <h2>5. Cookies and Similar Technologies</h2>
        <p>
          We use cookies and similar technologies to collect information and improve your experience.
          You can control the use of cookies through your browser settings.
        </p>
        
        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about our privacy policy, please contact us at:
          <br />
          Email: <a href="mailto:privacy@sprunkin.com">privacy@sprunkin.com</a>
        </p>
      </div>
    </div>
  );
} 