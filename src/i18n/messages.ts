import type { UiLanguage } from './types'

type Primitive = string | number
type Params = Record<string, Primitive>

export const messages: Record<UiLanguage, Record<string, string>> = {
  en: {
    'app.title': 'Life Simulation Game',
    'app.subtitle': 'Block Bootstrap Retirement Simulator',
    'app.language': 'Language',
    'language_name.en': 'English',
    'language_name.ja': 'Japanese',
    'language_name.zh-Hant': 'Traditional Chinese',
    'saved_records.title': 'Saved records',
    'saved_records.empty_title': 'No saved records yet',
    'saved_records.empty_body': 'Save a scenario from the control panel to reuse it later.',
    'saved_records.age_range': 'Age {currentAge} -> {retirementAge}',
    'saved_records.initial_portfolio': 'Start {value}',
    'saved_records.annual_contribution': 'Annual invest {value}',
    'saved_records.events': 'Events',
    'saved_records.housing': 'Housing',
    'saved_records.immigration': 'Immigration',
    'saved_records.success_rate': 'Success {value}',
    'saved_records.median_final': 'Median {value}',
    'saved_records.apply': 'Load record',
    'saved_records.confirm_delete': 'Delete this record',
    'saved_records.delete': 'Delete',
    'saved_records.close': 'Close',
    'saved_records.cancel': 'Cancel',
    'saved_records.count': '{count} total',
  },
  'zh-Hant': {
    'app.title': '人生模擬遊戲',
    'app.subtitle': '區塊自助法退休模擬器',
    'app.language': '語言',
    'language_name.en': 'English',
    'language_name.ja': '日本語',
    'language_name.zh-Hant': '繁體中文',
    'saved_records.title': '已儲存紀錄',
    'saved_records.empty_title': '目前沒有儲存紀錄',
    'saved_records.empty_body': '可先在控制面板儲存一組情境，之後再快速載入。',
    'saved_records.age_range': '年齡 {currentAge} -> {retirementAge}',
    'saved_records.initial_portfolio': '起始 {value}',
    'saved_records.annual_contribution': '年投資 {value}',
    'saved_records.events': '事件',
    'saved_records.housing': '住房',
    'saved_records.immigration': '移民',
    'saved_records.success_rate': '成功率 {value}',
    'saved_records.median_final': '中位數 {value}',
    'saved_records.apply': '載入紀錄',
    'saved_records.confirm_delete': '刪除此紀錄',
    'saved_records.delete': '刪除',
    'saved_records.close': '關閉',
    'saved_records.cancel': '取消',
    'saved_records.count': '共 {count} 筆',
  },
  ja: {
    'app.title': 'ライフシミュレーションゲーム',
    'app.subtitle': 'ブロック・ブートストラップ退職シミュレーター',
    'app.language': '言語',
    'language_name.en': 'English',
    'language_name.ja': '日本語',
    'language_name.zh-Hant': '繁體中文',
    'saved_records.title': '保存済みレコード',
    'saved_records.empty_title': '保存済みレコードはまだありません',
    'saved_records.empty_body': 'コントロールパネルからシナリオを保存すると、あとで再利用できます。',
    'saved_records.age_range': '年齢 {currentAge} -> {retirementAge}',
    'saved_records.initial_portfolio': '初期 {value}',
    'saved_records.annual_contribution': '年投資 {value}',
    'saved_records.events': 'イベント',
    'saved_records.housing': '住宅',
    'saved_records.immigration': '移住',
    'saved_records.success_rate': '成功率 {value}',
    'saved_records.median_final': '中央値 {value}',
    'saved_records.apply': 'レコードを読み込む',
    'saved_records.confirm_delete': 'このレコードを削除',
    'saved_records.delete': '削除',
    'saved_records.close': '閉じる',
    'saved_records.cancel': 'キャンセル',
    'saved_records.count': '{count} 件',
  },
}

export function translate(language: UiLanguage, key: string, params?: Params): string {
  const template = messages[language][key] ?? messages.en[key] ?? key
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name]
    return value == null ? `{${name}}` : String(value)
  })
}
