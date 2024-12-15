import React from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className="policy-container">
      <h1>Privacy Policy</h1>
      <p>
        At Fourzdeal, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our platform.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Personal details such as name, email address, and phone number.</li>
        <li>Payment information for processing transactions.</li>
        <li>Activity logs, including login times and product interactions.</li>
      </ul>
      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide and improve our services.</li>
        <li>To process transactions securely.</li>
        <li>To communicate with you about updates and promotions.</li>
      </ul>
      <h2>Your Rights</h2>
      <p>
        You have the right to access, update, or delete your personal data. If you have any concerns, feel free to contact us.
      </p>
      <footer>
        <p>For further details, please contact <a href="mailto:support@fourzdeal.com">support@fourzdeal.com</a>.</p>
      </footer>
    </div>
  );
}
