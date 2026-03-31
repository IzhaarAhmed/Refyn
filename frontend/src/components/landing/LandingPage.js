import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import './LandingPage.css';
import ThemeToggle from '../ThemeToggle';
import StarryBackground from '../StarryBackground';

const ThreeScene = React.lazy(() => import('./ThreeScene'));
const ThreeBackground = React.lazy(() => import('./ThreeBackground'));

/* ===== Animation Variants ===== */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
};

/* ===== NAVBAR ===== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`lp-navbar ${scrolled ? 'lp-navbar--scrolled' : ''}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="lp-navbar__inner">
        <div className="lp-navbar__logo">Re<span>fyn</span></div>
        <div className="lp-navbar__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="https://github.com/IzhaarAhmed/Refyn" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <div className="lp-navbar__actions">
          <ThemeToggle />
          <Link to="/login" className="lp-btn lp-btn--ghost">Login</Link>
          <Link to="/register" className="lp-btn lp-btn--ghost">Sign Up</Link>
          <Link to="/register" className="lp-btn lp-btn--primary">Start Reviewing</Link>
        </div>
      </div>
    </motion.nav>
  );
}

/* ===== HERO ===== */
function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-hero__bg-glow" />
      <div className="lp-hero__inner">
        <motion.div
          className="lp-hero__content"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1 className="lp-hero__title" variants={fadeUp}>
            Collaborative Code Reviews
            <br />
            <span className="lp-gradient-text">Without the Chaos</span>
          </motion.h1>
          <motion.p className="lp-hero__subtitle" variants={fadeUp}>
            Compare code changes, discuss line-by-line, and approve faster
            with automated analysis and GitHub integration.
          </motion.p>
          <motion.div className="lp-hero__buttons" variants={fadeUp}>
            <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">
              Start Reviewing
            </Link>
            <a
              href="https://github.com/IzhaarAhmed/Refyn"
              target="_blank"
              rel="noreferrer"
              className="lp-btn lp-btn--outline lp-btn--lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View on GitHub
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="lp-hero__visual"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
          <Suspense fallback={<div className="lp-hero__visual-fallback" />}>
            <ThreeScene />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
}

