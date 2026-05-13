/**
 * Philippines random event database.
 *
 * Sources and calibration notes:
 * - doc/ph-random-event-library-plan.md
 * - PSA labor force, inflation, FIES, and national health accounts releases
 * - PAGASA tropical cyclone information
 * - BSP/PIA remittance releases
 * - PNA/IBPAP IT-BPM industry reporting
 */

import type { RandomEvent, EventCategory } from './eventTypes'

export const EVENT_DATABASE_PH: RandomEvent[] = [
  // ================================================================
  // Macro and market
  // ================================================================
  {
    id: 'ph_high_inflation',
    name: 'High Inflation Pressure',
    category: 'market',
    description: 'Food, transport, utilities, and rent rise faster than the household budget can adjust.',
    baseProbability: 0.08,
    durationMonths: [6, 18],
    impacts: [
      { type: 'savings_change', value: -0.03 },
      { type: 'extra_expense', value: 1 },
    ],
    correlatedWith: ['ph_transport_fuel_shock', 'ph_currency_pressure'],
  },
  {
    id: 'ph_transport_fuel_shock',
    name: 'Transport And Fuel Shock',
    category: 'market',
    description: 'Fuel prices and commute costs jump, cutting into monthly savings.',
    baseProbability: 0.06,
    durationMonths: [3, 9],
    impacts: [
      { type: 'extra_expense', value: 0.8 },
      { type: 'savings_change', value: -0.02 },
    ],
    correlatedWith: ['ph_high_inflation'],
  },
  {
    id: 'ph_currency_pressure',
    name: 'Peso Pressure',
    category: 'market',
    description: 'Currency weakness raises imported costs and reduces purchasing power.',
    baseProbability: 0.04,
    durationMonths: [6, 18],
    impacts: [
      { type: 'savings_change', value: -0.04 },
    ],
    correlatedWith: ['ph_high_inflation'],
  },

  // ================================================================
  // Weather and disaster
  // ================================================================
  {
    id: 'ph_typhoon_disruption',
    name: 'Typhoon Disruption',
    category: 'property',
    description: 'A tropical cyclone disrupts work, transport, utilities, and household logistics.',
    baseProbability: 0.09,
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 1 },
      { type: 'income_change', value: -0.05 },
    ],
    correlatedWith: ['ph_flood_home_repair', 'ph_disaster_aid_recovery'],
  },
  {
    id: 'ph_flood_home_repair',
    name: 'Flood Or Home Repair',
    category: 'property',
    description: 'Flooding or storm damage creates repair, replacement, or relocation costs.',
    baseProbability: 0.05,
    durationMonths: [1, 6],
    impacts: [
      { type: 'extra_expense', value: 1.5 },
      { type: 'savings_change', value: -0.02 },
    ],
    ownerProbabilityMultiplier: 1.3,
    ownerExtraImpacts: [
      { type: 'extra_expense', value: 1 },
    ],
  },
  {
    id: 'ph_disaster_aid_recovery',
    name: 'Disaster Aid Recovery',
    category: 'property',
    description: 'Relief support, insurance, or family assistance offsets part of a disaster year.',
    baseProbability: 0.015,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.03 },
    ],
    isPositive: true,
  },

  // ================================================================
  // Career and income
  // ================================================================
  {
    id: 'ph_job_loss',
    name: 'Job Loss',
    category: 'career',
    description: 'A layoff, contract loss, or business closure interrupts employment.',
    baseProbability: 0.018,
    ageProbabilities: [
      { minAge: 25, maxAge: 29, probability: 0.022 },
      { minAge: 30, maxAge: 39, probability: 0.018 },
      { minAge: 40, maxAge: 49, probability: 0.016 },
      { minAge: 50, maxAge: 59, probability: 0.014 },
      { minAge: 60, maxAge: 99, probability: 0.010 },
    ],
    durationMonths: [3, 8],
    impacts: [
      { type: 'income_change', value: -0.50 },
      { type: 'extra_expense', value: 0.8 },
      { type: 'savings_change', value: -0.03 },
    ],
    correlatedWith: ['ph_underemployment_hours_cut'],
  },
  {
    id: 'ph_underemployment_hours_cut',
    name: 'Hours Cut',
    category: 'career',
    description: 'Underemployment or reduced shifts temporarily lowers take-home income.',
    baseProbability: 0.06,
    durationMonths: [3, 12],
    impacts: [
      { type: 'income_change', value: -0.15 },
    ],
  },
  {
    id: 'ph_bpo_growth_bonus',
    name: 'BPO Growth Bonus',
    category: 'career',
    description: 'IT-BPM demand creates overtime, bonuses, or a better job offer.',
    baseProbability: 0.04,
    durationMonths: [6, 12],
    impacts: [
      { type: 'income_change', value: 0.08 },
      { type: 'savings_boost', value: 0.03 },
    ],
    isPositive: true,
  },
  {
    id: 'ph_bpo_account_loss',
    name: 'BPO Account Loss',
    category: 'career',
    description: 'A client account is lost or automated, reducing hours or forcing a job search.',
    baseProbability: 0.025,
    durationMonths: [3, 9],
    impacts: [
      { type: 'income_change', value: -0.20 },
    ],
    correlatedWith: ['ph_job_loss'],
  },

  // ================================================================
  // Health
  // ================================================================
  {
    id: 'ph_medical_bill',
    name: 'Medical Bill',
    category: 'health',
    description: 'Out-of-pocket medical spending strains the annual budget.',
    baseProbability: 0.07,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.05 },
      { minAge: 35, maxAge: 44, probability: 0.06 },
      { minAge: 45, maxAge: 54, probability: 0.08 },
      { minAge: 55, maxAge: 64, probability: 0.11 },
      { minAge: 65, maxAge: 99, probability: 0.14 },
    ],
    durationMonths: [1, 3],
    impacts: [
      { type: 'extra_expense', value: 2 },
      { type: 'income_change', value: -0.03 },
    ],
  },
  {
    id: 'ph_major_illness_income_gap',
    name: 'Major Illness Income Gap',
    category: 'health',
    description: 'A serious illness causes a longer income gap and larger medical spending.',
    baseProbability: 0.006,
    ageProbabilities: [
      { minAge: 25, maxAge: 34, probability: 0.003 },
      { minAge: 35, maxAge: 44, probability: 0.005 },
      { minAge: 45, maxAge: 54, probability: 0.008 },
      { minAge: 55, maxAge: 64, probability: 0.012 },
      { minAge: 65, maxAge: 99, probability: 0.018 },
    ],
    durationMonths: [6, 36],
    impacts: [
      { type: 'income_change', value: -0.40 },
      { type: 'extra_expense', value: 5 },
      { type: 'savings_change', value: -0.08 },
    ],
  },

  // ================================================================
  // Family and remittances
  // ================================================================
  {
    id: 'ph_family_support_obligation',
    name: 'Family Support Obligation',
    category: 'family',
    description: 'A parent, sibling, or extended-family need requires extra cash support.',
    baseProbability: 0.06,
    durationMonths: [3, 12],
    impacts: [
      { type: 'extra_expense', value: 1.2 },
      { type: 'savings_change', value: -0.02 },
    ],
  },
  {
    id: 'ph_remittance_windfall',
    name: 'Remittance Windfall',
    category: 'family',
    description: 'A stronger remittance month or overseas family support boosts savings.',
    baseProbability: 0.035,
    durationMonths: [1, 1],
    impacts: [
      { type: 'savings_boost', value: 0.05 },
    ],
    isPositive: true,
  },
  {
    id: 'ph_remittance_interruption',
    name: 'Remittance Interruption',
    category: 'family',
    description: 'An overseas income source pauses or weakens, reducing household support.',
    baseProbability: 0.02,
    durationMonths: [6, 18],
    impacts: [
      { type: 'income_change', value: -0.08 },
    ],
  },
]

export const EVENT_MAP_PH = new Map(EVENT_DATABASE_PH.map(e => [e.id, e]))

export const EVENTS_BY_CATEGORY_PH = EVENT_DATABASE_PH.reduce((acc, event) => {
  if (!acc[event.category]) acc[event.category] = []
  acc[event.category].push(event)
  return acc
}, {} as Record<EventCategory, RandomEvent[]>)

export const CATEGORY_LABELS_PH: Record<EventCategory, string> = {
  market: 'Market',
  career: 'Career',
  health: 'Health',
  family: 'Family',
  property: 'Property',
  legal: 'Legal',
  immigration: 'Immigration',
}
