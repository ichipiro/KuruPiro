import busIcon from '../../assets/bus.png'

type BusColumnProps = {
  stopName: string;
  children: React.ReactNode;
}

export default function BusColumn({ stopName, children }: BusColumnProps) {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <div className="border-[0.16vw] border border-white px-[1.25vw] py-[0.625vw] flex items-center justify-between w-[22.6vw]">
        <h2 className="text-white text-[1.67vw] font-bold">{stopName}</h2>
        <img src={busIcon} alt="バス" className="h-[2.1vw]" />
      </div>
      <div className="flex flex-col justify-between flex-1 py-[1vw] items-center w-full">
        {children}
      </div>
    </div>
  )
}
