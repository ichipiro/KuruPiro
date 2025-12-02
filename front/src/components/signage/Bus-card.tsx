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

// 残り時間をフォーマット（1分未満は秒のみ）
function formatRemainingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) {
    return `${secs.toString().padStart(2, '0')}秒`
  }
  return `${mins}分${secs.toString().padStart(2, '0')}秒`
}

export default function BusCard({ busId, destination, via, scheduledTime, delayedTime, remainingSeconds, isRecommended = false }: BusCardProps) {
  const displayTime = delayedTime || scheduledTime;
  const isDelayed = !!(delayedTime && delayedTime !== scheduledTime);
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF';
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const isUnder5Minutes = remainingMinutes < 5;
  const barColor = (isUnder5Minutes && isRecommended) ? 'bg-[#FFD06C]' : 'bg-[#B4B4B4]';

  return (
    <>
      <div className={`relative rounded-[1.3vw] bg-white w-[26vw] h-[13vw] px-[2vw] pl-[1.8vw] flex flex-col justify-center overflow-hidden`}>
        {/* 遅延時の点滅する背景 */}
        {isDelayed && (
          <div 
            className="absolute inset-0 bg-[#FFE5E5] rounded-[1.3vw] animate-pulse-bg"
            style={{
              animation: 'pulseBg 1600ms ease-in-out infinite'
            }}
          />
        )}
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
              <span className="font-black text-[1.4vw]" style={{ color: themeColor }}>{via}</span>
              <span className={`font-black text-[1.4vw] ${isUnder5Minutes ? 'text-[#FF3535]' : 'text-[#005394]'}`}>あと{formatRemainingTime(remainingSeconds)}</span>
            </div>
          </div>
        </div>
        <div className={`absolute right-[0.3vw] top-1/2 -translate-y-1/2 h-[96%] w-[1.1vw] ${barColor} rounded-r-[1.1vw] z-20`} />
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