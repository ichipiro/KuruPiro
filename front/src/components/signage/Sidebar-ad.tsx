import adImage from '../../assets/ad-01.png'

export default function SidebarAdvertisement() {
  return (
    <div className="bg-white rounded-[1.04vw] overflow-hidden p-[0.83vw] border-[#005394] border-[0.36vw]">
      <img src={adImage} alt="広告" className="w-full h-auto" />
    </div>
  )
}
