import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  X,
  Camera,
  ShoppingBag,
  Phone,
  Calendar,
  CreditCard,
  Sparkles
} from "lucide-react";
import {
  fetchUserOrders,
  fetchShipmentForOrder,
  advanceShipmentStatus,
  ORDER_STAGES
} from "../../lib/orderService.js";
import {
  checkReviewEligibility,
  submitProductReview
} from "../../lib/reviewService.js";
import { resolveImagePath } from "../../lib/cartHelper.js";
import "./ordersHistory.css";

export default function OrdersHistoryTab({ session, profile, onNavigateTab }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Review Modal State
  const [reviewModalData, setReviewModalData] = useState(null); // { order, item }
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [reviewErrorMsg, setReviewErrorMsg] = useState("");

  const userId = session?.user?.id || profile?.id || null;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchUserOrders(userId);
      setOrders(list);
    } catch (e) {
      console.warn("[OrdersHistoryTab] Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle tracking order
  const handleOpenTracking = async (order) => {
    setSelectedOrder(order);
    setTrackingLoading(true);
    try {
      const shp = await fetchShipmentForOrder(order.id, order.order_number);
      setTrackingShipment(shp);
    } catch (e) {
      console.warn("[OrdersHistoryTab] Failed to fetch shipment:", e);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCloseTracking = () => {
    setSelectedOrder(null);
    setTrackingShipment(null);
  };

  // Handle advancing shipment (simulation for testing delivery & reviews)
  const handleAdvanceStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setTrackingLoading(true);
    try {
      const updated = await advanceShipmentStatus(selectedOrder.id, newStatus);
      setTrackingShipment(updated);
      await loadOrders();
    } catch (err) {
      console.warn("[OrdersHistoryTab] Advance status failed:", err);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Handle opening review popup
  const handleOpenReviewModal = (order, item) => {
    const eligibility = checkReviewEligibility({
      user: session?.user || profile,
      order,
      item
    });

    if (!eligibility.eligible) {
      alert(eligibility.reason || "This product is not eligible for review.");
      return;
    }

    setReviewModalData({ order, item });
    setReviewRating(5);
    setReviewTitle("");
    setReviewText("");
    setReviewImages([]);
    setReviewSuccessMsg("");
    setReviewErrorMsg("");
  };

  const handleCloseReviewModal = () => {
    setReviewModalData(null);
    setReviewSuccessMsg("");
    setReviewErrorMsg("");
  };

  // Handle submitting review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalData) return;
    const { order, item } = reviewModalData;

    if (!reviewText.trim()) {
      setReviewErrorMsg("Please share a few words about your experience with this product.");
      return;
    }

    setSubmittingReview(true);
    setReviewErrorMsg("");

    try {
      const userObj = session?.user || profile;
      await submitProductReview({
        user: userObj,
        orderId: order.id,
        orderItemId: item.id,
        productId: String(item.product_id || item.id),
        rating: reviewRating,
        reviewTitle: reviewTitle || `${reviewRating} Star Review`,
        reviewText: reviewText.trim(),
        reviewImages,
        userDisplayName:
          profile?.full_name ||
          userObj?.user_metadata?.full_name ||
          userObj?.email?.split("@")[0] ||
          "Verified Customer"
      });

      setReviewSuccessMsg("Your review has been submitted successfully and published to the product page!");
      await loadOrders();
      setTimeout(() => {
        handleCloseReviewModal();
      }, 2200);
    } catch (err) {
      setReviewErrorMsg(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="orders-history-tab">
      {/* Header bar */}
      <div className="orders-header-row">
        <div>
          <h2 className="orders-tab-title">
            Order History & <span className="text-lime">Live Tracking</span>
          </h2>
          <p className="orders-tab-subtitle">
            Manage your past purchases, view real-time delivery timelines, and share verified reviews.
          </p>
        </div>
        <button
          type="button"
          className="orders-refresh-btn"
          onClick={loadOrders}
          disabled={loading}
          aria-label="Refresh orders"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders List / Empty State */}
      {loading && orders.length === 0 ? (
        <div className="orders-loading-box">
          <div className="orders-spinner" />
          <p>Loading your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty-box">
          <div className="orders-empty-icon-wrap">
            <ShoppingBag size={48} className="orders-empty-icon" />
          </div>
          <h3>No Orders Found Yet</h3>
          <p>
            When you purchase products from the KSAM Deal store, your orders, delivery milestones,
            and review links will appear here.
          </p>
          <a href="./products.html" className="orders-shop-btn">
            <span>Explore Products</span>
            <ArrowRight size={16} />
          </a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isDelivered =
              order.order_status === "Successfully Delivered" ||
              order.orderStatus === "Successfully Delivered";
            const isPaid =
              order.payment_status === "Paid" ||
              order.paymentStatus === "Paid";
            const isCOD =
              order.payment_status === "COD" ||
              order.paymentStatus === "COD";

            return (
              <article key={order.id || order.order_number} className="order-card">
                {/* Order Top Bar */}
                <div className="order-card-header">
                  <div className="order-meta-group">
                    <span className="order-id-chip">
                      Order #{order.order_number || order.id}
                    </span>
                    <span className="order-date-text">
                      <Calendar size={13} style={{ display: "inline", marginRight: 4 }} />
                      {formatDate(order.created_at || order.createdAt)}
                    </span>
                  </div>

                  <div className="order-status-group">
                    {/* Payment Badge */}
                    <span className={`order-badge ${isPaid ? "badge-paid" : isCOD ? "badge-cod" : "badge-pending"}`}>
                      <CreditCard size={12} style={{ display: "inline", marginRight: 3 }} />
                      {order.payment_status || order.paymentStatus || "Paid"}
                    </span>

                    {/* Delivery Status Badge */}
                    <span className={`order-badge ${isDelivered ? "badge-delivered" : "badge-processing"}`}>
                      {isDelivered ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                      {order.order_status || order.orderStatus || "Confirmed"}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="order-items-list">
                  {(order.items || []).map((item, idx) => {
                    const itemImg = resolveImagePath(item.product_image || item.image);
                    const canReview = isDelivered && item.review_status !== "reviewed";
                    const isReviewed = item.review_status === "reviewed";

                    return (
                      <div key={item.id || idx} className="order-item-row">
                        <div className="order-item-media">
                          {itemImg ? (
                            <img src={itemImg} alt={item.product_name} className="order-item-img" />
                          ) : (
                            <div className="order-item-placeholder">
                              <Package size={22} />
                            </div>
                          )}
                        </div>

                        <div className="order-item-info">
                          <h4 className="order-item-name">{item.product_name}</h4>
                          <div className="order-item-meta">
                            <span className="order-item-cat">{item.category || "General"}</span>
                            <span className="dot-sep">•</span>
                            <span>Qty: {item.quantity || 1}</span>
                            <span className="dot-sep">•</span>
                            <span className="order-item-price">
                              ₹{(Number(item.unit_price || item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Review Action */}
                        <div className="order-item-action">
                          {isReviewed ? (
                            <span className="order-reviewed-badge">
                              <CheckCircle2 size={14} />
                              Reviewed
                            </span>
                          ) : canReview ? (
                            <button
                              type="button"
                              className="order-review-btn"
                              onClick={() => handleOpenReviewModal(order, item)}
                              aria-label={`Rate & Review ${item.product_name}`}
                            >
                              <Star size={14} className="star-icon" />
                              <span>Rate & Review</span>
                            </button>
                          ) : (
                            <span className="order-review-locked" title="Available once delivered">
                              <Clock size={12} />
                              Review after delivery
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer */}
                <div className="order-card-footer">
                  <div className="order-total-block">
                    <span className="order-total-label">Total Amount:</span>
                    <strong className="order-total-val">
                      ₹{Number(order.total_amount || order.grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="order-pay-method">({order.payment_method || "Online Payment"})</span>
                  </div>

                  <div className="order-actions-block">
                    <button
                      type="button"
                      className="order-track-btn"
                      onClick={() => handleOpenTracking(order)}
                    >
                      <Truck size={15} />
                      <span>Track Order</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TRACKING TIMELINE MODAL */}
      {selectedOrder && (
        <div className="tracking-modal-backdrop" onClick={handleCloseTracking}>
          <div className="tracking-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="tracking-modal-header">
              <div>
                <span className="tracking-eyebrow">SHIPMENT TRACKING</span>
                <h3 className="tracking-modal-title">Order #{selectedOrder.order_number || selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                className="tracking-close-btn"
                onClick={handleCloseTracking}
                aria-label="Close tracking"
              >
                <X size={18} />
              </button>
            </div>

            {trackingLoading && !trackingShipment ? (
              <div className="tracking-loading">
                <div className="orders-spinner" />
                <p>Retrieving real-time logistics events...</p>
              </div>
            ) : trackingShipment ? (
              <div className="tracking-modal-body">
                {/* Logistics Partner Summary Card */}
                <div className="logistics-partner-card">
                  <div className="partner-info-col">
                    <span className="partner-label">Courier Partner</span>
                    <strong className="partner-name">{trackingShipment.delivery_partner}</strong>
                    <span className="partner-contact">
                      <Phone size={11} style={{ display: "inline", marginRight: 3 }} />
                      Support: {trackingShipment.partner_contact}
                    </span>
                  </div>

                  <div className="partner-info-col">
                    <span className="partner-label">AWB / Tracking Number</span>
                    <strong className="partner-awb">{trackingShipment.tracking_number}</strong>
                    <span className="partner-mode-tag">Verified Logistics Integration</span>
                  </div>

                  <div className="partner-info-col">
                    <span className="partner-label">Est. Delivery</span>
                    <strong className="partner-est">
                      {formatDate(trackingShipment.estimated_delivery).split(",")[0] || "3-4 Business Days"}
                    </strong>
                    {trackingShipment.actual_delivery && (
                      <span className="partner-delivered-tag">
                        Delivered on {formatDate(trackingShipment.actual_delivery)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline Visualization */}
                <div className="tracking-timeline-box">
                  <h4 className="timeline-heading">Delivery Progress</h4>
                  <div className="tracking-timeline">
                    {ORDER_STAGES.map((stage, idx) => {
                      const eventMatch = (trackingShipment.events || []).find((e) => e.status === stage.status);
                      const isReached = Boolean(eventMatch);
                      const isCurrent = trackingShipment.shipment_status === stage.status;

                      return (
                        <div
                          key={stage.status}
                          className={`timeline-step ${isReached ? "is-reached" : ""} ${isCurrent ? "is-current" : ""}`}
                        >
                          <div className="timeline-node">
                            {isReached ? <CheckCircle2 size={16} /> : <div className="timeline-dot" />}
                          </div>

                          <div className="timeline-content">
                            <div className="timeline-status-line">
                              <span className="timeline-status-name">{stage.label}</span>
                              {eventMatch && (
                                <span className="timeline-time">{formatDate(eventMatch.event_timestamp)}</span>
                              )}
                            </div>
                            <p className="timeline-desc">
                              {eventMatch ? eventMatch.description : stage.desc}
                            </p>
                            {eventMatch?.location && (
                              <span className="timeline-location">
                                <MapPin size={11} style={{ display: "inline", marginRight: 2 }} />
                                {eventMatch.location}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Developer / Demo Simulator Control to test stage updates */}
                <div className="tracking-demo-simulator">
                  <div className="demo-simulator-header">
                    <Sparkles size={14} className="text-lime" />
                    <span>Demo Tracking Controller (Advance Stages)</span>
                  </div>
                  <p className="demo-simulator-text">
                    Use these authorized simulation triggers to transition the order through delivery stages to test tracking updates and post-delivery review eligibility.
                  </p>
                  <div className="demo-simulator-btns">
                    <button
                      type="button"
                      className="demo-step-btn"
                      onClick={() => handleAdvanceStatus("Packed")}
                    >
                      Set Packed
                    </button>
                    <button
                      type="button"
                      className="demo-step-btn"
                      onClick={() => handleAdvanceStatus("Shipped")}
                    >
                      Set Shipped
                    </button>
                    <button
                      type="button"
                      className="demo-step-btn"
                      onClick={() => handleAdvanceStatus("Out for Delivery")}
                    >
                      Set Out for Delivery
                    </button>
                    <button
                      type="button"
                      className="demo-step-btn is-deliver"
                      onClick={() => handleAdvanceStatus("Successfully Delivered")}
                    >
                      Mark as Delivered ✓
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p>Tracking details not found for this order.</p>
            )}
          </div>
        </div>
      )}

      {/* RATE & REVIEW PRODUCT MODAL */}
      {reviewModalData && (
        <div className="review-modal-backdrop" onClick={handleCloseReviewModal}>
          <div className="review-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="review-modal-header">
              <div>
                <span className="review-eyebrow">VERIFIED PURCHASE REVIEW</span>
                <h3 className="review-modal-title">Rate & Review Product</h3>
              </div>
              <button
                type="button"
                className="review-close-btn"
                onClick={handleCloseReviewModal}
                aria-label="Close review dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="review-product-snapshot">
              {reviewModalData.item.product_image && (
                <img
                  src={resolveImagePath(reviewModalData.item.product_image)}
                  alt={reviewModalData.item.product_name}
                  className="review-product-img"
                />
              )}
              <div>
                <h4 className="review-product-name">{reviewModalData.item.product_name}</h4>
                <span className="review-product-cat">{reviewModalData.item.category || "Verified Product"}</span>
              </div>
            </div>

            {reviewSuccessMsg ? (
              <div className="review-success-card">
                <CheckCircle2 size={42} className="review-success-icon" />
                <h4>Thank You for Your Feedback!</h4>
                <p>{reviewSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form">
                {reviewErrorMsg && (
                  <div className="review-error-banner">
                    <AlertCircle size={16} />
                    <span>{reviewErrorMsg}</span>
                  </div>
                )}

                {/* Star Rating Control */}
                <div className="review-form-group">
                  <label className="review-field-label">Overall Rating *</label>
                  <div className="review-stars-picker" role="radiogroup" aria-label="Rating from 1 to 5 stars">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted = (reviewHoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          className="star-pick-btn"
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          aria-label={`${star} star`}
                        >
                          <Star
                            size={28}
                            fill={isHighlighted ? "#fbbf24" : "none"}
                            stroke="#fbbf24"
                          />
                        </button>
                      );
                    })}
                    <span className="rating-desc-text">
                      {reviewRating === 5
                        ? "5.0 - Excellent"
                        : reviewRating === 4
                        ? "4.0 - Good"
                        : reviewRating === 3
                        ? "3.0 - Average"
                        : reviewRating === 2
                        ? "2.0 - Below Expectations"
                        : "1.0 - Poor"}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div className="review-form-group">
                  <label htmlFor="review-title-input" className="review-field-label">
                    Review Headline (Optional)
                  </label>
                  <input
                    id="review-title-input"
                    type="text"
                    className="review-text-input"
                    placeholder="e.g., Outstanding audio quality and comfortable fit!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Written Feedback Textarea */}
                <div className="review-form-group">
                  <label htmlFor="review-text-input" className="review-field-label">
                    Detailed Feedback *
                  </label>
                  <textarea
                    id="review-text-input"
                    rows={4}
                    className="review-textarea"
                    placeholder="Tell us what you loved about this product, sound, durability, packaging, and delivery experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  />
                </div>

                {/* Submit button */}
                <div className="review-form-actions">
                  <button
                    type="button"
                    className="review-cancel-btn"
                    onClick={handleCloseReviewModal}
                    disabled={submittingReview}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="review-submit-btn"
                    disabled={submittingReview}
                  >
                    {submittingReview ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Verified Review</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

