import SidebarHeader from './Sidebar-header'
import SidebarLogo from './Sidebar-logo'
import SidebarAdvertisement from './Sidebar-ad'
import SidebarFooter from './Sidebar-footer'

type SidebarProps = {
  currentTime: string;
  temperature: number;
  weatherIcon: string;
}

export default function Sidebar({ currentTime, temperature, weatherIcon }: SidebarProps) {
  return (
    <div className="bg-[#FFD06C] h-full p-[1.5vw] flex flex-col gap-[1.2vw]">
      <SidebarHeader currentTime={currentTime} temperature={temperature} weatherIcon={weatherIcon} />
      <SidebarLogo />
      <div className="flex-1 min-h-0 flex flex-col">
        <SidebarAdvertisement />
      </div>
      <SidebarFooter />
    </div>
  )
}
