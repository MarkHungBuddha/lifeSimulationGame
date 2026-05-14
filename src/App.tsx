import { Navigate, Route, Routes } from 'react-router-dom'
import { CompoundInterestCalculator } from './calculators/CompoundInterestCalculator'
import { LandingPage } from './landing/LandingPage'
import { SimulatorApp } from './SimulatorApp'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulator" element={<SimulatorApp />} />
      <Route path="/compound-interest-calculator" element={<CompoundInterestCalculator />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
