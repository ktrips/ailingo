# AiLingo (アイリンゴ)

Claudeを効率的に使いこなすプロンプトエンジニアリング技術を、ゲーム感覚で習得するWebアプリ。

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.local に Firebase 設定を記入
npm run dev  # http://localhost:5174
```

APIキーはUI上の設定から入力（`localStorage`に保存）。

## 学習ステージ

### DOJO 🏯 — プロンプトの型を7日間で習得
7つのチャレンジを通じてプロンプトエンジニアリングの基礎を学ぶ。

| Day | テーマ |
|-----|--------|
| 1 | Role指定 |
| 2 | 出力形式制御 |
| 3 | 制約指定 |
| 4 | Few-shot |
| 5 | Chain-of-Thought |
| 6 | コンテキスト管理 |
| 7 | 総合力 |

全7日クリアで BUILDER アンロック。

### BUILDER 🏗️ — 実アプリを5時間セッションで完成させる
難易度別のアプリ開発チャレンジ。1〜6セッションに分割された段階的なビルドプロセス。

| 難易度 | 例 |
|--------|-----|
| EASY ⭐ | カウンター、じゃんけん、BMI計算 |
| NORMAL ⭐⭐ | ストップウォッチ、TODOアプリ、クイズゲーム |
| HARD ⭐⭐⭐ | ポモドーロ、リアルタイムチャット、家計簿 |
| EXPERT ⭐⭐⭐⭐ | Markdownエディタ |
| MASTER ⭐⭐⭐⭐⭐ | AI Chatアプリ |

HARD全クリアで CREATOR アンロック。

### CREATOR 🌟 — 自由設計で本格アプリを創る（Coming Soon）

## スコアリング

### DOJO
```
efficiency    = min(tokenLimit / tokensUsed, 1)
attemptBonus  = max(0, (attempts - 1) * 0.1)  // 試行ごとに-10%
score         = floor((qualityScore / 100) * efficiency * 1000 * (1 - attemptBonus))

Gold   : score ≥ 800 かつ 1回クリア
Silver : score ≥ 500
Bronze : score ≥ 250
```

### BUILDER
```
tokenEff  = min(baseTokenBudget / tokensUsed, 1)
timeBonus = 1.5（予定より早い）| 1.0（通常）| 0.7（遅延）
score     = floor((qualityScore / 100) * tokenEff * 500 * timeBonus * difficultyStars)
```

## トークン制限

| ウィンドウ | 上限 |
|-----------|------|
| Sprint（5時間） | 50,000 tokens |
| Weekly（月曜起算） | 200,000 tokens |

## Claude API

ブラウザから直接 Anthropic API を呼び出す構成。

| 用途 | モデル | Max tokens |
|------|--------|------------|
| DOJOチャレンジ実行 | claude-haiku-4-5 | 512 |
| 回答品質評価 | claude-haiku-4-5 | 200 |
| BUILDERセッション評価 | claude-haiku-4-5 | 300 |

## Tech Stack

- **Frontend:** React 18 · TypeScript · Vite · Tailwind CSS
- **State:** Zustand（localStorage同期）
- **Backend:** Firebase Auth（Google OAuth）· Firestore · Firebase Hosting
- **AI:** Claude API（Haiku）— ブラウザ直接呼び出し
