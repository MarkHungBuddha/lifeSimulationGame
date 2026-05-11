export const retirementAges = [30, 40, 50, 60, 70] as const

export type RetirementAge = typeof retirementAges[number]
export type SequenceKind = 'good' | 'bad'

export const goodLuckPath = [
  1000, 1100, 1240, 1350, 1480, 1560, 1640, 1700, 1750, 1810,
  1870, 1900, 1880, 1840, 1780, 1700, 1640, 1600, 1580, 1560,
  1540, 1520, 1490, 1470, 1450, 1440, 1430, 1420, 1410, 1400,
]

export const badLuckPath = [
  1000, 880, 760, 650, 580, 540, 510, 470, 430, 400,
  380, 350, 310, 270, 220, 170, 120, 60, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]
