import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { formatCurrency, getRegionFlag } from '../config/regions'
import { useI18n } from '../i18n'
import { useGameStore } from '../store/gameStore'
import { useSavedRecords, type SavedRecord } from '../store/savedRecords'

function formatDate(ts: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

interface Props {
  open: boolean
  onClose: () => void
}

export function SavedRecordsDialog({ open, onClose }: Props) {
  const { records, deleteRecord, renameRecord } = useSavedRecords()
  const store = useGameStore()
  const { language, locale, t } = useI18n()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const applyRecord = (record: SavedRecord) => {
    store.setRegion(record.region)
    setTimeout(() => {
      useGameStore.setState({
        lifestyleId: record.lifestyleId,
        annualIncome: record.annualIncome,
        annualExpense: record.annualExpense,
        currentAge: record.currentAge,
        retirementAge: record.retirementAge,
        endAge: record.endAge,
        initialPortfolio: record.initialPortfolio,
        annualContribution: record.annualContribution,
        allocation: { ...record.allocation },
        withdrawal: record.withdrawal,
        numPaths: record.numPaths,
        enableEvents: record.enableEvents,
        immigrationEnabled: record.immigrationEnabled,
        immigrationTarget: record.immigrationTarget,
        immigrationAge: record.immigrationAge,
        immigrationAllocation: { ...record.immigrationAllocation },
        housingEnabled: record.housingEnabled,
        housingPurchaseAge: record.housingPurchaseAge,
        housingPriceToIncomeRatio: record.housingPriceToIncomeRatio,
        housingDownPaymentRatio: record.housingDownPaymentRatio,
        housingMortgageYears: record.housingMortgageYears,
        result: null,
        storyResult: null,
      })
    }, 0)
    onClose()
  }

  const startRename = (record: SavedRecord) => {
    setEditingId(record.id)
    setEditName(record.name)
  }

  const commitRename = () => {
    if (editingId && editName.trim()) {
      renameRecord(editingId, editName.trim())
    }
    setEditingId(null)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '80vh' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>{t('saved_records.title')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('saved_records.count', { count: records.length })}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 0, py: 0 }}>
        {records.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('saved_records.empty_title')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('saved_records.empty_body')}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {records.map((record, idx) => (
              <Box key={record.id}>
                {idx > 0 && <Divider />}
                <ListItem sx={{ py: 1.5, px: 2, alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      editingId === record.id ? (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <TextField
                            size="small"
                            variant="standard"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename()
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            autoFocus
                            sx={{ flex: 1 }}
                            slotProps={{ htmlInput: { maxLength: 50 } }}
                          />
                          <IconButton size="small" onClick={commitRename}><CheckIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => setEditingId(null)}><CloseIcon fontSize="small" /></IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1" fontWeight={700} noWrap sx={{ maxWidth: 200 }}>
                            {record.name}
                          </Typography>
                          <IconButton size="small" onClick={() => startRename(record)} sx={{ opacity: 0.5 }}>
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Stack>
                      )
                    }
                    secondary={
                      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(record.savedAt, locale)}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={`${getRegionFlag(record.region)} ${record.region.toUpperCase()}`} variant="outlined" />
                          <Chip size="small" label={t('saved_records.age_range', { currentAge: record.currentAge, retirementAge: record.retirementAge })} variant="outlined" />
                          <Chip size="small" label={t('saved_records.initial_portfolio', { value: formatCurrency(record.initialPortfolio, record.region, language) })} variant="outlined" />
                          <Chip size="small" label={t('saved_records.annual_contribution', { value: formatCurrency(record.annualContribution, record.region, language) })} variant="outlined" />
                          {record.enableEvents && <Chip size="small" label={t('saved_records.events')} color="warning" variant="outlined" />}
                          {record.housingEnabled && <Chip size="small" label={t('saved_records.housing')} color="success" variant="outlined" />}
                          {record.immigrationEnabled && <Chip size="small" label={t('saved_records.immigration')} color="info" variant="outlined" />}
                        </Stack>
                        {record.resultSummary && (
                          <Stack direction="row" spacing={0.5}>
                            <Chip
                              size="small"
                              label={t('saved_records.success_rate', { value: `${(record.resultSummary.successRate * 100).toFixed(0)}%` })}
                              color={record.resultSummary.successRate >= 0.8 ? 'success' : record.resultSummary.successRate >= 0.5 ? 'warning' : 'error'}
                              variant="filled"
                            />
                            <Chip
                              size="small"
                              label={t('saved_records.median_final', { value: formatCurrency(record.resultSummary.medianFinalPortfolio, record.region, language) })}
                              variant="outlined"
                            />
                          </Stack>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction sx={{ top: '50%' }}>
                    <Stack spacing={0.5}>
                      <Tooltip title={t('saved_records.apply')}>
                        <IconButton color="primary" onClick={() => applyRecord(record)}>
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                      {confirmDeleteId === record.id ? (
                        <Stack direction="row" spacing={0}>
                          <Tooltip title={t('saved_records.confirm_delete')}>
                            <IconButton color="error" size="small" onClick={() => { deleteRecord(record.id); setConfirmDeleteId(null) }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('saved_records.cancel')}>
                            <IconButton size="small" onClick={() => setConfirmDeleteId(null)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Tooltip title={t('saved_records.delete')}>
                          <IconButton size="small" sx={{ opacity: 0.4 }} onClick={() => setConfirmDeleteId(record.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('saved_records.close')}</Button>
      </DialogActions>
    </Dialog>
  )
}
