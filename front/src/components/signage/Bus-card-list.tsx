import BusBadge from "./Bus-badge";

type BusCardProps = {
  busId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingSeconds: number;
  isRecommended?: boolean;
}

export default function BusCardList({ busId, destination, via, scheduledTime, delayedTime, remainingSeconds, isRecommended = false }: BusCardProps) {
  const displayTime = delayedTime || scheduledTime;
  const isDelayed = !!(delayedTime && delayedTime !== scheduledTime);
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF';
  // 切り上げで表示（9分45秒 → 10分）
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const isUnder5Minutes = remainingMinutes < 5;
  const barColor = (isUnder5Minutes && isRecommended) ? 'bg-[#FFD06C]' : 'bg-[#B4B4B4]';

  return (
    <>
      <div className={`relative rounded-[1.5vw] bg-white w-[26vw] h-[7.5vw] px-[1.2vw] flex flex-col justify-center overflow-hidden`}>
        {/* 遅延時の点滅する背景 */}
        {isDelayed && (
          <div 
            className="absolute inset-0 bg-[#FFE5E5] rounded-[1.3vw] animate-pulse-bg"
            style={{
              animation: 'pulseBg 1600ms ease-in-out infinite'
            }}
          />
        )}
        <div>
          <div className="relative flex items-center space-x-[1vw]">
            <div className="border-[0.35vw] flex items-center w-fit" style={{ borderColor: themeColor }}>
              <div className="text-white p-[0.4vw] text-[0.95vw] font-black" style={{ backgroundColor: themeColor }}>{busId}</div>
            </div>
            <div className="flex flex-col divide-y-[0.12vw] divide-[#B4B4B4] flex-1">
              <div className="flex items-baseline gap-[0.5vw]">
                {isDelayed && (
                  <span className="text-[#797979] text-[1.5vw] font-semibold line-through">{scheduledTime}</span>
                )}
                <h3 className={`text-[3.5vw] font-semibold ${isDelayed ? 'text-[#FF3535]' : 'text-[#005394]'}`}>{displayTime}</h3>
              </div>
              <div className="flex justify-between items-center mt-[0.5vw] px-[0.4vw]">
                <span className="font-bold text-[1vw]" style={{ color: themeColor }}>{via}</span>
                <span className={`font-semibold text-[1vw] rounded-full px-[0.75vw] py-[0.25vw] text-white ${isUnder5Minutes ? 'bg-[#FF3535]' : 'bg-[#005394]'}`}>あと{remainingMinutes}分</span>
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