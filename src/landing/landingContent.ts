import type { UiLanguage } from '../i18n/types'

export interface LandingCopy {
  skip: string
  scroll: string
  brand: string
  scenes: {
    label: string
    headline: string
    emphasis: string
    lede: string
  }[]
  hookSub: string
  ageRows: Record<number, string>
  ageCallout: string
  uncertainties: { question: string; answer: string }[]
  demoTitle: string
  demoStart: string
  demoWithdraw: string
  seqGood: string
  seqBad: string
  outcomeLabel: string
  outcomeGood: string
  outcomeBad: string
  mcSteps: string[]
  cta: string
  ctaNote: string
  end: string
}

export const landingContent: Record<UiLanguage, LandingCopy> = {
  en: {
    brand: 'Monte Carlo',
    skip: 'Skip to simulator',
    scroll: 'Scroll',
    scenes: [
      {
        label: 'The question',
        headline: 'Do you want to retire',
        emphasis: 'tomorrow?',
        lede: 'Most people answer yes. Almost no one is ready. This is a 90-second walk through the math of why, and what to do about it.',
      },
      {
        label: 'The dream and the deadline',
        headline: 'Imagine your',
        emphasis: 'last day of work.',
        lede: 'A farm. A village you built. A passport with no stamps left to collect. Every version of an ideal retirement costs money. The earlier you stop earning, the more you need.',
      },
      {
        label: "What you can't know",
        headline: 'Income stops.',
        emphasis: "Expenses don't.",
        lede: 'A retirement plan is a 30+ year bet against four unknowns. Any one of them, wrong by a little, breaks the plan.',
      },
      {
        label: "Why one number isn't enough",
        headline: 'The 4% rule is a starting point.',
        emphasis: 'Not a plan.',
        lede: 'Spend 4% per year, the rule says. Simple. But the same money can survive for decades or run out early depending on the order returns arrive in.',
      },
      {
        label: 'The honest answer',
        headline: "Don't predict one future.",
        emphasis: 'Test thousands.',
        lede: "Monte Carlo simulation runs your plan through booms, crashes, stagnation, and inflation shocks. It does not tell you what will happen. It tells you how often your plan survives.",
      },
    ],
    hookSub: '5 scenes / 90 seconds / then you simulate',
    ageRows: {
      30: 'If you spend $40K/yr, you need about $1.6M and the money has to last 60+ years.',
      40: 'About $1.2M, lasting 50 years.',
      50: 'About $1.0M, lasting 40 years.',
      60: 'About $800K, lasting 30 years.',
      70: 'About $600K, lasting 20 years.',
    },
    ageCallout: 'The earlier you stop, the bigger the number, and the longer it has to survive.',
    uncertainties: [
      { question: 'How long will you live?', answer: 'Could be 75. Could be 100.' },
      { question: 'How much will prices rise?', answer: '2% per year? 6%? It compounds.' },
      { question: 'How will markets behave?', answer: 'Bull, bear, lost decade. Order matters.' },
      { question: 'How will your life change?', answer: 'Health, family, taste. All moving.' },
    ],
    demoTitle: 'Same money. Same withdrawal. Different luck.',
    demoStart: 'Start with',
    demoWithdraw: 'withdraw',
    seqGood: 'Good luck',
    seqBad: 'Bad luck',
    outcomeLabel: 'Outcome:',
    outcomeGood: 'Still has $1.4M after 30 years',
    outcomeBad: 'Bankrupt in year 18',
    mcSteps: [
      'Set your plan: age, savings, withdrawal.',
      'Run 10,000 paths through real market history.',
      'Read survival rate, then adjust the plan.',
    ],
    cta: 'Run your simulation',
    ctaNote: 'Free / No signup / Your data stays in your browser',
    end: 'There is no plan that lets you retire tomorrow. But if you start preparing today, it might come sooner than you think.',
  },
  'zh-Hant': {
    brand: 'Monte Carlo',
    skip: '直接進入模擬器',
    scroll: '向下滾動',
    scenes: [
      {
        label: '問題',
        headline: '你想',
        emphasis: '明天就退休嗎？',
        lede: '大多數人會回答想。但幾乎沒人準備好。接下來 90 秒，我們用數字看清楚原因，以及該怎麼準備。',
      },
      {
        label: '夢想與期限',
        headline: '想像你工作的',
        emphasis: '最後一天。',
        lede: '一座農場。一個你打造的村莊。一本蓋滿章的護照。每一種理想退休都需要錢。越早停止賺錢，需要的本金越高。',
      },
      {
        label: '你無法知道的事',
        headline: '收入會停。',
        emphasis: '支出不會。',
        lede: '退休計畫是一場跟四個未知數的 30 年以上賭局。任何一項只要差一點，整個計畫都可能失效。',
      },
      {
        label: '為什麼一個數字不夠',
        headline: '4% 法則是起點。',
        emphasis: '不是計畫。',
        lede: '規則說每年提領 4%。聽起來簡單。但同樣一筆錢，可能撐幾十年，也可能很早見底，關鍵在報酬出現的順序。',
      },
      {
        label: '誠實的答案',
        headline: '別預測一個未來。',
        emphasis: '測試幾千個。',
        lede: '蒙地卡羅模擬會把你的計畫放進榮景、崩盤、停滯、通膨衝擊。它不告訴你會發生什麼，而是告訴你計畫有多常能存活。',
      },
    ],
    hookSub: '5 個場景 / 90 秒 / 然後開始模擬',
    ageRows: {
      30: '如果每年花 $40K，你需要約 $1.6M，而且要撐 60 年以上。',
      40: '約 $1.2M，要撐 50 年。',
      50: '約 $1.0M，要撐 40 年。',
      60: '約 $800K，要撐 30 年。',
      70: '約 $600K，要撐 20 年。',
    },
    ageCallout: '越早退休，數字越大，而且要撐越久。',
    uncertainties: [
      { question: '你會活多久？', answer: '可能 75。也可能 100。' },
      { question: '物價會漲多少？', answer: '每年 2%？6%？會複利累積。' },
      { question: '市場會怎麼走？', answer: '牛市、熊市、失落十年。順序很重要。' },
      { question: '你的人生會怎麼變？', answer: '健康、家庭、品味，都會變。' },
    ],
    demoTitle: '一樣的本金。一樣的提領。不一樣的運氣。',
    demoStart: '從',
    demoWithdraw: '每年提領',
    seqGood: '好運氣',
    seqBad: '壞運氣',
    outcomeLabel: '結果：',
    outcomeGood: '30 年後還剩 $1.4M',
    outcomeBad: '第 18 年破產',
    mcSteps: [
      '設定你的計畫：年齡、存款、提領。',
      '用真實市場資料跑 10,000 條路徑。',
      '看存活率，然後調整計畫。',
    ],
    cta: '開始模擬',
    ctaNote: '免費 / 免註冊 / 資料只留在你的瀏覽器',
    end: '沒有計畫可以讓你明天就退休。但如果你今天開始準備，那一天可能比你想的更早。',
  },
  ja: {
    brand: 'Monte Carlo',
    skip: 'シミュレーターへ',
    scroll: 'スクロール',
    scenes: [
      {
        label: '問い',
        headline: '',
        emphasis: '明日、退職したいですか？',
        lede: '多くの人は「はい」と答えます。しかし準備できている人はほとんどいません。90秒で、その理由と対策を数字で見ていきます。',
      },
      {
        label: '夢と期限',
        headline: '仕事の',
        emphasis: '最終日を想像してください。',
        lede: '農場。自分で築いた村。スタンプでいっぱいのパスポート。理想の退職生活にはお金が必要です。早く収入を止めるほど、必要額は大きくなります。',
      },
      {
        label: '知り得ないこと',
        headline: '収入は止まる。',
        emphasis: '支出は止まらない。',
        lede: '退職計画は4つの未知数に対する30年以上の賭けです。どれか一つでも少し外れると、計画は崩れます。',
      },
      {
        label: '一つの数字では足りない理由',
        headline: '4%ルールは出発点。',
        emphasis: '計画ではない。',
        lede: '年4%を引き出す。単純に見えます。しかし同じ資産でも、リターンの順序によって長く続くことも、早く尽きることもあります。',
      },
      {
        label: '正直な答え',
        headline: '一つの未来を予測しない。',
        emphasis: '何千通りを試す。',
        lede: 'モンテカルロ・シミュレーションは、好景気、暴落、停滞、インフレを含む多くの未来で計画を試します。何が起きるかではなく、どれくらい生き残るかを示します。',
      },
    ],
    hookSub: '5シーン / 90秒 / そしてシミュレーション',
    ageRows: {
      30: '年間 $40K 使うなら約 $1.6M が必要で、60年以上もたせる必要があります。',
      40: '約 $1.2M、50年もたせる。',
      50: '約 $1.0M、40年もたせる。',
      60: '約 $800K、30年もたせる。',
      70: '約 $600K、20年もたせる。',
    },
    ageCallout: '早く辞めるほど必要額は大きく、もたせる期間も長くなる。',
    uncertainties: [
      { question: '何歳まで生きる？', answer: '75かもしれない。100かもしれない。' },
      { question: '物価はどれだけ上がる？', answer: '年2%？6%？複利で効きます。' },
      { question: '市場はどう動く？', answer: '強気、弱気、失われた10年。順序が重要です。' },
      { question: '人生はどう変わる？', answer: '健康、家族、好み。すべて動きます。' },
    ],
    demoTitle: '同じ元本。同じ引き出し。違う運。',
    demoStart: '開始',
    demoWithdraw: '毎年引き出し',
    seqGood: '幸運',
    seqBad: '不運',
    outcomeLabel: '結果：',
    outcomeGood: '30年後も $1.4M 残る',
    outcomeBad: '18年目で破産',
    mcSteps: [
      '計画を設定：年齢、貯蓄、引き出し。',
      '実際の市場データで10,000パスを実行。',
      '生存率を見て、計画を調整。',
    ],
    cta: 'シミュレーション開始',
    ctaNote: '無料 / 登録不要 / データはブラウザ内のみ',
    end: '明日退職できる計画は存在しません。しかし今日から準備を始めれば、その日は思ったより早いかもしれません。',
  },
}
