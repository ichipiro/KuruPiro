import { AnimatePresence, motion } from 'framer-motion'
import BusCard from './Bus-card'
import BusCardList from './Bus-card-list'

type BusData = {
  busId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingSeconds: number;
}

type AnimatedBusListProps = {
  buses: BusData[];
  displayCount: number;
}

// 滑らかなイージング
const smoothTransition = {
  type: "tween" as const,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.5,
  layout: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 0.8
  }
}

export default function AnimatedBusList({ buses, displayCount }: AnimatedBusListProps) {
  if (buses.length === 0) {
    return <div className="text-white text-center">運行情報がありません</div>
  }

  return (
    <AnimatePresence mode="popLayout">
      {/* 1便目 */}
      <motion.div
        key={`main-${buses[0].scheduledTime}-${buses[0].busId}`}
        layout
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -60, scale: 0.9 }}
        transition={smoothTransition}
      >
        <BusCard
          busId={buses[0].busId}
          destination={buses[0].destination}
          via={buses[0].via}
          scheduledTime={buses[0].scheduledTime}
          delayedTime={buses[0].delayedTime}
          remainingSeconds={buses[0].remainingSeconds}
          isRecommended={true}
        />
      </motion.div>

      {/* 2便目以降 */}
      {buses.slice(1, displayCount).map((bus, index) => (
        <motion.div
          key={`list-${bus.scheduledTime}-${bus.busId}`}
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{
            ...smoothTransition,
            delay: index * 0.03 // わずかなスタッガー効果
          }}
        >
          <BusCardList
            busId={bus.busId}
            destination={bus.destination}
            via={bus.via}
            scheduledTime={bus.scheduledTime}
            delayedTime={bus.delayedTime}
            remainingSeconds={bus.remainingSeconds}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
