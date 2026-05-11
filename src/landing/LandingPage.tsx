import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UiLanguage } from '../i18n/types'
import { useI18n } from '../i18n'
import { badLuckPath, goodLuckPath, retirementAges, type RetirementAge, type SequenceKind } from './landingData'
import { landingContent } from './landingContent'
import { useActiveScene } from './useActiveScene'
import './LandingPage.css'

const languageOptions: { value: UiLanguage; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh-Hant', label: '中' },
  { value: 'ja', label: '日' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { language, setLanguage } = useI18n()
  const copy = landingContent[language]
  const [selectedAge, setSelectedAge] = useState<RetirementAge>(50)
  const [sequence, setSequence] = useState<SequenceKind>('good')
  const { activeScene, visibleScenes } = useActiveScene(5)

  useEffect(() => {
    document.title = 'Monte Carlo - Will your retirement plan survive?'
  }, [language])

  const goSimulator = (withParams: boolean) => {
    const params = withParams ? `?retireAge=${selectedAge}&lang=${language}` : ''
    navigate(`/simulator${params}`)
  }

  return (
    <main className="landingPage">
      <TopNav
        brand={copy.brand}
        skip={copy.skip}
        language={language}
        setLanguage={setLanguage}
        onSkip={() => goSimulator(false)}
      />
      <ProgressDots activeScene={activeScene} labels={copy.scenes.map((scene) => scene.label)} />

      <Scene number={1} label={copy.scenes[0].label} visible={visibleScenes.has(1)}>
        <h1 className="landingHeadline landingHeadlineHero">
          {copy.scenes[0].headline} <em>{copy.scenes[0].emphasis}</em>
        </h1>
        <p className="landingLede landingLedeLarge">{copy.scenes[0].lede}</p>
        <div className="landingHookSub">
          <span />
          {copy.hookSub}
        </div>
        <div className="landingScrollCue">{copy.scroll}</div>
      </Scene>

      <Scene number={2} label={copy.scenes[1].label} visible={visibleScenes.has(2)}>
        <h2 className="landingHeadline">
          {copy.scenes[1].headline} <em>{copy.scenes[1].emphasis}</em>
        </h2>
        <p className="landingLede">{copy.scenes[1].lede}</p>
        <AgePicker selectedAge={selectedAge} setSelectedAge={setSelectedAge} copy={copy.ageRows} />
        <p className="landingAgeCallout">{copy.ageCallout}</p>
      </Scene>

      <Scene number={3} label={copy.scenes[2].label} visible={visibleScenes.has(3)}>
        <h2 className="landingHeadline">
          {copy.scenes[2].headline} <em>{copy.scenes[2].emphasis}</em>
        </h2>
        <p className="landingLede">{copy.scenes[2].lede}</p>
        <div className="landingUncertaintyGrid">
          {copy.uncertainties.map((item) => (
            <div className="landingUncertaintyItem" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </Scene>

      <Scene number={4} label={copy.scenes[3].label} visible={visibleScenes.has(4)}>
        <h2 className="landingHeadline">
          {copy.scenes[3].headline} <em>{copy.scenes[3].emphasis}</em>
        </h2>
        <p className="landingLede">{copy.scenes[3].lede}</p>
        <FourPercentDemo
          sequence={sequence}
          setSequence={setSequence}
          copy={{
            title: copy.demoTitle,
            start: copy.demoStart,
            withdraw: copy.demoWithdraw,
            good: copy.seqGood,
            bad: copy.seqBad,
            outcomeLabel: copy.outcomeLabel,
            outcomeGood: copy.outcomeGood,
            outcomeBad: copy.outcomeBad,
          }}
        />
      </Scene>

      <Scene number={5} label={copy.scenes[4].label} visible={visibleScenes.has(5)}>
        <h2 className="landingHeadline">
          {copy.scenes[4].headline} <em>{copy.scenes[4].emphasis}</em>
        </h2>
        <p className="landingLede">{copy.scenes[4].lede}</p>
        <div className="landingMcSteps">
          {copy.mcSteps.map((step, index) => (
            <div className="landingMcStep" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <div className="landingCtaRow">
          <button className="landingPrimaryButton" type="button" onClick={() => goSimulator(true)}>
            {copy.cta}
            <span aria-hidden="true">→</span>
          </button>
          <p>{copy.ctaNote}</p>
        </div>
      </Scene>

      <footer className="landingEndNote">
        <p>{copy.end}</p>
      </footer>
    </main>
  )
}

function TopNav({ brand, skip, language, setLanguage, onSkip }: {
  brand: string
  skip: string
  language: UiLanguage
  setLanguage: (language: UiLanguage) => void
  onSkip: () => void
}) {
  return (
    <nav className="landingTopNav" aria-label="Landing navigation">
      <div className="landingBrand">{brand}<span>.</span></div>
      <div className="landingNavActions">
        <div className="landingLangSwitch" aria-label="Language">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === language ? 'active' : ''}
              onClick={() => setLanguage(option.value)}
              aria-pressed={option.value === language}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button className="landingSkipButton" type="button" onClick={onSkip}>
          {skip}<span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  )
}

function ProgressDots({ activeScene, labels }: { activeScene: number; labels: string[] }) {
  return (
    <div className="landingProgress" aria-label="Landing progress">
      {labels.map((label, index) => {
        const scene = index + 1
        return (
          <button
            key={label}
            type="button"
            className={activeScene === scene ? 'active' : ''}
            aria-label={`Go to scene ${scene}: ${label}`}
            onClick={() => document.getElementById(`landing-scene-${scene}`)?.scrollIntoView({ behavior: 'smooth' })}
          />
        )
      })}
    </div>
  )
}

function Scene({ number, label, visible, children }: {
  number: number
  label: string
  visible: boolean
  children: ReactNode
}) {
  return (
    <section
      id={`landing-scene-${number}`}
      className={`landingScene ${visible ? 'visible' : ''}`}
      data-landing-scene={number}
    >
      <div className="landingSceneInner">
        <div className="landingSceneLabel">
          <span>{String(number).padStart(2, '0')}</span> / {label}
        </div>
        {children}
      </div>
    </section>
  )
}

function AgePicker({ selectedAge, setSelectedAge, copy }: {
  selectedAge: RetirementAge
  setSelectedAge: (age: RetirementAge) => void
  copy: Record<number, string>
}) {
  return (
    <div className="landingAgePicker">
      {retirementAges.map((age) => (
        <button
          key={age}
          type="button"
          className={selectedAge === age ? 'selected' : ''}
          onClick={() => setSelectedAge(age)}
          aria-pressed={selectedAge === age}
        >
          <span className="landingAgeLabel">{age}s</span>
          <span className="landingAgeText">{copy[age]}</span>
        </button>
      ))}
    </div>
  )
}

function FourPercentDemo({ sequence, setSequence, copy }: {
  sequence: SequenceKind
  setSequence: (sequence: SequenceKind) => void
  copy: {
    title: string
    start: string
    withdraw: string
    good: string
    bad: string
    outcomeLabel: string
    outcomeGood: string
    outcomeBad: string
  }
}) {
  const path = sequence === 'good' ? goodLuckPath : badLuckPath
  const chartPath = useMemo(() => buildChartPath(path), [path])
  const finalValue = path[path.length - 1]

  return (
    <div className="landingDemo">
      <p className="landingDemoTitle">{copy.title}</p>
      <p className="landingFormula">
        {copy.start} <em>$1,000,000</em> / {copy.withdraw} <em>$40,000/yr</em>
      </p>
      <div className="landingSequenceToggle" role="tablist" aria-label="Return sequence">
        <button
          type="button"
          role="tab"
          aria-selected={sequence === 'good'}
          className={sequence === 'good' ? 'active' : ''}
          onClick={() => setSequence('good')}
        >
          {copy.good}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={sequence === 'bad'}
          className={sequence === 'bad' ? 'active' : ''}
          onClick={() => setSequence('bad')}
        >
          {copy.bad}
        </button>
      </div>
      <svg className="landingChart" viewBox="0 0 600 200" role="img" aria-label={copy.title} preserveAspectRatio="none">
        <title>{copy.title}</title>
        <desc>{sequence === 'good' ? copy.outcomeGood : copy.outcomeBad}</desc>
        <line x1="8" y1="104" x2="592" y2="104" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.35" />
        <path d={chartPath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="104" r="3" fill="currentColor" />
        <circle cx="592" cy={chartY(finalValue)} r="3" fill={finalValue === 0 ? '#c8392f' : '#2a6d3a'} />
        <text x="8" y="196">Year 0</text>
        <text x="592" y="196" textAnchor="end">Year 30</text>
      </svg>
      <p className={`landingOutcome ${sequence}`}>
        <span>{copy.outcomeLabel}</span> {sequence === 'good' ? copy.outcomeGood : copy.outcomeBad}
      </p>
    </div>
  )
}

function chartY(value: number) {
  const height = 200
  const padding = 8
  const max = 2000
  return height - padding - (value / max) * (height - padding * 2)
}

function buildChartPath(path: number[]) {
  const width = 600
  const padding = 8
  const stepX = (width - padding * 2) / (path.length - 1)

  return path.map((value, index) => {
    const x = padding + index * stepX
    const y = chartY(value)
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}
