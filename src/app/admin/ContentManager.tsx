'use client';

import { useState, useEffect } from 'react';
import {
  NamedIcon,
  ICON_CHOICES,
  IconSparkle,
  IconHelpCircle,
  IconQuote,
  IconChefHat,
  IconClock,
  IconSearch,
  IconPlus,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconSave,
  IconGrid,
} from '@/components/Icons';

type TrustBadge = { icon: string; label: string };
type HowStep = { icon: string; title: string; body: string };
type FaqItem = { q: string; a: string };
type TestimonialItem = {
  name: string;
  rating: number;
  date: string;
  product: string;
  text: string;
  hidden?: boolean;
};
type AboutBlock = { heading: string; body: string };

type SiteContent = {
  trustBadges: TrustBadge[];
  menuHeading: string;
  menuIntro: string;
  howHeading: string;
  howSteps: HowStep[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  aboutLead: string;
  aboutBlocks: AboutBlock[];
  whyChooseUs: string[];
  leadTimes: string[];
  seoDescription: string;
  aiSummary: string;
  aiGuidance: string;
};

/** Small icon-picker used for trust badges and "how it works" steps. */
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="icon-picker">
      {ICON_CHOICES.map((name) => (
        <button
          key={name}
          type="button"
          title={name}
          aria-label={`Use the ${name} icon`}
          aria-pressed={value === name}
          className={`icon-choice ${value === name ? 'selected' : ''}`}
          onClick={() => onChange(name)}
        >
          <NamedIcon name={name} size={18} />
        </button>
      ))}
    </div>
  );
}

/** Editor for a simple list of text lines (bullet points). */
function LineListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <>
      {items.map((line, i) => (
        <div className="repeat-item" key={i}>
          <div className="repeat-item-head">
            <b>#{i + 1}</b>
            <div className="repeat-actions">
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => onChange(items.filter((_, x) => x !== i))}
              >
                <IconTrash size={14} /> Remove
              </button>
            </div>
          </div>
          <input
            type="text"
            value={line}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, x2) => (x2 === i ? e.target.value : x)))}
          />
        </div>
      ))}
      <div className="add-row">
        <button type="button" className="icon-btn" onClick={() => onChange([...items, ''])}>
          <IconPlus size={14} /> {addLabel}
        </button>
      </div>
    </>
  );
}

/**
 * Content Manager — lets the owner edit the WORDS on the public website:
 * hero trust badges, how-it-works steps, FAQs, testimonials, About copy,
 * lead times, and the SEO / AI-assistant text that feeds llms.txt, sitemap
 * descriptions and Schema.org markup. No code, no redeploy.
 */
