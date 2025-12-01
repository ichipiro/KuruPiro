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

export default function BusCardList({ busId, destination, via, scheduledTime, delayedTime, remainingMinutes, isRecommended = false }: BusCardProps) {
  const displayTime = delayedTime || scheduledTime;
  const isDelayed = !!(delayedTime && delayedTime !== scheduledTime);
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF';
  const isUnder5Minutes = remainingMinutes < 5;
  const barColor = (isUnder5Minutes && isRecommended) ? 'bg-[#FFD06C]' : 'bg-[#B4B4B4]';

  return (
    <>
      <div className={`relative rounded-[1.4vw] bg-white w-[22.6vw] h-[6.25vw] px-[1vw] flex flex-col justify-center overflow-hidden`}>
        {/* 遅延時の点滅する背景 */}
        {isDelayed && (
          <div 
            className="absolute inset-0 bg-[#FFE5E5] rounded-[1.1vw] animate-pulse-bg"
            style={{
              animation: 'pulseBg 1600ms ease-in-out infinite'
            }}
          />
        )}
        <div>
          <div className="relative flex items-center space-x-[0.83vw]">
            <div className="border-[0.31vw] flex items-center w-fit" style={{ borderColor: themeColor }}>
              <div className="text-white p-[0.36vw] text-[0.78vw] font-black" style={{ backgroundColor: themeColor }}>{busId}</div>
            </div>
            <div className="flex flex-col divide-y-[0.1vw] divide-[#B4B4B4] flex-1">
              <div className="flex items-baseline gap-[0.42vw]">
                {isDelayed && (
                  <span className="text-[#797979] text-[1.3vw] font-semibold line-through">{scheduledTime}</span>
                )}
                <h3 className={`text-[2.86vw] font-semibold ${isDelayed ? 'text-[#FF3535]' : 'text-[#005394]'}`}>{displayTime}</h3>
              </div>
              <div className="flex justify-between items-center mt-[0.42vw] px-[0.31vw]">
                <span className="font-bold text-[0.83vw]" style={{ color: themeColor }}>{via}</span>
                <span className={`font-semibold text-[0.83vw] rounded-full px-[0.625vw] py-[0.21vw] text-white ${isUnder5Minutes ? 'bg-[#FF3535]' : 'bg-[#005394]'}`}>あと{remainingMinutes}分</span>
              </div>
            </div>
          </div>
        </div>
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