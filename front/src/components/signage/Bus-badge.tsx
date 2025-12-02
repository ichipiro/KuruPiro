export default function BusBadge({ BusId, Destination, via }: { BusId: string, Destination: string, via?: string }) {
  const themeColor = via === '中広町経由' ? '#8400FF' : '#0091FF'

  return (
    <div className="border-[0.35vw] flex items-center w-fit" style={{ borderColor: themeColor, color: themeColor }}>
      <div className="text-white px-[0.6vw] py-[0.35vw] text-[1.1vw] font-black flex items-center justify-center min-w-[2.4vw]" style={{ backgroundColor: themeColor }}>{BusId}</div>
      <div className="text-[1.15vw] font-black px-[0.7vw] whitespace-nowrap">{Destination}</div>
    </div>
  )
}