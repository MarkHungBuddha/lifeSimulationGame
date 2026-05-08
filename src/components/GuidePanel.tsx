import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import BarChartIcon from '@mui/icons-material/BarChart'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import InsightsIcon from '@mui/icons-material/Insights'
import TuneIcon from '@mui/icons-material/Tune'
import { useI18n } from '../i18n'

type GuideMode = 'simulation' | 'story'

const FLOW_KEYS = ['setup', 'assumptions', 'optional_modules', 'run', 'review'] as const

export function GuidePanel({ mode }: { mode: GuideMode }) {
  const { t } = useI18n()

  const flowIcons = [
    <TuneIcon />,
    <FactCheckIcon />,
    <AccountBalanceIcon />,
    <BarChartIcon />,
    mode === 'simulation' ? <CheckCircleOutlineIcon /> : <AutoStoriesIcon />,
  ]

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
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820 }}>
              {t(`guide.${mode}.body`)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />

        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
          {t('guide.flow.title')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' },
            gap: { xs: 1, md: 1.5 },
            alignItems: 'stretch',
            mb: { xs: 2, sm: 2.5 },
          }}
        >
          {FLOW_KEYS.map((step, index) => (
            <Box
              key={step}
              sx={{
                p: { xs: 1.25, md: 1.5 },
                minHeight: { xs: 0, md: 150 },
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: index === 3 ? 'primary.main' : 'divider',
                bgcolor: index === 3 ? 'action.selected' : 'background.default',
                position: 'relative',
              }}
            >
              {index < FLOW_KEYS.length - 1 && (
                <Box
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    position: 'absolute',
                    top: 18,
                    right: -15,
                    zIndex: 1,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </Box>
              )}
              <Stack spacing={0.75} alignItems="flex-start" textAlign="left">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: index === 3 ? 'primary.contrastText' : 'primary.main',
                    bgcolor: index === 3 ? 'primary.main' : 'action.hover',
                    '& .MuiSvgIcon-root': { fontSize: 21 },
                  }}
                >
                  {flowIcons[index]}
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  {t('guide.flow.step_label', { step: index + 1 })}
                </Typography>
                <Typography variant="subtitle2" fontWeight={800}>
                  {t(`guide.flow.${step}.title.${mode}`)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {t(`guide.flow.${step}.body.${mode}`)}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}
