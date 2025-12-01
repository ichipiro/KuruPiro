type SidebarHeaderProps = {
  currentTime: string;
  temperature: number;
  weatherIcon: string;
}

export default function SidebarHeader({ currentTime, temperature, weatherIcon }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* 現在時刻 */}
      <div className="bg-[#1E3A5F] px-[0.83vw] py-[0.42vw] flex items-baseline gap-[0.625vw]">
        <span className="text-white text-[0.83vw] font-medium">現在時刻</span>
        <span className="text-white text-[2.1vw] font-bold">{currentTime}</span>
      </div>
      {/* 天気 */}
      <div className="relative flex items-center justify-center">
        <img src={weatherIcon} alt="天気" className="h-[3.65vw]" />
        <span 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#005394] text-[1.46vw] font-semibold"
          style={{ textShadow: '-0.05vw -0.05vw 0 #fff, 0.05vw -0.05vw 0 #fff, -0.05vw 0.05vw 0 #fff, 0.05vw 0.05vw 0 #fff' }}
        >
          {temperature}°C
        </span>
      </div>
    </div>
  )
}
