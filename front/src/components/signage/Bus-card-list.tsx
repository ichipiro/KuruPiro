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
      <div className={`relative rounded-[27px] bg-white w-[434px] h-[120px] px-[19px] flex flex-col justify-center overflow-hidden`}>
        {/* 遅延時の点滅する背景 */}
        {isDelayed && (
          <div 
            className="absolute inset-0 bg-[#FFE5E5] rounded-[21px] animate-pulse-bg"
            style={{
              animation: 'pulseBg 1600ms ease-in-out infinite'
            }}
          />
        )}
        <div>
          <div className="relative flex items-center space-x-[16px]">
            <div className="border-[6px] flex items-center w-fit" style={{ borderColor: themeColor }}>
              <div className="text-white p-[7px] text-[15px] font-black" style={{ backgroundColor: themeColor }}>{busId}</div>
            </div>
            <div className="flex flex-col divide-y-[2px] divide-[#B4B4B4] flex-1">
              <div className="flex items-baseline gap-[8px]">
                {isDelayed && (
                  <span className="text-[#797979] text-[25px] font-semibold line-through">{scheduledTime}</span>
                )}
                <h3 className={`text-[55px] font-semibold ${isDelayed ? 'text-[#FF3535]' : 'text-[#005394]'}`}>{displayTime}</h3>
              </div>
              <div className="flex justify-between items-center mt-[8px] px-[6px]">
                <span className="font-bold text-[16px]" style={{ color: themeColor }}>{via}</span>
                <span className={`font-semibold text-[16px] rounded-full px-[12px] py-[4px] text-white ${isUnder5Minutes ? 'bg-[#FF3535]' : 'bg-[#005394]'}`}>あと{remainingMinutes}分</span>
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