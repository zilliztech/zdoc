---
title: "リリースノート（2024年7月23日） | Cloud"
slug: /release-notes-291
sidebar_label: "2024年7月23日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "今回のアップデートで、Zilliz Cloud は Milvus の新しい RESTful API v2 をサポートし、一貫したインターフェースと拡張された機能を提供します。新しいドキュメントチャットボットにより、ユーザーサポートが強化されます。**Job Center** では、バックアップ、リストア、移行、インポート、コレクションのクローンなどのタスクを管理・追跡するための直感的なインターフェースが導入されます。プライベートプレビューで利用可能な Dedicated クラスター向けの **Auto-scaling** は、Compute Unit（CU）Capacity Threshold をトリガーとして、需要に応じて容量を動的に調整します。その他の機能強化には、クラスター監視メトリクスの追加、刷新されたクラスター管理インターフェース、改善されたユーザーメールテンプレートが含まれます。 | Cloud"
type: origin
token: RlhDw3Fr9iCpWSkylfAcyes1nLh
sidebar_position: 22
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年7月23日）

今回のアップデートで、Zilliz Cloud は Milvus の新しい RESTful API v2 をサポートし、一貫したインターフェースと拡張された機能を提供します。新しいドキュメントチャットボットにより、ユーザーサポートが強化されます。**Job Center** では、バックアップ、リストア、移行、インポート、コレクションのクローンなどのタスクを管理・追跡するための直感的なインターフェースが導入されます。プライベートプレビューで利用可能な Dedicated クラスター向けの **Auto-scaling** は、Compute Unit（CU）Capacity Threshold をトリガーとして、需要に応じて容量を動的に調整します。その他の機能強化には、より多くのクラスター監視メトリクス、刷新されたクラスター管理インターフェース、改善されたユーザーメールテンプレートが含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

クラスターを BETA にアップグレードする場合は、アップグレード後に **Milvus 2.4.x** の機能を利用できます。

### RESTful API v2\{#restful-api-v2}

最近の Milvus 2.4 のアップデートで、新しい RESTful API v2 がリリースされました。このリリースにより、Zilliz Cloud はこれらの API を完全にサポートし、一連のコントロールプレーンインターフェースを提供します。新しい v2 API は、v1 と比較してインターフェーススタイルの一貫性が高く、より幅広い機能をカバーしています。これらの機能には、データプレーンにおけるベクトル操作、コレクション管理、インデックス管理、パーティション管理、ロールとユーザー管理、エイリアス操作が含まれます。コントロールプレーンでは、API はデータのインポートとクラスター管理をカバーします。詳細については、RESTful v2 の [control plane API](/reference/restful/control-plane-v2) と [data plane API](/reference/restful/data-plane-v2) を参照してください。

### Chatbot\{#chatbot}

Zilliz Cloud では、従来の検索バーと比較して、より柔軟で強力なサポートツールとなるドキュメントチャットボットを利用できるようになりました。このチャットボットにより、ユーザーは情報を簡単に見つけ、質問に対するサポートを受けることができます。Zilliz Cloud のドキュメントページの右下にあるアイコンをクリックすると、チャットボットにアクセスできます。

### Job Center\{#job-center}

Zilliz Cloud では、単一のプロジェクト内のすべての履歴データタスクと非同期データタスクを統合した、直感的な Jobs ページを利用できるようになりました。このシンプルになったインターフェースにより、以下を含むさまざまな種類のジョブの進行状況を簡単に追跡し、管理できます。

- バックアップ

- リストア

- 移行

- インポート

- コレクションのクローン

詳細については、[プロジェクトジョブの管理](./job-center) を参照してください。

### Dedicated クラスター向け Auto-scaling [プライベートプレビュー]\{#auto-scaling-for-dedicated-clusters-private-preview}

Zilliz Cloud は、需要に基づいてクラスターの容量を動的に調整する機能である Auto-scaling を導入しました。Auto-scaling は主に CU（Compute Unit）Capacity Threshold によってトリガーされます。Zilliz Cloud はクラスターの CU 容量を 1 分ごとに監視し、2 分連続で 70%（デフォルトのしきい値）を超えた場合、システムは自動的にスケーリングプロセスを開始します。ユーザーは自動スケーリングの最大 CU サイズを設定できますが、現時点では下方向への Auto-scaling はサポートされていません。

Auto-scaling は現在プライベートプレビューであり、Dedicated（Enterprise）クラスターでのみ利用できます。この機能を有効にするには、[お問い合わせください](https://zilliz.com/contact-sales?_gl=1*y9u24o*_ga*NDAwNDA1MDY5LjE3MDkxNTcwNzU.*_ga_KKMVYG8YF2*MTcyMTcwNjA5MC4xMjQuMS4xNzIxNzA5OTk3LjAuMC4w*_ga_HT329313WV*MTcyMTcwNjA5MC4zNS4xLjE3MjE3MDk5OTcuMC4wLjA.*_ga_Q1F8R2NWDP*MTcyMTcwNjA5MC4zMy4xLjE3MjE3MDk5OTcuMC4wLjA.*_gcl_au*ODIwMjEwMjY0LjE3MTcwNjEwOTc.)。使用方法については、[Auto-scaling](./manage-cluster) を参照してください。

### Pipelines\{#pipelines}

- Pipelines は、新しい SEARCH_IMAGE_BY_TEXT 関数により、テキストによる画像検索をサポートするようになりました。この機能により、ユーザーはテキストクエリを入力して、データベースから関連する画像データを取得できます。検索機能は複数の言語をサポートし、テキストと画像のエンコードには CLIP vit base patch32 マルチモーダルモデルを使用します。

- ユーザーは、RestFul API と UI コンソールの両方を使用して、pipeline の詳細で pipeline の使用状況情報を取得できるようになりました。この機能強化により、ユーザーは pipeline の使用状況を包括的に把握でき、監視と分析を改善できます。

- 各プロジェクトにおける各種類の pipeline の最大数の制限が引き上げられました。ユーザーは、以前の上限である 10 と比較して、単一のプロジェクト内に各種類の pipeline を最大 100 個まで作成できるようになりました。この変更により、プロジェクト内で pipeline を管理する際の柔軟性とスケーラビリティが向上します。

### 機能強化\{#enhancements}

このリリースには、以下の一連の機能強化も含まれています。

- クラスターを監視するための [メトリクス](/docs/metrics-alerts-reference) の追加

- クラスターの変更、移行、バックアップを含む、クラスター管理ページのリファクタリング

- ユーザーメールテンプレートの改善

