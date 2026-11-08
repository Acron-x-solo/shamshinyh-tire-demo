import { useState } from "react";
import { ImageOff } from "lucide-react";
import { assetUrl } from "../data/assets.js";
export default function Photo({ src, alt, className = "", loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  return failed || !src ? (
    <div className={`photo-fallback ${className}`} role="img" aria-label={alt}>
      <ImageOff size={25} />
      <span>Фото в карточке мастерской</span>
    </div>
  ) : (
    <img
      className={className}
      src={assetUrl(src)}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
