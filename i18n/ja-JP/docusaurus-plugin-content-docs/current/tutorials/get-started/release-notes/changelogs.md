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

        **今後のリリース**

    </div>

    <div>

        - さらなる vector lakebase 機能がまもなく追加されます。

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月15日](./release-notes-2607#byoc-supports-storage-integrations-and-external-volumes)**

    </div>

    <div>

        - 💾 BYOC プロジェクトで、[Storage integration](/docs/byoc/integrate-with-aws-s3) と [external volumes](/docs/byoc/external-volume) が利用可能になりました。

        - 📈 オンデマンド cluster で [collection-level metrics](./metrics-alerts-reference) が利用開始されました。

        - 💳 オンデマンド compute と external volumes で課金が発生するようになりました。内訳については、[On-Demand Compute Cost](./on-demand-compute-cost) と [Storage Request Cost](./storage-request-cost) を参照してください。

        - 💻 [Programmable storage integrations](/reference/restful/storage-integration-operations-v2) が RESTful API で利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月6日](./release-notes-2607)**

    </div>

    <div>

        - 🔒 Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。詳細については、手順ごとのマニュアルガイドである [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp) と、IaC 自動化のための [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月24日](./release-notes-2606)**

    </div>

    <div>

        - 💾 高度にカスタマイズ可能なバックアップサイクルをオーケストレーションできるようになりました。詳細は [Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月17日](./release-notes-2606)**

    </div>

    <div>

        - 💾 cluster の復元時に互換性のある Milvus バージョンを指定できるようになりました。詳細は [Restore from Backup Files](./restore-from-backup-files) と [Use Recycle Bin](./use-recycle-bin) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月3日](./release-notes-2606#nullable-vector)**

    </div>

    <div>

        - 📅 vector フィールドが `nullable` 属性をサポートするようになり、既存の collection に新しい vector フィールドを追加できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月13日](./release-notes-2605#byoc-multi-dataplane-support)**

    </div>

    <div>

        - 🔒 BYOC プロジェクトで、異なるリージョンに複数の data plane を設定できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月7日](./release-notes-2605)**

    </div>

    <div>

        - 🏠 Zilliz Cloud は vector database 製品から Vector Lakebase プラットフォームへと進化し、以下の主要機能を提供します。

            - [On-demand search](./quick-start-to-on-demand-search)

            - [External data lake search](./quick-start-to-external-data-lake-search)

        - 🐦 Zilliz Cloud のオンデマンド compute 向けに、Milvus v3.0.x が以下の機能とともに Private Review に入りました。

            - [External collections and backfill](./create-external-collection)

            - [Nullable vectors](./nullable-fields)

            - [Embedding list searches and filtering](./use-array-of-structs),

            - [MinHash function](./minhash-function)

            - [searches](./single-vector-search#sort-search-results-by-scalar-fields) および [queries](./get-and-scalar-query#sort-query-results) の Order by

            - [Snapshots](./snapshots)

            - [Entity TTL](./set-collection-ttl)

            - Force merge

            - Custom dictionaries and tokenizers

            - Spark semantic deduplication and abnormal detection

        - 💾 インポート、移行、および external-collection ワークフロー向けの読み取り専用 [external volumes](./external-volume) が利用開始されました。

        - 🔍︎ collection レベルの [large top-K](./use-large-topk) が利用可能になり、有効化された collection では返されるエンティティの最大数が 16,384 から 1,000,000 に拡張されました

        - 🗺️ [Regional constraints are available in projects](./manage-projects#add-project-regions)。これにより、企業はデータ所在地を管理し、リージョンごとの data-plane アクセスを明示的に維持できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[4月](./release-notes-2604)[11日、2026年](./release-notes-2604)**

    </div>

    <div>

        - [🌎 Global cluster](./global-cluster-explained) が、洗練されたプラットフォーム機能により、リージョン災害復旧フェイルオーバーを完全にサポートするようになりました。

        - 📈 より細かい粒度の [metrics が collection レベルで利用可能](./metrics-alerts-reference#cluster-and-collection-metrics) になりました。

        - 📋 [Access logs](./access-log-overview) が Public Preview で利用可能になりました。

        - ⚙️ [maintenance window](./organization-settings#set-up-preferred-maintenance-window) が再設計され、より予測可能なアップグレードスケジューリングと事前通知を提供します。

        - 👥 新しい [cluster admin](./project-users#cluster-admin) ロールにより、チームメンバーは project レベルの完全な管理者権限なしで、特定の cluster への運用アクセスを取得できます。

        - 💾 BYOC プロジェクト内の cluster で階層型ストレージが利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月9日](./release-notes-2602#sso-enforcement)[、2026年](./release-notes-2602#sso-enforcement)**

    </div>

    <div>

        - 🔐 非 SSO 認証からのアクセスを制限する [SSO enforcement](./enforce-sso-in-your-organization)。

        - 👥 [organization-](./organization-users#organization-role) レベルおよび [project-level](./project-users#project-access) で設定できる cluster レベルのアクセス制御により、きめ細かなデータアクセスを実現。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月4日](./release-notes-2602#new-region-aws-ireland)[、2026年](./release-notes-2602#new-region-aws-ireland)**

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

        - 🚀   Zilliz Cloud で、別の新しい Milvus v2.6.x 機能が利用可能になりました

            - [Primary-Key Search](./primary-key-search)

        - 🔒 BYOC-I が [Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) で利用可能になりました。

        - 🔐 [Customer-managed encryption keys](./cmek) が、Zilliz Cloud cluster の保存データ暗号化のために利用可能になりました。

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

        - 🤖 [OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのモデルベース embedding 関数、および [Cohere reranker](./cohere-model-ranker) や [Voyage AI reranker](./voyage-ai-model-ranker) などの reranking 関数が public preview になりました。

        - 🤖 [Hosted models](./hosted-models) が private preview になりました。

        - 🛠️ インテリジェンスを備えた [Dynamic replica autoscaling](./auto-scaling)。

        - 📅 使い慣れた cron 設定による高度な [scheduled scaling](./scheduled-scaling)。

        - 🌎 [Global cluster](./global-cluster-explained) が提供開始されました。アクセスするには [お問い合わせください](https://support.zilliz.com/hc/en-us)。

        - ☁️ BYOC は以下の機能強化により、さらに使いやすくなりました。

            - [Full autoscaling capabilities](/docs/byoc/scale-cluster)

            - [Technical support access control](/docs/byoc/deploy-byoc-aws#technical-support-access)

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年12月26日](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x が一般提供（GA）になりました

        - 💾  階層型ストレージが GA になり、[課金が開始](./storage-cost) されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[2025年12月1日](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  Stage は [Volume](./managed-volume) に名称変更され、GA になりました

        - [🔐  organization レベルの IP Whitelist](./setup-console-ip-allowlist) が利用可能になりました

        - [🔐  TOTP ベースの MFA](./multi-factor-auth) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年11月6日](./release-notes-2511#business-critical-plan-availability)**

    </div>

    <div>

        - 🚀  より多くのデータ型とともに、Milvus v2.6.x が Zilliz Cloud で利用可能になりました:

            - [Geometry](./use-geometry-field)、および

            - [Array of Structs](./use-array-of-structs)

        - 🔍  [migrations](./via-endpoint#getting-started) 中に全文検索機能が利用可能になりました。

        - ⏰  [notification interval](./manage-project-alerts#alert-settings) をカスタマイズして、繰り返しアラートを抑制できます。

        - 🔧  既存の collection で [dynamic field](./modify-collections#example-5-enable-dynamic-field) を有効化できるようになり、collection の再作成が不要です。

        - 💳  サブスクリプションプランが project レベルに移行し、cluster には複数のデプロイオプションが用意されました。詳細は [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

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

            - 検索結果の改善のための [Boost ranker](./boost-ranker) と [Decay rankers](./decay-ranker-oveview)

            - [INT8_VECTOR data type](./use-dense-vector) のサポート

        - 💾  拡張容量 cluster 向けの階層型ストレージアップグレード

        - 事業継続戦略のための [🔄 Cross-region backup](./backup-to-other-regions)

        - シナリオに合わせて index 設定を調整できる [⚙️  Index build levels](./tune-index-build-level)

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

        - 📦  移行とデータインポートの共有ステージングレイヤーとしての [Stage](./managed-volume)

        - 📅  [Schedule-based cluster autoscaling](./scheduled-scaling)

        - cluster の [🔄  Partial restoration](./restore-from-backup-files#restore-a-partial-cluster)

        - Zilliz Cloud コンソールでの [⚙️  JSON index](./json-indexing) 設定

        - 📊  BYOC プロジェクト向け quota 設定

        - 🔐  cluster 復元時の RBAC 設定の復元

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年6月9日](./release-notes-2170)**

    </div>

    <div>

        - 📚  [Migration docs and best practices](./migrate-between-clusters) が再構成されました

        - きめ細かく柔軟な監視のための [🚨  Policy-based alerts](./manage-project-alerts)

        - Zilliz Cloud コンソールでの ⚙️  mmap 設定

        - ☁️  BYOC が Google Cloud Platform (GCP) で利用可能になりました

        - 🤖  指示に応える、よく設計された AI アシスタント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年4月24日](./release-notes-2150)**

    </div>

    <div>

        - ⚙️  BYOC プロジェクト向けのインスタンス設定と AWS PrivateLink サポート

        - [JSON index](./json-indexing) を使用した JSON フィールドでの高粒度フィルタリング

        - 🛠️  RESTful API を使用して [cluster の replica 数を変更](/reference/restful/modify-cluster-replica-v2) できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年3月27日](./release-notes-2140)**

    </div>

    <div>

        - 🔒 BYOC-I が完全なデータ主権を提供

        - [📋  Audit logs for your clusters](./audit-logs) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年1月27日](./release-notes-2130)**

    </div>

    <div>

        - 🚀  Milvus v2.5.x が Zilliz Cloud で利用可能になりました

        - [🔍  Full Text Search](./full-text-search) が既存のセマンティック検索機能を補完します

        - [📋  Audit logs for your clusters](./audit-logs) が利用可能になりました

        - セキュリティが強化された [☁️  BYOC on AWS](/docs/byoc/deploy-byoc-aws)

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年12月26日](./release-notes-2120)**

    </div>

    <div>

        - 🎯  [turning the search level](./tune-recall-rate) による高い再現率

        - [🔐  Collection-level RBAC support](./cluster-privileges#collection-level-privilege-groups)

        - [💾  mmap](./use-mmap) サポートによるデータ容量の拡張

        - マルチテナンシー向けの [🗂️  Database](/docs/database) が利用可能になりました

        - **新リージョン**: 🇺🇸 GCP us-central1 (Iowa)

        - [☁️  BYOC](/docs/byoc/deploy-byoc-aws) が AWS で利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年11月6日](./release-notes-2110)**

    </div>

    <div>

        - 🎨  Zilliz Cloud コンソールが再構成されました

        - 🔄  対応ソースを拡張したデータ移行: 

            - [Qdrant](./migrate-from-qdrant),

            - [Pinecone](./migrate-from-pinecone)、および

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 💳  支払いプロセスが改善され、[invoice page](./view-invoice) が再設計されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年10月14日](./release-notes-2102)**

    </div>

    <div>

        - [📚  Notebook gallery](https://zilliz.com/learn/milvus-notebooks) が公開されました

        - ⚡  容量を拡張したパフォーマンス最適化 cluster

        - 🔄  [Multi-replica](./auto-scaling) が一般提供になりました

        - **新リージョン**: 🇯🇵 AWS Tokyo (ap-northeast-1)

        - [📊  Prometheus と統合](./prometheus-monitoring)

        - Auth0 による [🔑  Single sign-on (SSO)](./single-sign-on)

        - 🎁  AWS Marketplace を使用した無料トライアル

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年9月14日](./release-notes-2100)**

    </div>

    <div>

        - ☁️  Serverless cluster が一般提供になりました

        - 🔄  [Multi-replica](./auto-scaling) が public preview で利用可能になりました

        - 📦  Zilliz Cloud にデータを移行するための migration サービス:

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector)、および

            - [Zilliz Cloud cluster 間](./offline-migration)

        - 🛠️  バックアップ、復元、移行、ジョブ管理のための RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年7月23日](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful API エンドポイントが再構成されました

        - 🤖  情報を簡単に取得できるチャットボット

        - バックアップ、復元、移行、データインポートのための [📋  One-stop job monitoring](./job-center)

        - [📈  Autoscaling](./manage-cluster) が private preview で利用可能になりました

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

            - Float16 & BFloat16 vector データ型のサポート

            - [Multi-vector hybrid search](./hybrid-search)

            - [Inverted index](./inverted-index-type) と [fuzzy match](./basic-filtering-operators)

            - [Grouping search](./grouping-search)

            - 改良された MilvusClient インターフェース

        - 📊  Pipelines が token 使用量を監視するようになりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年5月15日](./release-notes-280)**

    </div>

    <div>

        - ☁️  Serverless cluster がベータ版になりました

        - **新リージョン**: 🇩🇪 Azure Germany West Central (Frankfurt)

        - **新リージョン**: 🇩🇪 GCP europe-west3 (Frankfurt) と 🇺🇸 us-east-4 (Virginia)

        - 🧠  テキスト pipelines と画像 pipelines が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年4月13日](./release-notes-270)**

    </div>

    <div>

        - [🛒  Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice) が公開されました

        - 🔌  Pipelines が connector をサポートするようになりました

        - 🔄  Pipelines に検索 pipeline 向け reranker が導入されました

        - [📊  RESTful API によるメトリクス監視](/reference/restful/query-metrics) が利用可能になりました

        - 🌐  クラウド間の [data import](./data-import-zero-to-hero) と [migration](./migrate-between-clusters)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年3月13日](./release-notes-260)**

    </div>

    <div>

        - 🧠  Pipelines がより多くの embedding モデルをサポートするようになりました

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

        - 📊  [Metric boards and alert system](./metrics-alerts-reference) が再構成されました

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年12月11日](./release-notes-240)**

    </div>

    <div>

        - ☁️  Zilliz Cloud が以下のリージョンで Azure 上でも利用可能に:

            - **新リージョン**: 🇺🇸  Azure East US

        - 🚀  Pipelines がベータ版として利用可能に

        - 🔐  クラスター内の RBAC と認証情報管理

        - 🛠️  クラスター関連の RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年10月17日](./release-notes-230)**

    </div>

    <div>

        - **新リージョン**: 🇩🇪 AWS Frankfurt (aws-en-central-1)

        - 🚀  Milvus v2.3.x がパブリックプレビューとして利用可能に

            - [範囲検索](./range-search)

            - [Upsert](./upsert-entities)

            - [Cosine メトリックタイプ](./search-metrics-explained)

            - [アクセス制御](./access-control-overview)

            - 生ベクトルを返却

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

        - [📥  データインポートの機能強化](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年8月16日](./release-notes-210)**

    </div>

    <div>

        - **新リージョン**: 🇸🇬 AWS Singapore (ap-southeast-1)

        - **新リージョン**: 🇸🇬 GCP Singapore (asia-southeast-1)

        - 🔄  serverless クラスターから dedicated クラスターへの移行をサポート

        - 📤  一括挿入をサポート

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年6月11日](./release-notes-200)**

    </div>

    <div>

        - ☁️  Serverless クラスターが利用可能に

        - [💰  Zilliz Cloud のプラン階層を導入](https://zilliz.com/pricing)

        - 👥  [アクセス制御](./access-control-overview)のための組織、コラボレーション、RBAC

        - 🏷️  名前空間化のための partition key を導入

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

        - [🔄  Collection 名の変更](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年3月6日](./release-notes-100)**

    </div>

    <div>

        - **新リージョン**: 🇺🇸 GCP Oregon (us-west1)

        - ☁️  Zilliz Cloud が [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio) で利用可能に

        - [💾  Backup & Restore](./create-backup) が AWS で利用可能に

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

        - 📚  初心者向けのインラインガイド

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年1月10日](./release-notes-010)**

    </div>

    <div>

        - 👁️  collection のデータプレビュー

        - 📚  初心者が vector database に慣れるのに役立つデモデータセット

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

        - 🚀  Zilliz Cloud が招待不要で一般公開

        - ⚡  容量最適化 CUs が利用可能に

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

        - 🎨  Collection ビューをリファクタリング

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

        - 📊  より大規模な標準 vector database。

        - ⚙️  Cloud UI での collection 管理。

        - ⚙️  Cloud UI での index 管理。

        - 🔍  Cloud UI でのベクトル検索の実行。

        - 🔐  セキュリティ上の理由により、デフォルトでインターネットからのデータベースアクセスを無効化。

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

        - 👁️  Cloud UI での collection の表示。

        - 👁️  Cloud UI での collection スキーマの表示。

        - ➕  Cloud UI での collection の作成。

        - ➖  Cloud UI での collection の削除。

        - 👁️  Cloud UI での index の表示。

        - 🚀  より良い操作性のための Cloud UI。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年7月22日**

    </div>

    <div>

        - **新リージョン**: 🇺🇸 AWS Oregon (us-west-2)

        - ✅  Core Milvus のすべての機能をサポート。

        - ⏸️  vector database の一時停止と再開をサポート。

        - 📊  基本的な vector database メトリクスの表示をサポート。

        - 👥  データベースユーザー管理をサポート。

        - ➕  複数プロジェクトの作成をサポート。

        - 🔐  プロジェクトレベルでの IP Whitelist 設定をサポート。

        - 👁️  ユーザー操作イベントの表示をサポート。

        - 🔐  メールによる MFA の有効化をサポート。

    </div>

</Grid>

