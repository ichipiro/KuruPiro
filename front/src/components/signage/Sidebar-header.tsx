type SidebarHeaderProps = {
  currentTime: string;
  temperature: number;
  weatherIcon: string;
}

export default function SidebarHeader({ currentTime, temperature, weatherIcon }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* 現在時刻 */}
      <div className="bg-[#1E3A5F] px-[16px] py-[8px] flex items-baseline gap-[12px]">
        <span className="text-white text-[16px] font-medium">現在時刻</span>
        <span className="text-white text-[40px] font-bold">{currentTime}</span>
      </div>
      {/* 天気 */}
      <div className="relative flex items-center justify-center">
        <img src={weatherIcon} alt="天気" className="h-[70px]" />
        <span 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#005394] text-[28px] font-semibold"
          style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}
        >
          {temperature}°C
        </span>
      </div>
    </div>
  )
}
