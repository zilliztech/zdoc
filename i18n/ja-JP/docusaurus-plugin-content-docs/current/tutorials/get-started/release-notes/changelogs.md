---
title: "変更履歴 | Cloud"
slug: /changelogs
sidebar_label: "変更履歴"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "最終更新日 2026年7月6日 | Cloud"
type: origin
token: MUL3wkn7Yi3YoFkYk59csf8bnNc
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 変更履歴

**最終更新日:** 2026年7月6日

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **次回リリース**

    </div>

    <div>

        - さらに多くの Vector Lakebase 機能が近日登場予定です。

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月15日](./release-notes-2607#byoc-supports-storage-integrations-and-external-volumes)**

    </div>

    <div>

        - 💾 BYOC プロジェクトで [Storage integration](/docs/byoc/integrate-with-aws-s3) と [external volumes](/docs/byoc/external-volume) が利用可能になりました。

        - 📈 オンデマンドクラスターで [コレクションレベルのメトリクス](./metrics-alerts-reference) が利用可能になりました。

        - 💳 オンデマンドコンピューティングと external volumes で課金が発生するようになりました。内訳については、[On-Demand Compute Cost](./on-demand-compute-cost) および [Storage Request Cost](./storage-request-cost) を参照してください。

        - 💻 [Programmable storage integrations](/reference/restful/storage-integration-operations-v2) が RESTful API を通じて利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月6日](./release-notes-2607)**

    </div>

    <div>

        - 🔒 Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。詳細については、手順ごとのマニュアルガイドである [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp) と、IaC 自動化向けの [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月24日](./release-notes-2606)**

    </div>

    <div>

        - 💾 高度にカスタマイズ可能なバックアップサイクルをオーケストレーションできるようになりました。詳細については、[Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月17日](./release-notes-2606)**

    </div>

    <div>

        - 💾 クラスターを復元する際に、互換性のある Milvus バージョンを指定できるようになりました。詳細については、[Restore from Backup Files](./restore-from-backup-files) および [Use Recycle Bin](./use-recycle-bin) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月3日](./release-notes-2606#nullable-vector)**

    </div>

    <div>

        - 📅 ベクトルフィールドで `nullable` 属性がサポートされるようになり、既存のコレクションに新しいベクトルフィールドを追加できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月13日](./release-notes-2605#byoc-multi-dataplane-support)**

    </div>

    <div>

        - 🔒 BYOC プロジェクトで、異なるリージョンにまたがる複数のデータプレーンが利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月7日](./release-notes-2605)**

    </div>

    <div>

        - 🏠 Zilliz Cloud はベクトルデータベース製品から、以下の注目機能を備えた Vector Lakebase プラットフォームへと進化しました。

            - [On-demand search](./quick-start-to-on-demand-search)

            - [External data lake search](./quick-start-to-external-data-lake-search)

        - 🐦 Zilliz Cloud のオンデマンドコンピューティング向けに、Milvus v3.0.x の Private Review が以下の機能とともに開始されました。

            - [External collections and backfill](./create-external-collection)

            - [Nullable vectors](./nullable-fields)

            - [Embedding list searches and filtering](./use-array-of-structs),

            - [MinHash function](./minhash-function)

            - [検索](./single-vector-search#sort-search-results-by-scalar-fields) と [クエリ](./get-and-scalar-query#sort-query-results) の order by

            - [Snapshots](./snapshots)

            - [Entity TTL](./set-collection-ttl)

            - Force merge

            - Custom dictionaries and tokenizers

            - Spark semantic deduplication and abnormal detection

        - 💾 インポート、移行、および external-collection ワークフロー向けの読み取り専用 [external volumes](./external-volume) が利用可能になりました。

        - 🔍︎ コレクションレベルの [large top-K](./use-large-topk) が利用可能になり、有効化されたコレクションで返されるエンティティの最大数が 16,384 から 1,000,000 に拡張されました

        - 🗺️ [プロジェクトでリージョン制約が利用可能](./manage-projects#add-project-regions) になり、企業がデータ所在地を管理し、リージョン別データプレーンアクセスを明示的に維持できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年4月](./release-notes-2604)[11日](./release-notes-2604)**

    </div>

    <div>

        - [🌎 Global cluster](./global-cluster-explained) が、洗練されたプラットフォーム機能により、リージョン災害復旧フェイルオーバーを完全にサポートするようになりました。

        - 📈 よりきめ細かな [メトリクスがコレクションレベルで利用可能](./metrics-alerts-reference#cluster-and-collection-metrics) になりました。

        - 📋 [Access logs](./access-log-overview) が Public Preview で利用可能になりました。

        - ⚙️ より予測可能なアップグレードスケジュールと事前通知を提供するよう、[maintenance window](./organization-settings#set-up-preferred-maintenance-window) が再設計されました。

        - 👥 新しい [クラスター管理者](./project-users#cluster-admin) ロールにより、プロジェクトレベルの完全な管理者権限がなくても、チームメンバーが特定のクラスターに対する運用アクセスを持てるようになりました。

        - 💾 BYOC プロジェクトのクラスターで階層型ストレージが利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年2月9](./release-notes-2602#sso-enforcement)[日](./release-notes-2602#sso-enforcement)**

    </div>

    <div>

        - 🔐 非 SSO 認証からのアクセスを制限する [SSO enforcement](./enforce-sso-in-your-organization)。

        - 👥 [組織レベル](./organization-users#organization-role) および [プロジェクトレベル](./project-users#project-access) で設定できるクラスターレベルのアクセス制御により、きめ細かなデータアクセスを実現します。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年2月4](./release-notes-2602#new-region-aws-ireland)[日](./release-notes-2602#new-region-aws-ireland)**

    </div>

    <div>

        - **新リージョン**: 🇮🇪 AWS Ireland (eu-west-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年1月29日](./release-notes-2601#another-milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   さらに別の新しい Milvus v2.6.x 機能が Zilliz Cloud で利用可能になりました

            - [Primary-Key Search](./primary-key-search)

        - 🔒 BYOC-I が [Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) で利用可能になりました。

        - 🔐 Zilliz Cloud クラスターの保存データ暗号化向けに [Customer-managed encryption keys](./cmek) が利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年1月23日](./release-notes-2601#milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   新しい Milvus v2.6.x 機能が Zilliz Cloud で利用可能になりました

            - [Semantic Highlighter](./semantic-highlighter)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年1月15日](./release-notes-2601)**

    </div>

    <div>

        - 🚀   新しい Milvus v2.6.x 機能が Zilliz Cloud で利用可能になりました

            - [TIMESTAMPTZ Field](./use-timestamptz-field)

            - [Text Highlighter](./text-highlighter)

        - 🤖 [OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのモデルベース embedding functions と、[Cohere reranker](./cohere-model-ranker) や [Voyage AI reranker](./voyage-ai-model-ranker) などの reranking functions が Public Preview で利用可能になりました。

        - 🤖 [Hosted models](./hosted-models) が Private Preview で利用可能になりました。

        - 🛠️ インテリジェンスを備えた [Dynamic replica autoscaling](./auto-scaling)。

        - 📅 使い慣れた cron 設定による高度な [scheduled scaling](./scheduled-scaling)。

        - 🌎 [Global cluster](./global-cluster-explained) が利用可能になりました。アクセスするには [お問い合わせください](https://support.zilliz.com/hc/en-us)。

        - ☁️ BYOC は以下の機能強化により、さらに使いやすくなりました。

            - [フル autoscaling 機能](/docs/byoc/scale-cluster)

            - [Technical support access control](/docs/byoc/deploy-byoc-aws#technical-support-access)

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年12月26日](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x が一般提供 (GA) になりました

        - 💾  階層型ストレージが GA になり、[課金が開始](./storage-cost) されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[2025年12月1日](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  Stage は [Volume](./managed-volume) に名称変更され、GA になりました

        - [🔐  組織レベルの IP Whitelist](./setup-console-ip-allowlist) が利用可能になりました

        - [🔐  TOTP ベースの MFA](./multi-factor-auth) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年11月6日](./release-notes-2511#business-critical-plan-availability)**

    </div>

    <div>

        - 🚀  Milvus v2.6.x がより多くのデータ型とともに Zilliz Cloud で利用可能になりました:

            - [Geometry](./use-geometry-field), and

            - [Array of Structs](./use-array-of-structs)

        - 🔍  [移行](./via-endpoint#getting-started) 中に全文検索機能が利用可能になりました。

        - ⏰  [通知間隔](./manage-project-alerts#alert-settings) をカスタマイズして、繰り返しのアラートを抑制できます。

        - 🔧 [dynamic field は既存のコレクションに対して有効化可能](./modify-collections#example-5-enable-dynamic-field) になり、コレクションの再作成が不要になりました。

        - 💳 サブスクリプションプランはプロジェクトレベルに移行され、クラスターには複数のデプロイオプションが用意されました。詳しくは [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[2025年10月9日](./release-notes-2510#milvus-v26x-public-preview)**

    </div>

    <div>

        - 🚀  Milvus v2.6.x が Zilliz Cloud で利用可能になりました

            - ダウンタイムなしの [Field addition](./add-fields-to-an-existing-collection)

            - [multi-language analyzers](./multi-language-analyzers) と [phrase match](./phrase-match) による強化された全文検索

            - [JSON indexing](./json-indexing) と [Shredding](./json-shredding) による高速化された JSON フィルタリング

            - 検索結果の改善に使える [Boost ranker](./boost-ranker) と [Decay rankers](./decay-ranker-oveview)

            - [INT8_VECTOR data type](./use-dense-vector) のサポート

        - 💾  大容量クラスター向け階層型ストレージのアップグレード

        - [🔄 Cross-region backup](./backup-to-other-regions) による事業継続戦略

        - [⚙️  Index build levels](./tune-index-build-level) により、シナリオに応じてインデックス設定を調整できます

        - 🚧 Pipelines は非推奨になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年8月20日](./release-notes-2508#autoscaling-upgrade)**

    </div>

    <div>

        - 📈  設定を簡素化した [Autoscaling upgrade](./auto-scaling)

        - [📋  Audit logs](./audit-logs) が一般提供になりました

        - [🔐  SSO](./single-sign-on) エクスペリエンスが改善されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年8月13日](./release-notes-2508#support-aws-sydney-region)**

    </div>

    <div>

        - **新リージョン**: 🇦🇺 AWS Sydney (ap-southeast-2)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年7月15日](./release-notes-2180)**

    </div>

    <div>

        - 🔗  スキーマ進化のための Merge data API。

        - 📦  移行およびデータインポート用の共有ステージングレイヤーとしての [Stage](./managed-volume)

        - 📅  [Schedule-based cluster autoscaling](./scheduled-scaling)

        - [🔄  クラスターの部分復元](./restore-from-backup-files#restore-a-partial-cluster)

        - [⚙️  Zilliz Cloud コンソール上の JSON インデックス](./json-indexing) 設定

        - 📊  BYOC プロジェクトのクォータ設定

        - 🔐  クラスター復元時の RBAC 設定の復元

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年6月9日](./release-notes-2170)**

    </div>

    <div>

        - 📚  [移行ドキュメントとベストプラクティス](./migrate-between-clusters) を再構成しました

        - [🚨  Policy-based alerts](./manage-project-alerts) により、きめ細かく柔軟な監視が可能になりました

        - ⚙️  Zilliz Cloud コンソール上の mmap 設定

        - ☁️  BYOC が Google Cloud Platform (GCP) で利用可能になりました

        - 🤖  指示に応じて動作する、よく設計された AI アシスタント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年4月24日](./release-notes-2150)**

    </div>

    <div>

        - ⚙️  BYOC プロジェクト向けのインスタンス設定と AWS PrivateLink サポート

        - 🔍  [JSON インデックス](./json-indexing) を使用した JSON フィールド上でのきめ細かなフィルタリング

        - 🛠️  RESTful API を使用して [クラスターのレプリカ数を変更](/reference/restful/modify-cluster-replica-v2) できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年3月27日](./release-notes-2140)**

    </div>

    <div>

        - 🔒 BYOC-I は完全なデータ主権を提供します

        - [📋  クラスター向け Audit logs](./audit-logs) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年1月27日](./release-notes-2130)**

    </div>

    <div>

        - 🚀  Milvus v2.5.x が Zilliz Cloud で利用可能になりました

        - [🔍  Full Text Search](./full-text-search) により、既存のセマンティック検索機能が補完されます

        - [📋  クラスター向け Audit logs](./audit-logs) が利用可能になりました

        - [☁️  セキュリティが強化された AWS 上の BYOC](/docs/byoc/deploy-byoc-aws)

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年12月26日](./release-notes-2120)**

    </div>

    <div>

        - 🎯  [search level の調整](./tune-recall-rate) による高い再現率

        - [🔐  コレクションレベル RBAC サポート](./cluster-privileges#collection-level-privilege-groups)

        - [💾  データ容量拡張のための mmap](./use-mmap) サポート

        - [🗂️  マルチテナンシー向け Database](/docs/database) が利用可能になりました

        - **新リージョン**: 🇺🇸 GCP us-central1 (Iowa)

        - [☁️  BYOC](/docs/byoc/deploy-byoc-aws) が AWS で利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年11月6日](./release-notes-2110)**

    </div>

    <div>

        - 🎨  Zilliz Cloud コンソールを再構成しました

        - 🔄  対応ソースを拡張したデータ移行: 

            - [Qdrant](./migrate-from-qdrant),

            - [Pinecone](./migrate-from-pinecone), and

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 💳  支払いプロセスを改善し、[請求書ページ](./view-invoice) を再設計しました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年10月14日](./release-notes-2102)**

    </div>

    <div>

        - [📚  Notebook ギャラリー](https://zilliz.com/learn/milvus-notebooks) が公開されました

        - ⚡  容量を拡張したパフォーマンス最適化クラスター

        - 🔄  [Multi-replica](./auto-scaling) が一般提供になりました

        - **新リージョン**: 🇯🇵 AWS Tokyo (ap-northeast-1)

        - [📊  Prometheus との統合](./prometheus-monitoring)

        - [🔑  Auth0 による Single sign-on (SSO)](./single-sign-on)

        - 🎁  AWS Marketplace を利用した無料トライアル

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年9月14日](./release-notes-2100)**

    </div>

    <div>

        - ☁️  Serverless クラスターが一般提供になりました

        - 🔄  [Multi-replica](./auto-scaling) が Public Preview で利用可能になりました

        - 📦  Zilliz Cloud へデータを移行するための移行サービス:

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector), and

            - [Zilliz Cloud クラスター間](./offline-migration)

        - 🛠️  バックアップ、復元、移行、およびジョブ管理のための RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年7月23日](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful API エンドポイントを再構成しました

        - 🤖  情報を簡単に取得するためのチャットボット

        - [📋  バックアップ、復元、移行、およびデータインポートのための一元的なジョブ監視](./job-center)

        - [📈  Autoscaling](./manage-cluster) が Private Preview で利用可能になりました

        - 🖼️  Pipelines が画像検索に対応して強化されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年6月18日](./release-notes-290)**

    </div>

    <div>

        - 🚀  Milvus v2.4.x が Zilliz Cloud で利用可能になりました

            - [Sparse vector](./use-sparse-vector) データ型のサポート

            - Float16 および BFloat16 ベクトルデータ型のサポート

            - [Multi-vector hybrid search](./hybrid-search)

            - [Inverted index](./inverted-index-type) と [fuzzy match](./basic-filtering-operators)

            - [Grouping search](./grouping-search)

            - 改良された MilvusClient インターフェース

        - 📊  Pipelines でトークン使用量を監視できるようになりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年5月15日](./release-notes-280)**

    </div>

    <div>

        - ☁️  Serverless クラスターは現在 beta です

        - **新リージョン**: 🇩🇪 Azure Germany West Central (Frankfurt)

        - **新リージョン**: 🇩🇪 GCP europe-west3 (Frankfurt) および 🇺🇸 us-east-4 (Virginia)

        - 🧠  text pipelines と image pipelines が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年4月13日](./release-notes-270)**

    </div>

    <div>

        - [🛒  Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) が公開されました

        - 🔌  Pipelines が connectors をサポートするようになりました

        - 🔄  Pipelines に search pipelines 向け rerankers が導入されました

        - [📊  RESTful API によるメトリクス監視](/reference/restful/query-metrics) が利用可能です

        - 🌐 クロスクラウド [data import](./data-import-zero-to-hero) と [migration](./migrate-between-clusters)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年3月13日](./release-notes-260)**

    </div>

    <div>

        - 🧠  Pipelines がより多くの embedding models をサポートするようになりました

        - 🎮  collection playground が Zilliz Cloud コンソールで利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年1月18日](./release-notes-250)**

    </div>

    <div>

        - 📥  Parquet ファイルからの [Data import](./data-import-zero-to-hero)

        - [🔐  API keys](./manage-api-keys) が RBAC 原則に基づいて強化されました

        - 📊  [Metric boards and alert system](./metrics-alerts-reference) を再構成しました

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年12月11日](./release-notes-240)**

    </div>

    <div>

        - ☁️  Zilliz Cloud が以下のリージョンで Azure で利用可能に:

            - **新リージョン**: 🇺🇸  Azure East US

        - 🚀  Pipelines がベータ版で利用可能に

        - 🔐  クラスターでの RBAC と認証情報管理

        - 🛠️  クラスター関連の RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年10月17日](./release-notes-230)**

    </div>

    <div>

        - **新リージョン**: 🇩🇪 AWS Frankfurt (aws-en-central-1)

        - 🚀  Milvus v2.3.x がパブリックプレビューで利用可能に

            - [範囲検索](./range-search)

            - [アップサート](./upsert-entities)

            - [コサインメトリックタイプ](./search-metrics-explained)

            - [アクセス制御](./access-control-overview)

            - 戻り値での生ベクトル

            - [JSON_CONTAINS フィルター](./json-filtering-operators)

            - [エンティティ数](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年9月27日](./release-notes-221)**

    </div>

    <div>

        - 💰  前払いに対応

        - **新リージョン**: 🇺🇸 AWS US East 1 (aws-us-east-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年9月13日](./release-notes-220)**

    </div>

    <div>

        - [🔄  Zilliz Cloud クラスター間でのデータ移行](./offline-migration)

        - [🚀  Elasticsearch からの簡単な移行](./migrate-from-elasticsearch)

        - [📥  データインポートの強化](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年8月16日](./release-notes-210)**

    </div>

    <div>

        - **新リージョン**: 🇸🇬 AWS Singapore (ap-southeast-1)

        - **新リージョン**: 🇸🇬 GCP Singapore (asia-southeast-1)

        - 🔄  サーバーレスクラスターから専用クラスターへの移行をサポート

        - 📤  一括挿入をサポート

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年6月11日](./release-notes-200)**

    </div>

    <div>

        - ☁️  サーバーレスクラスターが利用可能に

        - [💰  Zilliz Cloud の料金プラン階層を導入](https://zilliz.com/pricing)

        - 👥  [アクセス制御](./access-control-overview) のための組織、コラボレーション、RBAC

        - 🏷️  名前空間化のためのパーティションキーを導入

        - 📝  動的スキーマが利用可能に

        - 📊  新しいデータ型: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年4月6日](./release-notes-110)**

    </div>

    <div>

        - [💰  料金計算ツール](https://zilliz.com/pricing#calculator)

        - 💾  GCP での [バックアップと復元](./create-backup)

        - [⏰  カスタムタイムゾーン](./organization-settings#manage-timezone)

        - [🔄  コレクションの名前変更](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年3月6日](./release-notes-100)**

    </div>

    <div>

        - **新リージョン**: 🇺🇸 GCP Oregon (us-west1)

        - ☁️  Zilliz Cloud が [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio) で利用可能に

        - [💾  バックアップと復元](./create-backup) が AWS で利用可能に

        - [🗑️  データ継続性戦略のためのごみ箱](./use-recycle-bin)

        - 🔄  [Milvus からの移行](./migrate-from-milvus)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年2月13日](./release-notes-011)**

    </div>

    <div>

        - 📧  メール通知

        - 📚  初心者向けのインラインガイダンス

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年1月10日](./release-notes-010)**

    </div>

    <div>

        - 👁️  コレクションのデータプレビュー

        - 📚  初心者がベクトルデータベースに慣れるためのデモデータセット

    </div>

