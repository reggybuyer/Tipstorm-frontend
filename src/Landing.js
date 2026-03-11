import React from "react";

export default function Landing() {

  return (
    <div className="landing">

      {/* HERO */}

      <div className="hero">

        <h1>TipStorm Predictions</h1>

        <p>
          Accurate football predictions with high odds and daily winning tips.
        </p>

        <div className="hero-buttons">

          <a href="/register" className="btn-primary">
            Join Free
          </a>

          <a href="/login" className="btn-secondary">
            Login
          </a>

        </div>

      </div>

      {/* FEATURES */}

      <div className="features">

        <div className="feature">
          ⚡ Daily football predictions
        </div>

        <div className="feature">
          📊 High odds accumulator slips
        </div>

        <div className="feature">
          💰 VIP premium tips
        </div>

      </div>

      {/* PLANS */}

      <div className="plans">

        <h2>Subscription Plans</h2>

        <div className="plan-grid">

          <div className="plan-card">

            <h3>Free</h3>
            <p>Basic predictions</p>

            <button className="btn-plan">
              Start Free
            </button>

          </div>

          <div className="plan-card">

            <h3>Weekly</h3>
            <p>Premium weekly tips</p>

            <button className="btn-plan">
              Upgrade
            </button>

          </div>

          <div className="plan-card">

            <h3>Monthly</h3>
            <p>Access to all premium tips</p>

            <button className="btn-plan">
              Upgrade
            </button>

          </div>

          <div className="plan-card vip">

            <h3>VIP</h3>
            <p>Highest odds & VIP predictions</p>

            <button className="btn-plan">
              Go VIP
            </button>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="footer">

        © {new Date().getFullYear()} TipStorm Predictions

      </div>

    </div>
  );
} 
