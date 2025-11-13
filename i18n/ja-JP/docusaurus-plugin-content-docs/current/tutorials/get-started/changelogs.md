---
title: "変更履歴 | Cloud"
slug: /changelogs
sidebar_label: "変更履歴"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "最終更新日: 2025年11月6日 | Cloud"
type: origin
token: MUL3wkn7Yi3YoFkYk59csf8bnNc
sidebar_position: 16
keywords:
  - zilliz
  - vector database
  - cloud
  - changelogs
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 変更履歴

**最終更新日:** 2025年11月6日

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **今後のリリース**

    </div>

    <div>

        - Milvus v2.6.x 機能が一般提供される

        - モデルプロバイダー統合によるホスト型埋め込み & ランク付けモデル、および

        - 多くの新機能がプライベートプレビューで利用可能になる。

    </div>

</Grid>

## 2025\{#2025}

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025年11月6日**

    </div>

    <div>

        - 🔥 Zilliz CloudでMilvus v2.6.xが利用可能になり、より多くのデータ型がサポートされる：

            - [ジオメトリ](./use-geometry-field)、および

            - [構造体の配列](./use-array-of-structs)

        - 👏 [移行](./via-endpoint#getting-started)中に全文検索機能が利用可能になる。

        - 😘 繰り返しアラートを抑えるために[通知間隔](./manage-project-alerts#alert-settings)をカスタマイズ可能。

        - 🚀 コレクションの再作成なしに[既存コレクションで動的フィールドが有効化可能](./modify-collections#example-4-enable-dynamic-field)になる。

        - 🔔 サブスクリプションプランがプロジェクトレベルに移行され、クラスターにはいくつかのデプロイメントオプションが用意されている。詳しくは[詳細プラン比較](./select-zilliz-cloud-service-plans)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="24,75">

    <div>

        **2025年10月9日**

    </div>

    <div>

        - Zilliz CloudでMilvus v2.6.xが利用可能になる

            - ダウンタイムなしでの[フィールド追加](./add-fields-to-an-existing-collection)

            - [多言語アナライザー](./multi-language-analyzers)と[フレーズマッチ](./phrase-match)による強化された全文検索

            - [JSONインデックス](./json-indexing)と[シャレディング](./json-shredding)による高速JSONフィルタリング

            - 検索結果の絞り込みのための[ブーストレンカー](./boost-ranker)と[減衰ランカー](./decay-ranker)

            - [INT8_VECTORデータ型](./use-dense-vector)のサポート

        - 拡張容量クラスターのための階層ストレージアップグレード

        - ビジネス継続性戦略のための[地域間バックアップ](./backup-to-other-regions)

        - シナリオに応じてインデックス設定を調整するための[インデックスビルドレベル](./tune-index-build-level)

        - 🚧 パイプラインが非推奨になる

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年8月20日**

    </div>

    <div>

        - シンプルな構成で[Autoscalingアップグレード](./scale-cluster#dynamic-scaling)

        - [監査ログ](./audit-logs)が一般提供される

        - [SSO](./single-sign-on)体験の向上

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年8月13日**

    </div>

    <div>

        - **新規リージョン**: 🇦🇺 AWS シドニー (ap-southeast-2)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年7月15日**

    </div>

    <div>

        - スキーマ進化のための[データ統合API](./merge-data)。

        - 移行とデータインポートのための共有ステージングレイヤーとしての[ステージ](./manage-stages)

        - [クラスターオートスケーリングのスケジュールベース](./scale-cluster)

        - [クラスターの部分復元](./restore-from-snapshot#restore-a-partial-cluster)

        - Zilliz Cloudコンソールでの[JSONインデックス](./json-indexing)設定

        - BYOCプロジェクトのクォータ設定

        - クラスター復元中のRBAC設定の復元

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年6月9日**

    </div>

    <div>

        - [移行ドキュメントとベストプラクティス](./migrations)のリファクタリング

        - 細かく柔軟な監視のための[ポリシーに基づくアラート](./manage-project-alerts)

        - Zilliz Cloudコンソールでのmmap設定

        - Google Cloud Platform (GCP)でのBYOC利用可能

        - コマンドに対する優れた設計のAIアシスタント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年4月24日**

    </div>

    <div>

        - [ダウンタイムゼロでの移行](./zero-downtime-migration)が利用可能になる

        - BYOCプロジェクトのインスタンス設定とAWS PrivateLinkサポート

        - [JSONインデックス](./use-json-fields)を使用したJSONフィールドの細かいフィルタリング

        - RESTful APIを使用して[クラスターのレプリカ数を変更](/reference/restful/modify-cluster-replica-v2)可能。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年3月27日**

    </div>

    <div>

        - BYOC-I は完全なデータ主権を提供

        - [クラスターの監査ログ](./audit-logs)が利用可能になる

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2025年1月27日**

    </div>

    <div>

        - Zilliz CloudでMilvus v2.5.xが利用可能になる

        - 既存のセマンティック検索機能を補完する[全文検索](./full-text-search)

        - [クラスターの監査ログ](./audit-logs)が利用可能になる

        - セキュリティ強化のための[AWSでのBYOC](/docs/byoc/deploy-byoc-aws)

    </div>

</Grid>

## 2024\{#2024}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年12月26日**

    </div>

    <div>

        - [検索レベルの調整](./tune-recall-rate)による高い再現率

        - [コレクションレベルのRBACサポート](./cluster-privileges#collection-level-privilege-groups)

        - 拡張データ容量のための[mmap](./use-mmap)サポート

        - マルチテナンシーのための[データベース](/docs/database)が利用可能になる

        - **新規リージョン**: 🇺🇸 GCP us-central1 (アイオワ)

        - AWSでの[BYOC](/docs/byoc/deploy-byoc-aws)が利用可能になる

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年11月6日**

    </div>

    <div>

        - Zilliz Cloudコンソールのリファクタリング

        - 拡張ソースを使用したデータ移行：

            - [Qdrant](./migrate-from-qdrant)、

            - [Pinecone](./migrate-from-pinecone)、および

            - [Tencent Cloud](./migrate-from-tencent-cloud)

        - 改善された支払いプロセスと再設計された[請求書ページ](./view-invoice)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年10月14日**

    </div>

    <div>

        - [ノートブックギャラリー](https://zilliz.com/learn/milvus-notebooks)がオンライン

        - 容量拡張のパフォーマンス最適化クラスター

        - [マルチレプリカ](./manage-replica)が一般提供される

        - **新規リージョン**: 🇯🇵 AWS 東京 (ap-northeast-1)

        - [Prometheusとの統合](./prometheus-monitoring)

        - Auth0による[シングルサインオン (SSO)](./single-sign-on)

        - AWSマーケットプレイスを使用した無料体験

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年9月14日**

    </div>

    <div>

        - サーバーレスクラスターが一般提供される

        - [マルチレプリカ](./manage-replica)がパブリックプレビューで利用可能になる

        - Zilliz Cloudへのデータ移行のための移行サービス：

            - [Milvus](./migrate-from-milvus)

            - [Elasticsearch](./migrate-from-elasticsearch)

            - [PostgreSQL](./migrate-from-pgvector)、および

            - [Zilliz Cloudクラスター間](./offline-migration)

        - バックアップ、復元、移行、ジョブ管理のためのRESTful APIエンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年7月23日**

    </div>

    <div>

        - RESTful APIエンドポイントのリファクタリング

        - 情報検索を容易にするチャットボット

        - バックアップ、復元、移行、データインポートのための[ワンストップジョブ監視](./job-center)

        - [オートスケーリング](./manage-cluster)がプライベートプレビューで利用可能になる

        - 画像検索で強化されたパイプライン

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年6月18日**

    </div>

    <div>

        - Zilliz CloudでMilvus v2.4.xが利用可能になる

            - [スパースベクトル](./use-sparse-vector)データ型サポート

            - Float16 & BFloat16ベクトルデータ型サポート

            - [マルチベクトルハイブリッド検索](./hybrid-search)

            - [逆インデックス](./index-scalar-fields)および[ファジー検索](./basic-filtering-operators#example-2-using-like-for-pattern-matching)

            - [グルーピング検索](./grouping-search)

            - 精巧なMilvusClientインターフェース

        - パイプラインがトークン使用量を監視する

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年5月15日**

    </div>

    <div>

        - サーバーレスクラスターがベータ版になる

        - **新規リージョン**: 🇩🇪 Azure ドイツ西部中央 (フランクフルト)

        - **新規リージョン**: 🇩🇪 GCP europe-west3 (フランクフルト) および 🇺🇸 us-east-4 (バージニア)

        - テキストパイプラインと画像パイプラインが利用可能になる

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年4月13日**

    </div>

    <div>

        - [Azureマーケットプレイス](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/zillizinc1703056661329.zilliz_cloud?tab=PlansAndPrice)がオンライン

        - パイプラインがコネクタをサポート

        - 検索パイプラインのための新規ランカーが導入される

        - [RESTful APIを通じたメトリック監視](/reference/restful/query-metrics)が利用可能

        - クラス間の[データインポート](./data-import)と[移行](./migrations)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年3月13日**

    </div>

    <div>

        - パイプラインがより多くの埋め込みモデルをサポート

        - コレクションプレイグラウンドがZilliz Cloudコンソールで利用可能になる

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2024年1月18日**

    </div>

    <div>

        - Parquetファイルからの[データインポート](./data-import)

        - RBAC原則で強化された[APIキー](./manage-api-keys)

        - [メトリックボードとアラートシステム](./metrics-and-alerts)のリファクタリング

    </div>

</Grid>

## 2023\{#2023}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年12月11日**

    </div>

    <div>

        - 次のリージョンでZilliz CloudがAzureで利用可能：

            - **新規リージョン**: 🇺🇸 Azure 米国東部

        - パイプラインがベータ版で利用可能

        - クラスターでのRBACと認証情報管理

        - クラスター関連のRESTful APIエンドポイント

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年10月17日**

    </div>

    <div>

        - **新規リージョン**: 🇩🇪 AWS フランクフルト (aws-en-central-1)

        - Milvus v2.3.xがパブリックプレビューで利用可能

            - [範囲検索](./range-search)

            - [アップサート](./upsert-entities)

            - [コサインメトリックタイプ](./search-metrics-explained)

            - [アクセス制御](./access-control)

            - 返却される生ベクトル

            - [JSON_CONTAINSフィルター](./json-filtering-operators)

            - [エンティティのカウント](./count-entities)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年9月27日**

    </div>

    <div>

        - 前払支払いのサポート

        - **新規リージョン**: 🇺🇸 AWS 米国東部1 (aws-us-east-1)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年9月13日**

    </div>

    <div>

        - [Zilliz Cloudクラスター間のデータ移行](./offline-migration)

        - [Elasticsearchからの簡単な移行](./migrate-from-elasticsearch)

        - [データインポートの強化](./prepare-data-import)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年8月16日**

    </div>

    <div>

        - **新規リージョン**: 🇸🇬 AWS シンガポール (ap-southeast-1)

        - **新規リージョン**: 🇸🇬 GCP シンガポール (asia-southeast-1)

        - サーバーレスクラスターから専用クラスターへの移行サポート

        - バルクインサートサポート

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年6月11日**

    </div>

    <div>

        - サーバーレスクラスターが利用可能になる

        - [Zilliz Cloudプランティア導入](https://zilliz.com/pricing)

        - [アクセス制御](./access-control)のための組織、コラボレーション、RBAC

        - ネームスペースのためのパーティションキー導入

        - 動的スキーマが利用可能になる

        - 新しいデータ型: JSON

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年4月6日**

    </div>

    <div>

        - [価格計算機](https://zilliz.com/pricing#calculator)

        - GCPでの[バックアップと復元](./backup-and-restore)

        - [カスタムタイムゾーン](./organization-settings#manage-timezone)

        - [コレクションの名前変更](./manage-collections-console)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年3月6日**

    </div>

    <div>

        - **新規リージョン**: 🇺🇸 GCP オレゴン (us-west1)

        - Zilliz Cloudが[AWSマーケットプレイス](https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio)で利用可能

        - AWSでの[バックアップと復元](./backup-and-restore)が利用可能に

        - データ継続性戦略のための[ごみ箱](./use-recycle-bin)

        - [Milvusからの移行](./migrations)

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年2月13日**

    </div>

    <div>

        - 電子メール通知

        - 初心者のためのインラインガイダンス

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2023年1月10日**

    </div>

    <div>

        - コレクションのデータプレビュー

        - ベクターデータベースに慣れ親しむためのデモデータセット

    </div>

</Grid>

## 2022\{#2022}

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年12月5日**

    </div>

    <div>

        - 新しいデザインのZilliz Cloudコンソール

        - **新規リージョン**: 🇺🇸 AWS オハイオ (us-east-2)

        - [プライベートリンク](./setup-a-private-link)が利用可能に

        - [データインポート](./data-import)が利用可能に

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年11月18日**

    </div>

    <div>

        - Zilliz Cloudが招待なしで一般公開

        - 容量最適化CUがオンラインに

        - QPSとクエリ遅延のためのリソースモニター

        - インデックス作成を簡素化するAUTOINDEX

        - ユーザー体験向上のためUIパフォーマンスを最適化

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年9月15日**

    </div>

    <div>

        - コレクションビューのリファクタリング

        - ベクトル検索ビューのリファクタリング

        - Googleによるサインアップが可能に

        - [システムメンテナンス設定](./organization-settings)が利用可能に

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月30日**

    </div>

    <div>

        - 大きな標準ベクターデータベース。

        - Cloud UIでのコレクション管理。

        - Cloud UIでのインデックス管理。

        - Cloud UIでのベクトル検索実行。

        - セキュリティ上の理由から、インターネットからのデータベースアクセスを既定で無効化。

        - ホワイトリストの体験向上。

        - クレジットサポート。

        - より良い相互作用のためのCloud UI改善。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年8月1日**

    </div>

    <div>

        - Cloud UIでのコレクション表示。

        - Cloud UIでのコレクションスキーマ表示。

        - Cloud UIでのコレクション作成。

        - Cloud UIでのコレクション削除。

        - Cloud UIでのインデックス表示。

        - より良い相互作用のためのCloud UI。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="25,74">

    <div>

        **2022年7月22日**

    </div>

    <div>

        - **新規リージョン**: 🇺🇸 AWS オレゴン (us-west-2)

        - すべてのCore Milvus機能をサポート。

        - ベクターデータベースの中断と再開をサポート。

        - 基本ベクターデータベースメトリックの表示をサポート。

        - データベースユーザーマネジメントをサポート。

        - 複数プロジェクト作成をサポート。

        - プロジェクトレベルでのIPホワイトリスト設定をサポート。

        - ユーザー操作イベントの表示をサポート。

        - 電子メールによるMFA有効化をサポート。

    </div>

</Grid>