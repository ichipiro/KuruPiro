import { AnimatePresence, motion } from 'framer-motion'
import BusCard from './Bus-card'
import BusCardList from './Bus-card-list'

type BusData = {
  busId: string;
  tripId: string;
  destination: string;
  via: string;
  scheduledTime: string;
  delayedTime?: string;
  remainingSeconds: number;
  currentLocation: string | null;
}

type AnimatedBusListProps = {
  buses: BusData[];
  displayCount: number;
  recommendedIndex?: number;
  columnId?: string; // カラム識別用（'numa' | 'piro'）
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

export default function AnimatedBusList({ buses, displayCount, recommendedIndex = 0, columnId }: AnimatedBusListProps) {
  if (buses.length === 0) {
    return <div className="text-white text-center">運行情報がありません</div>
  }

  return (
    <AnimatePresence mode="popLayout">
      {buses.slice(0, displayCount).map((bus, index) => {
        const isRecommended = index === recommendedIndex
        const isFirst = index === 0

        return (
          <motion.div
            key={`${isFirst ? 'main' : 'list'}-${bus.scheduledTime}-${bus.busId}`}
            layout
            initial={{ opacity: 0, y: isFirst ? -30 : 30, scale: isFirst ? 0.95 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isFirst ? -60 : -40, scale: isFirst ? 0.9 : 0.95 }}
            transition={{
              ...smoothTransition,
              delay: isFirst ? 0 : (index - 1) * 0.03
            }}
            data-trip-id={bus.tripId}
            data-column={columnId}
          >
            {isFirst ? (
              <BusCard
                busId={bus.busId}
                destination={bus.destination}
                via={bus.via}
                scheduledTime={bus.scheduledTime}
                delayedTime={bus.delayedTime}
                remainingSeconds={bus.remainingSeconds}
                isRecommended={isRecommended}
                currentLocation={bus.currentLocation}
              />
            ) : (
              <BusCardList
                busId={bus.busId}
                destination={bus.destination}
                via={bus.via}
                scheduledTime={bus.scheduledTime}
                delayedTime={bus.delayedTime}
                remainingSeconds={bus.remainingSeconds}
              />
            )}
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}
