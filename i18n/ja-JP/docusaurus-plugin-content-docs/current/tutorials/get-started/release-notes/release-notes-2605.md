---
title: "2026年5月リリースノート | Cloud"
slug: /release-notes-2605
sidebar_key: release-notes-2605
sidebar_label: "2026年5月"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の2026年5月のリリースノートです。"
type: origin
token: NRF1wGr3AiWWC1kVfWucZD6Xneb
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年5月 リリースノート

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-13**

    </div>

    <div>

        ## [BYOC] マルチデータプレーンサポート\{#byoc-multi-dataplane-support}

        Zilliz Cloud BYOC は、単一プロジェクト内で複数のデータプレーンをサポートするようになりました。BYOC プロジェクトは複数リージョンにまたがる構成が可能になり、各データプレーンはリージョンごとのインフラユニットとして機能します。

        - 1つの BYOC プロジェクト配下で **複数のデータプレーン** を管理でき、データプレーン管理用の **新しいデータプレーンページ** が追加されました。

        - プロジェクト内でターゲットリージョン／データプレーンを選択してクラスターを作成できます。

        既存の BYOC プロジェクトとの互換性は維持され、データ移行は不要です。現在の BYOC プロジェクトは、1つのデータプレーンを持つプロジェクトとしてそのまま利用できます。

        詳細は、[AWS で BYOC をデプロイ](/docs/byoc/deploy-byoc-aws)、[AWS で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-aws)、[Microsoft Azure で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-azure)、[GCP で BYOC をデプロイ](/docs/byoc/deploy-byoc-gcp) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## Vector Lakebase パブリックプレビュー\{#vector-lakebase-public-preview}

        この大型リリースにより、Zilliz Cloud はベクトルデータベース製品から Vector Lakebase プラットフォームへと進化します。

        アップグレード後、従来のベクトルデータベースサービスはレイテンシー重視ワークロード向けのリアルタイム配信レイヤーとなり、プラットフォーム全体のデータおよびコンピュート機能は、現代の AI アプリケーションやエージェントアプリケーションで必要となるセマンティック検索と分析のワークフローループをよりよく支えるよう拡張されます。

        Vector Lakebase は、S3 ベースの統合データ基盤の上で、次の3つのアクセスモードにより AI/エージェントワークロードを支えます。

        - **リアルタイム検索**: レイテンシーが重要な本番配信向け。

        - **反復的ディスカバリー**: インタラクティブかつ多段階の探索向け。

        - **バッチ分析**: オフラインでのマイニングとデータセット最適化向け。

        Vector Lakebase は、完全に分離されたストレージ・コンピュートアーキテクチャを採用しています。データは、コンピュートクラスターから独立したプロジェクトレベルのベクトルストアである Databases に保存され、チームはテキスト、JSON、ラベル、地理空間データ、その他の属性とともに無制限のベクトルを保存できます。

        特に、Zilliz Vector Lakebase では次の主要機能が導入されます。

        **On-Demand Search**

        インタラクティブな探索やバッチ分析は、オンライン配信より1〜3桁大きいデータセット（フィードバックデータ、ログ、エージェントノート、クロール済みコーパスなど）を対象とすることがよくあります。これらのワークロードは継続稼働ではなくタスク駆動であることが多く、コンピュートリソースは97%以上の時間アイドルになります。そのため、常時稼働の大規模ベクトルデータベースクラスターはコスト面で正当化しにくい場合があります。

        Zilliz On-Demand Search は、オブジェクトストレージとオンデマンドコンピュートに対して直接課金されます。これは AWS Lambda と同様で、料金は主に割り当てリソースサイズと実行時間に基づき、ストレージコストは基盤となる S3 コストに近い水準に保たれます。

        これらの常時稼働ではないワークロードに対して、On-Demand Search と Serverless はどちらも従量課金モデルです。ただし実験結果では、月間合計10時間のアクティブコンピュートを持つ10億ベクトル規模ワークロードにおいて、On-Demand Search の総コストは Serverless の約1/15（&#36;318 対 &#36;4,937）に抑えられます。

        詳細は [オンデマンド検索のクイックスタート](./quick-start-to-on-demand-search) および [On-Demand Compute Cost](./on-demand-compute-cost) を参照してください。

        **External Data Lake Search**

        Zilliz Vector Lakebase はフルマネージドのストレージとクエリコンピュートを提供しつつ、既存のデータレイク基盤やガバナンスパイプラインを持つお客様もサポートします。

        AI ワークロードにおける主な課題は、レイクデータ上で直接、効率的な検索とセマンティック探索を可能にすることです。Spark や Ray などの従来システムは、インデックス高速化されたセマンティック検索よりも、全件スキャンや map-reduce 計算に最適化されています。

        これに対し、Zilliz は External Collection モードを提供します。これは、お客様所有のレイクテーブルへのゼロコピー論理マッピングであり、その上に高性能インデックスとフルスペクトラム検索機能を提供します。

        既存データレイクのインデックス化と高速化については、[External Data Lake Search クイックスタート](./quick-start-to-external-data-lake-search) を参照してください。

        Vector Lakebase は Zilliz Cloud コンソール、REST API、PyMilvus、Zilliz CLI から利用できます。Query CU、Indexing CU、Project Database Storage、Storage Requests を含む、コンピュート、ストレージ、ストレージリクエスト全体にわたる従量課金を導入しています。

        ## Milvus 3.0 パブリックプレビュー\{#milvus-30-public-preview}

        Vector Lakebase のローンチとあわせて、Zilliz は Milvus 3.0 のパブリックプレビューも公開します。このバージョンでは、Milvus はオープンデータフォーマットと既存データレイク／大規模データ処理エンジンとの幅広い統合により、ベクトルデータベース機能を AI データインフラスタックへ拡張します。

        <Admonition type="info" icon="📘" title="Note">

        <p>このリリースでは、Milvus 3.0 の機能はオンデマンド・クラスターでのみサポートされています。サービング・クラスターではまだサポートされていません。</p>

        </Admonition>

        **外部データとストレージフォーマット**

        - **External Collection** — オブジェクトストレージ（Parquet、Lance、Vortex、Iceberg）上のデータを、Milvus にコピーせず直接参照できます。Milvus はスキーマ、インデックス、クエリ実行のみを管理します。インクリメンタルな Refresh によりソースファイルの変更とコレクションを同期し、単一データセットを複数インスタンスから同時に提供できます。

            詳細は [External Collection](./external-collection) を参照してください。

        - **External Backfill** *(Private Preview)*  — ライブコレクションの埋め込みモデルをダウンタイムなしで更新できます。`AddCollectionField` で新しいベクトルフィールドを追加し、Snapshot で一貫した開始時点を固定してから、オフラインで埋め込みジョブを実行し、通常の取り込み経路で値を書き戻します。新しい列のインデックス化完了後にアプリケーションを切り替えます。

            *External Backfill の Private Preview 参加をご希望の場合は、[お問い合わせ](https://zilliz.com/contact-sales) ください。*

        **スキーマとデータモデリング**

        - **Null Vector** — 6種類すべてのベクトル型で、ベクトルフィールドを nullable にできます。NULL 行は検索時に自動でスキップされ、検索品質への影響はなく、NULL ベクトルは実質的にストレージを消費しません。既存コレクションでも、`AddCollectionField` により新しい nullable ベクトル列を再構築なしでオンライン追加できます。

            詳細は [Nullable Fields](./nullable-fields) と [Default Values](./default-fields) を参照してください。

        - **EmbList + DiskANN**  — エンティティごとに可変長ベクトルリストを保持し、DiskANN でディスク上にインデックス化します。長文ドキュメント、ColBERT のような late-interaction モデル、マルチモーダルエンティティに適しており、大規模コーパスでも RAM 使用量を抑えられます。

            詳細は [StructArray](./use-array-of-structs) と [StructArray Operators](./struct-array-filtering) を参照してください。

        - **MinHash DIDO (Doc-in, Doc-out)**  — MINHASH_LSH にサーバーサイド MinHash 関数を追加します。Milvus は insert、bulk-insert、search 時にシグネチャを自動計算するため、重複排除、フィンガープリント、盗用検知ワークフロー向けにアプリケーション側の前処理が不要です。

            詳細は [MinHash Function](./minhash-function) を参照してください。

        **検索とランキング制御**

        - **Query / Search Order By** — 検索結果およびクエリ結果に対して、フィールドごとの ASC / DESC を指定した複数フィールド並び替えをサポートし、カーネルへプッシュダウンします。複合ランキングのための過剰フェッチやクライアント側再ソートは不要です。

            詳細は [Basic Vector Search](./single-vector-search#sort-search-results-by-scalar-fields)、[Grouping Search](./grouping-search#order-groups-by-a-scalar-field)、[Query](./get-and-scalar-query#sort-query-results) を参照してください。

        **データライフサイクルと運用**

        - **Snapshot** — データをコピーせず既存セグメントを参照する、コレクションの時点指定・読み取り専用ビューです。ライブコレクションが書き込みを継続している間も、バッチジョブは MVCC スタイルの分離下で実行でき、A/B 評価、重複排除、バックフィル検証に適しています。

            詳細は [Snapshots](./snapshots) と [Manage Snapshots](./manage-snapshots) を参照してください。

        - **Entity TTL (行レベル TTL)** — `Timestamptz` TTL フィールドによる行単位の有効期限設定です。期限切れ行は自動回収されるため、保持ポリシー遵守、セッションデータ、会話履歴の管理でアプリケーション側クリーンアップが不要になります。

             詳細は [Set Collection TTL](./set-collection-ttl) を参照してください。

        - **Force Merge** — 明示的にセグメントコンパクションをトリガー（同期/非同期）し、オフピーク時間帯でクエリレイテンシーの揺らぎやセグメント断片化によるストレージオーバーヘッドを削減します。

        **テキスト処理と Spark ベースのデータ処理**

        - **Custom dictionaries and tokenizers** *(Private Preview)* — FileResource メカニズムを通じて、カスタムトークナイザー辞書、同義語リスト、ストップワードリスト、複合語分割ルールを登録できます。BM25、analyzer、Text Match に反映され、アプリケーションコードに分散した管理ではなく中央集約でバージョン管理できます。

        - **Spark Semantic Dedup** *(Private Preview)* — 大規模 Spark データ処理向けのセマンティック重複排除をサポートします。

        - **Spark Abnormal Detection** *(Private Preview)* — Spark ベースのデータ処理中に異常レコードやパターンを検出します。

            *上記機能の Private Preview 参加をご希望の場合は、[お問い合わせ](https://zilliz.com/contact-sales) ください。*

        ## External Volumes\{#external-volumes}

        Zilliz Cloud は、Managed Volumes に加えて External Volumes をサポートするようになりました。External Volume は、お客様自身のクラウドオブジェクトストレージ内のバケットまたはパスへの読み取り専用参照です。これにより、データを先に Zilliz Cloud へコピーすることなく、インポート、移行、External Collection ワークフロー向けにソースデータをその場で読み取れます。

        - **データを既存の場所で活用** — External Volume を AWS S3 または Google Cloud Storage のパスに指定できます。データはお客様バケット内に保持され、必要時のみ Zilliz Cloud が読み取ります。

        - **リージョン単位の制御されたアクセス** — アクセスは Storage Integration と Zilliz Cloud RBAC により管理され、承認済みプロジェクトユーザーのみが External Volume を作成・管理できます。

        詳細は [External Volumes](./external-volume) を参照してください。

        ## Large TopK\{#large-topk}

        Large TopK がコレクションレベルでサポートされ、有効化したコレクションでは返却エンティティ数の上限が 16,384 から 1,000,000 に拡張されました。Serving Cluster と On-demand Compute の両方で利用でき、データマイニングやバッチ分析ワークロードに最適です。候補生成、モデル評価、大規模類似検索などのユースケースで、より広い候補リコールを実現します。

        詳細は [Use Large TopK](./use-large-topk) を参照してください。

        [On-Demand Compute Cost](./on-demand-compute-cost)

        ## 機能強化\{#enhancements}

        - **リージョン対応のプロジェクトガバナンス** — プロジェクトにリージョン制約が追加され、企業がデータレジデンシーを管理しやすくなり、リージョンごとのデータプレーンアクセスを明確化できます。このリージョンモデルは Zilliz Cloud コンソールと API の両方に反映されています。

        - **Zilliz CLI の更新** — Zilliz CLI は、このリリースにおける Lakebase、External Volumes、リージョン対応オペレーション、料金関連の更新をカバーするよう更新されました。詳細は [Zilliz CLI](https://github.com/zilliztech/zilliz-cli) を参照してください。

    </div>

</Grid>
