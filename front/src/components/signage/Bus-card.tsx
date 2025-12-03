import React from 'react';
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

  const [showLocation, setShowLocation] = React.useState(false);

  React.useEffect(() => {
    if (currentLocation) {
      const interval = setInterval(() => {
        setShowLocation(prev => !prev);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentLocation]);

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
          <div className="relative">
            <div className={`flex justify-between items-center mt-[0.5vw] px-[0.4vw] transition-opacity duration-500 ${!currentLocation || !showLocation ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-black text-[1.4vw]" style={{ color: themeColor }}>{via}</span>
              <span className={`font-black text-[1.4vw] ${isUnder5Minutes ? 'text-[#FF3535]' : 'text-[#005394]'}`}>あと{remainingMinutes}分</span>
            </div>
            <div className={`absolute top-0 left-0 right-0 mt-[0.5vw] px-[0.4vw] transition-opacity duration-500 ${currentLocation && showLocation ? 'opacity-100' : 'opacity-0'}`}>
              <span className="font-black text-[1.4vw]" style={{ color: themeColor }}>{currentLocation || '\u00A0'}通過</span>
            </div>
          </div>
        </div>
      </div>
      <div className={`absolute right-[0.3vw] top-1/2 -translate-y-1/2 h-[96%] w-[1.1vw] ${barColor} rounded-r-[1.1vw] z-20`} />
    </div>
  )
}