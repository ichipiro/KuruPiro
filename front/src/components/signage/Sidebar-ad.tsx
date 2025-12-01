import adImage from '../../assets/ad-01.png'

export default function SidebarAdvertisement() {
  return (
    <div className="bg-white rounded-[20px] overflow-hidden p-4 border border-[#005394] border-[7px]">
      <img src={adImage} alt="広告" className="w-full h-auto" />
    </div>
  )
}
