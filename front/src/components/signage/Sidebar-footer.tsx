import forSmartphone from '../../assets/for-smartphone.png'
import qrCode from '../../assets/qr.png'

export default function SidebarFooter() {
  return (
    <div className="flex items-center justify-center gap-[0.83vw]">
      {/* スマホ版リンク */}
      <img src={forSmartphone} alt="スマホ版はこちら" className="h-[3.125vw]" />
      {/* QRコード */}
      <img src={qrCode} alt="QRコード" className="h-[4.17vw]" />
    </div>
  )
}
