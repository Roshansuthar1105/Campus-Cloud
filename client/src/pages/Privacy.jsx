import React from 'react';

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="mb-4">
          Last updated: June 1, 2023
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to Campus Cloud. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. The Data We Collect About You</h2>
        <p className="mb-4">
          Personal data, or personal information, means any information about an individual from which that person can be identified. It does not include data where the identity has been removed (anonymous data).
        </p>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Identity Data includes first name, last name, username or similar identifier, and student/faculty ID.</li>
          <li className="mb-2">Contact Data includes email address and telephone numbers.</li>
          <li className="mb-2">Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          <li className="mb-2">Profile Data includes your username and password, your interests, preferences, feedback and survey responses.</li>
          <li className="mb-2">Usage Data includes information about how you use our website, products and services.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. How We Use Your Personal Data</h2>
        <p className="mb-4">
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Where we need to perform the contract we are about to enter into or have entered into with you.</li>
          <li className="mb-2">Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
          <li className="mb-2">Where we need to comply with a legal obligation.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Data Security</h2>
        <p className="mb-4">
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Data Retention</h2>
        <p className="mb-4">
          We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements. We may retain your personal data for a longer period in the event of a complaint or if we reasonably believe there is a prospect of litigation in respect to our relationship with you.
        </p>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Your Legal Rights</h2>
        <p className="mb-4">
          Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Request access to your personal data.</li>
          <li className="mb-2">Request correction of your personal data.</li>
          <li className="mb-2">Request erasure of your personal data.</li>
          <li className="mb-2">Object to processing of your personal data.</li>
          <li className="mb-2">Request restriction of processing your personal data.</li>
          <li className="mb-2">Request transfer of your personal data.</li>
          <li className="mb-2">Right to withdraw consent.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy or our privacy practices, please contact us at:
        </p>
        <p className="mb-4">
          <strong>Email:</strong> privacy@campuscloud.edu<br />
          <strong>Address:</strong> 123 Education Street, Academic City, AC 12345
        </p>
      </div>
    </div>
  );
};

export default Privacy;
