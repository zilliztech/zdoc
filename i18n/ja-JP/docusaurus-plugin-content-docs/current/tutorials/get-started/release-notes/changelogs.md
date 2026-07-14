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

        - さらに多くの vector lakebase 機能が登場予定です。

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月6日](./release-notes-2607)**

    </div>

    <div>

        - 🔒 Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。詳細については、手順ごとのマニュアルガイドは [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp)、IaC 自動化は [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月24日](./release-notes-2606)**

    </div>

    <div>

        - 💾 高度にカスタマイズされたバックアップサイクルをオーケストレーションできるようになりました。詳細については、[Schedule Automatic Backups](./schedule-automatic-backups) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月17日](./release-notes-2606)**

    </div>

    <div>

        - 💾 cluster を復元する際に、互換性のある Milvus バージョンを指定できるようになりました。詳細については、[Restore from Backup Files](./restore-from-backup-files) と [Use Recycle Bin](./use-recycle-bin) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月3日](./release-notes-2606)**

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

        - 🔒 異なるリージョンにある複数のデータプレーンを、BYOC プロジェクトで利用できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月7日](./release-notes-2605)**

    </div>

    <div>

        - 🏠 Zilliz Cloud は vector database 製品から Vector Lakebase プラットフォームへと進化し、以下の注目機能を提供します。

            - [On-demand search](./quick-start-to-on-demand-search)

            - [External data lake search](./quick-start-to-external-data-lake-search)

        - 🐦 Zilliz Cloud のオンデマンドコンピュート向けに、Milvus v3.0.x が Private Review に入り、以下の機能が含まれます。

            - [External collections and backfill](./create-external-collection)

            - [Nullable vectors](./nullable-fields),

            - [Embedding list searches and filtering](./use-array-of-structs),

            - [MinHash function](./minhash-function)

            - [searches](./single-vector-search#sort-search-results-by-scalar-fields) および [queries](./get-and-scalar-query) の Order by、

            - [Snapshots](./snapshots),

            - [Entity TTL](./set-collection-ttl),

            - Force merge,

            - カスタム辞書とトークナイザー、および

            - Spark のセマンティック重複排除と異常検出

        - 💾 インポート、移行、および external-collection ワークフロー向けの読み取り専用 [external volumes](./external-volume) が利用可能になりました。

        - 🔍︎ collection レベルの [large top-K](./use-large-topk) が利用可能になり、有効化された collection で返される entity の最大数が 16,384 から 1,000,000 に拡張されました

        - 🗺️ [プロジェクトでリージョン制約が利用可能](./manage-projects) になり、企業がデータレジデンシーを管理し、リージョナルなデータプレーンアクセスを明確に維持できるようになります。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[4月](./release-notes-2604)[ 11, 2026](./release-notes-2604)**

    </div>

    <div>

        - [🌎 Global cluster](./global-cluster-explained) が、洗練されたプラットフォーム機能により、リージョナルな災害復旧フェイルオーバーを完全にサポートするようになりました。

        - 📈 より細かい粒度の [metrics が collection レベルで利用可能](./metrics-alerts-reference#cluster-and-collection-metrics) になりました。

        - 📋 [Access logs](./access-log-overview) が Public Preview で利用可能です。

        - ⚙️ [maintenance window](./organization-settings#set-up-preferred-maintenance-window) が再設計され、より予測可能なアップグレードスケジューリングと事前通知を提供します。

        - 👥 新しい [cluster admin](./project-users) ロールにより、完全なプロジェクトレベルの管理者権限なしで、特定の cluster への運用アクセスをチームメンバーに付与できます。

        - 💾 BYOC プロジェクト内の cluster で階層型ストレージが利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月9日](./release-notes-2602)[, 2026](./release-notes-2602)**

    </div>

    <div>

        - 🔐 非 SSO 認証からのアクセスを制限する [SSO enforcement](./enforce-sso-in-your-organization)。

        - 👥 細かなデータアクセス制御のため、[organization-](./organization-users#organization-role) レベルおよび [project-level](./project-users) で構成される cluster レベルのアクセス制御。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月4日](./release-notes-2602)[, 2026](./release-notes-2602)**

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

        - 🔐 [Customer-managed encryption keys](./cmek) が、Zilliz Cloud cluster の保存データ暗号化に利用可能になりました。

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

        - 🤖 [OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのモデルベースの embedding functions と、[Cohere reranker](./cohere-model-ranker) や [Voyage AI reranker](./voyage-ai-model-ranker) などの reranking functions が Public Preview で利用可能です。

        - 🤖 [Hosted models](./hosted-models) が Private Preview で利用可能です。

        - 🛠️ インテリジェンスを備えた [dynamic replica autoscaling](./auto-scaling)。

        - 📅 なじみのある cron 設定による高度な [scheduled scaling](./scheduled-scaling)。

        - 🌎 [Global cluster](./global-cluster-explained) が稼働開始しました。アクセスするには [Contact us](https://support.zilliz.com/hc/en-us) をご利用ください。

        - ☁️ BYOC が以下の強化により、さらに使いやすくなりました。

            - [フル autoscaling 機能](/docs/byoc/scale-cluster)

            - [技術サポートアクセス制御](/docs/byoc/deploy-byoc-aws#technical-support-access)

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年12月26日](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x が一般提供 (GA) になりました

        - 💾  階層型ストレージが GA になり、[課金が開始](./storage-cost) されます

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[2025年12月1日](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  Stage が [Volume](./managed-volume) に名称変更され、GA になりました

        - [🔐  organization レベル IP Whitelist](./setup-console-ip-allowlist) が利用可能になりました

        - [🔐  TOTP ベース MFA](./multi-factor-auth) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年11月6日](./release-notes-2511#business-critical-plan-availability)**

    </div>

    <div>

        - 🚀  より多くのデータ型とともに、Milvus v2.6.x が Zilliz Cloud で利用可能になりました。

            - [Geometry](./use-geometry-field)、および

            - [Array of Structs](./use-array-of-structs)

        - 🔍  [migrations](./via-endpoint) 中に全文検索機能が利用可能になりました。

        - ⏰  繰り返しアラートを抑制するための [notification interval](./manage-project-alerts) のカスタマイズ。

        - 🔧  collection の再作成なしで、[dynamic field を既存の collections に対して有効化](./modify-collections) できるようになりました。

        - 💳  サブスクリプションプランは project レベルに移行され、cluster には複数のデプロイオプションがあります。詳細は [Detailed Plan Comparison](./select-zilliz-cloud-service-plans) を参照してください。

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

            - 検索結果の精緻化のための [Boost ranker](./boost-ranker) と [Decay rankers](./decay-ranker-oveview)

            - [INT8_VECTOR data type](./use-dense-vector) のサポート

        - 💾  拡張容量 cluster 向けの階層型ストレージアップグレード

        - [🔄 Cross-region backup](./backup-to-other-regions) による事業継続戦略

        - [⚙️  Index build levels](./tune-index-build-level) により、シナリオに合わせて index 設定を調整可能

        - 🚧 Pipelines は非推奨になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年8月20日](./release-notes-2508)**

    </div>

    <div>

        - 📈  構成を簡素化した [Autoscaling upgrade](./auto-scaling)

        - [📋  Audit logs](./audit-logs) が一般提供になりました

        - [🔐  SSO](./single-sign-on) エクスペリエンスが改善されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年8月13日](./release-notes-2508)**

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

        - 🔗  スキーマ進化のためのマージデータ API。

        - 📦  移行とデータインポート向けの共有ステージングレイヤーとしての [Stage](./managed-volume)

        - 📅  [スケジュールベースの cluster autoscaling](./scheduled-scaling)

        - [🔄  cluster の部分復元](./restore-from-backup-files)

        - [⚙️  Zilliz Cloud コンソール上の JSON index](./json-indexing) 設定

        - 📊  BYOC プロジェクト向け quota 設定

        - 🔐  cluster 復元時の RBAC 設定の復元

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年6月9日](./release-notes-2170)**

    </div>

    <div>

        - 📚  [移行ドキュメントとベストプラクティス](./migrate-between-clusters) を刷新

        - [🚨  Policy-based alerts](./manage-project-alerts) による粒度が高く柔軟な監視

        - ⚙️  Zilliz Cloud コンソール上の mmap 設定

        - ☁️  Google Cloud Platform (GCP) 上で BYOC が利用可能になりました

        - 🤖  指示に応える、よく設計された AI アシスタント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年4月24日](./release-notes-2150)**

    </div>

    <div>

        - ⚙️  BYOC プロジェクト向けのインスタンス設定と AWS PrivateLink サポート

        - 🔍  [JSON index](./json-indexing) を使用した JSON フィールドに対する細粒度フィルタリング

        - 🛠️  RESTful API を使用して [cluster の replica 数を変更](/reference/restful/modify-cluster-replica-v2) できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年3月27日](./release-notes-2140)**

    </div>

    <div>

        - 🔒 BYOC-I が完全なデータ主権を提供します

        - [📋  cluster 向け Audit logs](./audit-logs) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2025年1月27日](./release-notes-2130)**

    </div>

    <div>

        - 🚀  Milvus v2.5.x が Zilliz Cloud で利用可能になりました

        - [🔍  Full Text Search](./full-text-search) が既存のセマンティック検索機能を補完します

        - [📋  cluster 向け Audit logs](./audit-logs) が利用可能になりました

        - [☁️  セキュリティが強化された AWS 上の BYOC](/docs/byoc/deploy-byoc-aws)

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年12月26日](./release-notes-2120)**

    </div>

    <div>

        - 🎯  [検索レベルの調整](./tune-recall-rate) による高い再現率

        - [🔐  collection レベル RBAC サポート](./cluster-privileges)

        - [💾  より大きなデータ容量に対応する mmap](./use-mmap) サポート

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

        - 🎨  Zilliz Cloud コンソールを刷新

        - 🔄  データ移行の対応元を拡張: 

            - [Qdrant](./migrate-from-qdrant),

            - [Pinecone](./migrate-from-pinecone), および

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 💳  支払いプロセスの改善と [請求書ページ](./view-invoice) の再設計

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

        - ☁️  Serverless cluster が一般提供になりました

        - 🔄  [Multi-replica](./auto-scaling) が Public Preview で利用可能になりました

        - 📦  Zilliz Cloud へデータを移行するための移行サービス:

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector)、および

            - [Zilliz Cloud cluster 間](./offline-migration)

        - 🛠️  backup、restore、migration、およびジョブ管理向け RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年7月23日](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful API エンドポイントを刷新

        - 🤖  情報取得を容易にするチャットボット

        - [📋  backup、restore、migration、およびデータインポートのためのワンストップジョブ監視](./job-center)

        - [📈  Autoscaling](./manage-cluster) が Private Preview で利用可能になりました

        - 🖼️  Pipelines が画像検索で強化されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2024年6月18日](./release-notes-290)**

    </div>

    <div>

        - 🚀  Milvus v2.4.x が Zilliz Cloud で利用可能になりました

            - [Sparse vector](./use-sparse-vector) データ型のサポート

            - Float16 および BFloat16 vector データ型のサポート

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

        - ☁️  Serverless cluster は現在 beta です

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

        - 🔌  Pipelines が connectors をサポートするようになりました

        - 🔄  Pipelines が検索 pipelines 向けに rerankers を導入しました

        - [📊  RESTful API によるメトリクス監視](/reference/restful/query-metrics) が利用可能です

        - 🌐  クラウド間の [データインポート](./data-import-zero-to-hero) と [移行](./migrate-between-clusters)

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

        - [🔐  API keys](./manage-api-keys) が RBAC 原則で強化されました

        - 📊  [Metric boards and alert system](./metrics-alerts-reference) を刷新

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年12月11日](./release-notes-240)**

    </div>

    <div>

        - ☁️  Zilliz Cloud が Azure で以下のリージョンとともに利用可能になりました。

            - **新リージョン**: 🇺🇸  Azure East US

        - 🚀  Pipelines が beta で利用可能になりました

        - 🔐  cluster における RBAC と認証情報管理

        - 🛠️  cluster 関連の RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年10月17日](./release-notes-230)**

    </div>

    <div>

        - **新リージョン**: 🇩🇪 AWS Frankfurt (aws-en-central-1)

        - 🚀  Milvus v2.3.x が Public Preview で利用可能になりました

            - [Range search](./range-search)

            - [Upsert](./upsert-entities)

            - [Cosine metric type](./search-metrics-explained)

            - [Access control](./access-control-overview)

            - 戻り値での raw vectors

            - [JSON_CONTAINS filter](./json-filtering-operators)

            - [Entity count](./count-entities)

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

        - [🔄  Zilliz Cloud cluster 間のデータ移行](./offline-migration)

        - [🚀  Elasticsearch からの簡単な移行](./migrate-from-elasticsearch)

        - [📥  Data import の強化](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年8月16日](./release-notes-210)**

    </div>

    <div>

        - **新リージョン**: 🇸🇬 AWS Singapore (ap-southeast-1)

        - **新リージョン**: 🇸🇬 GCP Singapore (asia-southeast-1)

        - 🔄  serverless cluster から dedicated cluster への移行サポート

        - 📤  Bulk insert のサポート

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年6月11日](./release-notes-200)**

    </div>

    <div>

        - ☁️  Serverless cluster が利用可能になりました

        - [💰  Zilliz Cloud のプラン階層を導入](https://zilliz.com/pricing)

        - 👥 [access control](./access-control-overview) のための organization、コラボレーション、RBAC

        - 🏷️  namespacing のための partition key を導入

        - 📝  dynamic schema が利用可能になりました

        - 📊  新しいデータ型: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年4月6日](./release-notes-110)**

    </div>

    <div>

        - [💰  料金計算ツール](https://zilliz.com/pricing#calculator)

        - 💾  GCP での [Back & restore](./create-backup)

        - [⏰  カスタムタイムゾーン](./organization-settings#manage-timezone)

        - [🔄  collection の名前変更](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2023年3月6日](./release-notes-100)**

    </div>

    <div>

        - **新リージョン**: 🇺🇸 GCP Oregon (us-west1)

        - ☁️  Zilliz Cloud が [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio) で利用可能になりました

        - [💾  Backup & Restore](./create-backup) が AWS で利用可能になりました

        - [🗑️  データ継続性戦略のための Recycle bin](./use-recycle-bin)

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

        - 🔐  [Private Link](./setup-a-private-link-aws) が利用可能になりました

        - 📥  [Data import](./data-import-zero-to-hero) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2022年11月18日](./release-notes-008)**

    </div>

    <div>

        - 🚀  Zilliz Cloud が招待なしで一般公開されました

        - ⚡  容量最適化 CU が利用可能になりました

        - 📊  QPS とクエリレイテンシのリソースモニター

        - 🛠️  indexing を簡素化する AUTOINDEX

        - ⚡  より良いユーザー体験のための UI パフォーマンス最適化

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年9月15日**

    </div>

    <div>

        - 🎨  collection ビューを刷新

        - 🔍  vector search ビューを刷新

        - 🧑‍💻  Google でのサインアップが利用可能になりました

        - [⚙️  システムメンテナンス設定](./organization-settings) が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月30日**

    </div>

    <div>

        - 📊  より大きな標準 vector database。

        - ⚙️  Cloud UI での collection 管理。

        - ⚙️  Cloud UI での index 管理。

        - 🔍  Cloud UI での vector search 実行。

        - 🔐  セキュリティ上の理由から、デフォルトでインターネットからの database アクセスを無効化。

        - 🔐  Whitelist 利用体験の改善。

        - 💰  クレジットに対応。

        - 🚀  より良い操作性のための Cloud UI 改善。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月1日**

    </div>

    <div>

        - 👁️  Cloud UI での collection 表示。

        - 👁️  Cloud UI での collection schema 表示。

        - ➕  Cloud UI での collection 作成。

        - ➖  Cloud UI での collection 削除。

        - 👁️  Cloud UI での index 表示。

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

        - ⏸️  vector database の一時停止と再開をサポート。

        - 📊  基本的な vector database metrics の表示をサポート。

        - 👥  database ユーザー管理をサポート。

        - ➕  複数 project の作成をサポート。

        - 🔐  project レベルでの IP Whitelist 設定をサポート。

        - 👁️  ユーザー操作イベントの表示をサポート。

        - 🔐  メールによる MFA 有効化をサポート。

    </div>

</Grid>

