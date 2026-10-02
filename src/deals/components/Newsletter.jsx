import { useState } from "react";
import {
  Mail,
  ArrowRight,
  Check,
  Star,
  Sparkles,
  ShoppingBag,
  Zap,
  TrendingDown,
} from "lucide-react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setIsSubscribed(false);
      return;
    }

    setMessage("You're officially on the KSAM Deal list! 🔥");
    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <>
      <style>{`

        /* =====================================================
           NEWSLETTER MAIN SECTION
        ===================================================== */

        .ksam-newsletter {
          position: relative;
          overflow: hidden;
          isolation: isolate;

          padding: 110px 0 0;

          background:
            radial-gradient(
              circle at 8% 20%,
              rgba(112, 178, 148, 0.14),
              transparent 28%
            ),
            radial-gradient(
              circle at 92% 75%,
              rgba(255, 87, 87, 0.08),
              transparent 30%
            ),
            #f8f8f5;

          color: #111;
        }


        /* =====================================================
           BACKGROUND GRID
        ===================================================== */

        .ksam-grid {
          position: absolute;
          inset: 0;
          z-index: -5;

          opacity: 0.35;

          background-image:
            linear-gradient(
              rgba(0,0,0,0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0,0,0,0.035) 1px,
              transparent 1px
            );

          background-size: 55px 55px;

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent 90%
            );
        }


        /* =====================================================
           BACKGROUND GLOWS
        ===================================================== */

        .ksam-glow {
          position: absolute;
          z-index: -3;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(80px);

          animation:
            ksamGlowMove 8s ease-in-out infinite alternate;
        }


        .ksam-glow-one {
          width: 280px;
          height: 280px;

          left: -100px;
          top: 80px;

          background: rgba(112,178,148,0.16);
        }


        .ksam-glow-two {
          width: 300px;
          height: 300px;

          right: -120px;
          top: 160px;

          background: rgba(255,87,87,0.10);

          animation-delay: 2s;
        }


        .ksam-glow-three {
          width: 180px;
          height: 180px;

          left: 45%;
          bottom: 100px;

          background: rgba(255,190,70,0.10);

          animation-delay: 4s;
        }


        @keyframes ksamGlowMove {

          0% {
            transform: translate(0,0) scale(1);
          }

          100% {
            transform: translate(30px,-25px) scale(1.15);
          }

        }


        /* =====================================================
           CONTAINER
        ===================================================== */

        .ksam-newsletter-container {
          position: relative;

          width: min(1240px, calc(100% - 48px));

          margin: auto;

          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(400px,0.85fr);

          gap: 80px;

          align-items: center;
        }


        /* =====================================================
           LEFT CONTENT
        ===================================================== */

        .ksam-newsletter-content {
          position: relative;
          z-index: 5;

          padding: 20px 0 70px;
        }


        /* =====================================================
           BADGE
        ===================================================== */

        .ksam-badge {
          display: inline-flex;

          align-items: center;

          gap: 9px;

          padding: 8px 14px;

          border: 1px solid rgba(112,178,148,0.25);

          border-radius: 100px;

          background: rgba(255,255,255,0.75);

          box-shadow:
            0 5px 25px rgba(0,0,0,0.04);

          color: #4f9272;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.12em;
        }


        .ksam-badge-icon {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 25px;
          height: 25px;

          border-radius: 50%;

          background: #70b294;

          color: white;

          animation:
            ksamBadgeRotate 2s ease-in-out infinite;
        }


        @keyframes ksamBadgeRotate {

          0%,100% {
            transform: rotate(0deg);
          }

          50% {
            transform: rotate(12deg);
          }

        }


        .ksam-live-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #ff5757;

          animation:
            ksamLivePulse 1.5s infinite;
        }


        @keyframes ksamLivePulse {

          0% {
            box-shadow:
              0 0 0 0 rgba(255,87,87,0.35);
          }

          70% {
            box-shadow:
              0 0 0 7px rgba(255,87,87,0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(255,87,87,0);
          }

        }


        /* =====================================================
           TITLE
        ===================================================== */

        .ksam-title {
          margin: 28px 0 0;

          max-width: 720px;

          font-size: clamp(52px,6vw,82px);

          line-height: 0.94;

          letter-spacing: -0.055em;

          font-weight: 950;

          color: #101010;
        }


        .ksam-title-green {
          color: #70b294;
        }


        .ksam-title-red {
          color: #ff5757;
        }


        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .ksam-description {
          max-width: 590px;

          margin-top: 28px;

          color: #666;

          font-size: 17px;

          line-height: 1.75;
        }


        /* =====================================================
           FEATURES
        ===================================================== */

        .ksam-features {
          display: grid;

          grid-template-columns:
            repeat(3,1fr);

          gap: 12px;

          max-width: 650px;

          margin-top: 32px;
        }


        .ksam-feature {
          display: flex;

          align-items: center;

          gap: 11px;

          padding: 13px 12px;

          border-radius: 13px;

          transition:
            transform .3s ease,
            background .3s ease;
        }


        .ksam-feature:hover {
          transform: translateY(-4px);

          background: rgba(255,255,255,0.8);
        }


        .ksam-feature-icon {
          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          width: 40px;
          height: 40px;

          border-radius: 11px;

          background: #70b294;

          color: white;

          box-shadow:
            0 8px 18px rgba(112,178,148,0.18);
        }


        .ksam-feature h4 {
          margin: 0;

          font-size: 13px;

          font-weight: 800;

          color: #202020;
        }


        .ksam-feature p {
          margin: 3px 0 0;

          font-size: 11px;

          color: #8b8b8b;
        }


        /* =====================================================
           FORM
        ===================================================== */

        .ksam-form {
          display: flex;

          gap: 10px;

          max-width: 650px;

          margin-top: 34px;
        }


        .ksam-email {
          display: flex;

          align-items: center;

          flex: 1;

          min-width: 0;

          height: 64px;

          padding: 0 20px;

          border: 1px solid rgba(0,0,0,0.06);

          border-radius: 15px;

          background: rgba(255,255,255,0.95);

          box-shadow:
            0 12px 35px rgba(0,0,0,0.05);

          transition:
            border .3s ease,
            box-shadow .3s ease,
            transform .3s ease;
        }


        .ksam-email:focus-within {
          border-color: rgba(112,178,148,0.7);

          box-shadow:
            0 15px 35px rgba(112,178,148,0.12);

          transform: translateY(-2px);
        }


        .ksam-email svg {
          flex-shrink: 0;

          margin-right: 12px;

          color: #888;
        }


        .ksam-email input {
          width: 100%;

          border: none;

          outline: none;

          background: transparent;

          color: #111;

          font-size: 15px;
        }


        .ksam-email input::placeholder {
          color: #999;
        }


        /* =====================================================
           BUTTON
        ===================================================== */

        .ksam-subscribe {
          display: flex;

          align-items: center;
          justify-content: center;

          gap: 12px;

          height: 64px;

          padding: 0 28px;

          border: none;

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              #ff6262,
              #ff4f4f
            );

          color: white;

          font-size: 15px;

          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 14px 30px rgba(255,87,87,0.22);

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            filter .25s ease;
        }


        .ksam-subscribe:hover {
          transform: translateY(-3px);

          box-shadow:
            0 20px 40px rgba(255,87,87,0.32);

          filter: brightness(1.05);
        }


        .ksam-subscribe:active {
          transform: scale(.98);
        }


        .ksam-subscribe svg {
          transition:
            transform .3s ease;
        }


        .ksam-subscribe:hover svg {
          transform: translateX(5px);
        }


        /* =====================================================
           MESSAGE
        ===================================================== */

        .ksam-message {
          margin-top: 13px;

          font-size: 13px;

          font-weight: 700;
        }


        .ksam-message.success {
          color: #4d9d76;
        }


        .ksam-message.error {
          color: #e55353;
        }


        /* =====================================================
           PRIVACY
        ===================================================== */

        .ksam-privacy {
          display: flex;

          align-items: center;

          gap: 6px;

          margin-top: 13px;

          color: #999;

          font-size: 11px;
        }


        .ksam-privacy svg {
          color: #70b294;
        }


        /* =====================================================
           RIGHT VISUAL
        ===================================================== */

        .ksam-visual {
          position: relative;

          min-height: 650px;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        /* =====================================================
           CIRCLES
        ===================================================== */

        .ksam-circle {
          position: absolute;

          border-radius: 50%;
        }


        .ksam-circle-one {
          width: 430px;
          height: 430px;

          right: 20px;

          background:
            linear-gradient(
              135deg,
              rgba(112,178,148,0.17),
              rgba(112,178,148,0.03)
            );

          border:
            1px solid rgba(112,178,148,0.18);

          animation:
            ksamRotate 15s linear infinite;
        }


        .ksam-circle-two {
          width: 330px;
          height: 330px;

          left: 70px;

          background:
            radial-gradient(
              circle,
              rgba(255,87,87,0.09),
              transparent 70%
            );

          animation:
            ksamCircleFloat 6s ease-in-out infinite;
        }


        @keyframes ksamRotate {

          from {
            transform: rotate(0);
          }

          to {
            transform: rotate(360deg);
          }

        }


        @keyframes ksamCircleFloat {

          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-18px);
          }

        }


        /* =====================================================
           IMAGE
        ===================================================== */

        .ksam-image-wrapper {
          position: relative;

          z-index: 3;

          width: min(470px,80%);

          height: 580px;

          overflow: hidden;

          border-radius: 30px;

          transform: rotate(2deg);

          box-shadow:
            0 35px 80px rgba(0,0,0,0.17);

          transition:
            transform .5s ease,
            box-shadow .5s ease;
        }


        .ksam-image-wrapper:hover {
          transform:
            rotate(0deg)
            translateY(-8px);

          box-shadow:
            0 45px 90px rgba(0,0,0,0.22);
        }


        .ksam-image {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;

          transition:
            transform .8s ease;
        }


        .ksam-image-wrapper:hover .ksam-image {
          transform: scale(1.06);
        }


        /* =====================================================
           IMAGE SHINE
        ===================================================== */

        .ksam-shine {
          position: absolute;

          z-index: 4;

          top: 0;

          left: -120%;

          width: 80%;
          height: 100%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.27),
              transparent
            );

          transform: skewX(-20deg);

          pointer-events: none;

          animation:
            ksamShine 5s ease-in-out infinite;
        }


        @keyframes ksamShine {

          0% {
            left: -120%;
          }

          35% {
            left: 140%;
          }

          100% {
            left: 140%;
          }

        }


        /* =====================================================
           FLOATING DEAL CARD
        ===================================================== */

        .ksam-deal-card {
          position: absolute;

          z-index: 8;

          top: 70px;
          left: -10px;

          display: flex;

          align-items: center;

          gap: 12px;

          padding: 15px 18px;

          border:
            1px solid rgba(255,255,255,.8);

          border-radius: 17px;

          background:
            rgba(255,255,255,.88);

          backdrop-filter:
            blur(15px);

          box-shadow:
            0 18px 45px rgba(0,0,0,.12);

          animation:
            ksamFloat 4s ease-in-out infinite;
        }


        @keyframes ksamFloat {

          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-12px);
          }

        }


        .ksam-deal-icon {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 43px;
          height: 43px;

          border-radius: 12px;

          background: #70b294;

          color: white;
        }


        .ksam-deal-label {
          margin: 0;

          font-size: 9px;

          font-weight: 900;

          letter-spacing: .12em;

          color: #999;
        }


        .ksam-deal-title {
          margin: 3px 0 0;

          font-size: 14px;

          color: #222;
        }


        .ksam-deal-title strong {
          color: #ff5757;
        }


        /* =====================================================
           RATING CARD
        ===================================================== */

        .ksam-rating-card {
          position: absolute;

          z-index: 8;

          right: -20px;

          bottom: 110px;

          display: flex;

          align-items: center;

          gap: 12px;

          padding: 15px 18px;

          border:
            1px solid rgba(255,255,255,.8);

          border-radius: 17px;

          background:
            rgba(255,255,255,.9);

          backdrop-filter:
            blur(15px);

          box-shadow:
            0 18px 45px rgba(0,0,0,.12);

          animation:
            ksamFloat 5s ease-in-out infinite reverse;
        }


        .ksam-avatar {
          display: flex;

          align-items: center;
          justify-content: center;

          width: 43px;
          height: 43px;

          border-radius: 50%;

          background:
            linear-gradient(
  135deg,
  #27EEA3 0%,
  #2ED8C9 50%,
  #34C9E2 100%
);

          color: white;

          font-size: 12px;

          font-weight: 900;
        }


        .ksam-stars {
          display: flex;

          gap: 2px;

          color: #ffb52e;
        }


        .ksam-rating-text {
          margin: 5px 0 0;

          color: #777;

          font-size: 11px;
        }


        /* =====================================================
           NOTIFICATION
        ===================================================== */

        .ksam-notification {
          position: absolute;

          z-index: 10;

          right: 5px;

          top: 225px;

          display: flex;

          align-items: center;

          gap: 11px;

          width: 270px;

          padding: 13px;

          border-radius: 15px;

          background: #111;

          color: white;

          box-shadow:
            0 20px 50px rgba(0,0,0,.25);

          animation:
            ksamNotificationFloat 4.5s ease-in-out infinite;
        }


        @keyframes ksamNotificationFloat {

          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }

        }


        .ksam-notification-icon {
          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          width: 38px;
          height: 38px;

          border-radius: 11px;

          background: #ff5757;

          color: white;
        }


        .ksam-notification small {
          display: block;

          margin-bottom: 3px;

          color: #8d8d8d;

          font-size: 8px;

          font-weight: 800;

          letter-spacing: .12em;
        }


        .ksam-notification strong {
          display: block;

          color: white;

          font-size: 11px;
        }


        .ksam-notification-dot {
          width: 7px;
          height: 7px;

          margin-left: auto;

          border-radius: 50%;

          background: #70b294;

          box-shadow:
            0 0 0 4px rgba(112,178,148,.15);

          animation:
            ksamLivePulse 1.5s infinite;
        }


        /* =====================================================
           DISCOUNT BUBBLE
        ===================================================== */

        .ksam-discount {
          position: absolute;

          z-index: 12;

          right: 25px;

          top: 70px;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          width: 82px;
          height: 82px;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #ff5757,
              #ff7373
            );

          color: white;

          box-shadow:
            0 15px 35px rgba(255,87,87,.28);

          transform: rotate(8deg);

          animation:
            ksamDiscountFloat 3.5s ease-in-out infinite;
        }


        .ksam-discount span {
          font-size: 22px;

          font-weight: 950;

          line-height: 1;
        }


        .ksam-discount small {
          margin-top: 4px;

          font-size: 8px;

          font-weight: 900;

          letter-spacing: .15em;
        }


        @keyframes ksamDiscountFloat {

          0%,100% {
            transform:
              rotate(8deg)
              translateY(0);
          }

          50% {
            transform:
              rotate(3deg)
              translateY(-9px);
          }

        }


        /* =====================================================
           STATS
        ===================================================== */

        .ksam-stats {
          position: relative;

          display: grid;

          grid-template-columns:
            repeat(4,1fr);

          align-items: center;

          width: min(1240px,calc(100% - 48px));

          margin: 30px auto 0;

          padding: 40px 0;

          border-top:
            1px solid rgba(0,0,0,.07);
        }


        .ksam-stat {
          text-align: center;
        }


        .ksam-stat strong {
          display: block;

          color: #111;

          font-size: 38px;

          font-weight: 950;

          letter-spacing: -.05em;
        }


        .ksam-stat strong span {
          color: #70b294;

          font-size: 22px;
        }


        .ksam-stat p {
          margin: 5px 0 0;

          color: #888;

          font-size: 11px;

          font-weight: 600;
        }


        .ksam-stat-divider {
          width: 1px;

          height: 42px;

          background:
            rgba(0,0,0,.08);
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width:1050px) {

          .ksam-newsletter-container {
            grid-template-columns:
              1fr .8fr;

            gap: 40px;
          }


          .ksam-title {
            font-size:
              clamp(48px,6vw,68px);
          }


          .ksam-features {
            grid-template-columns:1fr;
          }


          .ksam-image-wrapper {
            width:400px;
            height:520px;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width:800px) {

          .ksam-newsletter {
            padding-top:75px;
          }


          .ksam-newsletter-container {
            width:min(
              calc(100% - 32px),
              600px
            );

            grid-template-columns:1fr;

            gap:20px;
          }


          .ksam-newsletter-content {
            padding-bottom:20px;
          }


          .ksam-title {
            font-size:
              clamp(48px,13vw,70px);
          }


          .ksam-description {
            font-size:15px;
          }


          .ksam-form {
            flex-direction:column;
          }


          .ksam-email,
          .ksam-subscribe {
            width:100%;
          }


          .ksam-features {
            grid-template-columns:1fr;
          }


          .ksam-visual {
            min-height:570px;

            margin-top:10px;
          }


          .ksam-image-wrapper {
            width:min(420px,82vw);

            height:500px;
          }


          .ksam-deal-card {
            left:0;

            top:45px;
          }


          .ksam-rating-card {
            right:0;

            bottom:90px;
          }


          .ksam-notification {
            right:0;

            top:190px;
          }


          .ksam-discount {
            right:0;

            top:45px;
          }


          .ksam-stats {
            width:min(
              calc(100% - 32px),
              600px
            );

            grid-template-columns:
              repeat(2,1fr);

            gap:30px;

            padding:35px 0;
          }


          .ksam-stat-divider {
            display:none;
          }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width:480px) {

          .ksam-newsletter {
            padding-top:60px;
          }


          .ksam-newsletter-container {
            width:
              calc(100% - 24px);
          }


          .ksam-title {
            font-size:48px;
          }


          .ksam-description {
            margin-top:22px;

            font-size:14px;

            line-height:1.65;
          }


          .ksam-form {
            margin-top:27px;
          }


          .ksam-email,
          .ksam-subscribe {
            height:59px;
          }


          .ksam-visual {
            min-height:510px;
          }


          .ksam-image-wrapper {
            width:78vw;

            height:430px;

            border-radius:22px;
          }


          .ksam-circle {
            display:none;
          }


          .ksam-deal-card,
          .ksam-rating-card {
            padding:11px;

            border-radius:13px;
          }


          .ksam-notification {
            top:160px;

            width:225px;

            padding:10px;
          }


          .ksam-discount {
            width:68px;
            height:68px;

            top:35px;
          }


          .ksam-discount span {
            font-size:18px;
          }


          .ksam-stats {
            grid-template-columns:
              1fr 1fr;

            gap:22px;
          }


          .ksam-stat strong {
            font-size:29px;
          }

        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion:reduce) {

          *,
          *::before,
          *::after {
            animation:none !important;

            transition:none !important;
          }

        }

      `}</style>


      {/* =====================================================
          SECTION
      ===================================================== */}

      <section className="ksam-newsletter">

        {/* Background */}

        <div className="ksam-grid"></div>

        <div className="ksam-glow ksam-glow-one"></div>
        <div className="ksam-glow ksam-glow-two"></div>
        <div className="ksam-glow ksam-glow-three"></div>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div className="ksam-newsletter-container">


          {/* =================================================
              LEFT
          ================================================= */}

          <div className="ksam-newsletter-content">

            {/* Badge */}

            <div className="ksam-badge">

              <span className="ksam-badge-icon">
                <Sparkles size={15} />
              </span>

              KSAM DEAL INSIDER

              <span className="ksam-live-dot"></span>

            </div>


            {/* Heading */}

            <h2 className="ksam-title">

              Hot deals.

              <br />

              <span className="ksam-title-green">
                Into your inbox.
              </span>

              <br />

              Every week
              <span className="ksam-title-red">
                .
              </span>

            </h2>


            {/* Description */}

            <p className="ksam-description">

              Don't waste hours searching different
              websites. Get the latest discounts,
              price drops and amazing product
              discoveries directly in your inbox.

            </p>


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="ksam-features">


              <div className="ksam-feature">

                <div className="ksam-feature-icon">
                  <TrendingDown size={18} />
                </div>

                <div>

                  <h4>
                    Fresh price drops
                  </h4>

                  <p>
                    Never miss a discount
                  </p>

                </div>

              </div>


              <div className="ksam-feature">

                <div className="ksam-feature-icon">
                  <Zap size={18} />
                </div>

                <div>

                  <h4>
                    Exclusive deals
                  </h4>

                  <p>
                    Deals worth grabbing
                  </p>

                </div>

              </div>


              <div className="ksam-feature">

                <div className="ksam-feature-icon">
                  <ShoppingBag size={18} />
                </div>

                <div>

                  <h4>
                    Smart discoveries
                  </h4>

                  <p>
                    Products you'll love
                  </p>

                </div>

              </div>


            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="ksam-form"
              onSubmit={handleSubmit}
            >

              <div className="ksam-email">

                <Mail size={21} />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email address"
                  aria-label="Email address"
                />

              </div>


              <button
                type="submit"
                className="ksam-subscribe"
              >

                Subscribe

                <ArrowRight size={19} />

              </button>

            </form>


            {/* Message */}

            {message && (

              <div
                className={
                  `ksam-message ${
                    isSubscribed
                      ? "success"
                      : "error"
                  }`
                }
              >

                {message}

              </div>

            )}


            {/* Privacy */}

            <p className="ksam-privacy">

              <Check size={14} />

              No spam. Just great deals.
              Unsubscribe anytime.

            </p>

          </div>


          {/* =================================================
              RIGHT VISUAL
          ================================================= */}

          <div className="ksam-visual">


            {/* Decorative circles */}

            <div
              className="
                ksam-circle
                ksam-circle-one
              "
            ></div>


            <div
              className="
                ksam-circle
                ksam-circle-two
              "
            ></div>


            {/* =================================================
                MAIN IMAGE
            ================================================= */}

            <div className="ksam-image-wrapper">

              <div className="ksam-shine"></div>

              <img
                src="./public/products/newsletter-person1.png"
                alt="KSAM Deal shopping"
                className="ksam-image"
              />

            </div>


            {/* =================================================
                DEAL CARD
            ================================================= */}

            <div className="ksam-deal-card">

              <div className="ksam-deal-icon">
                <TrendingDown size={20} />
              </div>

              <div>

                <p className="ksam-deal-label">
                  PRICE DROP
                </p>

                <h4 className="ksam-deal-title">

                  Up to{" "}

                  <strong>
                    70% OFF
                  </strong>

                </h4>

              </div>

            </div>


            {/* =================================================
                RATING CARD
            ================================================= */}

            <div className="ksam-rating-card">

              <div className="ksam-avatar">
                KD
              </div>

              <div>

                <div className="ksam-stars">

                  {[1,2,3,4,5].map((star) => (

                    <Star
                      key={star}
                      size={13}
                      fill="currentColor"
                    />

                  ))}

                </div>

                <p className="ksam-rating-text">

                  Loved by{" "}
                  <strong>
                    50K+
                  </strong>{" "}
                  shoppers

                </p>

              </div>

            </div>


            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <div className="ksam-notification">

              <div className="ksam-notification-icon">

                <Mail size={18} />

              </div>


              <div>

                <small>
                  NEW DEAL ALERT
                </small>

                <strong>
                  Nike Air Max — 42% OFF
                </strong>

              </div>


              <div className="ksam-notification-dot"></div>

            </div>


            {/* =================================================
                DISCOUNT
            ================================================= */}

            <div className="ksam-discount">

              <span>
                -42%
              </span>

              <small>
                TODAY
              </small>

            </div>


          </div>

        </div>


        {/* ===================================================
            STATS
        =================================================== */}

        {/* <div className="ksam-stats">


          <div className="ksam-stat">

            <strong>
              50K<span>    +</span>
            </strong>

            <p>
              Happy shoppers
            </p>

          </div>


          <div className="ksam-stat-divider"></div>


          <div className="ksam-stat">

            <strong>
              4.7<span>    ★ </span>
            </strong>

            <p>
              Average rating
            </p>

          </div>


          <div className="ksam-stat-divider"></div>


          <div className="ksam-stat">

            <strong>
              10K<span>    +</span>
            </strong>

            <p>
              Deals discovered
            </p>

          </div>


          <div className="ksam-stat-divider"></div>


          <div className="ksam-stat">

            <strong>
              24<span>    /    7</span>
            </strong>

            <p>
              Deal hunting
            </p>

          </div>


        </div> */}

      </section>
    </>
  );
}

export default Newsletter;