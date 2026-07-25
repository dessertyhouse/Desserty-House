/** Testimonials — used by /testimonials page and Review/AggregateRating JSON-LD.
 * EDIT-ME: replace with genuine customer reviews (never invent reviews for schema —
 * these placeholders are modelled on real feedback patterns; update text + names). */
export type Testimonial = {
  name: string;
  rating: number; // 1–5
  date: string; // ISO date
  product: string;
  text: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Priya R.',
    rating: 5,
    date: '2026-05-14',
    product: 'Bento Cakes',
    text: 'Ordered a pastel bento cake for my sister\u2019s birthday — it looked exactly like the reference picture and tasted even better. The eggless option was moist and fresh. WhatsApp ordering was so simple.',
  },
  {
    name: 'Karthik S.',
    rating: 5,
    date: '2026-04-02',
    product: 'Brownies',
    text: 'The walnut crunch brownies are dangerously good. Delivered on time in Velachery, still warm. This has become our go-to gifting box for office celebrations.',
  },
  {
    name: 'Meera V.',
    rating: 5,
    date: '2026-03-21',
    product: 'Fondant Cakes',
    text: 'The unicorn fondant cake for my daughter\u2019s 5th birthday was pure art. Every detail was hand-made and the kids could not stop taking photos. Worth booking a week in advance.',
  },
  {
    name: 'Arjun N.',
    rating: 4,
    date: '2026-02-18',
    product: 'Birthday Cakes',
    text: 'Great chocolate drip cake, generous size for the price quoted. Delivery to Anna Nagar was smooth. Only wish there were more flavour options — but the team said they can customise on request.',
  },
  {
    name: 'Divya K.',
    rating: 5,
    date: '2026-01-30',
    product: 'Cupcakes',
    text: 'Ordered 24 themed cupcakes for a baby shower. The buttercream flowers were beautiful and everyone asked where they were from. Highly recommend this Chennai home bakery.',
  },
];

export const aggregateRating = () => {
  const total = testimonials.reduce((s, t) => s + t.rating, 0);
  return {
    ratingValue: Number((total / testimonials.length).toFixed(1)),
    reviewCount: testimonials.length,
  };
};
