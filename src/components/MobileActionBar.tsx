import {
  Box,
  Button,
  Paper,
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import { useI18n } from '../i18n'
import { useRunControls } from '../hooks/useRunControls'

export function MobileActionBar({ onAdjust }: { onAdjust: () => void }) {
  const { t } = useI18n()
  const runControls = useRunControls()

  return (
    <Paper
      elevation={8}
      square
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        px: 1.5,
        pt: 1,
        pb: 'calc(8px + env(safe-area-inset-bottom))',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.35fr)', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={onAdjust}
          sx={{ minHeight: 46, fontWeight: 700 }}
        >
          {t('mobile_action.adjust')}
        </Button>
        <Button
          variant="contained"
          disabled={runControls.disabled}
          startIcon={<runControls.Icon />}
          onClick={runControls.run}
          sx={{ minHeight: 46, fontWeight: 800 }}
        >
          {runControls.label}
        </Button>
      </Box>
    </Paper>
  )
}
