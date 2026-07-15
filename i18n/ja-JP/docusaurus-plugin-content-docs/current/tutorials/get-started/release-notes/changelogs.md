---
title: "変更履歴 | Cloud"
slug: /changelogs
sidebar_key: changelogs
sidebar_label: "変更履歴"
beta: FALSE
notebook: FALSE
description: "最終更新日: 2026年7月15日 | Cloud"
type: origin
token: MUL3wkn7Yi3YoFkYk59csf8bnNc
sidebar_position: 0
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - 変更履歴

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 変更履歴

**最終更新日:** 2026年7月15日

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **次期リリース**

    </div>

    <div>

        - Vector Lakebase のさらなる機能が近日公開予定です。

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月15日](./release-notes-2607)**

    </div>

    <div>

        - 💾 BYOC プロジェクトで[ストレージ統合](/docs/byoc/integrate-with-aws-s3)と[外部ボリューム](/docs/byoc/external-volume)が利用可能になりました。

        - 📈 オンデマンドクラスターで[コレクションレベルのメトリクス](./metrics-alerts-reference)が利用可能になりました。

        - 💳 オンデマンドコンピュートと外部ボリュームに対する課金が開始されました。料金の内訳については、[オンデマンドコンピュートのコスト](./on-demand-compute-cost)および[ストレージリクエストのコスト](./storage-request-cost)を参照してください。

        - 💻 RESTful API を通じて[プログラムによるストレージ統合](/reference/restful/storage-integration-operations-v2)を利用できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年7月6日](./release-notes-2607)**

    </div>

    <div>

        - 🔒 Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。詳細については、手動でのステップバイステップ手順は [GCP 上で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-gcp) を、IaC 自動化については [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月24日](./release-notes-2606)**

    </div>

    <div>

        - 💾 高度にカスタマイズしたバックアップサイクルを構成できるようになりました。詳細については、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月17日](./release-notes-2606)**

    </div>

    <div>

        - 💾 クラスターを復元するときに、互換性のある Milvus バージョンを指定できるようになりました。詳細については、[バックアップファイルからの復元](./restore-from-backup-files)および[ごみ箱を使用](./use-recycle-bin)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年6月3日](./release-notes-2606#nullable-vector)**

    </div>

    <div>

        - 📅 ベクトルフィールドが `nullable` 属性をサポートするようになり、既存のコレクションに新しいベクトルフィールドを追加できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月13日](./release-notes-2605#byoc-multi-dataplane-support)**

    </div>

    <div>

        - 🔒 BYOC プロジェクトで、異なるリージョンに複数のデータプレーンを作成できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2026年5月7日](./release-notes-2605)**

    </div>

    <div>

        - 🏠 Zilliz Cloud は、ベクトルデータベース製品から Vector Lakebase プラットフォームへ進化し、以下の主要機能が追加されました。

            - [オンデマンド検索](./quick-start-to-on-demand-search)

            - [外部データレイク検索](./quick-start-to-external-data-lake-search)

        - 🐦 Milvus v3.0.x が Zilliz Cloud のオンデマンドコンピュート向けに Private Review に入り、以下の機能が利用可能になりました。

            - [External Collection と Backfill](./create-external-collection)

            - [Nullable Vectors](./nullable-fields)

            - [Embedding list の検索とフィルタリング](./use-array-of-structs)

            - [MinHash Function](./minhash-function)

            - [検索](./single-vector-search#sort-search-results-by-scalar-fields)および[クエリ](./get-and-scalar-query#sort-query-results)での Order by

            - [Snapshots](./snapshots)

            - [Entity TTL](./set-collection-ttl)

            - Force merge

            - Custom dictionaries and tokenizers

            - Spark semantic deduplication and abnormal detection

        - 💾 インポート、移行、External Collection ワークフロー向けの読み取り専用[External Volumes](./external-volume)が利用可能になりました。

        - 🔍︎ コレクションレベルの[Large Top-K](./use-large-topk)が利用可能になり、有効化したコレクションで返却可能なエンティティ上限が 16,384 から 1,000,000 に拡張されました。

        - 🗺️ [プロジェクトでリージョン制約が利用可能](./manage-projects#add-project-regions)になり、企業がデータレジデンシーを管理し、リージョンごとのデータプレーンアクセスを明示的に維持しやすくなりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[4月](./release-notes-2604)[ 11, 2026](./release-notes-2604)**

    </div>

    <div>

        - [🌎 グローバルクラスタ](./global-cluster-explained)が、強化されたプラットフォーム機能により、リージョン間ディザスタリカバリーの完全なサポートを提供するようになりました。

        - 📈 より細かい粒度の[コレクションレベルでのメトリクス](./metrics-alerts-reference#cluster-and-collection-metrics)が利用可能になりました。

        - 📋 [アクセスログ](./access-log-overview)がパブリックプレビューで利用可能になりました。

        - ⚙️ [メンテナンスウィンドウ](./organization-settings#set-up-preferred-maintenance-window)が再設計され、より予測可能なアップグレードスケジューリングと事前通知が提供されるようになりました。

        - 👥 新しい[クラスタ管理者](./project-users#cluster-admin)ロールにより、チームメンバーはプロジェクトレベルの完全な管理者権限なしに、特定のクラスタへの運用アクセスを取得できます。

        - 💾 階層型ストレージがBYOCプロジェクトのクラスタで利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月9日](./release-notes-2602#sso-enforcement)[, 2026](./release-notes-2602#sso-enforcement)**

    </div>

    <div>

        - 🔐 [SSOの強制適用](./enforce-sso-in-your-organization)により、SSO認証以外からのアクセスを制限できます。

        - 👥 [組織レベル](./organization-users#organization-role)および[プロジェクトレベル](./project-users#project-access)で設定されるクラスタレベルのアクセス制御により、きめ細かなデータアクセスが実現します。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月4日](./release-notes-2602#new-region-aws-ireland)[, 2026](./release-notes-2602#new-region-aws-ireland)**

    </div>

    <div>

        - **新しいリージョン**: 🇮🇪 AWS アイルランド (eu-west-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[1月29日, 2026](./release-notes-2601#another-milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   新しいMilvus v2.6.xの機能がZilliz Cloudで利用可能になりました

            - [プライマリキー検索](./primary-key-search)

        - 🔒 BYOC-Iが[Microsoft Azure](/docs/byoc/deploy-byoc-i-azure)で利用可能になりました。

        - 🔐 [カスタマー管理の暗号化キー](./cmek)が、Zilliz Cloudクラスタ内の保存データの暗号化に利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[1月23日, 2026](./release-notes-2601#milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   新しいMilvus v2.6.xの機能がZilliz Cloudで利用可能になりました

            - [セマンティックハイライター](./semantic-highlighter)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[1月15日, 2026](./release-notes-2601)**

    </div>

    <div>

        - 🚀   新しいMilvus v2.6.xの機能がZilliz Cloudで利用可能になりました

            - [TIMESTAMPTZフィールド](./use-timestamptz-field)

            - [テキストハイライター](./text-highlighter)

        - 🤖 [OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere)などのモデルベースの埋め込み関数、および [Cohere リランカー](./cohere-model-ranker)、[Voyage AI リランカー](./voyage-ai-model-ranker)などのリランキング関数がパブリックプレビューで利用可能になりました。

        - 🛠️ インテリジェンスを備えた[動的レプリカの自動スケーリング](./manage-replica#dynamic-scaling)。

        - 📅 おなじみのcron設定による高度な[スケジュールされたスケーリング](./scale-query-cu#scheduled-scaling)。

        - 🌎 [グローバルクラスタ](./global-cluster-explained)が稼働開始しました。[お問い合わせ](https://support.zilliz.com/hc/en-us)いただくとアクセスできます。

        - ☁️ BYOCが以下の機能強化により、より使いやすくなりました：

            - [完全な自動スケーリング機能](/docs/byoc/scale-cluster)

            - [テクニカルサポートのアクセス制御](/docs/byoc/deploy-byoc-aws#technical-support-access)

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[12月26日, 2025](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.xが一般提供（GA）開始

        - 💾  階層型ストレージがGAとなり、[課金が開始](./storage-cost)されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[12月1日, 2025](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  ステージが[ボリューム](./managed-volume)に名称変更され、GAとなりました

        - [🔐  組織レベルのIPホワイトリスト](./setup-console-ip-allowlist)が利用可能になりました

        - [🔐  TOTPベースのMFA](./multi-factor-auth)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[11月6日, 2025](./release-notes-2511#business-critical-plan-availability)**

    </div>

    <div>

        - 🚀  Milvus v2.6.xがZilliz Cloudで利用可能になり、より多くのデータ型をサポート：

            - [ジオメトリ](./use-geometry-field)、および

            - [構造体の配列](./use-array-of-structs)

        - 🔍  [データ移行](./via-endpoint#getting-started)中に全文検索機能が利用可能になりました。

        - ⏰  繰り返しのアラートを抑制するための[通知間隔のカスタマイズ](./manage-project-alerts#alert-settings)。

        - 🔧  [既存のコレクションで動的フィールドを有効化](./modify-collections#example-5-enable-dynamic-field)でき、コレクションの再作成が不要になりました。

        - 💳  サブスクリプションプランがプロジェクトレベルに移行し、クラスタには複数のデプロイメントオプションが用意されました。詳細は[詳細なプラン比較](./select-zilliz-cloud-service-plans)をご覧ください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[10月9日, 2025](./release-notes-2510#milvus-v26x-public-preview)**

    </div>

    <div>

        - 🚀  Milvus v2.6.xがZilliz Cloudで利用可能になりました

            - ダウンタイムなしの[フィールド追加](./add-fields-to-an-existing-collection)

            - [多言語アナライザー](./multi-language-analyzers)と[フレーズ一致](./phrase-match)による強化された全文検索

            - [JSONインデックス](./json-indexing)と[Shredding](./json-shredding)による高速化されたJSONフィルタリング

            - 検索結果の絞り込みのための[ブーストランカー](./boost-ranker)と[デケイランカー](./decay-ranker-oveview)

            - [INT8_VECTORデータ型](./use-dense-vector)のサポート

        - 💾  拡張容量クラスタ向けの階層型ストレージアップグレード

        - [🔄 クロスリージョンバックアップ](./backup-to-other-regions)によるビジネス継続性戦略

        - [⚙️  インデックス構築レベル](./tune-index-build-level)により、シナリオに応じたインデックス設定のカスタマイズが可能

        - 🚧 Pipelinesが非推奨となりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[8月20日, 2025](./release-notes-2508#autoscaling-upgrade)**

    </div>

    <div>

        - 📈  [自動スケーリングのアップグレード](./scale-query-cu#dynamic-scaling)により、設定が簡素化されました

        - [📋  監査ログ](./audit-logs)が一般提供開始

        - [🔐  SSO](./single-sign-on)のエクスペリエンスが改善されました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[8月13日, 2025](./release-notes-2508#support-aws-sydney-region)**

    </div>

    <div>

        - **新しいリージョン**: 🇦🇺 AWS シドニー (ap-southeast-2)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[7月15日, 2025](./release-notes-2180)**

    </div>

    <div>

        - 🔗  データマージAPIによるスキーマ進化。

        - 📦  [ステージ](./managed-volume)をデータ移行とデータインポートの共有ステージングレイヤーとして

        - 📅  [スケジュールベースのクラスタ自動スケーリング](./scale-query-cu#scheduled-scaling)

        - [🔄  クラスタの部分的な復元](./restore-from-backup-files#restore-a-partial-cluster)

        - [⚙️  Zilliz CloudコンソールでのJSONインデックス](./json-indexing)設定

        - 📊  BYOCプロジェクトのクォータ設定

        - 🔐  クラスタ復元時のRBAC設定の復元

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[6月9日, 2025](./release-notes-2170)**

    </div>

    <div>

        - 📚  [移行ドキュメントとベストプラクティス](./migrate-between-clusters)のリファクタリング

        - [🚨  ポリシーベースのアラート](./manage-project-alerts)によるきめ細かく柔軟な監視

        - ⚙️  Zilliz Cloudコンソールでのmmap設定

        - ☁️  BYOCがGoogle Cloud Platform (GCP)で利用可能になりました

        - 🤖  コマンドに応じる洗練されたAIアシスタント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[4月24日, 2025](./release-notes-2150)**

    </div>

    <div>

        - ⚙️  BYOCプロジェクトのインスタンス設定とAWS プライベートLinkサポート

        - 🔍  [JSONインデックス](./json-indexing)を使用したJSONフィールドのきめ細かなフィルタリング

        - 🛠️  RESTful APIを使用して[クラスタのレプリカ数を変更](/reference/restful/modify-cluster-replica-v2)できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[3月27日, 2025](./release-notes-2140)**

    </div>

    <div>

        - 🔒 BYOC-Iが完全なデータ主権を提供

        - [📋  クラスタの監査ログ](./audit-logs)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[1月27日, 2025](./release-notes-2130)**

    </div>

    <div>

        - 🚀  Milvus v2.5.xがZilliz Cloudで利用可能になりました

        - [🔍  全文検索](./full-text-search)が既存のセマンティック検索機能を補完

        - [📋  クラスタの監査ログ](./audit-logs)が利用可能になりました

        - [☁️  AWSでのBYOC](/docs/byoc/deploy-byoc-aws)がセキュリティ強化とともに提供開始

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[12月26日, 2024](./release-notes-2120)**

    </div>

    <div>

        - 🎯  [検索レベルの変更](./tune-recall-rate)による高い再現率

        - [🔐  コレクションレベルのRBACサポート](./cluster-privileges#collection-level-privilege-groups)

        - [💾  mmap](./use-mmap)による拡張データ容量のサポート

        - [🗂️  マルチテナンシー向けデータベース](/docs/database)が利用可能になりました

        - **新しいリージョン**: 🇺🇸 GCP us-central1 (アイオワ)

        - [☁️  AWSでのBYOC](/docs/byoc/deploy-byoc-aws)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[11月6日, 2024](./release-notes-2110)**

    </div>

    <div>

        - 🎨  Zilliz Cloudコンソールのリファクタリング

        - 🔄  データ移行のソースが拡大：

            - [Qdrant](./migrate-from-qdrant)、

            - [Pinecone](./migrate-from-pinecone)、および

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 💳  支払いプロセスの改善と[請求書ページ](./view-invoice)の再設計

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[10月14日, 2024](./release-notes-2102)**

    </div>

    <div>

        - [📚  ノートブックギャラリー](https://zilliz.com/learn/milvus-notebooks)が公開

        - ⚡  容量拡張されたパフォーマンス最適化済みクラスタ

        - 🔄  [マルチレプリカ](./manage-replica)が一般提供開始

        - **新しいリージョン**: 🇯🇵 AWS 東京 (ap-northeast-1)

        - [📊  Prometheusとの統合](./prometheus-monitoring)

        - [🔑  Auth0を使用したシングルサインオン (SSO)](./single-sign-on)

        - 🎁  AWS Marketplaceを使用した無料トライアル

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[9月14日, 2024](./release-notes-2100)**

    </div>

    <div>

        - ☁️  サーバーレスクラスタが一般提供開始

        - 🔄  [マルチレプリカ](./manage-replica)がパブリックプレビューで利用可能

        - 📦  Zilliz Cloudへのデータ移行サービス：

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector)、および

            - [Zilliz Cloudクラスタ間](./offline-migration)

        - 🛠️  バックアップ、復元、移行、およびジョブ管理のRESTful APIエンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[7月23日, 2024](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful APIエンドポイントのリファクタリング

        - 🤖  簡単な情報検索のためのチャットボット

        - [📋  バックアップ、復元、移行、およびデータインポートのためのワンストップジョブ監視](./job-center)

        - [📈  自動スケーリング](./manage-cluster)がプライベートプレビューで利用可能

        - 🖼️  画像検索機能が強化されたPipelines

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[6月18日, 2024](./release-notes-290)**

    </div>

    <div>

        - 🚀  Milvus v2.4.xがZilliz Cloudで利用可能になりました

            - [スパースベクトル](./use-sparse-vector)データ型のサポート

            - Float16 & BFloat16ベクトルデータ型のサポート

            - [マルチベクトルハイブリッド検索](./hybrid-search)

            - [転置インデックス](./inverted-index-type)と[ファジーマッチ](./basic-filtering-operators)

            - [グルーピング検索](./grouping-search)

            - 洗練されたMilvusClientインターフェース

        - 📊  Pipelinesがトークン使用量を監視するようになりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[5月15日, 2024](./release-notes-280)**

    </div>

    <div>

        - ☁️  サーバーレスクラスタがベータ版となりました

        - **新しいリージョン**: 🇩🇪 Azure Germany West Central (フランクフルト)

        - **新しいリージョン**: 🇩🇪 GCP europe-west3 (フランクフルト) および 🇺🇸 us-east-4 (バージニア)

        - 🧠  テキストパイプラインと画像パイプラインが利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[4月13日, 2024](./release-notes-270)**

    </div>

    <div>

        - [🛒  Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice)が公開

        - 🔌  Pipelinesがコネクタをサポート

        - 🔄  検索パイプラインのリランカー導入

        - [📊  RESTful APIによるメトリクス監視](/reference/restful/query-metrics)が利用可能

        - 🌐  クロスクラウドの[データインポート](./data-import-zero-to-hero)と[データ移行](./migrate-between-clusters)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[3月13日, 2024](./release-notes-260)**

    </div>

    <div>

        - 🧠  Pipelinesがより多くの埋め込みモデルをサポート

        - 🎮  Zilliz Cloudコンソールでコレクションプレイグラウンドが利用可能

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[1月18日, 2024](./release-notes-250)**

    </div>

    <div>

        - 📥  [Parquetファイルからのデータインポート](./data-import-zero-to-hero)

        - [🔐  RBAC原則を備えたAPIキー](./manage-api-keys)の強化

        - 📊  [メトリクスボードとアラートシステム](./metrics-alerts-reference)のリファクタリング

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[12月11日, 2023](./release-notes-240)**

    </div>

    <div>

        - ☁️  Zilliz CloudがAzureで利用可能になり、以下のリージョンを提供：

            - **新しいリージョン**: 🇺🇸  Azure East US

        - 🚀  Pipelinesがベータ版で利用可能

        - 🔐  クラスタでのRBACと認証情報管理

        - 🛠️  クラスタ関連のRESTful APIエンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[10月17日, 2023](./release-notes-230)**

    </div>

    <div>

        - **新しいリージョン**: 🇩🇪 AWS フランクフルト (aws-en-central-1)

        - 🚀  Milvus v2.3.xがパブリックプレビューで利用可能

            - [範囲検索](./range-search)

            - [アップサート](./upsert-entities)

            - [コサインメトリックタイプ](./search-metrics-explained)

            - [アクセス制御](./access-control-overview)

            - 返却される生ベクトル

            - [JSON_CONTAINSフィルタ](./json-filtering-operators)

            - [エンティティ数](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[9月27日, 2023](./release-notes-221)**

    </div>

    <div>

        - 💰  前払いのサポート

        - **新しいリージョン**: 🇺🇸 AWS US East 1 (aws-us-east-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[9月13日, 2023](./release-notes-220)**

    </div>

    <div>

        - [🔄  Zilliz Cloudクラスタ間のデータ移行](./offline-migration)

        - [🚀  Elasticsearchからの簡単な移行](./migrate-from-elasticsearch)

        - [📥  データインポートの機能強化](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[8月16日, 2023](./release-notes-210)**

    </div>

    <div>

        - **新しいリージョン**: 🇸🇬 AWS シンガポール (ap-southeast-1)

        - **新しいリージョン**: 🇸🇬 GCP シンガポール (asia-southeast-1)

        - 🔄  サーバーレスクラスタから専用クラスタへの移行サポート

        - 📤  一括挿入のサポート

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[6月11日, 2023](./release-notes-200)**

    </div>

    <div>

        - ☁️  サーバーレスクラスタが利用可能になりました

        - [💰  Zilliz Cloudプラン階層の導入](https://zilliz.com/pricing)

        - 👥  [アクセス制御](./access-control-overview)のための組織、コラボレーション、およびRBAC

        - 🏷️  名前空間分けのためのパーティションキーの導入

        - 📝  動的スキーマが利用可能になりました

        - 📊  新しいデータ型: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[4月6日, 2023](./release-notes-110)**

    </div>

    <div>

        - [💰  料金計算ツール](https://zilliz.com/pricing#calculator)

        - 💾  [GCPでのバックアップと復元](./create-backup)

        - [⏰  カスタムタイムゾーン](./organization-settings#manage-timezone)

        - [🔄  コレクション名の変更](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[3月6日, 2023](./release-notes-100)**

    </div>

    <div>

        - **新しいリージョン**: 🇺🇸 GCP オレゴン (us-west1)

        - ☁️  Zilliz Cloudが[AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio)で利用可能になりました

        - [💾  AWSでのバックアップと復元](./create-backup)が利用可能になりました

        - [🗑️  データ継続性戦略のためのごみ箱](./use-recycle-bin)

        - 🔄  [Milvusからの移行](./migrate-from-milvus)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[2月13日, 2023](./release-notes-011)**

    </div>

    <div>

        - 📧  Eメール通知

        - 📚  初心者向けのインラインガイダンス

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[1月10日, 2023](./release-notes-010)**

    </div>

    <div>

        - 👁️  コレクションのデータプレビュー

        - 📚  ベクトルデータベースに慣れるためのデモデータセット

    </div>

</Grid>

## 2022\{#2022}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[12月5日, 2022](./release-notes-009)**

    </div>

    <div>

        - 🎨  新しいデザインのZilliz Cloudコンソール

        - **新しいリージョン**: 🇺🇸 AWS オハイオ (us-east-2)

        - 🔐  [プライベート Link](./setup-a-private-link-aws)が利用可能になりました

        - 📥  [データインポート](./data-import-zero-to-hero)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[11月18日, 2022](./release-notes-008)**

    </div>

    <div>

        - 🚀  Zilliz Cloudが招待なしで一般公開

        - ⚡  容量最適化済みCUがオンライン

        - 📊  QPSとクエリレイテンシーのリソースモニター

        - 🛠️  インデックス作成を簡素化するAUTOINDEX

        - ⚡  より良いユーザーエクスペリエンスのためのUIパフォーマンスの最適化

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年9月15日**

    </div>

    <div>

        - 🎨  コレクションビューのリファクタリング

        - 🔍  ベクトル検索ビューのリファクタリング

        - 🧑‍💻  Googleでのサインアップが利用可能

        - [⚙️  システムメンテナンス設定](./organization-settings)が利用可能

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月30日**

    </div>

    <div>

        - 📊  より大きな標準ベクトルデータベース。

        - ⚙️  Cloud UIでのコレクション管理。

        - ⚙️  Cloud UIでのインデックス管理。

        - 🔍  Cloud UIでのベクトル検索実行。

        - 🔐  セキュリティ上の理由から、デフォルトでインターネットからのデータベースアクセスを無効化。

        - 🔐  ホワイトリスト機能の改善。

        - 💰  クレジットのサポート。

        - 🚀  より良いインタラクションのためのCloud UIの改善。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月1日**

    </div>

    <div>

        - 👁️  Cloud UIでのコレクション表示。

        - 👁️  Cloud UIでのコレクションスキーマ表示。

        - ➕  Cloud UIでのコレクション作成。

        - ➖  Cloud UIでのコレクション削除。

        - 👁️  Cloud UIでのインデックス表示。

        - 🚀  より良いインタラクションのためのCloud UI。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年7月22日**

    </div>

    <div>

        - **新しいリージョン**: 🇺🇸 AWS オレゴン (us-west-2)

        - ✅  すべてのCore Milvus機能をサポート。

        - ⏸️  ベクトルデータベースの一時停止と再開をサポート。

        - 📊  基本的なベクトルデータベースメトリクスの表示をサポート。

        - 👥  データベースユーザー管理をサポート。

        - ➕  複数のプロジェクト作成をサポート。

        - 🔐  プロジェクトレベルでのIPホワイトリスト設定をサポート。

        - 👁️  ユーザー操作イベントの表示をサポート。

        - 🔐  EメールによるMFAの有効化をサポート。

    </div>

</Grid>
