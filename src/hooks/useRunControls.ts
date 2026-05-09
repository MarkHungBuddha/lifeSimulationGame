import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import type { SvgIconComponent } from '@mui/icons-material'
import type { Allocation } from '../engine/simulator'
import { useI18n } from '../i18n'
import { useGameStore } from '../store/gameStore'

const ASSET_KEYS: (keyof Allocation)[] = ['sp500', 'intlStock', 'bond', 'gold', 'cash', 'reits']

function isFullAllocation(allocation: Allocation) {
  const sum = ASSET_KEYS.reduce((total, key) => total + allocation[key], 0)
  return Math.abs(sum - 1) <= 0.001
}

export function useRunControls() {
  const store = useGameStore()
  const { t } = useI18n()

  const allocationValid = isFullAllocation(store.allocation)
  const immigrationAllocationValid = isFullAllocation(store.immigrationAllocation)
  const requiresImmigrationAllocation = store.immigrationEnabled && !!store.immigrationTarget
  const hasInvalidAssumptions = !allocationValid || (requiresImmigrationAllocation && !immigrationAllocationValid)
  const isStoryMode = store.viewMode === 'story'
  const isBusy = isStoryMode ? store.isStoryRunning : store.isRunning
  const disabled = isBusy || hasInvalidAssumptions
  const progressLabel = `${(store.progress * 100).toFixed(0)}%`

  let label = isStoryMode ? t('mobile_action.generate_story') : t('mobile_action.run')
  let Icon: SvgIconComponent = isStoryMode ? AutoStoriesIcon : PlayArrowIcon

  if (isBusy) {
    label = isStoryMode
      ? t('mobile_action.generating_story')
      : t('mobile_action.running', { value: progressLabel })
    Icon = HourglassTopIcon
  }

  return {
    allocationValid,
    immigrationAllocationValid,
    hasInvalidAssumptions,
    isBusy,
    disabled,
    label,
    Icon,
    run: isStoryMode ? store.runStory : store.runSimulation,
  }
}
