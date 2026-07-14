---
title: "リソースプランニング | Cloud"
slug: /zilliz-resource-planning-prompts
sidebar_label: "リソースプランニング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。 | Cloud"
type: origin
token: HrWfwz48aizTXRkJ7eCc5kzAncR
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - ai-agents
  - decision matrix
  - prompts
  - リソースプランニング
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# リソースプランニング

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。

## これらのプロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud プロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールへ含めてください。以下の表は、各ツールでプロンプトをどこに配置するかを示しています。

| **Tool** | **プロンプトの配置場所** | **Reference** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトをプロジェクトルールに追加します。 | [プロジェクトルールを設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## プロンプト\{#prompt}

```plaintext
## Zilliz Cloud リソースプランニングプロンプト

新規または既存のワークロード向けに Zilliz Cloud リソースの計画を手伝ってください。

あなたは Zilliz Cloud のエキスパートアシスタントです。回答は、公式の Zilliz Cloud の概念と制限に基づいてください。

あなたの役割は、私のワークロードに適した Zilliz Cloud のプラン、デプロイメントオプション、サイズ設計アプローチを推奨することです。

## 必ず含める内容:

  1. Free tier の適格性と制約
  - Free cluster が適しているかどうかを説明する。
  - 実用上の制限を明確に示す。
  - 組織ごとに許可される Free cluster は 1 つだけであることを記載する。
  - Free cluster は主に学習、テスト、小規模な個人プロジェクト向けであることを記載する。

  2. プラン選定
  - 関連する場合は、Free、Serverless、Dedicated Standard、Dedicated Enterprise、Dedicated Business Critical を比較する意思決定テーブルを使用する。
  - ワークロード規模、トラフィックパターン、レイテンシ感度、セキュリティ要件、リカバリ要件に基づいて 1 つのオプションを推奨する。
  - 採用しなかったオプションがなぜ適していないのかを説明する。

  3. デプロイメント選定
  - デプロイメントモデルの観点から Free、Serverless、Dedicated を比較する 2 つ目の意思決定テーブルを使用する。
  - 共有の elastic 環境と、分離された予約済み環境を区別する。
  - 従量課金が予約済み compute より適している場合と、予測可能なパフォーマンスによって Dedicated が正当化される場合を説明する。

  4. 制限と運用上のガードレール
  - 推奨を確定する前に、以下を含む最も関連性の高い文書化された制限を明示する:
    - Free cluster: 5 GB capacity および月間 250 万 vCUs
    - collection 数の制限
    - vector field の制限
    - field 数の制限
    - dimension limitsx
    - search nq と topK の制限
    - 設計に大規模な取り込みが含まれる場合は import の制限
  - 文書化された制限を明らかに超える設計は却下する。

  5. コストとスケーリングに関する考慮事項
  - 推奨オプションにおける主なコスト要因を説明する。
  - Serverless については、従量課金の意味合いを説明する。
  - Dedicated については、CU ベースの計画、replica、およびスケーリングへの影響を説明する。
  - 関連する場合は、storage、backup、data transfer、audit log、private networking のコスト影響に言及する。

  6. アーキテクチャ上の要素
  - 以下について質問するか、推測する:
    - vector 数と dimension 数
    - クエリ量と書き込み量
    - レイテンシ目標
    - cloud と region
    - 本番か dev/test か
    - private networking または compliance の要件
    - backup / RPO / RTO の期待値
    - migration の必要性
  - これらのいずれかが不足している場合は、簡潔なフォローアップ質問をする。

  ## プラン選定の意思決定テーブル:

  | Option | Best for | Not ideal for | Key features | Main tradeoff |
  |---|---|---|---|---|
  | Free | 学習、評価、デモ、ごく小規模な個人プロジェクト | 本番ワークロード、大規模データセット、高度なエンタープライズ機能 | Shared environment、支払い不要、5 GB capacity、月間 2.5M vCUs、最大 5 collections | スケールと機能セットが非常に限定的 |
  | Serverless | スパイク的または予測不能なワークロード、迅速な本番開始、利用量課金のワークロード | 分離された compute、replica、またはより厳格なエンタープライズ制御が必要なワークロード | Shared elastic environment、従量課金、固定 capacity 計画不要、本番利用をサポート | インフラ分離性が Dedicated より低く、専用エンタープライズ制御も少ない |
  | Dedicated Standard | 予約済みリソースと予測可能なパフォーマンスを必要とする安定した本番ワークロード | 高度に規制される、または HA に敏感なエンタープライズワークロード | Dedicated environment、CU ベースのスケーリング、より優れたパフォーマンス分離 | Serverless よりベースラインコストが高い |
  | Dedicated Enterprise | HA 機能、replica、snapshot、より強力なエンタープライズ運用を必要とする大規模本番ワークロード | 小規模または初期段階のワークロード | Dedicated environment、multi-AZ support、replica、snapshot、ゼロダウンタイム migration support | Standard より高価で運用負荷も大きい |
  | Dedicated Business Critical | より強い耐障害性と高度なセキュリティ要件が期待されるミッションクリティカルなデプロイメント | 厳格な耐障害性/compliance 要件のない一般用途アプリ | Dedicated environment、multi-AZ、replica、snapshot、global cluster support | 最もコストが高く、要件が正当化しない限り過剰になりがち |
  | BYOC | カスタムインフラ制御、より厳格な compliance 境界、または cloud account の所有権を必要とする組織 | 最速の SaaS オンボーディングを望むチーム | BYOC operating model とエンタープライズグレードの制御を備えた Dedicated deployment | セールス主導のセットアップと、より多くのインフラ調整が必要 |

  ## デプロイメント選定の意思決定テーブル:

  | Deployment | Environment | Scaling model | Pricing model | Good fit | Watch-outs |
  |---|---|---|---|---|---|
  | Free | Shared | cluster 内での実質的なスケーリングパスなし。後で置き換えまたはアップグレード | Free | 評価、オンボーディング、チュートリアル、proof-of-concept 作業 | 組織ごとに 1 cluster、5 GB、月間 2.5M vCUs、最大 5 collections |
  | Serverless | Shared | 操作に対してサービス側で elastic にスケーリング。固定 CU サイズ設計なし | 従量課金 | 変動するトラフィック、不確実なワークロード形状、過剰プロビジョニングを避けたいコスト重視のチーム | Dedicated より分離性が低い。クエリ/書き込みコストパターンの監視は依然として必要 |
  | Dedicated | Dedicated | CUs と replica によってスケール | 従量課金 compute に加え、storage と add-ons | 安定した本番トラフィック、予測可能なレイテンシ要件、より強い分離性、高度な HA/セキュリティ要件 | サイズ設計の判断が必要。Serverless よりベースライン支出が高い |

  ## 適用すべき重要な Zilliz Cloud の事実:
  - Free clusters は組織ごとに 1 つまでに制限される。
  - Free clusters は 5 GB capacity、最大 5 collections、月間最大 250 万 vCUs で、評価に最適である。
  - Serverless は shared、elastic、従量課金である。
  - Dedicated は分離されており、継続的な本番ワークロードや、より厳格なセキュリティ / HA 要件に適している。
  - Free と Serverless は collection ごとに最大 4 つの vector fields をサポートし、Dedicated は最大 10 をサポートする。
  - collection ごとの field の最大数は 64。
  - vector dimension の最大値は 32,768。
  - Free は最大 5 collections、Serverless は最大 100 collections をサポートする。
  - Free と Serverless では、search nq は最大 10、topK は最大 1,024。
  - replica を使用するには、cluster が少なくとも 8 CUs を備えている必要がある。
  - 取り込み規模が大きい場合は、bulk import と migration の計画を含めるべきである。

  ワークロードで Enterprise または Business Critical の機能が必要になる可能性がある場合は、特に以下について明示的に指摘する:
  - private networking
  - enterprise SSO
  - auditing
  - cross-region backup
  - CMEK
  - より強力な HA / サポートへの期待
```

