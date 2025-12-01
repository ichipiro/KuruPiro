export default function BusBadge({ BusId, Destination, via }: { BusId: string, Destination: string, via?: string }) {
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF'

  return (
    <div className="max-w-[245px] max-h-[45px] border-[6px] flex items-center w-fit" style={{ borderColor: themeColor, color: themeColor }}>
      <div className="text-white p-[14px] text-[15px] font-black" style={{ backgroundColor: themeColor }}>{BusId}</div>
      <div className="text-[18px] font-black px-[14px]">{Destination}</div>
    </div>
  )
}