'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import SunCalc from 'suncalc'

type Coords = {
  latitude: number
  longitude: number
}

type WeatherData = {
  cloudCover: number
}

const FALLBACK_COORDS: Coords = {
  latitude: 48.8566,
  longitude: 2.3522,
}

const WEATHER_REFRESH_MS = 10 * 60 * 1000
const SUN_DISTANCE = 70

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpColor(a: THREE.Color, b: THREE.Color, t: number) {
  return new THREE.Color(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t))
}

async function fetchWeather(coords: Coords): Promise<WeatherData> {
  const query = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    current: 'cloud_cover,is_day',
    timezone: 'auto',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`)
  if (!response.ok) {
    throw new Error(`Open-Meteo error ${response.status}`)
  }

  const data = (await response.json()) as {
    current?: {
      cloud_cover?: number
    }
  }

  return {
    cloudCover: clamp(data.current?.cloud_cover ?? 0, 0, 100),
  }
}

async function getCoordsFromBrowser(): Promise<Coords> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return FALLBACK_COORDS
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => resolve(FALLBACK_COORDS),
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 30 * 60 * 1000,
      },
    )
  })
}

export function DayNightCycle() {
  const [coords, setCoords] = useState<Coords>(FALLBACK_COORDS)
  const [weather, setWeather] = useState<WeatherData>({ cloudCover: 0 })

  const directionalRef = useRef<THREE.DirectionalLight | null>(null)
  const ambientRef = useRef<THREE.AmbientLight | null>(null)
  const hemiRef = useRef<THREE.HemisphereLight | null>(null)
  const sunTargetRef = useRef<THREE.Object3D | null>(null)

  const sunColorDay = useMemo(() => new THREE.Color('#fff2cf'), [])
  const sunColorSunset = useMemo(() => new THREE.Color('#ffb07a'), [])
  const moonColor = useMemo(() => new THREE.Color('#b9d3ff'), [])

  const skyDay = useMemo(() => new THREE.Color('#8fcef9'), [])
  const skySunset = useMemo(() => new THREE.Color('#f28b65'), [])
  const skyNight = useMemo(() => new THREE.Color('#07122a'), [])

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      const browserCoords = await getCoordsFromBrowser()
      if (!cancelled) {
        setCoords(browserCoords)
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const updateWeather = async () => {
      try {
        const nextWeather = await fetchWeather(coords)
        if (!cancelled) {
          setWeather(nextWeather)
        }
      } catch {
        // Keep previous weather values if the API is temporarily unavailable.
      }
    }

    updateWeather()
    const id = window.setInterval(updateWeather, WEATHER_REFRESH_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [coords])

  useFrame((state) => {
    const now = new Date()
    const sun = SunCalc.getPosition(now, coords.latitude, coords.longitude)

    // In this scene, we rotate azimuth mapping so the travel is visually East/West on the expected axis.
    const horizontal = Math.cos(sun.altitude) * SUN_DISTANCE
    const altitudeSin = Math.sin(sun.altitude)
    const x = Math.cos(sun.azimuth) * horizontal
    const z = Math.sin(sun.azimuth) * horizontal

    const isSunAboveHorizon = altitudeSin > 0
    const y = isSunAboveHorizon
      ? altitudeSin * SUN_DISTANCE
      : Math.max(4, -altitudeSin * SUN_DISTANCE * 0.35)

    const altitudeFactor = clamp((Math.sin(sun.altitude) + 0.12) / 1.12, 0, 1)
    const twilightFactor = clamp((Math.sin(sun.altitude) + 0.02) / 0.22, 0, 1)
    const cloudFactor = 1 - weather.cloudCover / 100

    const daylightIntensity = altitudeFactor * (0.7 + cloudFactor * 0.5)
    const moonIntensity = (1 - twilightFactor) * 0.08

    const directional = directionalRef.current
    const ambient = ambientRef.current
    const hemi = hemiRef.current
    const sunTarget = sunTargetRef.current

    if (directional) {
      directional.position.set(x, y, z)
      directional.castShadow = isSunAboveHorizon
      directional.intensity = isSunAboveHorizon ? daylightIntensity : moonIntensity
      directional.color.copy(
        altitudeFactor > 0
          ? lerpColor(sunColorSunset, sunColorDay, altitudeFactor)
          : moonColor,
      )
    }

    if (sunTarget && directional) {
      directional.target = sunTarget
    }

    if (ambient) {
      ambient.intensity = 0.08 + daylightIntensity * 0.35 + moonIntensity * 0.5
    }

    if (hemi) {
      hemi.intensity = 0.1 + daylightIntensity * 0.6 + moonIntensity * 0.4
      hemi.color.copy(
        altitudeFactor > 0
          ? lerpColor(skySunset, skyDay, altitudeFactor)
          : skyNight,
      )
      hemi.groundColor.copy(lerpColor(new THREE.Color('#1a1a1a'), new THREE.Color('#404040'), altitudeFactor))
    }

    const skyColor = altitudeFactor > 0
      ? lerpColor(skySunset, skyDay, altitudeFactor)
      : skyNight
    state.scene.background = skyColor
  })

  return (
    <>
      <object3D ref={(node) => { sunTargetRef.current = node }} position={[0, 0, 0]} />
      <ambientLight ref={(node) => { ambientRef.current = node }} intensity={0.2} />
      <hemisphereLight
        ref={(node) => { hemiRef.current = node }}
        args={['#8fcef9', '#2b2b2b', 0.55]}
      />
      <directionalLight
        ref={(node) => { directionalRef.current = node }}
        castShadow
        intensity={1}
        position={[20, 20, 20]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
      />
    </>
  )
}
