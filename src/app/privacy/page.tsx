import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Dessert(y) House - How we collect, use, and protect your information.',
};

export default function PrivacyPolicy() {
  return (
    <main>
      <header className="shell nav">
        <Link href="/" className="brand">
          Desserty House
          <small>HANDMADE IN CHENNAI</small>
        </Link>
        <Link className="btn gold" href="/order">Start an order</Link>
      </header>

      <section className="shell section privacy-content">
        <div className="eyebrow">LEGAL</div>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="policy-section">
          <h2>Introduction</h2>
          <p>
            Dessert(y) House ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you use our website and services.
          </p>
          <p>
            By using our website <strong>dessertyhouse.in</strong> and submitting order requests, 
            you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>

        <div className="policy-section">
          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <p>When you submit an order request, we collect:</p>
          <ul>
            <li><strong>Name</strong> – Your full name for order identification</li>
            <li><strong>Phone number</strong> – WhatsApp number for order communication</li>
            <li><strong>Delivery address</strong> – Chennai locality for delivery planning</li>
            <li><strong>Order details</strong> – Product preferences, event date, quantity, and customization notes</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>We may automatically collect:</p>
          <ul>
            <li>IP address (for rate limiting and security)</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Referring website addresses</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and manage your cake/dessert orders</li>
            <li>Communicate with you via WhatsApp about your order</li>
            <li>Provide order updates and delivery information</li>
            <li>Send payment instructions and confirm transactions</li>
            <li>Improve our website and services</li>
            <li>Prevent spam and ensure website security</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>WhatsApp Communication</h2>
          <p>
            By providing your WhatsApp number, you consent to receiving order-related messages 
            via WhatsApp. We use WhatsApp to:
          </p>
          <ul>
            <li>Confirm order receipt and availability</li>
            <li>Discuss customization, pricing, and delivery details</li>
            <li>Send payment instructions</li>
            <li>Provide order status updates</li>
          </ul>
          <p>
            Please note that WhatsApp's own privacy policy applies to your use of their platform.
          </p>
        </div>

        <div className="policy-section">
          <h2>Data Storage and Security</h2>
          <p>
            Your information is stored securely using Supabase (a cloud database service) with 
            industry-standard security measures. We implement:
          </p>
          <ul>
            <li>Encrypted data transmission (HTTPS)</li>
            <li>Secure server-side processing</li>
            <li>Access controls and authentication for admin areas</li>
            <li>Regular security assessments</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Data Retention</h2>
          <p>
            We retain your order information for as long as necessary to:
          </p>
          <ul>
            <li>Fulfill your order and provide customer support</li>
            <li>Maintain our business records</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>
            Typically, order data is retained for a minimum of 2 years for business and 
            accounting purposes. You may request deletion of your data at any time 
            by contacting us.
          </p>
        </div>

        <div className="policy-section">
          <h2>Sharing Your Information</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information with:</p>
          <ul>
            <li><strong>Payment processors</strong> – When you make a payment, payment details go directly to the payment provider</li>
            <li><strong>Cloud services</strong> – For image storage (Cloudinary) and database (Supabase)</li>
            <li><strong>Legal requirements</strong> – When required by law or to protect our rights</li>
          </ul>
        </div>

        <div className="policy-section">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct any inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>Raise concerns about how we handle your data</li>
          </ul>
          <p>
            To exercise these rights, please contact us via WhatsApp or email with your request.
          </p>
        </div>

        <div className="policy-section">
          <h2>Cookies</h2>
          <p>
            Our website may use cookies for:
          </p>
          <ul>
            <li>Admin dashboard authentication</li>
            <li>Website functionality and preferences</li>
            <li>Analytics (if any)</li>
          </ul>
          <p>
            You can control cookie preferences through your browser settings.
          </p>
        </div>

        <div className="policy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted 
            on this page with an updated "Last updated" date. We encourage you to review 
            this policy periodically.
          </p>
        </div>

        <div className="policy-section">
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="contact-box">
            <p><strong>Dessert(y) House</strong></p>
            <p>Chennai, Tamil Nadu, India</p>
            <p>
              WhatsApp: <a href="https://wa.me/918939411490">+91 89394 11490</a>
            </p>
          </div>
        </div>

        <div className="policy-footer">
          <Link href="/" className="btn">Back to Home</Link>
          <Link href="/order" className="btn gold">Place an Order</Link>
        </div>
      </section>
    </main>
  );
}
