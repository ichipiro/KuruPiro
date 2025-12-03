import { useEffect, useState, useCallback } from 'react'

type Line = {
  tripId: string
  x1: number
  y1: number
  x2: number
  y2: number
}

type BusConnectionLinesProps = {
  containerRef: React.RefObject<HTMLDivElement>
}

export default function BusConnectionLines({ containerRef }: BusConnectionLinesProps) {
  const [lines, setLines] = useState<Line[]>([])

  const updateLines = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()

    // 沼田側と市大側のカードを取得（アクティブな要素のみ）
    const numaCards = container.querySelectorAll('[data-column="numa"][data-trip-id][data-bus-state="active"]')
    const piroCards = container.querySelectorAll('[data-column="piro"][data-trip-id][data-bus-state="active"]')

    // 市大側のtripIdをマップ化（同じtripIdは最初の1つだけ）
    const piroMap = new Map<string, Element>()
    piroCards.forEach(card => {
      const tripId = card.getAttribute('data-trip-id')
      if (tripId && !piroMap.has(tripId)) {
        piroMap.set(tripId, card)
      }
    })

    // 沼田側のカードとマッチする市大側のカードを線で結ぶ
    const newLines: Line[] = []
    const processedTripIds = new Set<string>()

    numaCards.forEach(numaCard => {
      const tripId = numaCard.getAttribute('data-trip-id')
      if (!tripId || processedTripIds.has(tripId)) return

      processedTripIds.add(tripId)

      const piroCard = piroMap.get(tripId)
      if (!piroCard) return

      const numaRect = numaCard.getBoundingClientRect()
      const piroRect = piroCard.getBoundingClientRect()

      newLines.push({
        tripId,
        x1: numaRect.right - containerRect.left,
        y1: numaRect.top + numaRect.height / 2 - containerRect.top,
        x2: piroRect.left - containerRect.left,
        y2: piroRect.top + piroRect.height / 2 - containerRect.top,
      })
    })

    setLines(newLines)
  }, [containerRef])

  useEffect(() => {
    updateLines()

    // 定期的に更新（アニメーション対応）
    const interval = setInterval(updateLines, 100)

    // リサイズ対応
    window.addEventListener('resize', updateLines)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', updateLines)
    }
  }, [updateLines])

  if (lines.length === 0) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    >
      {lines.map(line => (
        <line
          key={line.tripId}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="4"
          strokeDasharray="8 6"
        />
      ))}
    </svg>
  )
}
