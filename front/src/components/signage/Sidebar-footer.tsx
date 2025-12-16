import forSmartphone from '../../assets/for-smartphone.webp'
import qrCode from '../../assets/qr.webp'

export default function SidebarFooter() {
  return (
    <div className="flex items-center justify-center gap-[1vw]">
      {/* スマホ版リンク */}
      <img src={forSmartphone} alt="スマホ版はこちら" className="h-[4vw]" />
      {/* QRコード */}
      <img src={qrCode} alt="QRコード" className="h-[5.5vw]" />
    </div>
  )
}
