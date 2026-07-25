/** FAQ content — single source used by the /faq page, FAQPage JSON-LD and llms-full.txt. */
export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: 'How do I place an order with Desserty House?',
    a: 'Browse the menu at dessertyhouse — choose a product and style code, then submit the order form on the /order page or message us directly on WhatsApp at +91 89394 11490. You will receive a unique order ID (format DH-YYYY-XXXXXX) which you can use to track your order.',
  },
  {
    q: 'Do you offer eggless cakes and brownies?',
    a: 'Yes. Every product — brownies, bento cakes, birthday cakes, fondant cakes, cupcakes, donuts and bomboloni — is available in both egg and eggless versions. Just select your preference when ordering.',
  },
  {
    q: 'How much advance notice do you need for an order?',
    a: 'Standard items (brownies, cupcakes, donuts, bomboloni) need at least 2 days notice. Bento and birthday cakes need 2–3 days. Custom fondant cakes and wedding cakes need 5–7 days or more depending on the design complexity.',
  },
  {
    q: 'Which areas in Chennai do you deliver to?',
    a: 'We deliver across Chennai including Tambaram, Velachery, Adyar, T. Nagar, Anna Nagar, OMR and Porur. Delivery charges depend on your location and are confirmed on WhatsApp before payment. Self-pickup can also be arranged.',
  },
  {
    q: 'How is pricing decided?',
    a: 'Prices start from ₹70 and depend on the product, size, design complexity and quantity (delivery cost is extra). After you submit an order request, we confirm the exact quote, delivery charge and payment details personally on WhatsApp before you pay anything.',
  },
  {
    q: 'How do I pay for my order?',
    a: 'We accept UPI and bank transfer. After your order is confirmed on WhatsApp we share the payment details. We never ask for payment before confirming the design, quantity, date and total price.',
  },
  {
    q: 'Can I customise a cake with my own design or photo?',
    a: 'Absolutely. Share a reference photo, theme, colour palette or message on WhatsApp and we will tell you what is possible. Our fondant cakes are fully hand-crafted, so most themes — birthdays, baby showers, anniversaries, weddings — can be created.',
  },
  {
    q: 'How do I track my order?',
    a: 'Use the Track Order page at /track. Enter your order ID (DH-YYYY-XXXXXX) and the WhatsApp phone number used when ordering to see the latest status update.',
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'Orders can be cancelled free of charge before payment is made. After payment, cancellations made at least 48 hours before the delivery date receive a 50% (half) refund; cancellations 24–48 hours before receive a partial refund depending on how much preparation has begun; cancellations under 24 hours are not refunded. See our Refund Policy page for details.',
  },
  {
    q: 'Are your products made fresh?',
    a: 'Yes — everything is baked to order in small batches from our home kitchen in Chennai. Nothing is pre-made or stored; your order is prepared for your specific delivery date.',
  },
];
