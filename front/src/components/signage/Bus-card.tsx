import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BusBadge from "./Bus-badge";

type BusCardProps = {
  busId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingSeconds: number;
  isRecommended?: boolean;
  currentLocation?: string | null;
}

export default function BusCard({ busId, destination, via, scheduledTime, delayedTime, remainingSeconds, isRecommended = false, currentLocation = null }: BusCardProps) {
  const displayTime = delayedTime || scheduledTime;
  const isDelayed = !!(delayedTime && delayedTime !== scheduledTime);
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF';
  // 切り上げで表示（4分30秒 → 5分）
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const isUnder5Minutes = remainingMinutes < 5;
  // おすすめなら黄色ボーダー
  const barColor = isRecommended ? 'bg-[#FFD06C]' : 'bg-[#B4B4B4]';

  // viaとcurrentLocationを結合したスクロールテキストを生成
  const scrollText = currentLocation ? `${via}　　　${currentLocation}通過` : via;

  // テキストの幅を測定
  const textRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textRef.current && currentLocation) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [scrollText, currentLocation]);

  return (
    <div className={`relative rounded-[1.3vw] ${isDelayed ? 'bg-[#FFE5E5]' : 'bg-white'} w-[26vw] h-[13vw] px-[2vw] pl-[1.8vw] flex flex-col justify-center overflow-hidden mt-[1vw] mb-[1.5vw]`}>
      <div className="relative z-10">
        <BusBadge BusId={busId} Destination={destination} via={via} />
        <div className="flex flex-col divide-y-[0.12vw] divide-[#B4B4B4]">
          <div className="my-[0.5vw] flex items-baseline gap-[0.5vw]">
            {isDelayed && (
              <span className="text-[#797979] text-[1.5vw] font-semibold line-through">{scheduledTime}</span>
            )}
            <h2 className={`text-[4.5vw] font-semibold ${isDelayed ? 'text-[#FF3535]' : 'text-[#005394]'}`}>{displayTime}</h2>
          </div>
          <div className="flex justify-between items-center mt-[0.5vw] px-[0.4vw]">
            <div className="overflow-hidden flex-1 mr-[0.5vw]">
              {currentLocation ? (
                <motion.div
                  className="inline-flex gap-[3vw]"
                  animate={{
                    x: textWidth > 0 ? [0, -(textWidth + 48)] : 0 // 48px = gap分
                  }}
                  transition={{
                    x: {
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                >
                  <span ref={textRef} className="font-black text-[1.4vw] whitespace-nowrap shrink-0" style={{ color: themeColor }}>
                    {scrollText}
                  </span>
                  <span className="font-black text-[1.4vw] whitespace-nowrap shrink-0" style={{ color: themeColor }}>
                    {scrollText}
                  </span>
                </motion.div>
              ) : (
                <span className="font-black text-[1.4vw] whitespace-nowrap" style={{ color: themeColor }}>
                  {via}
                </span>
              )}
            </div>
            <span className={`font-black text-[1.4vw] whitespace-nowrap ${isUnder5Minutes ? 'text-[#FF3535]' : 'text-[#005394]'}`}>あと{remainingMinutes}分</span>
          </div>
        </div>
      </div>
      <div className={`absolute right-[0.3vw] top-1/2 -translate-y-1/2 h-[96%] w-[1.1vw] ${barColor} rounded-r-[1.1vw] z-20`} />
    </div>
  )
}
