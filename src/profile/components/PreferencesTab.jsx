import { Sliders, Bell, Sparkles } from "lucide-react";

const CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: "💻" },
  { id: "fashion", name: "Fashion", icon: "👕" },
  { id: "home", name: "Home & Kitchen", icon: "🏠" },
  { id: "beauty", name: "Beauty & Personal Care", icon: "💄" },
  { id: "sports", name: "Sports & Fitness", icon: "⚽" },
  { id: "audio", name: "Audio & Headphones", icon: "🎧" },
  { id: "shoes", name: "Shoes & Footwear", icon: "👟" },
  { id: "watches", name: "Watches", icon: "⌚" },
  { id: "books", name: "Books", icon: "📚" },
  { id: "toys", name: "Toys & Games", icon: "🧸" }
];

export default function PreferencesTab({
  preferences = {},
  onChange
}) {
  const favoriteCategories = preferences.favorite_categories || [];
  const notifications = preferences.notifications || {
    deal_alerts: true,
    price_drops: true,
    newsletter: true
  };

  const toggleCategory = (catId) => {
    let next;
    if (favoriteCategories.includes(catId)) {
      next = favoriteCategories.filter((id) => id !== catId);
    } else {
      next = [...favoriteCategories, catId];
    }
    onChange("preferences", {
      ...preferences,
      favorite_categories: next
    });
  };

  const toggleNotification = (key, val) => {
    onChange("preferences", {
      ...preferences,
      notifications: {
        ...notifications,
        [key]: val
      }
    });
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Shopping Preferences">
      {/* Category Preferences */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <Sparkles size={20} color="#FFD60A" />
            <span>Favorite Categories</span>
          </h2>
          <p className="ks-card-desc">
            Select the shopping categories you love most so we can highlight relevant price drops and personalized deal feeds.
          </p>
        </div>

        <div className="ks-chips-wrap">
          {CATEGORIES.map((cat) => {
            const isSelected = favoriteCategories.includes(cat.id);
            return (
              <button
                type="button"
                key={cat.id}
                className={`ks-filter-chip${isSelected ? " is-selected" : ""}`}
                onClick={() => toggleCategory(cat.id)}
                aria-pressed={isSelected}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <Bell size={20} color="#38BDF8" />
            <span>Notification Choices</span>
          </h2>
          <p className="ks-card-desc">
            Control which automated price tracking alerts and updates you receive.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Deal Alerts */}
          <div className="ks-switch-row">
            <div className="ks-switch-info">
              <span className="ks-switch-title">Flash Deal Alerts</span>
              <span className="ks-switch-desc">
                Instant alerts when limited-time mega discounts go live in your favorite categories.
              </span>
            </div>
            <label className="ks-switch">
              <input
                type="checkbox"
                checked={notifications.deal_alerts !== false}
                onChange={(e) => toggleNotification("deal_alerts", e.target.checked)}
              />
              <span className="ks-slider" />
            </label>
          </div>

          {/* Price Drops */}
          <div className="ks-switch-row">
            <div className="ks-switch-info">
              <span className="ks-switch-title">Wishlist Price Drop Notifications</span>
              <span className="ks-switch-desc">
                Get notified when an item you viewed or wishlisted drops below its lowest 30-day price.
              </span>
            </div>
            <label className="ks-switch">
              <input
                type="checkbox"
                checked={notifications.price_drops !== false}
                onChange={(e) => toggleNotification("price_drops", e.target.checked)}
              />
              <span className="ks-slider" />
            </label>
          </div>

          {/* Newsletter */}
          <div className="ks-switch-row">
            <div className="ks-switch-info">
              <span className="ks-switch-title">Weekly KSAM Deal Digest</span>
              <span className="ks-switch-desc">
                A weekly round-up of the best tech, fashion, and home deals across top Indian marketplaces.
              </span>
            </div>
            <label className="ks-switch">
              <input
                type="checkbox"
                checked={notifications.newsletter !== false}
                onChange={(e) => toggleNotification("newsletter", e.target.checked)}
              />
              <span className="ks-slider" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
