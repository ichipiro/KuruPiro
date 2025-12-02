import busIcon from '../../assets/bus.png'

type BusColumnProps = {
  stopName: string;
  children: React.ReactNode;
}

export default function BusColumn({ stopName, children }: BusColumnProps) {
  return (
    <div className="flex flex-col h-full w-full items-center">
      <div className="border-[0.18vw] border border-white px-[1.5vw] py-[0.75vw] flex items-center justify-between w-[26vw]">
        <h2 className="text-white text-[2vw] font-bold">{stopName}</h2>
        <img src={busIcon} alt="バス" className="h-[2.5vw]" />
      </div>
      <div className="flex flex-col justify-start gap-[1.2vw] flex-1 py-[1vw] items-center w-full">
        {children}
      </div>
    </div>
  )
}
