import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
  value: string
  duration?: number
  className?: string
}

interface ParsedValue {
  prefix: string
  target: number
  suffix: string
  decimals: number
  useComma: boolean
}

const parseValue = (value: string): ParsedValue => {
  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)([^\d]*)$/)
  if (!match) {
    return { prefix: '', target: 0, suffix: value, decimals: 0, useComma: false }
  }
  const [, prefix, numStr, suffix] = match
  const cleanNum = numStr.replace(/,/g, '')
  const decimals = cleanNum.includes('.') ? cleanNum.split('.')[1].length : 0
  return {
    prefix,
    target: parseFloat(cleanNum) || 0,
    suffix,
    decimals,
    useComma: numStr.includes(','),
  }
}

const formatNumber = (num: number, decimals: number, useComma: boolean) => {
  const fixed = num.toFixed(decimals)
  if (!useComma) return fixed
  const [intPart, decPart] = fixed.split('.')
  const withCommas = Number(intPart).toLocaleString('en-US')
  return decPart ? `${withCommas}.${decPart}` : withCommas
}

export const CountUp = ({ value, duration = 1.8, className }: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const { prefix, target, suffix, decimals, useComma } = parseValue(value)
  const [display, setDisplay] = useState(() => formatNumber(0, decimals, useComma))

  useEffect(() => {
    if (!isInView) return

    let frame: number
    let start: number | null = null

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(formatNumber(target * eased, decimals, useComma))
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [isInView, target, decimals, useComma, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
