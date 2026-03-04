'use client'

import { useRef, useEffect } from 'react'

/* ═══════════════════════════════════════════════
 *  CanvasChart
 *
 *  Reusable real-time chart (used in TaskManager
 *  for CPU and Network history).
 * ═══════════════════════════════════════════════ */

interface CanvasChartProps {
  /** Array of values (0–100 or custom range). Latest value at end. */
  data: number[]
  /** Maximum value for normalization (default 100). */
  maxValue?: number
  /** Line color (default #00FF00). */
  lineColor?: string
  /** Grid color (default #008000). */
  gridColor?: string
  /** Whether to fill under the line (default true). */
  fill?: boolean
  /** Canvas width attribute (default 200). */
  width?: number
  /** Canvas height attribute (default 80). */
  height?: number
}

export function CanvasChart({
  data,
  maxValue = 100,
  lineColor = '#00FF00',
  gridColor = '#008000',
  fill = true,
  width = 200,
  height = 80,
}: CanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Line
    if (data.length < 2) return
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 2
    ctx.beginPath()
    const stepX = canvas.width / (data.length - 1)
    data.forEach((val, i) => {
      const x = i * stepX
      const y = canvas.height - (val / maxValue) * canvas.height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Fill under line
    if (fill) {
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.fillStyle = lineColor.replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', '')
      // Simple approach: use lineColor with low alpha
      ctx.fillStyle = `${lineColor}33` // hex alpha ~0.2
      ctx.fill()
    }
  }, [data, maxValue, lineColor, gridColor, fill, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
