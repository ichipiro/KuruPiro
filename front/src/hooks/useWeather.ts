import useSWR from 'swr'

import weatherSunny from '../assets/weather_sunny.png'
import weatherCloudy from '../assets/weather_cloudy.png'
import weatherRainy from '../assets/weather_rainy.png'
import weatherSnow from '../assets/weather_snow.png'
import weatherThunder from '../assets/weather_thunder.png'
import weatherMoon from '../assets/weather_moon.png'

type WeatherData = {
  temperature: number;
  icon: string;
}

// WMO Weather interpretation codes to icon mapping with cloud cover
// https://open-meteo.com/en/docs
function getWeatherIcon(code: number, isDay: boolean, cloudCover: number): string {
  // 雨や雪などの降水がある場合は天気コード優先
  // 雨 (61-67: 雨, 80-82: にわか雨)
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return weatherRainy
  }

  // 雪 (71-77: 雪, 85-86: にわか雪)
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return weatherSnow
  }

  // 雷 (95-99: 雷雨)
  if (code >= 95 && code <= 99) {
    return weatherThunder
  }

  // 降水がない場合は雲量で判断
  // 雲量50%以上は曇り
  if (cloudCover >= 50) {
    return weatherCloudy
  }

  // 夜間で雲量50%未満は月アイコン
  if (!isDay) {
    return weatherMoon
  }

  // 昼間で雲量50%未満は晴れ
  return weatherSunny
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// 広島市立大学の座標
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=34.4384655&longitude=132.4161172&current=temperature_2m,weather_code,is_day,cloud_cover&timezone=Asia/Tokyo'

export function useWeather(): WeatherData {
  const { data } = useSWR(WEATHER_API_URL, fetcher, {
    refreshInterval: 60 * 60 * 1000, // 1時間ごとに更新
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000, // 1時間は重複リクエストを防ぐ
  })

  if (!data?.current) {
    return {
      temperature: 0,
      icon: weatherSunny
    }
  }

  const temperature = Math.round(data.current.temperature_2m)
  const weatherCode = data.current.weather_code
  const isDay = data.current.is_day === 1
  const cloudCover = data.current.cloud_cover || 0

  return {
    temperature,
    icon: getWeatherIcon(weatherCode, isDay, cloudCover)
  }
}
