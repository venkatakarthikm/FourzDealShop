import React from 'react';
import './PrivacyPolicy.css';

export default function TermsOfService() {
  return (
    <div className="terms-container">
      <h1>Terms of Service</h1>
      <p>
        Welcome to Fourzdeal! By using our platform, you agree to comply with the following terms and conditions. Please read them carefully.
      </p>
      <h2>Account Registration</h2>
      <ul>
        <li>Users must provide accurate information during registration.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
      </ul>
      <h2>Prohibited Activities</h2>
      <ul>
        <li>Engaging in fraudulent or illegal activities.</li>
        <li>Posting harmful, abusive, or offensive content.</li>
        <li>Violating intellectual property rights of others.</li>
      </ul>
      <h2>Limitation of Liability</h2>
      <p>
        Fourzdeal is not liable for any damages arising from the use of our platform. Users are responsible for ensuring their own compliance with laws and regulations.
      </p>
      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to update these Terms of Service at any time. Continued use of the platform indicates acceptance of any changes.
      </p>
      <footer>
        <p>For questions or concerns, please contact <a href="mailto:support@fourzdeal.com">support@fourzdeal.com</a>.</p>
      </footer>
    </div>
  );
}
