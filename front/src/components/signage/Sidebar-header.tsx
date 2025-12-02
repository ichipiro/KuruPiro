type SidebarHeaderProps = {
  currentTime: string;
  temperature: number;
  weatherIcon: string;
}

export default function SidebarHeader({ currentTime, temperature, weatherIcon }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* 現在時刻 */}
      <div className="bg-[#1E3A5F] px-[1vw] py-[0.5vw] flex items-baseline gap-[0.8vw]">
        <span className="text-white text-[1.1vw] font-medium">現在時刻</span>
        <span className="text-white text-[2.8vw] font-bold">{currentTime}</span>
      </div>
      {/* 天気 */}
      <div className="relative flex items-center justify-center">
        <img src={weatherIcon} alt="天気" className="h-[5vw]" />
        <span 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#005394] text-[1.8vw] font-semibold"
          style={{ textShadow: '-0.1vw -0.1vw 0 #fff, 0.1vw -0.1vw 0 #fff, -0.1vw 0.1vw 0 #fff, 0.1vw 0.1vw 0 #fff' }}
        >
          {temperature}°C
        </span>
      </div>
    </div>
  )
}
