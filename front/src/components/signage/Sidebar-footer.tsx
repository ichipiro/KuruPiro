import forSmartphone from '../../assets/for-smartphone.png'
import qrCode from '../../assets/qr.png'

export default function SidebarFooter() {
  return (
    <div className="flex items-center justify-center gap-[16px]">
      {/* スマホ版リンク */}
      <img src={forSmartphone} alt="スマホ版はこちら" className="h-[60px]" />
      {/* QRコード */}
      <img src={qrCode} alt="QRコード" className="h-[80px]" />
    </div>
  )
}