</Grid>

## 2022\{#2022}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2022年12月5日](./release-notes-009)**

    </div>

    <div>

        - 🎨  新しいデザインの Zilliz Cloud コンソール

        - **新リージョン**: 🇺🇸 AWS Ohio (us-east-2)

        - 🔐  [Private Link](./setup-a-private-link-aws) が利用可能に

        - 📥  [データインポート](./data-import-zero-to-hero) が利用可能に

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2022年11月18日](./release-notes-008)**

    </div>

    <div>

        - 🚀  Zilliz Cloud が招待なしで一般公開

        - ⚡  容量最適化 CUs がオンライン化

        - 📊  QPS とクエリレイテンシのリソースモニター

        - 🛠️  インデックス作成を簡素化する AUTOINDEX

        - ⚡  より良いユーザー体験のための UI パフォーマンス最適化

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年9月15日**

    </div>

    <div>

        - 🎨  コレクションビューをリファクタリング

        - 🔍  ベクトル検索ビューをリファクタリング

        - 🧑‍💻  Google でのサインアップが利用可能に

        - [⚙️  システムメンテナンス設定](./organization-settings) が利用可能に

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月30日**

    </div>

    <div>

        - 📊  より大きな標準ベクトルデータベース。

        - ⚙️  Cloud UI でのコレクション管理。

        - ⚙️  Cloud UI でのインデックス管理。

        - 🔍  Cloud UI でのベクトル検索実行。

        - 🔐  セキュリティ上の理由から、デフォルトでインターネットからのデータベースアクセスを無効化。

        - 🔐  ホワイトリスト設定の体験を改善。

        - 💰  クレジットに対応。

        - 🚀  より良い操作性のために Cloud UI を改善。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月1日**

    </div>

    <div>

        - 👁️  Cloud UI でのコレクション表示。

        - 👁️  Cloud UI でのコレクションスキーマ表示。

        - ➕  Cloud UI でのコレクション作成。

        - ➖  Cloud UI でのコレクション削除。

        - 👁️  Cloud UI でのインデックス表示。

        - 🚀  より良い操作性のための Cloud UI。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年7月22日**

    </div>

    <div>

        - **新リージョン**: 🇺🇸 AWS Oregon (us-west-2)

        - ✅  すべての Core Milvus 機能をサポート。

        - ⏸️  ベクトルデータベースの一時停止と再開をサポート。

        - 📊  基本的なベクトルデータベースメトリクスの表示をサポート。

        - 👥  データベースユーザー管理をサポート。

        - ➕  複数のプロジェクト作成をサポート。

        - 🔐  プロジェクトレベルでの IP ホワイトリスト設定をサポート。

        - 👁️  ユーザー操作イベントの表示をサポート。

        - 🔐  メールによる MFA の有効化をサポート。

    </div>

</Grid>

