import BusBadge from "./Bus-badge";

type BusCardProps = {
  busId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingMinutes: number;
  isRecommended?: boolean;
}

export default function BusCard({ busId, destination, via, scheduledTime, delayedTime, remainingMinutes, isRecommended = false }: BusCardProps) {
  const displayTime = delayedTime || scheduledTime;
  const isDelayed = !!(delayedTime && delayedTime !== scheduledTime);
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF';
  const isUnder5Minutes = remainingMinutes < 5;
  const barColor = (isUnder5Minutes && isRecommended) ? 'bg-[#FFD06C]' : 'bg-[#B4B4B4]';

  return (
    <>
      <div className={`relative rounded-[21px] bg-white w-[434px] h-[210px] px-[36px] pl-[30px] flex flex-col justify-center overflow-hidden`}>
        {/* 遅延時の点滅する背景 */}
        {isDelayed && (
          <div 
            className="absolute inset-0 bg-[#FFE5E5] rounded-[21px] animate-pulse-bg"
            style={{
              animation: 'pulseBg 1600ms ease-in-out infinite'
            }}
          />
        )}
        <div className="relative z-10">
          <BusBadge BusId={busId} Destination={destination} via={via} />
          <div className="flex flex-col divide-y-[2px] divide-[#B4B4B4]">
            <div className="my-[8px] flex items-baseline gap-[8px]">
              {isDelayed && (
                <span className="text-[#797979] text-[24px] font-semibold line-through">{scheduledTime}</span>
              )}
              <h2 className={`text-[70px] font-semibold ${isDelayed ? 'text-[#FF3535]' : 'text-[#005394]'}`}>{displayTime}</h2>
            </div>
            <div className="flex justify-between items-center mt-[8px] px-[6px]">
              <span className="font-black text-[22px]" style={{ color: themeColor }}>{via}</span>
              <span className={`font-black text-[22px] ${isUnder5Minutes ? 'text-[#FF3535]' : 'text-[#005394]'}`}>あと{remainingMinutes}分</span>
            </div>
          </div>
        </div>
        <div className={`absolute right-[5px] top-1/2 -translate-y-1/2 h-[96%] w-[18px] ${barColor} rounded-r-[19px] z-20`} />
      </div>
      <style>{`
        @keyframes pulseBg {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}