import adImage from '../../assets/ad-01.png'

export default function SidebarAdvertisement() {
  return (
    <div className="bg-white rounded-[1.2vw] overflow-hidden p-[1vw] border-[#005394] border-[0.4vw] h-full flex items-center justify-center">
      <img src={adImage} alt="広告" className="w-full h-auto max-h-full object-contain" />
    </div>
  )
}
