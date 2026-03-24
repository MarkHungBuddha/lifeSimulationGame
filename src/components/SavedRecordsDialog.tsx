import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Typography, Stack, Chip, Box, TextField,
  Tooltip, Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { useSavedRecords, type SavedRecord } from '../store/savedRecords'
import { useGameStore } from '../store/gameStore'
import { formatCurrency } from '../config/regions'

const REGION_FLAGS: Record<string, string> = { us: '🇺🇸', tw: '🇹🇼', jp: '🇯🇵' }

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

interface Props {
  open: boolean
  onClose: () => void
}

export function SavedRecordsDialog({ open, onClose }: Props) {
  const { records, deleteRecord, renameRecord } = useSavedRecords()
  const store = useGameStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const applyRecord = (record: SavedRecord) => {
    store.setRegion(record.region)
    // After setRegion resets to defaults, apply saved values
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { maxHeight: '80vh' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>儲存的紀錄</Typography>
          <Typography variant="caption" color="text.secondary">
            共 {records.length} 筆
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 0, py: 0 }}>
        {records.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">尚無儲存紀錄</Typography>
            <Typography variant="caption" color="text.secondary">
              點擊控制面板的「儲存紀錄」按鈕來保存當前設定
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
                          <TextField size="small" variant="standard" value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
                            autoFocus sx={{ flex: 1 }}
                            slotProps={{ htmlInput: { maxLength: 50 } }} />
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
                          {formatDate(record.savedAt)}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={`${REGION_FLAGS[record.region] || ''} ${record.region.toUpperCase()}`} variant="outlined" />
                          <Chip size="small" label={`${record.currentAge}→${record.retirementAge}歲`} variant="outlined" />
                          <Chip size="small" label={`起始 ${formatCurrency(record.initialPortfolio, record.region)}`} variant="outlined" />
                          <Chip size="small" label={`年投 ${formatCurrency(record.annualContribution, record.region)}`} variant="outlined" />
                          {record.enableEvents && <Chip size="small" label="隨機事件" color="warning" variant="outlined" />}
                          {record.housingEnabled && <Chip size="small" label="購屋" color="success" variant="outlined" />}
                          {record.immigrationEnabled && <Chip size="small" label="移民" color="info" variant="outlined" />}
                        </Stack>
                        {record.resultSummary && (
                          <Stack direction="row" spacing={0.5}>
                            <Chip size="small"
                              label={`成功率 ${(record.resultSummary.successRate * 100).toFixed(0)}%`}
                              color={record.resultSummary.successRate >= 0.8 ? 'success' : record.resultSummary.successRate >= 0.5 ? 'warning' : 'error'}
                              variant="filled" />
                            <Chip size="small"
                              label={`中位數 ${formatCurrency(record.resultSummary.medianFinalPortfolio, record.region)}`}
                              variant="outlined" />
                          </Stack>
                        )}
                      </Stack>
                    }
                  />
                  <ListItemSecondaryAction sx={{ top: '50%' }}>
                    <Stack spacing={0.5}>
                      <Tooltip title="套用此紀錄">
                        <IconButton color="primary" onClick={() => applyRecord(record)}>
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                      {confirmDeleteId === record.id ? (
                        <Stack direction="row" spacing={0}>
                          <Tooltip title="確認刪除">
                            <IconButton color="error" size="small"
                              onClick={() => { deleteRecord(record.id); setConfirmDeleteId(null) }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="取消">
                            <IconButton size="small" onClick={() => setConfirmDeleteId(null)}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Tooltip title="刪除">
                          <IconButton size="small" sx={{ opacity: 0.4 }}
                            onClick={() => setConfirmDeleteId(record.id)}>
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
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>
    </Dialog>
  )
}
