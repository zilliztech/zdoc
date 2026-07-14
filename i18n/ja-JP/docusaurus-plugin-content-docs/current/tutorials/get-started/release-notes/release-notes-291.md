---
title: "リリースノート（2024年7月23日） | Cloud"
slug: /release-notes-291
sidebar_label: "2024年7月23日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "今回のアップデートで、Zilliz Cloud は Milvus の新しい RESTful API v2 をサポートし、一貫したインターフェースと拡張された機能を提供します。新しいドキュメントチャットボットによりユーザーサポートが強化されました。Job Center では、backup、restore、migration、import、clone collection などのタスクを管理・追跡するための直感的なインターフェースが導入されました。private preview で利用可能な dedicated cluster 向けの Auto-scaling は、Compute Unit（CU）Capacity Threshold をトリガーとして、需要に応じて容量を動的に調整します。その他の機能強化には、cluster 監視メトリクスの追加、刷新された cluster 管理インターフェース、改善されたユーザーメールテンプレートが含まれます。 | Cloud"
type: origin
token: RlhDw3Fr9iCpWSkylfAcyes1nLh
sidebar_position: 21
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年7月23日）

今回のアップデートで、Zilliz Cloud は Milvus の新しい RESTful API v2 をサポートし、一貫したインターフェースと拡張された機能を提供します。新しいドキュメントチャットボットによりユーザーサポートが強化されました。**Job Center** では、backup、restore、migration、import、clone collection などのタスクを管理・追跡するための直感的なインターフェースが導入されました。private preview で利用可能な dedicated cluster 向けの **Auto-scaling** は、Compute Unit（CU）Capacity Threshold をトリガーとして、需要に応じて容量を動的に調整します。その他の機能強化には、cluster 監視メトリクスの追加、刷新された cluster 管理インターフェース、改善されたユーザーメールテンプレートが含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。 

cluster を BETA にアップグレードしたい場合は、アップグレード後に **Milvus 2.4.x** の機能を利用できます。

### RESTful API v2\{#restful-api-v2}

最近の Milvus 2.4 アップデートで、新しい RESTful API v2 がリリースされました。このリリースにより、Zilliz Cloud はこれらの API を完全にサポートし、一連の control plane インターフェースを提供します。新しい v2 API は、v1 と比較してインターフェーススタイルの一貫性が高く、より幅広い機能をカバーしています。これらの機能には、vector 操作、collection 管理、index 管理、partition 管理、ロールおよびユーザー管理、そして data plane における alias 操作が含まれます。control plane では、API はデータ import と cluster 管理をカバーします。詳細については、RESTful v2 の [control plane API](/reference/restful/control-plane-v2) と [data plane API](/reference/restful/data-plane-v2) を参照してください。

### Chatbot\{#chatbot}

Zilliz Cloud では、従来の検索バーよりも柔軟で強力なサポートツールとして、ドキュメントチャットボットを利用できるようになりました。このチャットボットにより、ユーザーは情報を簡単に見つけて、質問に対するサポートを受けることができます。Zilliz Cloud ドキュメントページの右下にあるアイコンをクリックすると、チャットボットにアクセスできます。

### Job Center\{#job-center}

Zilliz Cloud では、単一の project 内のすべての履歴データタスクと非同期データタスクを統合した、直感的な Jobs ページを利用できるようになりました。この簡素化されたインターフェースにより、以下を含むさまざまな種類の job の進行状況を簡単に追跡し、管理できます。

- Backup

- Restore

- Migration

- Import

- Clone Collection

詳細については、[Project Jobs の管理](./job-center) を参照してください。

### Dedicated Clusters 向け Auto-scaling [Private Preview]\{#auto-scaling-for-dedicated-clusters-private-preview}

Zilliz Cloud は auto-scaling を導入しました。これは、需要に応じて cluster の容量を動的に調整する機能です。Auto-scaling は主に CU（Compute Unit）Capacity Threshold によってトリガーされます。Zilliz Cloud は cluster の CU 容量を毎分監視し、2 分連続で 70%（デフォルトしきい値）を超えた場合、システムは自動的にスケーリングプロセスを開始します。ユーザーは自動スケーリング用の最大 CU サイズを設定できますが、現時点では下方向の自動スケーリングはサポートされていません。

Auto-scaling は現在 private preview 中で、Dedicated（Enterprise）cluster でのみ利用可能です。この機能を有効にするには、[お問い合わせください](https://zilliz.com/contact-sales?_gl=1*y9u24o*_ga*NDAwNDA1MDY5LjE3MDkxNTcwNzU.*_ga_KKMVYG8YF2*MTcyMTcwNjA5MC4xMjQuMS4xNzIxNzA5OTk3LjAuMC4w*_ga_HT329313WV*MTcyMTcwNjA5MC4zNS4xLjE3MjE3MDk5OTcuMC4wLjA.*_ga_Q1F8R2NWDP*MTcyMTcwNjA5MC4zMy4xLjE3MjE3MDk5OTcuMC4wLjA.*_gcl_au*ODIwMjEwMjY0LjE3MTcwNjEwOTc.)。使用方法については、[Auto-scaling](./manage-cluster) を参照してください。

### Pipelines\{#pipelines}

- Pipelines は、新しい SEARCH_IMAGE_BY_TEXT 関数により、テキストによる画像検索をサポートするようになりました。この機能により、ユーザーはテキストクエリを入力して、データベースから関連する画像データを取得できます。検索機能は複数言語に対応しており、テキストと画像のエンコードには CLIP vit base patch32 マルチモーダルモデルを使用します。

- ユーザーは、RestFul API と UI コンソールの両方を使用して、pipeline の詳細で pipeline の使用状況情報を取得できるようになりました。この機能強化により、ユーザーは監視や分析を改善するために pipeline 使用状況を包括的に把握できます。

- 各 project における各タイプの pipeline の最大数制限が引き上げられました。これにより、従来の上限 10 と比較して、ユーザーは単一の project 内に各種類の pipeline を最大 100 個まで作成できるようになりました。この変更により、project 内で pipelines を管理する際の柔軟性とスケーラビリティが向上します。

### Enhancements\{#enhancements}

このリリースには、以下の機能強化も含まれます。

- cluster を監視するための [metrics](/docs/metrics-alerts-reference) の追加

- cluster の変更、migration、backup を含む、cluster 管理ページのリファクタリング

- ユーザーメールテンプレートの改善