export default function ContentManager() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (data.success) setContent(data.content);
      else setMessage({ type: 'error', text: data.error || 'Could not load content.' });
    } catch {
      setMessage({ type: 'error', text: 'Could not load content.' });
    }
  }

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((c) => (c ? { ...c, [key]: value } : c));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setMessage({
          type: 'success',
          text: 'Content saved! The website updates within about a minute.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save content.' });
    }
    setSaving(false);
  }

  async function resetAll() {
    if (!confirm('Reset ALL website content back to the original defaults?\n\nThis undoes every text change you have made here. It cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/content', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setMessage({ type: 'success', text: 'Content reset to defaults.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to reset.' });
    }
  }

  if (!content) {
    return (
      <div className="content-manager">
        <h2>Website Content</h2>
        {message ? (
          <div className={`message ${message.type}`}>{message.text}</div>
        ) : (
          <p className="muted">Loading content…</p>
        )}
      </div>
    );
  }

  return (
    <div className="content-manager">
      <div className="post-manager-header">
        <div>
          <h2>Website Content</h2>
          <p className="muted">
            Edit the words shown on the public website — badges, steps, FAQs, reviews, About page
            and the text search engines and AI assistants read.
          </p>
        </div>
        <div className="repeat-actions">
          <button className="btn" onClick={load} type="button">
            <IconRefresh size={15} /> Refresh
          </button>
          <button className="btn small outline" onClick={resetAll} type="button">
            Reset all to defaults
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <form onSubmit={save} className="post-form">
        {/* ---------------- Hero trust badges ---------------- */}
        <h3>
          <IconSparkle size={18} /> Hero trust badges
        </h3>
        <p className="hint">
          The small pills under the hero buttons on the home page. Keep the labels short (2–4 words)
          so they stay on one line on mobile.
        </p>
        {content.trustBadges.map((b, i) => (
          <div className="repeat-item" key={i}>
            <div className="repeat-item-head">
              <b>
                <NamedIcon name={b.icon} size={16} /> Badge {i + 1}
              </b>
              <div className="repeat-actions">
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() =>
                    set('trustBadges', content.trustBadges.filter((_, x) => x !== i))
                  }
                >
                  <IconTrash size={14} /> Remove
                </button>
              </div>
            </div>
            <input
              type="text"
              maxLength={60}
              value={b.label}
              placeholder="e.g. Egg & eggless choices"
              onChange={(e) =>
                set(
                  'trustBadges',
                  content.trustBadges.map((x, x2) =>
                    x2 === i ? { ...x, label: e.target.value } : x
                  )
                )
              }
            />
            <IconPicker
              value={b.icon}
              onChange={(icon) =>
                set(
                  'trustBadges',
                  content.trustBadges.map((x, x2) => (x2 === i ? { ...x, icon } : x))
                )
              }
            />
          </div>
        ))}
        {content.trustBadges.length < 6 && (
          <div className="add-row">
            <button
              type="button"
              className="icon-btn"
              onClick={() =>
                set('trustBadges', [...content.trustBadges, { icon: 'sparkle', label: '' }])
              }
            >
              <IconPlus size={14} /> Add badge
            </button>
          </div>
        )}

        {/* ---------------- Home menu section ---------------- */}
        <h3>
          <IconGrid size={18} /> Home page menu section
        </h3>
        <label>
          Section heading
          <input
            type="text"
            maxLength={120}
            value={content.menuHeading}
            onChange={(e) => set('menuHeading', e.target.value)}
          />
        </label>
        <label>
          Intro paragraph
          <textarea
            rows={2}
            maxLength={400}
            value={content.menuIntro}
            onChange={(e) => set('menuIntro', e.target.value)}
          />
        </label>

        {/* ---------------- How it works ---------------- */}
        <h3>
          <IconChefHat size={18} /> &quot;How it works&quot; steps
        </h3>
        <p className="hint">The three-step ordering explainer on the home page.</p>
        {content.howSteps.map((s, i) => (
          <div className="repeat-item" key={i}>
            <div className="repeat-item-head">
              <b>
                <NamedIcon name={s.icon} size={16} /> Step {i + 1}
              </b>
              <div className="repeat-actions">
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => set('howSteps', content.howSteps.filter((_, x) => x !== i))}
                >
                  <IconTrash size={14} /> Remove
                </button>
              </div>
            </div>
            <input
              type="text"
              maxLength={60}
              value={s.title}
              placeholder="Step title"
              onChange={(e) =>
                set(
                  'howSteps',
                  content.howSteps.map((x, x2) => (x2 === i ? { ...x, title: e.target.value } : x))
                )
              }
            />
            <textarea
              rows={2}
              maxLength={300}
              value={s.body}
              placeholder="What the customer does at this step"
              onChange={(e) =>
                set(
                  'howSteps',
                  content.howSteps.map((x, x2) => (x2 === i ? { ...x, body: e.target.value } : x))
                )
              }
            />
            <IconPicker
              value={s.icon}
              onChange={(icon) =>
                set('howSteps', content.howSteps.map((x, x2) => (x2 === i ? { ...x, icon } : x)))
              }
            />
          </div>
        ))}
        {content.howSteps.length < 6 && (
          <div className="add-row">
            <button
              type="button"
              className="icon-btn"
              onClick={() =>
                set('howSteps', [...content.howSteps, { icon: 'sparkle', title: '', body: '' }])
              }
            >
              <IconPlus size={14} /> Add step
            </button>
          </div>
        )}

        {/* ---------------- FAQs ---------------- */}
        <h3>
          <IconHelpCircle size={18} /> FAQs ({content.faqs.length})
        </h3>
        <p className="hint">
          Shown on the FAQ page, sent to Google as FAQ rich-result markup, and included in the
          AI-assistant files. Clear, specific answers rank best.
        </p>
        {content.faqs.map((f, i) => (
          <div className="repeat-item" key={i}>
            <div className="repeat-item-head">
              <b>Question {i + 1}</b>
              <div className="repeat-actions">
                <button
                  type="button"
                  className="icon-btn"
                  disabled={i === 0}
                  onClick={() => {
                    const next = [...content.faqs];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    set('faqs', next);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  disabled={i === content.faqs.length - 1}
                  onClick={() => {
                    const next = [...content.faqs];
                    [next[i + 1], next[i]] = [next[i], next[i + 1]];
                    set('faqs', next);
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => set('faqs', content.faqs.filter((_, x) => x !== i))}
                >
                  <IconTrash size={14} /> Remove
                </button>
              </div>
            </div>
            <input
              type="text"
              maxLength={200}
              value={f.q}
              placeholder="Question"
              onChange={(e) =>
                set('faqs', content.faqs.map((x, x2) => (x2 === i ? { ...x, q: e.target.value } : x)))
              }
            />
            <textarea
              rows={3}
              maxLength={1200}
              value={f.a}
              placeholder="Answer"
              onChange={(e) =>
                set('faqs', content.faqs.map((x, x2) => (x2 === i ? { ...x, a: e.target.value } : x)))
              }
            />
          </div>
        ))}
        <div className="add-row">
          <button
            type="button"
            className="icon-btn"
            onClick={() => set('faqs', [...content.faqs, { q: '', a: '' }])}
          >
            <IconPlus size={14} /> Add FAQ
          </button>
        </div>

        {/* ---------------- Testimonials ---------------- */}
        <h3>
          <IconQuote size={18} /> Testimonials ({content.testimonials.length})
        </h3>
        <p className="hint">
          Only publish reviews customers actually gave you — these are sent to Google as review
          markup, and invented reviews can get a site penalised. Use <b>Hide</b> to take one off the
          website while keeping the text here. Reviews written by customers through the website are
          moderated in the <b>Reviews</b> tab instead.
        </p>
        {content.testimonials.map((t, i) => (
          <div className={`repeat-item ${t.hidden ? 'is-hidden-review' : ''}`} key={i}>
            <div className="repeat-item-head">
              <b>
                {t.name || 'New review'} · {t.rating}★
              </b>
              <div className="repeat-actions">
                {t.hidden && <span className="badge-soft status-hidden">HIDDEN</span>}
                <button
                  type="button"
                  className="icon-btn"
                  title={t.hidden ? 'Show this on the website again' : 'Take this off the website without deleting it'}
                  onClick={() =>
                    set(
                      'testimonials',
                      content.testimonials.map((x, x2) =>
                        x2 === i ? { ...x, hidden: !x.hidden } : x
                      )
                    )
                  }
                >
                  {t.hidden ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                  {t.hidden ? 'Show' : 'Hide'}
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() =>
                    set('testimonials', content.testimonials.filter((_, x) => x !== i))
                  }
                >
                  <IconTrash size={14} /> Remove
                </button>
              </div>
            </div>
            <div className="form-row">
              <label>
                Customer name
                <input
                  type="text"
                  maxLength={60}
                  value={t.name}
                  onChange={(e) =>
                    set(
                      'testimonials',
                      content.testimonials.map((x, x2) =>
                        x2 === i ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                />
              </label>
              <label>
                Rating
                <select
                  value={t.rating}
                  onChange={(e) =>
                    set(
                      'testimonials',
                      content.testimonials.map((x, x2) =>
                        x2 === i ? { ...x, rating: Number(e.target.value) } : x
                      )
                    )
                  }
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} star{r > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Date
                <input
                  type="date"
                  value={t.date}
                  onChange={(e) =>
                    set(
                      'testimonials',
                      content.testimonials.map((x, x2) =>
                        x2 === i ? { ...x, date: e.target.value } : x
                      )
                    )
                  }
                />
              </label>
              <label>
                Product ordered
                <input
                  type="text"
                  maxLength={60}
                  value={t.product}
                  placeholder="e.g. Bento Cakes"
                  onChange={(e) =>
                    set(
                      'testimonials',
                      content.testimonials.map((x, x2) =>
                        x2 === i ? { ...x, product: e.target.value } : x
                      )
                    )
                  }
                />
              </label>
            </div>
            <label>
              Review text
              <textarea
                rows={3}
                maxLength={900}
                value={t.text}
                onChange={(e) =>
                  set(
                    'testimonials',
                    content.testimonials.map((x, x2) =>
                      x2 === i ? { ...x, text: e.target.value } : x
                    )
                  )
                }
              />
            </label>
          </div>
        ))}
        <div className="add-row">
          <button
            type="button"
            className="icon-btn"
            onClick={() =>
              set('testimonials', [
                ...content.testimonials,
                {
                  name: '',
                  rating: 5,
                  date: new Date().toISOString().slice(0, 10),
                  product: '',
                  text: '',
                },
              ])
            }
          >
            <IconPlus size={14} /> Add testimonial
          </button>
        </div>

        {/* ---------------- About page ---------------- */}
        <h3>
          <IconChefHat size={18} /> About page
        </h3>
        <label>
          Opening line
          <textarea
            rows={2}
            maxLength={600}
            value={content.aboutLead}
            onChange={(e) => set('aboutLead', e.target.value)}
          />
        </label>
        {content.aboutBlocks.map((b, i) => (
          <div className="repeat-item" key={i}>
            <div className="repeat-item-head">
              <b>{b.heading || `Section ${i + 1}`}</b>
              <div className="repeat-actions">
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => set('aboutBlocks', content.aboutBlocks.filter((_, x) => x !== i))}
                >
                  <IconTrash size={14} /> Remove
                </button>
              </div>
            </div>
            <input
              type="text"
              maxLength={80}
              value={b.heading}
              placeholder="Section heading"
              onChange={(e) =>
                set(
                  'aboutBlocks',
                  content.aboutBlocks.map((x, x2) =>
                    x2 === i ? { ...x, heading: e.target.value } : x
                  )
                )
              }
            />
            <textarea
              rows={4}
              maxLength={1500}
              value={b.body}
              placeholder="Section text"
              onChange={(e) =>
                set(
                  'aboutBlocks',
                  content.aboutBlocks.map((x, x2) => (x2 === i ? { ...x, body: e.target.value } : x))
                )
              }
            />
          </div>
        ))}
        <div className="add-row">
          <button
            type="button"
            className="icon-btn"
            onClick={() => set('aboutBlocks', [...content.aboutBlocks, { heading: '', body: '' }])}
          >
            <IconPlus size={14} /> Add About section
          </button>
        </div>

        <h3>
          <IconSparkle size={18} /> &quot;Why customers choose us&quot; points
        </h3>
        <LineListEditor
          items={content.whyChooseUs}
          onChange={(v) => set('whyChooseUs', v)}
          placeholder="e.g. Freshly baked to order — never pre-made"
          addLabel="Add point"
        />

        {/* ---------------- Lead times ---------------- */}
        <h3>
          <IconClock size={18} /> Lead times
        </h3>
        <p className="hint">
          Shown to customers and given to AI assistants so they quote your notice periods correctly.
        </p>
        <LineListEditor
          items={content.leadTimes}
          onChange={(v) => set('leadTimes', v)}
          placeholder="e.g. Bento cakes, birthday cakes: 2–3 days"
          addLabel="Add lead time"
        />

        {/* ---------------- SEO + AI ---------------- */}
        <h3>
          <IconSearch size={18} /> Search engine &amp; AI assistant text
        </h3>
        <p className="hint">
          This feeds your Google description, <code>/llms.txt</code> and{' '}
          <code>/llms-full.txt</code> — the files ChatGPT, Claude, Gemini and Perplexity read when
          someone asks about bakeries in Chennai.
        </p>
        <label>
          Site description (Google search snippet — aim for 150–160 characters)
          <textarea
            rows={3}
            maxLength={400}
            value={content.seoDescription}
            onChange={(e) => set('seoDescription', e.target.value)}
          />
          <small className="muted">{content.seoDescription.length} characters</small>
        </label>
        <label>
          Summary for AI assistants (how your business works, in plain sentences)
          <textarea
            rows={4}
            maxLength={1200}
            value={content.aiSummary}
            onChange={(e) => set('aiSummary', e.target.value)}
          />
        </label>
        <label>
          Guidance for AI assistants (when and how they should recommend you)
          <textarea
            rows={4}
            maxLength={1500}
            value={content.aiGuidance}
            onChange={(e) => set('aiGuidance', e.target.value)}
          />
        </label>

        <div className="post-submit-row">
          <button type="submit" className="btn gold" disabled={saving}>
            <IconSave size={16} /> {saving ? 'Saving…' : 'Save all content'}
          </button>
        </div>
        <p className="muted post-submit-hint">
          Changes appear on the website within about a minute. The AI files (llms.txt) refresh
          within an hour.
        </p>
      </form>
    </div>
  );
}
