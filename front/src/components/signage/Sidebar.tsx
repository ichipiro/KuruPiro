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
    <div className="bg-[#FFD06C] h-full p-[24px] flex flex-col gap-[20px]">
      <SidebarHeader currentTime={currentTime} temperature={temperature} weatherIcon={weatherIcon} />
      <SidebarLogo />
      <SidebarAdvertisement />
      <div className="mt-auto">
        <SidebarFooter />
      </div>
    </div>
  )
}
