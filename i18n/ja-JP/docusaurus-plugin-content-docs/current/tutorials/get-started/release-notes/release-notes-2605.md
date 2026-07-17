---
title: "2026年5月 リリースノート | Cloud"
slug: /release-notes-2605
sidebar_label: "2026年5月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
type: origin
token: NRF1wGr3AiWWC1kVfWucZD6Xneb
sidebar_position: 4
displayed_sidebar: releasesSidebar

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

        Zilliz Cloud BYOC は、単一のプロジェクト内で複数のデータプレーンをサポートするようになりました。BYOC プロジェクトは複数のリージョンにまたがることができ、各データプレーンはリージョン固有のインフラストラクチャユニットを表します。

        - 1つの BYOC プロジェクト配下での**複数データプレーン**に対応し、データプレーン管理用の**新しいデータプレーンページ**を提供

        - プロジェクト内で対象のリージョン/データプレーンを選択して cluster を作成

        既存の BYOC プロジェクトとの互換性は維持され、データ移行は不要です。現在の BYOC プロジェクトは、1つのデータプレーンを持つプロジェクトとしてそのまま動作し続けます。

        詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws)、[Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) をご覧ください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## Vector Lakebase パブリックプレビュー\{#vector-lakebase-public-preview}

        このメジャーリリースにより、Zilliz Cloud はベクターデータベース製品から Vector Lakebase プラットフォームへと進化します。

        アップグレード後、従来のベクターデータベースサービスはレイテンシ重視のワークロード向けリアルタイムサービングレイヤーとなり、プラットフォーム全体のデータおよびコンピュート機能は、現代の AI およびエージェントアプリケーションに必要なセマンティック検索と分析のワークフローループをより適切に支援できるよう拡張されます。

        Vector Lakebase は、S3 ベースの統合データ基盤の上に構築されており、以下の 3 つのアクセスモードを通じて AI およびエージェントのワークロードを支えます。

        - レイテンシ重視の本番サービング向けの **Real-time Retrieval**、

        - インタラクティブかつマルチステップな探索向けの **Iterative Discovery**、

        - オフラインマイニングおよびデータセット最適化向けの **Batch Analytics**。

        Vector Lakebase は、完全に分離されたストレージ–コンピュートアーキテクチャ上に構築されています。データは Database に保存されます。これは project レベルの vector ストアであり、いかなる compute cluster にも依存しません。チームはそこに無制限の vector を、テキスト、JSON、ラベル、地理空間データ、その他の属性タイプとともに保存できます。

        特に、Zilliz Vector Lakebase では以下の主要機能が導入されます。

        **On-Demand Search**

        インタラクティブな探索やバッチ分析では、オンラインサービングよりも 1～3 桁大きいデータセットを扱うことがよくあります。これには、フィードバックデータ、ログ、エージェントノート、クローリング済みコーパスなどが含まれます。これらのワークロードは通常、継続的に稼働するのではなくタスク駆動型であり、compute リソースは 97% を超える時間アイドル状態のままとなります。その結果、常時稼働する大規模なベクターデータベース cluster を使用することは、コスト面で正当化が難しい場合が多くあります。

        Zilliz On-Demand Search は、オブジェクトストレージとオンデマンド compute に対して直接課金します。これは AWS Lambda に似ており、料金は主に割り当てられたリソースサイズと実行時間に基づき、ストレージコストは基盤となる S3 コストに近い水準に保たれます。

        このような常時稼働しないワークロードに対して、On-Demand Search と Serverless はどちらも従量課金モデルに従います。しかし、当社の実験結果では、月あたり累計 10 時間のアクティブ compute を必要とする 10 億 vector のワークロードにおいて、On-Demand Search の総コストは Serverless の約 1/15 にすぎません（&#36;318 対 &#36;4,937）。

        詳細については、[Quickstart to On-Demand Search](./quick-start-to-on-demand-search) および [On-Demand Compute Cost](./on-demand-compute-cost) を参照してください。

        **External Data Lake Search**

        Zilliz Vector Lakebase は完全マネージドのストレージおよびクエリ compute を提供すると同時に、既存のデータレイク基盤やガバナンスパイプラインを持つ顧客もサポートします。

        AI ワークロードにおける主な課題は、レイクデータ上で直接、効率的な検索とセマンティック探索を可能にすることです。Spark や Ray のような従来システムは、インデックスで高速化されたセマンティック検索ではなく、全データスキャンや map-reduce 計算向けに最適化されています。

        これに対応するため、Zilliz は External Collection モードを提供します。これは、顧客所有のレイクテーブルに対するゼロコピーの論理マッピングであり、その上に高性能なインデックス作成とフルスペクトラム検索機能を構築できます。

        既存のデータレイクをインデックス化して高速化する方法については、[Quickstart to External Data Lake Search](./quick-start-to-external-data-lake-search) をご参照ください。

        Vector Lakebase は、Zilliz Cloud コンソール、REST API、PyMilvus、および Zilliz CLI を通じて利用できます。compute、ストレージ、およびストレージリクエスト全体にわたる使用量ベース課金が導入されており、これには Query CU、Indexing CU、Project Database Storage、Storage Requests が含まれます。

        ## Milvus 3.0 パブリックプレビュー\{#milvus-30-public-preview}

        Vector Lakebase の開始とあわせて、Zilliz は Milvus 3.0 のパブリックプレビューもリリースします。このバージョンでは、Milvus はオープンデータフォーマットと既存のデータレイクおよび大規模データ処理エンジンとの広範な統合を通じて、ベクターデータベースの機能を AI データインフラストラクチャスタックへと拡張します。

        <Admonition type="info" icon="📘" title="注記">

        このリリースでは、Milvus 3.0 の機能は On-demand Clusters でのみサポートされます。Serving Clusters はまだサポートされていません。

        </Admonition>

        **External data and storage formats**

        - **External Collection** — オブジェクトストレージ（Parquet、Lance、Vortex、Iceberg）上のデータを、Milvus にコピーすることなく直接参照します。Milvus は schema、index、およびクエリ実行のみを管理します。増分 Refresh により source file の変更と collection の同期が保たれ、単一のデータセットを複数のインスタンスから同時に提供できます。 

            詳細については、[Create an External Collection](./create-external-collection) を参照してください。

        - **External Backfill** *(Private Preview)*  — 稼働中の collection でダウンタイムなしに embedding model をアップグレードします。`AddCollectionField` を使って新しい vector field を追加し、Snapshot で一貫性のある開始時点を固定し、embedding ジョブをオフラインで実行し、通常のインジェスト経路を通じて値を書き戻します。新しい列の index 作成が完了すると、アプリケーションはそれに切り替わります。

            *External Backfill の Private Preview への参加をご希望の場合は、[contact us](https://zilliz.com/contact-sales) してください。*

        **Schema and data modeling**

        - **Null Vector** — 6 種類すべての vector type において、vector field を nullable にできます。NULL 行は検索時に自動的にスキップされ、検索品質への影響はなく、NULL vector は実質的にストレージを消費しません。既存の collection に対しても、`AddCollectionField` を使って新しい nullable vector 列を再構築なしでオンライン追加できます。

            詳細については、[Nullable Fields](./nullable-fields) および [Default Values](./default-fields) を参照してください。

        - **EmbList + DiskANN**  — entity ごとに可変長の vector list を保存し、DiskANN によってディスク上に index を構築します。長文ドキュメント、ColBERT のような late-interaction model、マルチモーダル entity に適しており、大規模コーパスサイズでも RAM 使用量を抑制できます。

            詳細については、[StructArray Overview](./use-array-of-structs) および [StructArray Operators](./struct-array-filtering) を参照してください。

        - **MinHash DIDO (Doc-in, Doc-out)**  — MINHASH_LSH にサーバーサイドの MinHash 関数を追加します。Milvus は insert、bulk-insert、および search の際に自動的にシグネチャを計算するため、重複排除、フィンガープリンティング、盗用検出ワークフローでアプリケーション側の前処理は不要です。

            詳細については、[MinHash Function](./minhash-function) を参照してください。

        **Search and ranking controls**

        - **Query / Search Order By** — 検索および query 結果に対する複数 field の並び替えを、field ごとの ASC / DESC 指定付きでサポートし、カーネルにプッシュダウンされます。複合ランキングのために過剰取得してクライアント側で再ソートする必要がなくなります。

            詳細については、[Basic Vector Search](./single-vector-search#sort-search-results-by-scalar-fields)、[Grouping Search](./grouping-search#order-groups-by-a-scalar-field)、および [Query](./get-and-scalar-query#sort-query-results) を参照してください。

        **Data lifecycle and operations**

        - **Snapshot** — データをコピーすることなく既存の segment を参照する、collection のポイントインタイムな読み取り専用ビューです。バッチジョブは MVCC スタイルの分離レベルのもとで実行され、その間もライブ collection は書き込みを受け付け続けます。A/B 評価、重複排除、backfill 検証に適しています。

            詳細については、[Snapshots](./snapshots) および [Manage Snapshots](./manage-snapshots) を参照してください。

        - **Entity TTL (Row-level TTL)** — `Timestamptz` TTL field による行単位の有効期限設定です。期限切れの行は自動的に回収されるため、保持コンプライアンス、セッションデータ、会話履歴に対応でき、アプリケーション側でのクリーンアップは不要です。

             詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください

        - **Force Merge** — オフピーク時間帯に segment compaction を明示的にトリガーし（同期または非同期）、segment の断片化によるクエリレイテンシの揺らぎとストレージオーバーヘッドを削減します。

        **Text and Spark-powered data processing**

        - **Custom dictionaries and tokenizers** *(Private Preview)* — FileResource メカニズムを通じて、カスタム tokenizer 辞書、同義語リスト、ストップワードリスト、decompounder ルールを登録できます。BM25、analyzer、および Text Match に反映され、アプリケーションコードに分散させるのではなく一元的にバージョン管理されます。

        - **Spark Semantic Dedup** *(Private Preview)* — 大規模な Spark データ処理向けのセマンティック重複排除をサポートします。

        - **Spark Abnormal Detection** *(Private Preview)* — Spark ベースのデータ処理中に異常なレコードまたはパターンを検出します。

            *上記いずれかの機能の Private Preview への参加をご希望の場合は、[contact us](https://zilliz.com/contact-sales) してください。*

        ## External Volumes\{#external-volumes}

        Zilliz Cloud は、Managed Volumes に加えて External Volumes をサポートするようになりました。External Volume は、お客様自身のクラウドオブジェクトストレージ内の bucket または path への読み取り専用参照であり、インポート、移行、および external-collection ワークフローのために、Zilliz Cloud がソースデータをその場で読み取れるようにします。これにより、最初にデータを Zilliz Cloud にコピーする必要がありません。

        - **データが既に存在する場所でそのまま利用** — External Volume を AWS S3 または Google Cloud Storage の path に向けます。データはお客様の bucket に保持され、Zilliz Cloud は必要なときだけそれを読み取ります。

        - **制御されたリージョナルアクセス** — アクセスは Storage Integration と Zilliz Cloud RBAC を通じて管理され、認可された project ユーザーのみが External Volumes を作成または管理できるようにします。

        詳細については、[External Volumes](./external-volume) を参照してください。

        ## Large TopK\{#large-topk}

        collection レベルで Large TopK がサポートされるようになり、有効化された collection における返却 entity の最大数が 16,384 から 1,000,000 へ拡張されました。Serving Cluster と On-demand Compute の両方で利用可能であり、データマイニングやバッチ分析のワークロードに最適です。候補生成、model 評価、大規模類似検索などのユースケースにおいて、より広範な候補再現を可能にします。

        詳細については、[Use Large TopK](./use-large-topk) を参照してください。

        ## 機能強化\{#enhancements}

        - **リージョン認識型の project ガバナンス** — project にリージョン制約が含まれるようになり、企業がデータレジデンシーを管理し、リージョナルなデータプレーンアクセスを明示的に維持できるよう支援します。このリージョンモデルは、Zilliz Cloud コンソールと API の両方に反映されています。

        - **Zilliz CLI の更新** — Zilliz CLI は、このリリースでの変更内容に対応するよう更新されました。これには、Lakebase、External Volumes、リージョン認識型の操作、価格関連の更新が含まれます。詳細については、[Zilliz CLI](https://github.com/zilliztech/zilliz-cli) をご参照ください。

    </div>

</Grid>

