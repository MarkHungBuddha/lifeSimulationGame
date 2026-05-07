import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BarChartIcon from '@mui/icons-material/BarChart'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import InsightsIcon from '@mui/icons-material/Insights'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import PercentIcon from '@mui/icons-material/Percent'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'
import TimelineIcon from '@mui/icons-material/Timeline'
import TuneIcon from '@mui/icons-material/Tune'
import { useI18n } from '../i18n'

type GuideMode = 'simulation' | 'story'

const TERM_KEYS = [
  'survival_rate',
  'monte_carlo',
  'block_bootstrap',
  'percentile',
  'drawdown',
  'allocation',
  'withdrawal',
] as const

export function GuidePanel({ mode }: { mode: GuideMode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useI18n()
  const device = isMobile ? 'mobile' : 'desktop'

  const stepIcons = isMobile
    ? [<MenuOpenIcon />, <TuneIcon />, mode === 'simulation' ? <BarChartIcon /> : <AutoStoriesIcon />, <PlayCircleIcon />]
    : [<TuneIcon />, <AccountBalanceIcon />, mode === 'simulation' ? <BarChartIcon /> : <AutoStoriesIcon />, <PlayCircleIcon />]

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1180, mx: 'auto' }}>
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}>
            <InsightsIcon sx={{ fontSize: { xs: 34, sm: 42 } }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" fontWeight={800}>
                {t(`guide.${mode}.title`)}
              </Typography>
              <Chip size="small" label={t(`guide.device.${device}`)} color="primary" variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820 }}>
              {t(`guide.${mode}.body`)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />

        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
          {t('guide.steps.title')}
        </Typography>
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4].map((step, index) => (
            <Grid key={step} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box
                sx={{
                  height: '100%',
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex', '& .MuiSvgIcon-root': { fontSize: 22 } }}>
                    {stepIcons[index]}
                  </Box>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {t(`guide.${device}.step${step}.title`)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t(`guide.${device}.step${step}.body.${mode}`)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <HelpOutlineIcon color="action" />
          <Typography variant="subtitle1" fontWeight={800}>
            {t('guide.terms.title')}
          </Typography>
        </Stack>
        <Grid container spacing={1.25}>
          {TERM_KEYS.map((term) => (
            <Grid key={term} size={{ xs: 12, sm: 6, lg: term === 'block_bootstrap' ? 6 : 3 }}>
              <Box sx={{ height: '100%', p: 1.25, borderLeft: '3px solid', borderColor: 'primary.main', bgcolor: 'action.hover' }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  {term === 'survival_rate' && <PercentIcon color="primary" fontSize="small" />}
                  {term === 'allocation' && <AccountBalanceIcon color="primary" fontSize="small" />}
                  {term === 'withdrawal' && <TimelineIcon color="primary" fontSize="small" />}
                  <Typography variant="body2" fontWeight={800}>
                    {t(`guide.term.${term}.title`)}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.45 }}>
                  {t(`guide.term.${term}.body`)}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}
