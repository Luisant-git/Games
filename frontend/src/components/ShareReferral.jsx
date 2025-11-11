import toast from "react-hot-toast";
import "./ShareReferral.css";

const ShareReferral = ({ referCode, onClose }) => {
  const shareReferralCode = (platform) => {
    if (!referCode) return;

    const appUrl = window.location.origin;
    const referralUrl = `${appUrl}/register?ref=${referCode}`;
    const message = `எங்கள் கேமிங் தளத்தில் சேருங்கள்!\n\nபெரிய வெற்றிகள் UdhayamLottery-ல் தொடங்குகின்றன!\nகேரளா லாட்டரிகள் மூலம் உண்மையான பணம் வெல்லுங்கள் – 100% உண்மையானதும் பாதுகாப்பானதும்\n\n-> Use my referral code: ${referCode}\n-> Register here: ${referralUrl}\n\nஇன்று விளையாடி வெல்லத் தொடங்குங்கள்!`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message)}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            referralUrl
          )}&text=${encodeURIComponent(message)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(message);
        toast.success("Referral message copied to clipboard!");
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: "Gaming Platform Referral",
            text: message,
            url: referralUrl,
          });
        } else {
          navigator.clipboard.writeText(message);
          toast.success("Referral message copied to clipboard!");
        }
    }
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-header">
          <h3>Share Referral Code</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="referral-code-display">
          <span>Your Referral Code:</span>
          <div className="code-box">{referCode}</div>
        </div>

        <div className="share-options">
          <button
            className="share-btn whatsapp"
            onClick={() => shareReferralCode("whatsapp")}
          >
            📱 WhatsApp
          </button>
          <button
            className="share-btn telegram"
            onClick={() => shareReferralCode("telegram")}
          >
            ✈️ Telegram
          </button>
          <button
            className="share-btn copy"
            onClick={() => shareReferralCode("copy")}
          >
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareReferral;