/* ===== TRUST BAR ===== */
function TrustBar() {
  const items = [
    { icon: '{ }', label: 'Visual Diff Engine' },
    { icon: '>', label: 'GitHub Sync' },
    { icon: '#', label: 'Line Comments' },
    { icon: '!', label: 'Auto Analysis' },
  ];

  return (
    <motion.section
      className="lp-trust"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeIn}
    >
      <div className="lp-trust__inner">
        <p className="lp-trust__text">Built for modern engineering teams</p>
        <div className="lp-trust__items">
          {items.map((item, i) => (
            <div key={i} className="lp-trust__item">
              <span className="lp-trust__icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ===== PROBLEM SECTION ===== */
function ProblemSection() {
  const problems = [
    { title: 'Messy PR Discussions', desc: 'Comments scattered across threads with no structure.' },
    { title: 'Unclear Diffs', desc: 'Hard to see what actually changed in large pull requests.' },
    { title: 'Slow Approvals', desc: 'Reviews sit for days waiting on unclear feedback.' },
    { title: 'Scattered Feedback', desc: 'Context gets lost between tools and conversations.' },
  ];

  return (
    <section className="lp-problem">
      <div className="lp-problem__inner">
        <motion.div
          className="lp-problem__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.p className="lp-section-label" variants={fadeUp}>The Problem</motion.p>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            Code reviews are <span className="lp-gradient-text">broken</span>
          </motion.h2>
          <motion.p className="lp-section-subtitle" variants={fadeUp}>
            Traditional tools weren't built for modern team workflows.
          </motion.p>
        </motion.div>

        <motion.div
          className="lp-problem__grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {problems.map((p, i) => (
            <motion.div key={i} className="lp-problem__card" variants={scaleIn}>
              <div className="lp-problem__card-num">0{i + 1}</div>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="lp-problem__solution"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <p>Refyn replaces chaos with clarity.</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ===== FEATURES ===== */
function Features() {
  const features = [
    { icon: '<>', title: 'Visual Diff Viewer', desc: 'Side-by-side comparison of every code change with syntax highlighting.' },
    { icon: '//', title: 'Line-Level Comments', desc: 'Comment on specific lines with full context preserved.' },
    { icon: '\u2713', title: 'Approval Workflow', desc: 'Majority-based voting to approve or reject changes clearly.' },
    { icon: '\u2B21', title: 'GitHub Integration', desc: 'Connect repos and import pull requests directly.' },
    { icon: '\u26A1', title: 'Automated Analysis', desc: 'Detect complexity, security issues, and refactoring patterns.' },
    { icon: '\u2699', title: 'Background Jobs', desc: 'Handle large reviews efficiently with async processing.' },
  ];

  return (
    <section className="lp-features" id="features">
      <div className="lp-features__inner">
        <motion.div
          className="lp-features__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.p className="lp-section-label" variants={fadeUp}>Features</motion.p>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            Everything your team needs to
            <br />
            <span className="lp-gradient-text">review code effectively</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="lp-features__grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {features.map((f, i) => (
            <motion.div key={i} className="lp-feature-card" variants={scaleIn} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
              <div className="lp-feature-card__icon">{f.icon}</div>
              <h4 className="lp-feature-card__title">{f.title}</h4>
              <p className="lp-feature-card__desc">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ===== DEMO SECTION ===== */
function DemoSection() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0.3, 0.5], [4, 0]);
  const scale = useTransform(scrollYProgress, [0.3, 0.5], [0.92, 1]);

  return (
    <section className="lp-demo">
      <div className="lp-demo__inner">
        <motion.div
          className="lp-demo__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p className="lp-section-label" variants={fadeUp}>Product Preview</motion.p>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            See <span className="lp-gradient-text">Refyn</span> in action
          </motion.h2>
        </motion.div>

        <motion.div
          className="lp-demo__preview"
          style={{ rotateX: rotate, scale }}
        >
          <div className="lp-demo__window">
            <div className="lp-demo__titlebar">
              <div className="lp-demo__dots">
                <span /><span /><span />
              </div>
              <span className="lp-demo__url">refyn.app/review/42</span>
            </div>
            <div className="lp-demo__content">
              {/* Simulated diff viewer */}
              <div className="lp-demo__diff">
                <div className="lp-demo__diff-header">
                  <span className="lp-demo__file">src/auth/middleware.js</span>
                  <span className="lp-demo__changes"><span className="lp-green">+12</span> <span className="lp-red">-4</span></span>
                </div>
                <div className="lp-demo__diff-lines">
                  <div className="lp-demo__line"><span className="lp-line-num">14</span><code>  const token = req.headers.authorization;</code></div>
                  <div className="lp-demo__line lp-demo__line--removed"><span className="lp-line-num">15</span><code>- if (!token) return res.status(401).send();</code></div>
                  <div className="lp-demo__line lp-demo__line--added"><span className="lp-line-num">15</span><code>+ if (!token) {'{'}</code></div>
                  <div className="lp-demo__line lp-demo__line--added"><span className="lp-line-num">16</span><code>+   logger.warn('Missing auth token');</code></div>
                  <div className="lp-demo__line lp-demo__line--added"><span className="lp-line-num">17</span><code>+   return res.status(401).json({'{'} error: 'Unauthorized' {'}'});</code></div>
                  <div className="lp-demo__line lp-demo__line--added"><span className="lp-line-num">18</span><code>+ {'}'}</code></div>
                  <div className="lp-demo__line"><span className="lp-line-num">19</span><code>  const decoded = jwt.verify(token, secret);</code></div>
                </div>
                {/* Comment thread */}
                <div className="lp-demo__comment">
                  <div className="lp-demo__comment-avatar">A</div>
                  <div className="lp-demo__comment-body">
                    <strong>alice</strong> <span className="lp-demo__comment-line">Line 17</span>
                    <p>Good catch - should we also log the IP address for security auditing?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ===== HOW IT WORKS ===== */
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Connect your GitHub repo', desc: 'Link any repository with a personal access token in seconds.' },
    { num: '02', title: 'Create a code review', desc: 'Paste original and modified code, or import a pull request.' },
    { num: '03', title: 'Collaborate and approve', desc: 'Your team reviews, comments, and votes. Majority rules.' },
  ];

  return (
    <section className="lp-how" id="how-it-works">
      <div className="lp-how__inner">
        <motion.div
          className="lp-how__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p className="lp-section-label" variants={fadeUp}>How it Works</motion.p>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            Three steps to
            <br />
            <span className="lp-gradient-text">better code reviews</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="lp-how__steps"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {steps.map((step, i) => (
            <motion.div key={i} className="lp-how__step" variants={fadeUp}>
              <div className="lp-how__step-num">{step.num}</div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
              {i < steps.length - 1 && <div className="lp-how__connector" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ===== BENEFITS ===== */
function Benefits() {
  const benefits = [
    { icon: '\u{1F680}', title: 'Faster Reviews', desc: 'Cut review cycles from days to hours.' },
    { icon: '\u{1F4AC}', title: 'Clear Collaboration', desc: 'Every comment is tied to a specific line.' },
    { icon: '\u{1F6E1}', title: 'Better Code Quality', desc: 'Automated analysis catches issues early.' },
    { icon: '\u{1F4CB}', title: 'Organized Discussions', desc: 'No more scattered feedback across tools.' },
    { icon: '\u{26A1}', title: 'Productive Teams', desc: 'Majority voting means no more bottlenecks.' },
  ];

  return (
    <section className="lp-benefits">
      <div className="lp-benefits__inner">
        <motion.div
          className="lp-benefits__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p className="lp-section-label" variants={fadeUp}>Why Refyn</motion.p>
          <motion.h2 className="lp-section-title" variants={fadeUp}>
            Ship better code, <span className="lp-gradient-text">together</span>
          </motion.h2>
        </motion.div>

        <motion.div
          className="lp-benefits__grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {benefits.map((b, i) => (
            <motion.div key={i} className="lp-benefit-card" variants={fadeUp}>
              <span className="lp-benefit-card__icon">{b.icon}</span>
              <h4>{b.title}</h4>
              <p>{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ===== CTA ===== */
function CTA() {
  return (
    <section className="lp-cta">
      <div className="lp-cta__glow" />
      <motion.div
        className="lp-cta__inner"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
      >
        <motion.h2 className="lp-cta__title" variants={fadeUp}>
          Start reviewing code with
          <br />
          <span className="lp-gradient-text">your team today.</span>
        </motion.h2>
        <motion.p className="lp-cta__subtitle" variants={fadeUp}>
          Free to use. Set up in under 2 minutes.
        </motion.p>
        <motion.div className="lp-cta__buttons" variants={fadeUp}>
          <Link to="/register" className="lp-btn lp-btn--primary lp-btn--lg">Sign Up Free</Link>
          <Link to="/github" className="lp-btn lp-btn--outline lp-btn--lg">Connect GitHub Repository</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ===== FOOTER ===== */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__brand">
          <div className="lp-footer__logo">Re<span>fyn</span></div>
          <p>Collaborative code reviews for modern teams.</p>
        </div>
        <div className="lp-footer__links">
          <div className="lp-footer__col">
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
          </div>
          <div className="lp-footer__col">
            <h5>Resources</h5>
            <a href="https://github.com/IzhaarAhmed/Refyn" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://github.com/IzhaarAhmed/Refyn#api-endpoints" target="_blank" rel="noreferrer">API Docs</a>
            <a href="https://github.com/IzhaarAhmed/Refyn/blob/main/docs/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contributing</a>
          </div>
          <div className="lp-footer__col">
            <h5>Legal</h5>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="mailto:contact@refyn.dev">Contact</a>
          </div>
        </div>
        <div className="lp-footer__bottom">
          <p>&copy; 2026 Refyn. Built by <a href="https://github.com/IzhaarAhmed" target="_blank" rel="noreferrer">Izhaar Ahmed</a></p>
        </div>
      </div>
    </footer>
  );
}

/* ===== MAIN LANDING PAGE ===== */
export default function LandingPage() {
  return (
    <div className="lp">
      <StarryBackground />
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
      <Navbar />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <Features />
      <DemoSection />
      <HowItWorks />
      <Benefits />
      <CTA />
      <Footer />
    </div>
  );
}
