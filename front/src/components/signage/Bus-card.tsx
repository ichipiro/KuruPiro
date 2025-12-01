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
      <div className={`relative rounded-[1.1vw] bg-white w-[22.6vw] h-[10.9vw] px-[1.875vw] pl-[1.56vw] flex flex-col justify-center overflow-hidden`}>
        {/* 遅延時の点滅する背景 */}
        {isDelayed && (
          <div 
            className="absolute inset-0 bg-[#FFE5E5] rounded-[1.1vw] animate-pulse-bg"
            style={{
              animation: 'pulseBg 1600ms ease-in-out infinite'
            }}
          />
        )}
        <div className="relative z-10">
          <BusBadge BusId={busId} Destination={destination} via={via} />
          <div className="flex flex-col divide-y-[0.1vw] divide-[#B4B4B4]">
            <div className="my-[0.42vw] flex items-baseline gap-[0.42vw]">
              {isDelayed && (
                <span className="text-[#797979] text-[1.25vw] font-semibold line-through">{scheduledTime}</span>
              )}
              <h2 className={`text-[3.65vw] font-semibold ${isDelayed ? 'text-[#FF3535]' : 'text-[#005394]'}`}>{displayTime}</h2>
            </div>
            <div className="flex justify-between items-center mt-[0.42vw] px-[0.31vw]">
              <span className="font-black text-[1.15vw]" style={{ color: themeColor }}>{via}</span>
              <span className={`font-black text-[1.15vw] ${isUnder5Minutes ? 'text-[#FF3535]' : 'text-[#005394]'}`}>あと{remainingMinutes}分</span>
            </div>
          </div>
        </div>
        <div className={`absolute right-[0.26vw] top-1/2 -translate-y-1/2 h-[96%] w-[0.94vw] ${barColor} rounded-r-[1vw] z-20`} />
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