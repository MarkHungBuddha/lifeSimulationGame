import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BarChartIcon from '@mui/icons-material/BarChart'
import { getLifestyleDisplay } from '../i18n/lifestyles'
import { useI18n } from '../i18n'
import { LIFESTYLE_LIST, type LifestyleId } from '../engine/lifestyle'
import { LIFESTYLE_LIST_JP } from '../engine/lifestyle_jp'
import { LIFESTYLE_LIST_TW } from '../engine/lifestyle_tw'
import { getPhilippinesLifestyleList } from '../engine/lifestyle_ph'
import { FEATURE_FLAGS } from '../config/featureFlags'
import { formatSliderValue, getRegionLabel, isPhilippinesRegion, type Region } from '../config/regions'
import { useRunControls } from '../hooks/useRunControls'
import { useGameStore } from '../store/gameStore'

const REGION_OPTIONS: Region[] = ['us', 'tw', 'jp', 'ph-manila', 'ph-cebu']

function getLifestyleList(region: Region) {
  if (isPhilippinesRegion(region)) return getPhilippinesLifestyleList(region)
  if (region === 'jp') return LIFESTYLE_LIST_JP
  if (region === 'tw') return LIFESTYLE_LIST_TW
  return LIFESTYLE_LIST
}

export function MobileQuickSetup({ onAdjust }: { onAdjust: () => void }) {
  const store = useGameStore()
  const { language, t } = useI18n()
  const runControls = useRunControls()
  const lifestyleList = getLifestyleList(store.region)
  const lifestyleValue = store.lifestyleId
  const effectiveViewMode = FEATURE_FLAGS.storyMode ? store.viewMode : 'simulation'
  const selectedLifestyle = store.lifestyleId !== 'custom'
    ? getLifestyleDisplay(store.region, store.lifestyleId as Exclude<LifestyleId, 'custom'>, language)
    : null

  const handleRegionChange = (event: SelectChangeEvent<Region>) => {
    store.setRegion(event.target.value as Region)
  }

  const handleLifestyleChange = (event: SelectChangeEvent<LifestyleId>) => {
    const next = event.target.value as LifestyleId
    if (next !== 'custom') store.applyLifestyle(next)
  }

  return (
    <Box sx={{ px: 2, pt: 2, pb: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              {t('mobile_setup.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('mobile_setup.subtitle')}
            </Typography>
          </Box>

          <Grid container spacing={1}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('mobile_setup.region')}</InputLabel>
                <Select value={store.region} label={t('mobile_setup.region')} onChange={handleRegionChange}>
                  {REGION_OPTIONS.map((region) => (
                    <MenuItem key={region} value={region}>
                      {getRegionLabel(region, language)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('mobile_setup.lifestyle')}</InputLabel>
                <Select value={lifestyleValue} label={t('mobile_setup.lifestyle')} onChange={handleLifestyleChange}>
                  {store.lifestyleId === 'custom' && (
                    <MenuItem value="custom">{t('mobile_setup.custom')}</MenuItem>
                  )}
                  {lifestyleList.map((preset) => {
                    const display = getLifestyleDisplay(store.region, preset.id as Exclude<LifestyleId, 'custom'>, language)
                    return (
                      <MenuItem key={preset.id} value={preset.id}>
                        {display.name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedLifestyle && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
              {selectedLifestyle.name}: {selectedLifestyle.tagline}
            </Typography>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 1,
            }}
          >
            <SummaryItem label={t('result.annual_income')} value={formatSliderValue(store.annualIncome, store.region, language)} />
            <SummaryItem label={t('result.annual_expense')} value={formatSliderValue(store.annualExpense, store.region, language)} />
            <SummaryItem label={t('result.annual_contribution')} value={formatSliderValue(store.annualContribution, store.region, language)} />
            <SummaryItem label={t('result.retirement')} value={t('result.age_suffix', { age: store.retirementAge })} />
          </Box>

          {FEATURE_FLAGS.storyMode && (
            <ToggleButtonGroup
              fullWidth
              size="small"
              exclusive
              value={effectiveViewMode}
              onChange={(_, value) => value && store.setViewMode(value)}
            >
              <ToggleButton value="simulation">
                <BarChartIcon sx={{ mr: 0.5, fontSize: 18 }} />
                {t('mobile_setup.simulation')}
              </ToggleButton>
              <ToggleButton value="story">
                <AutoStoriesIcon sx={{ mr: 0.5, fontSize: 18 }} />
                {t('mobile_setup.story')}
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<TuneIcon />}
              onClick={onAdjust}
              sx={{ minHeight: 44, fontWeight: 700 }}
            >
              {t('mobile_setup.adjust_assumptions')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              disabled={runControls.disabled}
              startIcon={<runControls.Icon />}
              onClick={runControls.run}
              sx={{ minHeight: 44, fontWeight: 800 }}
            >
              {runControls.label}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={800} noWrap>
        {value}
      </Typography>
    </Box>
  )
}
