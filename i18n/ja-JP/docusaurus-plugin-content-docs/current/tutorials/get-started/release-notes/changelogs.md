---
title: "変更履歴 | Cloud"
slug: /changelogs
sidebar_label: "変更履歴"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "最終更新日: 2026年10月19日 | Cloud"
type: origin
token: MUL3wkn7Yi3YoFkYk59csf8bnNc
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 変更履歴

**最終更新日:** 2026年10月19日

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **次回リリース**

    </div>

    <div>

        - ベクトル Lakebase のより多くのベクトル機能が近日提供される予定です。

    </div>

</Grid>

## 2026\{#2026}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[Oct](./release-notes-2610#zero-downtime-migration)[ 19, 2026](./release-notes-2610#zero-downtime-migration)**

    </div>

    <div>

        - 🚚 [Zero Downtime Migration](./zero-downtime-migration) は、ダウンタイムなしで既存の Dedicated クラスターにコレクションを移行し、切り替え前に最大 7 日間、増分変更を同期します。

        - 📥 [Data Backfill](./data-backfill) は、プライマリキーを使用して Parquet ファイルから既存エンティティの選択したフィールドを一括更新します。`coalesce`、`overwrite`、`replace` モードに加え、変更がないかを確認する事前チェックを備えています。

        - 🔐 [Google Cloud クラスターでの CMEK](./gcp-kms): `Business Critical` プロジェクトは、Dedicated クラスターの作成時または暗号化されたバックアップの復元時に Google Cloud KMS キーを選択できます。

        - 🌍 2 つの[新しい BYOC リージョン](./cloud-providers-and-regions): Google Cloud europe-west9（パリ）と AWS ap-southeast-7（タイ）。

        - 🔑 SSO 強制適用で[Organization Owner を除外](./enforce-sso-in-your-organization)できるようになり、[Ping Identity (PingOne)](./single-sign-on-with-ping-one) が SAML 2.0 経由の SSO オプションに加わりました。

        - ⏱️ [オンデマンドクラスターのキープウォームスケジュール](./manage-on-demand-clusters)では、コンソールまたは `keepWarm` API オブジェクトで管理される毎週の実行時間枠を維持します。

        - 📦 [Milvus からの移行](./via-endpoint)では、コレクションごとのインデックス作成をスキップし、後でインデックスを構築できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Sept 22, 2026**

    </div>

    <div>

        🐦 **Serverless クラスターと Free クラスターが Milvus v3.0.x と互換性を持つようになりました** — Zilliz Cloud は Serverless クラスターを Milvus v3.0.x にアップグレードしたため、次の機能をユーザー側の操作なしで利用できます:

        - [検索集約](/docs/search-aggregation)

        - [検索](/docs/single-vector-search#sort-search-results-by-scalar-fields)と[クエリ](/docs/get-and-scalar-query#sort-query-results)の並べ替え

        - [クエリ集約](/docs/get-and-scalar-query#aggregate-query-results)

        - [正規表現フィルタリング](/docs/pattern-match#use-regex)

        - StructArray フィールドの[要素レベルの検索](/docs/search-with-struct-array#run-element-level-search)と[一致演算子](/docs/struct-array-filtering)

        - [MinHash 関数](/docs/minhash-function)

        - [エンティティレベルの TTL](/docs/set-collection-ttl#set-entity-level-ttl)

        - 既存のコレクションからの[フィールドと関数の削除](/docs/add-fields-to-an-existing-collection#drop-fields-and-functions-from-an-existing-collection)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Sept 3, 2026**

    </div>

    <div>

        - 🔐 **強化された[アクセス制御](./access-control-overview)** — 組織ロールとプロジェクトロールを分離し、カスタムプロジェクトロールを作成し、IdP と同期されたグループにロールを割り当て、[SCIM でユーザーとグループをプロビジョニング](./scim-provisioning-overview)し、API を通じてロールを管理します。

        - 🐢 **[Dedicated クラスターの低速ログ](./configure-slow-logs)** — 遅い Search、Hybrid Search、Query リクエストをキャプチャし、分析用にログをユーザー自身のオブジェクトストレージに配信します。

        - 📈 **クラスター作成時のレプリカとオートスケーリングの構成** — Dedicated クラスターまたは Global クラスターの作成時に、[レプリカ数と Query CU](./create-cluster) のオートスケーリング範囲を設定します。

        - 🌎 **リージョンを考慮したプロジェクトナビゲーション** — [プロジェクト](./manage-projects)のリソースをリージョンごとに管理し、リージョンの追加と削除をより簡単にできるようにし、マルチリージョンプロジェクトでのクラスター作成を合理化します。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Aug 6, 2026**

    </div>

    <div>

        - **新しいリージョン**: 🇯🇵 東京（日本、GCP）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **Aug 3, 2026**

    </div>

    <div>

        - **新しいリージョン**: 🇬🇧 ロンドン（英国、AWS）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 15, 2026](./release-notes-2607#byoc-supports-storage-integrations-and-external-volumes)**

    </div>

    <div>

        - 💾 [ストレージ統合](/docs/byoc/integrate-with-aws-s3)と[外部ボリューム](/docs/byoc/external-volume)が BYOC プロジェクトで利用可能になりました。

        - 📈 [コレクションレベルのメトリクス](./metrics-alerts-reference)がオンデマンドクラスターで利用可能になりました。

        - 💳 オンデマンドコンピューティングと外部ボリュームには、今後料金が発生します。内訳については、[オンデマンドコンピューティングのコスト](./on-demand-compute-cost)と[ストレージリクエストのコスト](./storage-request-cost)を参照してください。

        - 💻 [プログラム可能なストレージ統合](/reference/restful/storage-integration-operations-v2)が RESTful API を通じて利用できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 6, 2026](./release-notes-2607)**

    </div>

    <div>

        - 🔒 Zilliz Cloud の **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。詳細については、ステップバイステップの手順ガイドとして [GCP への BYOC-I のデプロイ](/docs/byoc/deploy-byoc-i-gcp)、IaC 自動化として [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 24, 2026](./release-notes-2606)**

    </div>

    <div>

        - 💾 高度にカスタマイズされたバックアップサイクルを編成できるようになりました。詳細については、[自動バックアップのスケジュール](./schedule-automatic-backups)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 17, 2026](./release-notes-2606)**

    </div>

    <div>

        - 💾 クラスターの復元時に互換性のある Milvus バージョンを指定できるようになりました。詳細については、[バックアップファイルからの復元](./restore-from-backup-files)と[リサイクルビンの使用](./use-recycle-bin)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 3, 2026](./release-notes-2606#nullable-vector)**

    </div>

    <div>

        - 📅 ベクトルフィールドが `nullable` 属性をサポートするようになり、既存のコレクションに新しいベクトルフィールドを追加できるようになりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[May 13, 2026](./release-notes-2605#byoc-multi-dataplane-support)**

    </div>

    <div>

        - 🔒 BYOC プロジェクトでは、異なるリージョンにある複数のデータプレーンを使用できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[May 7, 2026](./release-notes-2605)**

    </div>

    <div>

        - 🏠 Zilliz Cloud は、ベクトルデータベース製品から ベクトル Lakebase プラットフォームに進化し、次の主要機能を備えています:

            - [オンデマンド検索](./quick-start-to-on-demand-search)

            - [外部データレイク検索](./quick-start-to-external-data-lake-search)

        - 🐦 Milvus v3.0.x が Zilliz Cloud のオンデマンドコンピューティング向けに Private Review に入り、次の機能を備えています:

            - [外部コレクションとバックフィル](./create-external-collection)

            - [Nullable ベクトル](./nullable-fields)

            - [埋め込みリスト検索とフィルタリング](./use-array-of-structs),

            - [MinHash 関数](./minhash-function)

            - [検索](./single-vector-search#sort-search-results-by-scalar-fields)と[クエリ](./get-and-scalar-query#sort-query-results)の並べ替え

            - [スナップショット](./snapshots)

            - [エンティティ TTL](./set-collection-ttl)

            - Force merge

            - カスタム辞書とトークナイザー

            - Spark のセマンティック重複排除と異常検出

        - 💾 インポート、移行、外部コレクションワークフロー向けの読み取り専用[外部ボリューム](./external-volume)が利用可能になりました。

        - 🔍︎ コレクションレベルの[大規模 top-K](./use-large-topk)が利用可能になり、有効化されたコレクションでは返されるエンティティの最大数が 16,384 から 1,000,000 に拡大されます

        - 🗺️ [プロジェクトでリージョン制約を利用できるようになり](./manage-projects#add-project-regions)、企業がデータレジデンシーを管理し、リージョンデータプレーンへのアクセスを明示的に維持できるようにします。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **April 27, 2026**

    </div>

    <div>

        - **新しいリージョン**: 🇰🇷 ソウル（韓国、AWS）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April](./release-notes-2604)[ 11, 2026](./release-notes-2604)**

    </div>

    <div>

        - [🌎 Global クラスター](./global-cluster-explained)は、洗練されたプラットフォーム機能により、リージョン単位の災害復旧障害を完全にサポートするようになりました。

        - 📈 よりきめ細かな[メトリクスがコレクションレベルで利用可能](./metrics-alerts-reference#cluster-and-collection-metrics)になりました。

        - 📋 [アクセスログ](./access-log-overview)がパブリックプレビューで利用できます。

        - ⚙️ [メンテナンスウィンドウ](./organization-settings#set-up-preferred-maintenance-window)が再設計され、より予測可能なアップグレードスケジュールと事前通知を提供します。

        - 👥 新しい[クラスター管理者](./manage-platform-roles#predefined-project-roles)ロールにより、チームメンバーはプロジェクトレベルの完全な管理者権限なしで特定のクラスターに運用アクセスできます。

        - 💾 階層型ストレージが BYOC プロジェクトのクラスターで利用可能になりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[February 9](./release-notes-2602#sso-enforcement)[, 2026](./release-notes-2602#sso-enforcement)**

    </div>

    <div>

        - 🔐 [SSO 強制適用](./enforce-sso-in-your-organization)により、SSO 以外の認証からのアクセスを制限します。

        - 👥 クラスターレベルのアクセス制御を[組織](./manage-platform-roles)[および](./manage-platform-roles)[プロジェクト](./manage-platform-roles)レベルで構成し、きめ細かなデータアクセスを実現します。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[February 4](./release-notes-2602#new-region-aws-ireland)[, 2026](./release-notes-2602#new-region-aws-ireland)**

    </div>

    <div>

        - **新しいリージョン**: 🇮🇪 AWS アイルランド（eu-west-1）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 29, 2026](./release-notes-2601#another-milvus-v26x-new-feature)**

    </div>

    <div>

        - 🚀   もう 1 つの新しい Milvus v2.6.x 機能が Zilliz Cloud で利用可能になりました

            - [プライマリキー検索](./primary-key-search)

        - 🔒 BYOC-I が [Microsoft Azure](/docs/byoc/deploy-byoc-i-azure) で利用可能になりました。

        - 🔐 [顧客管理の暗号化キー](./cmek)を使用して、Zilliz Cloud クラスターの保存データを暗号化できます。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 15, 2026](./release-notes-2601)**

    </div>

    <div>

        - 🚀   新しい Milvus v2.6.x 機能が Zilliz Cloud で利用可能になりました

            - [TIMESTAMPTZ フィールド](./use-timestamptz-field)

            - [テキストハイライター](./text-highlighter)

        - 🤖 [OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのモデルベースの埋め込み関数、および [Cohere reranker](./cohere-model-ranker) や [Voyage AI reranker](./voyage-ai-model-ranker) などの再ランキング関数をパブリックプレビューで利用できます。

        - 🤖 ホスト型モデルをプライベートプレビューで利用できます。

        - 🛠️ インテリジェントな[動的レプリカオートスケーリング](./auto-scaling)。

        - 📅 使い慣れた cron 設定による高度な[スケジュールスケーリング](./scheduled-scaling)。

        - 🌎 [Global クラスター](./global-cluster-explained)が利用可能になりました。利用するには[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

        - ☁️ BYOC は次の機能強化により、より使いやすくなりました:

            - [手動スケーリング](./manual-scaling)、[オートスケーリング](./auto-scaling)、[スケジュールスケーリング](./scheduled-scaling)などの完全なオートスケーリング機能。

            - [テクニカルサポートのアクセス制御](/docs/byoc/deploy-byoc-aws#technical-support-access)

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 26, 2025](./release-notes-2512#milvus-v26-ga)**

    </div>

    <div>

        - 🚀   Milvus v2.6.x が一般提供（GA）になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[December 1, 2025](./release-notes-2512#volume-ga-formerly-stage)**

    </div>

    <div>

        - 📦  Stage は [Volume](./managed-volume) に名前が変更され、GA になりました

        - [🔐  組織レベルの IP ホワイトリスト](./setup-console-ip-allowlist)が利用可能になりました

        - [🔐  TOTP ベースの MFA](./multi-factor-auth)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[November 6, 2025](./release-notes-2511#business-critical-plan-availability)**

    </div>

    <div>

        - 🚀  Milvus v2.6.x が Zilliz Cloud でより多くのデータ型に対応して利用可能になりました:

            - [Geometry](./use-geometry-field)、および

            - [Array of Structs](./use-array-of-structs)

        - 🔍  [移行](./via-endpoint#getting-started)中に全文検索機能を利用できるようになりました。

        - ⏰  繰り返し通知を抑制するために[通知間隔](./manage-project-alerts#alert-settings)をカスタマイズできます。

        - 🔧  コレクションを再作成せずに[既存のコレクションで動的フィールドを有効化](./modify-collections#example-5-enable-dynamic-field)できます。

        - 💳  サブスクリプションプランはプロジェクトレベルに移行され、クラスターには複数のデプロイオプションが用意されています。詳細については、[プランの詳細比較](./select-zilliz-cloud-service-plans)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,75">

    <div>

        **[October 9, 2025](./release-notes-2510#milvus-v26x-public-preview)**

    </div>

    <div>

        - 🚀  Milvus v2.6.x が Zilliz Cloud で利用可能になりました

            - ダウンタイムなしの[フィールド追加](./add-fields-to-an-existing-collection)

            - [多言語アナライザー](./multi-language-analyzers)と[フレーズ一致](./phrase-match)による強化された全文検索

            - [JSON インデックス](./json-indexing)と[Shredding](./json-shredding)による JSON フィルタリングの高速化

            - 検索結果を改善するための[Boost ranker](./boost-ranker)と[Decay ranker](./decay-ranker-oveview)

            - [INT8_VECTOR データ型](./use-dense-vector)のサポート

        - 💾  拡張容量クラスター向けの階層型ストレージのアップグレード

        - ビジネス継続性戦略のための[🔄 クロスリージョンバックアップ](./backup-to-other-regions)

        - シナリオに合わせてインデックス設定を調整できる[⚙️ インデックス構築レベル](./tune-index-build-level)

        - 🚧 Pipelines は非推奨になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[August 20, 2025](./release-notes-2508#autoscaling-upgrade)**

    </div>

    <div>

        - 📈  構成を簡素化した[オートスケーリングのアップグレード](./auto-scaling)

        - [📋  監査ログ](./audit-logs)が一般提供になりました

        - [🔐  SSO](./single-sign-on)のエクスペリエンスが向上しました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[August 13, 2025](./release-notes-2508#support-aws-sydney-region)**

    </div>

    <div>

        - **新しいリージョン**: 🇦🇺 AWS シドニー（ap-southeast-2）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 15, 2025](./release-notes-2180)**

    </div>

    <div>

        - 🔗  スキーマ進化のためのデータマージ API。

        - 📦  移行とデータインポートのための共有ステージングレイヤーとしての [Stage](./managed-volume)

        - 📅  [スケジュールベースのクラスターオートスケーリング](./scheduled-scaling)

        - クラスターの[🔄  部分復元](./restore-from-backup-files#restore-a-partial-cluster)

        - Zilliz Cloud コンソールでの[⚙️  JSON インデックス](./json-indexing)設定

        - 📊  BYOC プロジェクトのクォータ設定

        - 🔐  クラスター復元時の RBAC 設定の復元

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 9, 2025](./release-notes-2170)**

    </div>

    <div>

        - 📚  [移行ドキュメントとベストプラクティス](./migrate-between-clusters)をリファクタリング

        - 詳細で柔軟な監視のための[🚨  ポリシーベースのアラート](./manage-project-alerts)

        - Zilliz Cloud コンソールでの ⚙️  mmap 設定

        - ☁️  BYOC が Google Cloud Platform（GCP）で利用可能になりました

        - 🤖  コマンドに対応する、よく設計された AI アシスタント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April 24, 2025](./release-notes-2150)**

    </div>

    <div>

        - ⚙️  BYOC プロジェクトのインスタンス設定と AWS PrivateLink サポート

        - [JSON インデックス](./json-indexing)を使用した JSON フィールドのきめ細かなフィルタリング

        - 🛠️  RESTful API を使用して[クラスターのレプリカ数を変更](/reference/restful/modify-cluster-replica-v2)します。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[March 27, 2025](./release-notes-2140)**

    </div>

    <div>

        - 🔒 BYOC-I による完全なデータ主権

        - [📋  クラスターの監査ログ](./audit-logs)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 27, 2025](./release-notes-2130)**

    </div>

    <div>

        - 🚀  Milvus v2.5.x が Zilliz Cloud で利用可能になりました

        - [🔍  全文検索](./full-text-search)が既存のセマンティック検索機能を補完します

        - [📋  クラスターの監査ログ](./audit-logs)が利用可能になりました

        - セキュリティが強化された[☁️  AWS 上の BYOC](/docs/byoc/deploy-byoc-aws)

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 26, 2024](./release-notes-2120)**

    </div>

    <div>

        - 🎯  [検索レベルを調整](./tune-recall-rate)することによる高い再現率

        - [🔐  コレクションレベルの RBAC サポート](./cluster-privileges#collection-level-privilege-groups)

        - データ容量を拡張するための [💾  mmap](./use-mmap) サポート

        - マルチテナンシー向けの [🗂️  データベース](/docs/database)が利用可能になりました

        - **新しいリージョン**: 🇺🇸 GCP us-central1（アイオワ）

        - [☁️  BYOC](/docs/byoc/deploy-byoc-aws)が AWS で利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[November 6, 2024](./release-notes-2110)**

    </div>

    <div>

        - 🎨  Zilliz Cloud コンソールをリファクタリングしました

        - 🔄  移行元を拡張したデータ移行: 

            - [Qdrant](./migrate-from-qdrant)、

            - [Pinecone](./migrate-from-pinecone)、および

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 💳  支払いプロセスを改善し、[請求書ページ](./view-invoice)を再設計しました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[October 14, 2024](./release-notes-2102)**

    </div>

    <div>

        - [📚  ノートブックギャラリー](https://zilliz.com/learn/milvus-notebooks)が公開されました

        - ⚡  容量を拡張したパフォーマンス最適化クラスター

        - 🔄  [マルチレプリカ](./auto-scaling)が一般提供になりました

        - **新しいリージョン**: 🇯🇵 AWS 東京（ap-northeast-1）

        - [📊  Prometheus との統合](./prometheus-monitoring)

        - [🔑  Auth0 によるシングルサインオン（SSO）](./single-sign-on)

        - 🎁  AWS Marketplace を使用した無料トライアル

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[September 14, 2024](./release-notes-2100)**

    </div>

    <div>

        - ☁️  Serverless クラスターが一般提供になりました

        - 🔄  [マルチレプリカ](./auto-scaling)がパブリックプレビューで利用可能になりました

        - 📦  Zilliz Cloud にデータを移行するための移行サービス:

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector)、および

            - [Zilliz Cloud クラスター間](./offline-migration)

        - 🛠️  バックアップ、復元、移行、ジョブ管理用の RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[July 23, 2024](./release-notes-291)**

    </div>

    <div>

        - 🛠️  RESTful API エンドポイントをリファクタリングしました

        - 🤖  情報を簡単に取得できるチャットボット

        - バックアップ、復元、移行、データインポート用の[📋  一元化されたジョブ監視](./job-center)

        - [📈  オートスケーリング](./manage-cluster)がプライベートプレビューで利用可能になりました

        - 🖼️  画像検索で強化された Pipelines

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 18, 2024](./release-notes-290)**

    </div>

    <div>

        - 🚀  Milvus v2.4.x が Zilliz Cloud で利用可能になりました

            - [Sparse vector](./use-sparse-vector)データ型のサポート

            - Float16 および BFloat16 ベクトルデータ型のサポート

            - [マルチベクトルハイブリッド検索](./hybrid-search)

            - [転置インデックス](./inverted-index-type)と[あいまい一致](./basic-filtering-operators)

            - [グループ化検索](./grouping-search)

            - 改良された MilvusClient インターフェース

        - 📊  Pipelines がトークン使用量を監視するようになりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[May 15, 2024](./release-notes-280)**

    </div>

    <div>

        - ☁️  Serverless クラスターがベータ版になりました

        - **新しいリージョン**: 🇩🇪 Azure Germany West Central（フランクフルト）

        - **新しいリージョン**: 🇩🇪 GCP europe-west3（フランクフルト）および 🇺🇸 us-east-4（バージニア）

        - 🧠  テキストパイプラインと画像パイプラインが利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April 13, 2024](./release-notes-270)**

    </div>

    <div>

        - [🛒  Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice)が公開されました

        - 🔌  Pipelines がコネクターをサポートするようになりました

        - 🔄  Pipelines が検索パイプライン用の再ランカーを導入しました

        - [📊  RESTful API によるメトリック監視](/reference/restful/query-metrics)が利用可能になりました

        - 🌐  クロスクラウドの[データインポート](./data-import-zero-to-hero)と[移行](./migrate-between-clusters)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[March 13, 2024](./release-notes-260)**

    </div>

    <div>

        - 🧠  Pipelines がより多くの埋め込みモデルをサポートするようになりました

        - 🎮  コレクションプレイグラウンドが Zilliz Cloud コンソールで利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 18, 2024](./release-notes-250)**

    </div>

    <div>

        - 📥  Parquet ファイルからの[データインポート](./data-import-zero-to-hero)

        - [🔐  API キー](./manage-api-keys)が RBAC の原則で強化されました

        - 📊  [メトリックボードとアラートシステム](./metrics-alerts-reference)をリファクタリングしました

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 11, 2023](./release-notes-240)**

    </div>

    <div>

        - ☁️  Zilliz Cloud が Azure で次のリージョンとともに利用可能になりました:

            - **新しいリージョン**: 🇺🇸  Azure East US

        - 🚀  Pipelines がベータ版で利用可能になりました

        - 🔐  クラスターでの RBAC と認証情報の管理

        - 🛠️  クラスター関連の RESTful API エンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[October 17, 2023](./release-notes-230)**

    </div>

    <div>

        - **新しいリージョン**: 🇩🇪 AWS フランクフルト（aws-en-central-1）

        - 🚀  Milvus v2.3.x がパブリックプレビューで利用可能になりました

            - [範囲検索](./range-search)

            - [Upsert](./upsert-entities)

            - [コサイン類似度のメトリックタイプ](./search-metrics-explained)

            - アクセス制御

            - ベクトルをそのまま返す

            - [JSON_CONTAINS フィルター](./json-filtering-operators)

            - [エンティティ数](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[September 27, 2023](./release-notes-221)**

    </div>

    <div>

        - 💰  前払いのサポート

        - **新しいリージョン**: 🇺🇸 AWS US East 1（aws-us-east-1）

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[September 13, 2023](./release-notes-220)**

    </div>

    <div>

        - [🔄  Zilliz Cloud クラスター間のデータ移行](./offline-migration)

        - [🚀  Elasticsearch からの簡単な移行](./migrate-from-elasticsearch)

        - [📥  データインポートの機能強化](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[August 16, 2023](./release-notes-210)**

    </div>

    <div>

        - **新しいリージョン**: 🇸🇬 AWS シンガポール（ap-southeast-1）

        - **新しいリージョン**: 🇸🇬 GCP シンガポール（asia-southeast-1）

        - 🔄  Serverless クラスターから Dedicated クラスターへの移行のサポート

        - 📤  一括挿入のサポート

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[June 11, 2023](./release-notes-200)**

    </div>

    <div>

        - ☁️  Serverless クラスターが利用可能になりました

        - [💰  Zilliz Cloud プラン階層の導入](https://zilliz.com/pricing)

        - 👥  アクセス制御のための組織、コラボレーション、RBAC

        - 🏷️  名前空間用のパーティションキーの導入

        - 📝  動的スキーマが利用可能になりました

        - 📊  新しいデータ型: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[April 6, 2023](./release-notes-110)**

    </div>

    <div>

        - [💰  料金計算ツール](https://zilliz.com/pricing#calculator)

        - 💾  GCP での[バックアップと復元](./create-backup)

        - [⏰  カスタムタイムゾーン](./organization-settings#manage-timezone)

        - [🔄  コレクション名の変更](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[March 6, 2023](./release-notes-100)**

    </div>

    <div>

        - **新しいリージョン**: 🇺🇸 GCP オレゴン（us-west1）

        - ☁️  Zilliz Cloud が [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio) で利用可能になりました

        - [💾  バックアップと復元](./create-backup)が AWS で利用可能になりました

        - データ継続性戦略のための[🗑️  リサイクルビン](./use-recycle-bin)

        - 🔄  [Milvus からの移行](./migrate-from-milvus)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[February 13, 2023](./release-notes-011)**

    </div>

    <div>

        - 📧  メール通知

        - 📚  初心者向けのインラインガイダンス

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[January 10, 2023](./release-notes-010)**

    </div>

    <div>

        - 👁️  コレクションのデータプレビュー

        - 初心者がベクトルデータベースに慣れるための 📚  デモデータセット

    </div>

</Grid>

## 2022\{#2022}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[December 5, 2022](./release-notes-009)**

    </div>

    <div>

        - 🎨  新しいデザインの Zilliz Cloud コンソール

        - **新しいリージョン**: 🇺🇸 AWS オハイオ（us-east-2）

        - 🔐  [Private Link](./setup-a-private-link-aws)が利用可能になりました

        - 📥  [データインポート](./data-import-zero-to-hero)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **[November 18, 2022](./release-notes-008)**

    </div>

    <div>

        - 🚀  Zilliz Cloud が招待なしで一般公開されました

        - ⚡  容量最適化 CU が利用可能になりました

        - 📊  QPS とクエリレイテンシ用のリソースモニター

        - 🛠️  インデックス作成を簡素化する AUTOINDEX

        - ⚡  ユーザーエクスペリエンス向上のための UI パフォーマンスの最適化

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **September 15, 2022**

    </div>

    <div>

        - 🎨  コレクションビューをリファクタリングしました

        - 🔍  ベクトル検索ビューをリファクタリングしました

        - 🧑‍💻  Google でのサインアップが利用可能になりました

        - [⚙️  システムメンテナンス設定](./organization-settings)が利用可能になりました

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 30, 2022**

    </div>

    <div>

        - 📊  より大規模な標準ベクトルデータベース。

        - ⚙️  Cloud UI でのコレクションの管理。

        - ⚙️  Cloud UI でのインデックスの管理。

        - 🔍  Cloud UI でのベクトル検索の実行。

        - 🔐  セキュリティ上の理由から、デフォルトでインターネットからのデータベースアクセスを無効化します。

        - 🔐  ホワイトリスト設定のエクスペリエンスを改善します。

        - 💰  クレジットをサポートします。

        - 🚀  より良いインタラクションのための Cloud UI の改善。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **August 1, 2022**

    </div>

    <div>

        - 👁️  Cloud UI でのコレクションの表示。

        - 👁️  Cloud UI でのコレクションスキーマの表示。

        - ➕  Cloud UI でのコレクションの作成。

        - ➖  Cloud UI でのコレクションの削除。

        - 👁️  Cloud UI でのインデックスの表示。

        - 🚀  より良いインタラクションのための Cloud UI。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **July 22, 2022**

    </div>

    <div>

        - **新しいリージョン**: 🇺🇸 AWS オレゴン（us-west-2）

        - ✅  Milvus のすべてのコア機能をサポートします。

        - ⏸️  ベクトルデータベースの一時停止と再開をサポートします。

        - 📊  基本的なベクトルデータベースメトリクスの表示をサポートします。

        - 👥  データベースユーザー管理をサポートします。

        - ➕  複数のプロジェクトの作成をサポートします。

        - 🔐  プロジェクトレベルでの IP ホワイトリスト設定をサポートします。

        - 👁️  ユーザーの操作イベントの表示をサポートします。

        - 🔐  メールによる MFA の有効化をサポートします。

    </div>

</Grid>
