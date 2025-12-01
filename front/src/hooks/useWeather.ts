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

// WMO Weather interpretation codes to icon mapping
// https://open-meteo.com/en/docs
function getWeatherIcon(code: number, isDay: boolean): string {
  // 夜間は月アイコン（晴れの場合）
  if (!isDay && code <= 3) {
    return weatherMoon
  }

  // 晴れ (0-3)
  if (code <= 3) {
    return weatherSunny
  }
  
  // 曇り (45-48: 霧, 51-57: 霧雨)
  if ((code >= 45 && code <= 48) || (code >= 51 && code <= 57)) {
    return weatherCloudy
  }
  
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
  
  // デフォルト: 曇り
  return weatherCloudy
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// 広島市立大学の座標
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=34.4456&longitude=132.3958&current=temperature_2m,weather_code,is_day&timezone=Asia/Tokyo'

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

  return {
    temperature,
    icon: getWeatherIcon(weatherCode, isDay)
  }
}
