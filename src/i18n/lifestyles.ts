import type { Region } from '../config/regions'
import type { UiLanguage } from './types'
import type { LifestyleId } from '../engine/lifestyle'

export interface LifestyleDisplay {
  emoji: string
  name: string
  tagline: string
  description: string
}

type LifestyleKey = Exclude<LifestyleId, 'custom'>

type LifestyleDisplayMap = Record<UiLanguage, Record<Region, Record<LifestyleKey, LifestyleDisplay>>>

const displays: LifestyleDisplayMap = {
  en: {
    us: {
      frugal: { emoji: '🌱', name: 'Frugal', tagline: 'Lean baseline', description: 'Low-cost U.S. lifestyle focused on aggressive savings and early resilience.' },
      moderate: { emoji: '💼', name: 'Moderate', tagline: 'Balanced baseline', description: 'Middle-of-the-road U.S. setup with stable spending and sustainable investing.' },
      comfortable: { emoji: '🏡', name: 'Comfortable', tagline: 'Room to breathe', description: 'Higher-spend U.S. household with more comfort, more housing cost, and slower accumulation.' },
      lavish: { emoji: '✨', name: 'Lavish', tagline: 'High-spend lifestyle', description: 'Premium U.S. lifestyle with strong income but limited savings headroom.' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'Early exit, low burn', description: 'Aggressive U.S. savings path aiming for early retirement on a lean budget.' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: 'Early exit, wide margin', description: 'High-income U.S. accumulation path targeting early retirement with extra comfort.' },
    },
    tw: {
      frugal: { emoji: '🌱', name: 'Frugal', tagline: 'Lean Taiwan budget', description: 'Entry-level Taiwan setup with tight spending discipline and steady savings.' },
      moderate: { emoji: '💼', name: 'Moderate', tagline: 'Taiwan baseline', description: 'Balanced Taiwan preset built around mainstream urban income and expenses.' },
      comfortable: { emoji: '🏡', name: 'Comfortable', tagline: 'Comfort-focused track', description: 'Upper-middle Taiwan lifestyle with higher comfort and slower but still healthy accumulation.' },
      lavish: { emoji: '✨', name: 'Lavish', tagline: 'Premium city lifestyle', description: 'High-spend Taiwan lifestyle with premium housing and limited savings slack.' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'Minimalist early exit', description: 'Taiwan early-retirement path built on a low expense base and very high savings rate.' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: 'Early exit with cushion', description: 'High-income Taiwan track aimed at retiring early without giving up comfort.' },
    },
    jp: {
      frugal: { emoji: '🌱', name: 'Frugal', tagline: 'Lean Japan budget', description: 'Conservative Japan lifestyle with modest spending and dependable savings.' },
      moderate: { emoji: '💼', name: 'Moderate', tagline: 'Japan baseline', description: 'Balanced Japan preset with mainstream urban compensation and retirement pacing.' },
      comfortable: { emoji: '🏡', name: 'Comfortable', tagline: 'Stable comfort track', description: 'Comfortable Japan lifestyle with higher living costs and slower accumulation.' },
      lavish: { emoji: '✨', name: 'Lavish', tagline: 'High-spend metro core', description: 'Premium Japan lifestyle centered on major-city costs and prestige spending.' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'Minimalist early exit', description: 'Japan early-retirement path built around disciplined spending and heavy investing.' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: 'Well-funded early exit', description: 'High-income Japan strategy for early retirement with a larger lifestyle buffer.' },
    },
    'ph-manila': {
      frugal: { emoji: '🌱', name: 'Frugal', tagline: 'Lean city budget', description: 'Entry-level Manila setup with tight rent control and modest savings.' },
      moderate: { emoji: '💼', name: 'Moderate', tagline: 'Manila baseline', description: 'Balanced Manila preset aligned with the researched MVP defaults.' },
      comfortable: { emoji: '🏙️', name: 'Comfortable', tagline: 'Urban professional track', description: 'Professional Manila household with higher rent tolerance and steady accumulation.' },
      lavish: { emoji: '✨', name: 'Lavish', tagline: 'High-spend city core', description: 'Central Manila high-spend lifestyle with limited savings headroom.' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'Early exit, low burn', description: 'Aggressive Manila savings path aimed at early retirement on a lean budget.' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: 'Early exit, wide margin', description: 'High-income Manila accumulation path targeting an early but comfortable retirement.' },
    },
    'ph-cebu': {
      frugal: { emoji: '🌱', name: 'Frugal', tagline: 'Lean regional budget', description: 'Lower-cost Cebu setup with conservative spending and small but steady savings.' },
      moderate: { emoji: '💼', name: 'Moderate', tagline: 'Cebu baseline', description: 'Balanced Cebu preset aligned with the researched MVP defaults.' },
      comfortable: { emoji: '🌊', name: 'Comfortable', tagline: 'Regional growth track', description: 'Upper-middle Cebu lifestyle with better savings leverage than Manila.' },
      lavish: { emoji: '✨', name: 'Lavish', tagline: 'High-spend regional core', description: 'Premium Cebu lifestyle with central-city housing costs and thinner savings.' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'Early exit, low burn', description: 'Cebu early-retirement path built around a lower long-run expense base.' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: 'Early exit, wide margin', description: 'High-income Cebu path aimed at retiring early with a larger comfort buffer.' },
    },
  },
  'zh-Hant': {
    us: {
      frugal: { emoji: '🌱', name: '節省型', tagline: '精簡基線', description: '低成本美國生活型態，重點放在高儲蓄率與提早建立安全邊際。' },
      moderate: { emoji: '💼', name: '均衡型', tagline: '平衡基線', description: '典型美國中產設定，支出與投資節奏較均衡。' },
      comfortable: { emoji: '🏡', name: '舒適型', tagline: '留有餘裕', description: '生活舒適度更高，但住房與日常支出也會拖慢資產累積。' },
      lavish: { emoji: '✨', name: '豪華型', tagline: '高消費生活', description: '高收入但高消費的美國生活型態，存錢空間有限。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '低支出提早退休', description: '以極高儲蓄率換取提早退休，退休後維持精簡生活。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '有餘裕的提早退休', description: '高收入高累積路線，希望提早退休且保有舒適生活。' },
    },
    tw: {
      frugal: { emoji: '🌱', name: '節省型', tagline: '精簡台灣預算', description: '台灣入門級低支出生活，重視紀律與穩定儲蓄。' },
      moderate: { emoji: '💼', name: '均衡型', tagline: '台灣基線', description: '以台灣主流都會收入與支出水準建立的平衡型預設。' },
      comfortable: { emoji: '🏡', name: '舒適型', tagline: '重視生活品質', description: '更舒適的台灣生活模式，花費較高，但仍保有穩健累積能力。' },
      lavish: { emoji: '✨', name: '豪華型', tagline: '高消費都會生活', description: '高消費與高品質生活並存，儲蓄空間相對有限。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '極簡提早退休', description: '以低開銷與高儲蓄率為核心，目標是盡早退休。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '舒適提早退休', description: '高收入高累積路線，希望在提早退休時仍保有明顯餘裕。' },
    },
    jp: {
      frugal: { emoji: '🌱', name: '節省型', tagline: '精簡日本預算', description: '偏保守的日本生活型態，支出控制嚴格、儲蓄穩定。' },
      moderate: { emoji: '💼', name: '均衡型', tagline: '日本基線', description: '以日本都會白領為參考的平衡型預設。' },
      comfortable: { emoji: '🏡', name: '舒適型', tagline: '穩定舒適路線', description: '更重視居住與生活品質，因此累積速度會較慢。' },
      lavish: { emoji: '✨', name: '豪華型', tagline: '高消費都心生活', description: '以大城市高消費生活為中心，支出壓力也同步提升。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '極簡提早退休', description: '透過節制支出與高投入資產配置，追求提早退休。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '寬鬆提早退休', description: '高收入與高累積並行，希望提早退休時仍有舒適安全邊際。' },
    },
    'ph-manila': {
      frugal: { emoji: '🌱', name: '節省型', tagline: '精簡都會預算', description: '馬尼拉入門生活設定，重視租金控制與基本儲蓄。' },
      moderate: { emoji: '💼', name: '均衡型', tagline: '馬尼拉基線', description: '以研究預設為基礎的馬尼拉平衡型生活。' },
      comfortable: { emoji: '🏙️', name: '舒適型', tagline: '都會專業路線', description: '專業人士的馬尼拉生活，房租容忍度更高，累積較穩定。' },
      lavish: { emoji: '✨', name: '豪華型', tagline: '高消費市中心', description: '馬尼拉市中心高消費生活，儲蓄緩衝空間較小。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '低燃耗提早退休', description: '以積極儲蓄換取提早退休，退休後維持精簡預算。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '寬鬆提早退休', description: '高收入高累積路線，目標是在馬尼拉提早且舒適地退休。' },
    },
    'ph-cebu': {
      frugal: { emoji: '🌱', name: '節省型', tagline: '精簡區域預算', description: '宿霧低成本生活設定，以保守支出與穩定儲蓄為主。' },
      moderate: { emoji: '💼', name: '均衡型', tagline: '宿霧基線', description: '以研究預設為基礎的宿霧平衡型生活。' },
      comfortable: { emoji: '🌊', name: '舒適型', tagline: '區域成長路線', description: '宿霧中上階層生活，通常比馬尼拉更容易累積資產。' },
      lavish: { emoji: '✨', name: '豪華型', tagline: '高消費核心區', description: '高品質宿霧生活，但中央區域住房成本明顯提高。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '低燃耗提早退休', description: '利用較低長期開銷，打造宿霧版本的提早退休路線。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '寬鬆提早退休', description: '高收入宿霧路線，目標是在提早退休時仍保有舒適餘裕。' },
    },
  },
  ja: {
    us: {
      frugal: { emoji: '🌱', name: '倹約型', tagline: 'ミニマム基準', description: '米国で支出をかなり抑え、早い段階から高い貯蓄率を狙う設定です。' },
      moderate: { emoji: '💼', name: 'バランス型', tagline: '標準ベース', description: '米国の標準的な中間層を意識した、支出と投資のバランス型です。' },
      comfortable: { emoji: '🏡', name: '快適型', tagline: '余裕ある暮らし', description: '住居や日常生活の快適さを優先する分、資産形成の速度はやや落ちます。' },
      lavish: { emoji: '✨', name: '贅沢型', tagline: '高消費ライフ', description: '高収入だが高支出でもある、余白の少ないプレミアム生活です。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '低支出で早期離脱', description: '極めて高い貯蓄率で早期退職を目指し、退職後は引き締まった生活を維持します。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '余裕ある早期退職', description: '高収入を活かして早期退職しつつ、退職後も快適さを保つ路線です。' },
    },
    tw: {
      frugal: { emoji: '🌱', name: '倹約型', tagline: '台湾ミニマム予算', description: '台湾で支出を抑え、規律ある家計管理を重視する設定です。' },
      moderate: { emoji: '💼', name: 'バランス型', tagline: '台湾ベースライン', description: '台湾の都市部を想定した、標準的で扱いやすいバランス型です。' },
      comfortable: { emoji: '🏡', name: '快適型', tagline: '生活品質重視', description: 'より快適な暮らしを優先する一方、資産形成の伸びはやや緩やかになります。' },
      lavish: { emoji: '✨', name: '贅沢型', tagline: '都市型ハイコスト', description: '高消費の都市生活で、貯蓄余力は相対的に小さくなります。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'ミニマル早期退職', description: '低コスト生活と高い貯蓄率で早期退職を目指す台湾向けルートです。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '快適な早期退職', description: '高収入を土台に、余裕を保ったまま早期退職を狙う設定です。' },
    },
    jp: {
      frugal: { emoji: '🌱', name: '倹約型', tagline: '日本ミニマム予算', description: '日本で保守的に暮らし、安定した貯蓄を積み上げる設定です。' },
      moderate: { emoji: '💼', name: 'バランス型', tagline: '日本ベースライン', description: '日本の都市部ホワイトカラーを想定した標準的なバランス型です。' },
      comfortable: { emoji: '🏡', name: '快適型', tagline: '安定した快適路線', description: '生活の快適さを優先する分、資産形成ペースは少し落ちます。' },
      lavish: { emoji: '✨', name: '贅沢型', tagline: '都心ハイコスト', description: '大都市の高コスト生活を反映した、支出の重いライフスタイルです。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: 'ミニマル早期退職', description: '支出を抑えつつ資産投入を強め、早期退職を目指す日本向け路線です。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '余裕ある早期退職', description: '高収入と高蓄積を前提に、余裕のある早期退職を目指します。' },
    },
    'ph-manila': {
      frugal: { emoji: '🌱', name: '倹約型', tagline: '都心ミニマム予算', description: 'マニラで家賃を抑えつつ、最低限の生活と小さな貯蓄を維持する設定です。' },
      moderate: { emoji: '💼', name: 'バランス型', tagline: 'マニラ基準', description: '調査ベースのデフォルトに合わせた、マニラ向けバランス型です。' },
      comfortable: { emoji: '🏙️', name: '快適型', tagline: '都市プロフェッショナル', description: '専門職世帯を意識したマニラ生活で、家賃は高めだが貯蓄も安定します。' },
      lavish: { emoji: '✨', name: '贅沢型', tagline: '高消費シティコア', description: 'マニラ中心部の高支出生活で、貯蓄余力はかなり薄くなります。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '低燃費の早期離脱', description: '高い貯蓄率でマニラから早期退職を狙う、引き締まったFIRE設定です。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '余裕ある早期離脱', description: '高収入を前提に、快適さを保ったまま早期退職を目指す路線です。' },
    },
    'ph-cebu': {
      frugal: { emoji: '🌱', name: '倹約型', tagline: '地方ミニマム予算', description: 'セブの低コスト環境を活かし、保守的に支出を管理する設定です。' },
      moderate: { emoji: '💼', name: 'バランス型', tagline: 'セブ基準', description: '調査ベースのデフォルトに沿った、セブ向け標準設定です。' },
      comfortable: { emoji: '🌊', name: '快適型', tagline: '地方成長トラック', description: 'マニラより資産を積みやすい、上位中間層向けのセブ生活です。' },
      lavish: { emoji: '✨', name: '贅沢型', tagline: '高消費コア生活', description: '中心部の住居費を伴う、プレミアムなセブ生活を反映しています。' },
      fire_lean: { emoji: '🔥', name: 'Lean FIRE', tagline: '低燃費の早期離脱', description: '低い長期支出を活かして早期退職を狙うセブルートです。' },
      fire_fat: { emoji: '🚀', name: 'Fat FIRE', tagline: '余裕ある早期離脱', description: '高収入を土台に、快適さを維持したまま早期退職を目指します。' },
    },
  },
}

export function getLifestyleDisplay(region: Region, id: LifestyleKey, language: UiLanguage): LifestyleDisplay {
  return displays[language][region][id]
}
