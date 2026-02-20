import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import adImage from '../../assets/ad-01.webp'
import adImage_2 from '../../assets/ad-02.webp'
import guraduation from '../../assets/guraduation-01.webm'

type AdItem = {
  id: number
  src: string
  alt: string
  type: string
  startDate?: string
  endDate?: string
}

// 広告リスト（画像を追加する場合はここにインポートして配列に追加してください）
const ADS: AdItem[] = [
  { id: 1, src: adImage, alt: "広告", type: 'image' },
  { id: 2, src: adImage_2, alt: "広告2", type: 'image' },
  { id: 3, src: guraduation, alt: "卒業式", type: 'video', startDate: '2026-03-23', endDate: '2026-03-23' },
]

export default function SidebarAdvertisement() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const displayAds = useMemo(() => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return ADS.filter((ad) => {
      if (ad.startDate && todayStr < ad.startDate) return false
      if (ad.endDate && todayStr > ad.endDate) return false
      return true
    })
  }, [])

  useEffect(() => {
    if (displayAds.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayAds.length)
    }, 15000) // 5秒ごとに切り替え

    return () => clearInterval(interval)
  }, [displayAds.length])

  if (displayAds.length === 0) return null

  const currentAd = displayAds[currentIndex]

  return (
    <div className="bg-white rounded-[1.2vw] overflow-hidden border-[#005394] border-[0.4vw] h-full relative">
      <AnimatePresence>
        <motion.div
          key={currentAd.id}
          className={`absolute inset-0 flex items-center justify-center ${currentAd.type === 'video' ? '' : 'p-[1vw]'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {currentAd.type === 'video' ? (
            <>
              <video
                src={currentAd.src}
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover scale-110 brightness-45"
              />
              <video src={currentAd.src} autoPlay muted loop playsInline className="relative z-10 w-full h-full object-contain" />
            </>
          ) : (
            <img src={currentAd.src} alt={currentAd.alt} className="w-full h-auto max-h-full object-contain" />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
