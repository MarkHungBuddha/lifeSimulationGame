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
import { useSavedRecords, type SavedRecord } from '../store/savedRecords'
import { useGameStore } from '../store/gameStore'
import { formatCurrency, getRegionFlag } from '../config/regions'
import { useI18n } from '../i18n'
import type { UiLanguage } from '../i18n/types'

const COPY: Record<UiLanguage, {
  title: string
  emptyTitle: string
  emptyBody: string
  ageRange: (currentAge: number, retirementAge: number) => string
  initialPortfolio: (value: string) => string
  annualContribution: (value: string) => string
  events: string
  housing: string
  immigration: string
  successRate: (value: string) => string
  medianFinal: (value: string) => string
  apply: string
  confirmDelete: string
  delete: string
  close: string
  cancel: string
  count: (count: number) => string
}> = {
  en: {
    title: 'Saved records',
    emptyTitle: 'No saved records yet',
    emptyBody: 'Save a scenario from the control panel to reuse it later.',
    ageRange: (currentAge, retirementAge) => `Age ${currentAge} -> ${retirementAge}`,
    initialPortfolio: (value) => `Start ${value}`,
    annualContribution: (value) => `Annual invest ${value}`,
    events: 'Events',
    housing: 'Housing',
    immigration: 'Immigration',
    successRate: (value) => `Success ${value}`,
    medianFinal: (value) => `Median ${value}`,
    apply: 'Load record',
    confirmDelete: 'Delete this record',
    delete: 'Delete',
    close: 'Close',
    cancel: 'Cancel',
    count: (count) => `${count} total`,
  },
  zh: {
    title: '已儲存紀錄',
    emptyTitle: '目前沒有儲存紀錄',
    emptyBody: '可先在控制面板儲存一組情境，之後再快速載入。',
    ageRange: (currentAge, retirementAge) => `年齡 ${currentAge} -> ${retirementAge}`,
    initialPortfolio: (value) => `起始 ${value}`,
    annualContribution: (value) => `年投資 ${value}`,
    events: '事件',
    housing: '住房',
    immigration: '移民',
    successRate: (value) => `成功率 ${value}`,
    medianFinal: (value) => `中位數 ${value}`,
    apply: '載入紀錄',
    confirmDelete: '刪除此紀錄',
    delete: '刪除',
    close: '關閉',
    cancel: '取消',
    count: (count) => `共 ${count} 筆`,
  },
  ja: {
    title: '保存済みレコード',
    emptyTitle: '保存済みレコードはまだありません',
    emptyBody: 'コントロールパネルからシナリオを保存すると、あとで再利用できます。',
    ageRange: (currentAge, retirementAge) => `年齢 ${currentAge} -> ${retirementAge}`,
    initialPortfolio: (value) => `初期 ${value}`,
    annualContribution: (value) => `年投資 ${value}`,
    events: 'イベント',
    housing: '住宅',
    immigration: '移住',
    successRate: (value) => `成功率 ${value}`,
    medianFinal: (value) => `中央値 ${value}`,
    apply: 'レコードを読み込む',
    confirmDelete: 'このレコードを削除',
    delete: '削除',
    close: '閉じる',
    cancel: 'キャンセル',
    count: (count) => `${count} 件`,
  },
}

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
  const { language, locale } = useI18n()
  const copy = COPY[language]
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
          <Typography variant="h6" fontWeight={700}>{copy.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {copy.count(records.length)}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 0, py: 0 }}>
        {records.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">{copy.emptyTitle}</Typography>
            <Typography variant="caption" color="text.secondary">
              {copy.emptyBody}
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
                          <Chip size="small" label={copy.ageRange(record.currentAge, record.retirementAge)} variant="outlined" />
                          <Chip size="small" label={copy.initialPortfolio(formatCurrency(record.initialPortfolio, record.region, language))} variant="outlined" />
                          <Chip size="small" label={copy.annualContribution(formatCurrency(record.annualContribution, record.region, language))} variant="outlined" />
                          {record.enableEvents && <Chip size="small" label={copy.events} color="warning" variant="outlined" />}
                          {record.housingEnabled && <Chip size="small" label={copy.housing} color="success" variant="outlined" />}
                          {record.immigrationEnabled && <Chip size="small" label={copy.immigration} color="info" variant="outlined" />}
                        </Stack>
                        {record.resultSummary && (
                          <Stack direction="row" spacing={0.5}>
                            <Chip
                              size="small"
                              label={copy.successRate(`${(record.resultSummary.successRate * 100).toFixed(0)}%`)}
                              color={record.resultSummary.successRate >= 0.8 ? 'success' : record.resultSummary.successRate >= 0.5 ? 'warning' : 'error'}
                              variant="filled"
                            />
                            <Chip
                              size="small"
                              label={copy.medianFinal(formatCurrency(record.resultSummary.medianFinalPortfolio, record.region, language))}
                              variant="outlined"
                            />
                          </Stack>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction sx={{ top: '50%' }}>
                    <Stack spacing={0.5}>
                      <Tooltip title={copy.apply}>
                        <IconButton color="primary" onClick={() => applyRecord(record)}>
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                      {confirmDeleteId === record.id ? (
                        <Stack direction="row" spacing={0}>
                          <Tooltip title={copy.confirmDelete}>
                            <IconButton color="error" size="small" onClick={() => { deleteRecord(record.id); setConfirmDeleteId(null) }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={copy.cancel}>
                            <IconButton size="small" onClick={() => setConfirmDeleteId(null)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Tooltip title={copy.delete}>
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
        <Button onClick={onClose}>{copy.close}</Button>
      </DialogActions>
    </Dialog>
  )
}
