import { useMemo } from "react";
import {
  Sparkles,
  Camera,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Bell,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";

export default function OverviewTab({
  profile,
  session,
  addresses = [],
  alerts = [],
  recentlyViewed = [],
  completeness = 0,
  onNavigateTab,
  onOpenAvatarModal
}) {
  const isEmailVerified = !!(session?.user?.email_confirmed_at || session?.user?.confirmed_at);

  // Checklist items
  const checklist = useMemo(() => {
    return [
      {
        id: "photo",
        title: "Add Profile Picture",
        desc: "Upload a clean photo or avatar to personalize your account",
        done: !!profile?.avatar_url,
        action: () => onOpenAvatarModal(),
        actionLabel: "Upload Photo"
      },
      {
        id: "name",
        title: "Set Your Full Name",
        desc: "Help us greet you and address your notifications properly",
        done: !!profile?.full_name?.trim(),
        action: () => onNavigateTab("profile"),
        actionLabel: "Add Name"
      },
      {
        id: "phone",
        title: "Add Mobile Number",
        desc: "Verify your 10-digit Indian mobile number for order and alert SMS",
        done: /^[6-9]\d{9}$/.test(profile?.phone?.trim() || ""),
        action: () => onNavigateTab("profile"),
        actionLabel: "Add Phone"
      },
      {
        id: "address",
        title: "Save Delivery Address",
        desc: "Save your primary pin code to easily check deal shipping eligibility",
        done: addresses.length > 0,
        action: () => onNavigateTab("addresses"),
        actionLabel: "Add Address"
      },
      {
        id: "email",
        title: "Verify Email Address",
        desc: "Ensure you receive critical security alerts and saved deal drops",
        done: isEmailVerified,
        action: () => {
          window.location.href = `${BASE_URL}verify-email.html`;
        },
        actionLabel: "Verify Now"
      }
    ];
  }, [profile, addresses.length, isEmailVerified, onNavigateTab, onOpenAvatarModal]);

  const completedCount = checklist.filter((i) => i.done).length;

  return (
    <div className="ks-tab-panel space-y-6" role="tabpanel" aria-label="Account Overview">
      {/* Welcome & Completeness Checklist Card */}
      <div className="ks-card">
        <div className="ks-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="ks-card-title">
              <Sparkles size={22} color="#22FF88" />
              <span>Welcome back, {profile?.full_name || "Deal Hunter"}!</span>
            </h2>
            <p className="ks-card-desc">
              Here is your KSAM Deal activity summary, tracking status, and account setup checklist.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
            <div className="text-right">
              <span className="block text-xs text-gray-400">Completeness</span>
              <span className="text-base font-black text-[#22FF88]">{completeness}%</span>
            </div>
            <div className="h-8 w-8 rounded-full border-2 border-[#22FF88] flex items-center justify-center text-xs font-bold text-white">
              {completedCount}/5
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#22FF88] via-[#38BDF8] to-[#FFD60A] transition-all duration-700"
            style={{ width: `${completeness}%` }}
          />
        </div>

        {/* Checklist Rows */}
        <div className="divide-y divide-white/5">
          {checklist.map((item) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.done ? (
                    <CheckCircle2 size={18} className="text-[#22FF88]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-600" />
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${item.done ? "text-gray-300 line-through decoration-white/20" : "text-white"}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>

              {!item.done && (
                <button
                  type="button"
                  onClick={item.action}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#22FF88]/40 bg-[#22FF88]/10 text-xs font-bold text-[#22FF88] hover:bg-[#22FF88] hover:text-black transition"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Strip: Active Alerts & Recently Viewed */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Price Alerts Strip */}
        <div className="ks-card mb-0 flex flex-col justify-between">
          <div>
            <div className="ks-card-header flex items-center justify-between mb-4">
              <h3 className="ks-card-title text-base">
                <Bell size={18} color="#FFD60A" />
                <span>Active Price Alerts</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("alerts")}
                className="text-xs font-bold text-[#FFD60A] hover:underline flex items-center gap-1"
              >
                View all ({alerts.length}) <ChevronRight size={14} />
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 bg-white/[0.02] rounded-xl border border-white/5">
                <p>No price alerts active right now.</p>
                <p className="text-gray-500 mt-1">Tap the bell icon on any deal to track drops!</p>
                <a
                  href={`${BASE_URL}#deals`}
                  className="mt-3 inline-block px-3 py-1.5 bg-[#FFD60A]/10 border border-[#FFD60A]/30 text-[#FFD60A] rounded-lg font-bold"
                >
                  Explore Deals
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      {alert.product?.image ? (
                        <img
                          src={alert.product.image}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-black"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                          P
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 max-w-[180px]">
                          {alert.product?.name}
                        </h4>
                        <div className="text-[11px] text-gray-400">
                          Target: <strong className="text-[#22FF88]">₹{alert.target_price}</strong>
                          <span className="mx-1">·</span>
                          Now: ₹{alert.product?.price}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#22FF88]/15 text-[#22FF88]">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Strip */}
        <div className="ks-card mb-0 flex flex-col justify-between">
          <div>
            <div className="ks-card-header flex items-center justify-between mb-4">
              <h3 className="ks-card-title text-base">
                <Clock size={18} color="#38BDF8" />
                <span>Recently Viewed</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab("recent")}
                className="text-xs font-bold text-[#38BDF8] hover:underline flex items-center gap-1"
              >
                View all ({recentlyViewed.length}) <ChevronRight size={14} />
              </button>
            </div>

            {recentlyViewed.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 bg-white/[0.02] rounded-xl border border-white/5">
                <p>You haven't viewed any products yet.</p>
                <p className="text-gray-500 mt-1">Discover trending Indian store discounts today.</p>
                <a
                  href={`${BASE_URL}#deals`}
                  className="mt-3 inline-block px-3 py-1.5 bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] rounded-lg font-bold"
                >
                  Browse Deals
                </a>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentlyViewed.slice(0, 3).map((item) => (
                  <a
                    key={item.id}
                    href={`${BASE_URL}deal.html?id=${encodeURIComponent(item.id)}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#38BDF8]/30 transition group"
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-black"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                          P
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition line-clamp-1 max-w-[180px]">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-gray-400">
                          <strong className="text-[#22FF88]">₹{item.price}</strong>
                          {item.store && <span className="ml-1 text-gray-500">· {item.store}</span>}
                        </div>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
