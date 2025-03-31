export const metadata = {
  title: 'Terms of Use - Sprunkin',
  description: 'Understand the terms and conditions for using the Sprunkin platform'
}

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
      <p className="text-gray-600 mb-8">Last updated: {lastUpdated}</p>
      
      <div className="prose prose-lg max-w-none">
        <p>
          Welcome to the Sprunkin website. Please read the following terms and conditions carefully as they apply to your use of the Sprunkin website, services, and applications.
          By accessing or using our platform, you agree to comply with these terms. If you do not agree to these terms, please do not use our services.
        </p>
        
        <h2>1. Service Description</h2>
        <p>
          Sprunkin provides an online gaming platform where users can browse and play various online games. We reserve the right to modify, suspend, or terminate part or all of our services at any time without prior notice.
        </p>
        
        <h2>2. User Accounts</h2>
        <p>
          Certain features may require you to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          You agree to notify us immediately of any unauthorized use of your account.
        </p>
        <p>
          You must provide accurate, complete, and current information. If you provide inaccurate, incomplete, or outdated information, we may suspend or terminate your account.
        </p>
        
        <h2>3. User Behavior</h2>
        <p>
          When using our services, you agree not to:
        </p>
        <ul>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the intellectual property rights of others</li>
          <li>Distribute harmful, offensive, harassing, pornographic, defamatory, or otherwise objectionable content</li>
          <li>Attempt to interfere with or disrupt the website's normal operation</li>
          <li>Collect user information without our explicit permission</li>
          <li>Use automated means to access the website</li>
          <li>Impersonate others or falsely represent your relationship with any person or entity</li>
        </ul>
        
        <h2>4. Intellectual Property</h2>
        <p>
          All content on the website, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, are owned by Sprunkin or its content providers and are protected by international copyright laws.
          You may not copy, distribute, or use these contents without our prior written consent.
        </p>
        
        <h2>5. User Content</h2>
        <p>
          You may have the opportunity to post comments, feedback, or other content on our platform. You retain all rights to your content, but grant us a non-exclusive, free, perpetual, transferable,
          and re-licensable right to use, modify, display, and distribute your content.
        </p>
        
        <h2>6. Disclaimer</h2>
        <p>
          The Sprunkin website and services are provided "as is" without any express or implied warranties. In the maximum extent permitted by law, we disclaim all warranties,
          including but not limited to merchantability, fitness for a particular purpose, and non-infringement of implied warranties.
        </p>
        
        <h2>7. Limitation of Liability</h2>
        <p>
          In no event shall Sprunkin or its officers, directors, employees, or agents be liable for any direct, indirect, incidental, special, punitive, or consequential damages,
          whether these damages arise from your use of or inability to use our services, any content or content provided by third parties, or otherwise.
        </p>
        
        <h2>8. Terms Modification</h2>
        <p>
          We reserve the right to modify these terms at any time. Modified terms will be effective immediately upon posting on the website.
          Your continued use of our services after any modification constitutes your acceptance of the modified terms.
        </p>
        
        <h2>9. Applicable Law</h2>
        <p>
          These terms are governed by the laws of the People's Republic of China, without regard to its conflict of law provisions.
        </p>
        
        <h2>10. Contact Information</h2>
        <p>
          If you have any questions about these terms, please contact us: <a href="mailto:terms@sprunkin.com">terms@sprunkin.com</a>
        </p>
      </div>
    </div>
  );
} 