import busIcon from '../../assets/bus.png'

type BusColumnProps = {
  stopName: string;
  children: React.ReactNode;
}

export default function BusColumn({ stopName, children }: BusColumnProps) {
  return (
    <div className="flex flex-col gap-[16px] w-full items-center">
      <div className="border-[3px] border border-white px-[24px] py-[12px] flex items-center justify-between w-[434px]">
        <h2 className="text-white text-[32px] font-bold">{stopName}</h2>
        <img src={busIcon} alt="バス" className="h-[40px]" />
      </div>
      <div className="flex flex-col gap-[12px] items-center">
        {children}
      </div>
    </div>
  )
}
