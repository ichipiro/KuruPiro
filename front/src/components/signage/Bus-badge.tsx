export default function BusBadge({ BusId, Destination, via }: { BusId: string, Destination: string, via?: string }) {
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF'

  return (
    <div className="max-w-[12.76vw] max-h-[2.34vw] border-[0.31vw] flex items-center w-fit" style={{ borderColor: themeColor, color: themeColor }}>
      <div className="text-white p-[0.73vw] text-[0.78vw] font-black" style={{ backgroundColor: themeColor }}>{BusId}</div>
      <div className="text-[0.94vw] font-black px-[0.73vw]">{Destination}</div>
    </div>
  )
}