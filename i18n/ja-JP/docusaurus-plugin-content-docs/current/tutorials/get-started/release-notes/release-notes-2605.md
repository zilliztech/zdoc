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

        ## [BYOC] マルチデータプレーンのサポート\{#byoc-multi-dataplane-support}

        Zilliz Cloud BYOC が、単一プロジェクト内で複数のデータプレーンをサポートするようになりました。BYOC プロジェクトは複数リージョンにまたがることができ、各データプレーンはリージョン固有のインフラストラクチャユニットを表します。

        - 1 つの BYOC プロジェクト配下での**複数データプレーン**と、データプレーン管理用の**新しいデータプレーンページ**

        - プロジェクト内で対象リージョン / データプレーンを選択して cluster を作成

        既存の BYOC プロジェクトとの互換性は維持され、データ移行は不要です。現在の BYOC プロジェクトは、1 つのデータプレーンを持つプロジェクトとして引き続き動作します。

        詳細については、[AWS で BYOC をデプロイ](/docs/byoc/deploy-byoc-aws)、[AWS で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-aws)、[Microsoft Azure で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-azure)、および [GCP で BYOC をデプロイ](/docs/byoc/deploy-byoc-gcp) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## Vector Lakebase パブリックプレビュー\{#vector-lakebase-public-preview}

        このメジャーリリースにより、Zilliz Cloud は vector database 製品から Vector Lakebase プラットフォームへと進化します。

        アップグレード後、従来の vector database サービスはレイテンシが重要なワークロード向けのリアルタイム serving レイヤーとなり、同時にプラットフォーム全体のデータおよびコンピュート機能が拡張され、現代の AI および agent アプリケーションで必要とされるセマンティック検索と分析のワークフローループをより適切にサポートします。

        Vector Lakebase は、S3 ベースの統合データ基盤の上に構築されており、次の 3 つのアクセスモードを通じて AI および agent ワークロードを支えます。

        - レイテンシ重視の本番 serving 向けの **Real-time Retrieval**

        - 対話型かつ多段階の探索向けの **Iterative Discovery**

        - オフラインマイニングおよびデータセット最適化向けの **Batch Analytics**

        Vector Lakebase は、完全に分離されたストレージ–コンピュートアーキテクチャ上に構築されています。データは Database に保存されます。これは project レベルの vector ストアであり、いかなる compute cluster にも依存しません。チームはここに、無制限の vector を、テキスト、JSON、ラベル、地理空間データ、その他のタイプの属性とともに保存できます。

        特に、Zilliz Vector Lakebase はいくつかの重要な機能を導入します。

        **On-Demand Search**

        対話型探索やバッチ分析では、オンライン serving より 1 ～ 3 桁大きいデータセットを扱うことが多く、これにはフィードバックデータ、ログ、agent ノート、クロール済みコーパスなどが含まれます。これらのワークロードは通常、継続的に稼働するものではなくタスク駆動型であるため、compute リソースは 97% 以上の時間アイドル状態のままです。その結果、常時稼働の大規模 vector database cluster を使うことは、コスト面で正当化しにくいことがよくあります。

        Zilliz On-Demand Search は、オブジェクトストレージとオンデマンド compute に対して直接課金します。これは AWS Lambda に似ており、料金は主に割り当てたリソースサイズと実行時間に基づき、ストレージコストは基盤となる S3 コストに近い水準に保たれます。

        これらの常時稼働ではないワークロードでは、On-Demand Search と Serverless のどちらも従量課金モデルを採用しています。しかし、当社の実験が示すように、月間累計アクティブ compute 時間が 10 時間の 10 億 vector ワークロードでは、On-Demand Search の総コストは Serverless のわずか約 1/15 です (&#36;318 vs. &#36;4,937)。

        詳細については、[On-Demand Search クイックスタート](./quick-start-to-on-demand-search) と [On-Demand Compute Cost](./on-demand-compute-cost) を参照してください。

        **External Data Lake Search**

        Zilliz Vector Lakebase は、フルマネージドなストレージおよびクエリ compute を提供すると同時に、既存のデータレイク基盤とガバナンスパイプラインを持つ顧客もサポートします。

        AI ワークロードにおける重要な課題は、レイクデータの上で直接、効率的な検索とセマンティック探索を可能にすることです。Spark や Ray のような従来システムは、インデックスで高速化されたセマンティック検索ではなく、フルデータスキャンや map-reduce 計算向けに最適化されています。

        これに対処するため、Zilliz は External Collection モードを提供します。これは、顧客所有のレイクテーブルへのゼロコピーの論理マッピングであり、その上に高性能な index とフルスペクトラムの検索機能を構築します。

        既存のデータレイクを index 化して高速化する方法については、[External Data Lake Search クイックスタート](./quick-start-to-external-data-lake-search) を参照してください。

        Vector Lakebase には、Zilliz Cloud コンソール、REST API、PyMilvus、Zilliz CLI からアクセスできます。compute、storage、および storage request 全体にわたる従量課金が導入されており、これには Query CU、Indexing CU、Project Database Storage、および Storage Requests が含まれます。

        ## Milvus 3.0 パブリックプレビュー\{#milvus-30-public-preview}

        Vector Lakebase のローンチにあわせて、Zilliz は Milvus 3.0 のパブリックプレビューも公開します。このバージョンでは、Milvus はオープンなデータフォーマットと既存のデータレイクおよび大規模データ処理エンジンとのより広範な統合を通じて、vector database 機能を AI データインフラストラクチャスタックへと拡張します。

        <Admonition type="info" icon="📘" title="Notes">

        このリリースでは、Milvus 3.0 の機能は On-demand Clusters でのみサポートされます。Serving Clusters はまだサポートされていません。

        </Admonition>

        **外部データとストレージフォーマット**

        - **External Collection** — オブジェクトストレージ上のデータ (Parquet、Lance、Vortex、Iceberg) を、Milvus にコピーせず直接参照します。Milvus は schema、index、クエリ実行のみを管理します。増分 Refresh により、ソースファイルの変更に collection を同期した状態に保てます。また、1 つのデータセットを複数のインスタンスから同時に提供できます。 

            詳細については、[External Collection を作成](./create-external-collection) を参照してください。

        - **External Backfill** *(プライベートプレビュー)*  — 稼働中の collection でダウンタイムなしに embedding モデルをアップグレードします。`AddCollectionField` を使って新しい vector フィールドを追加し、Snapshot で整合性のある開始時点を固定し、embedding ジョブをオフラインで実行し、通常の取り込み経路を通じて値を書き戻します。新しい列の index 作成が完了すると、アプリケーションを切り替えます。

            *External Backfill のプライベートプレビューに参加するには、[お問い合わせください](https://zilliz.com/contact-sales)。*

        **Schema とデータモデリング**

        - **Null Vector** — 6 種類すべての vector 型で、vector フィールドを nullable にできます。NULL 行は検索時に自動的にスキップされるため検索品質に影響せず、NULL vector は実質的にストレージを消費しません。既存の collection でも、`AddCollectionField` を使って新しい nullable vector 列を再構築なしでオンライン追加できます。

            詳細については、[Nullable Fields](./nullable-fields) と [Default Values](./default-fields) を参照してください。

        - **EmbList + DiskANN**  — entity ごとに可変長の vector リストを保存し、DiskANN によりディスク上で index 化します。長文ドキュメント、ColBERT のような late-interaction モデル、マルチモーダル entity に適しており、大規模コーパスでも RAM 使用量を抑えられます。

            詳細については、[StructArray Overview](./use-array-of-structs) と [StructArray Operators](./struct-array-filtering) を参照してください。

        - **MinHash DIDO (Doc-in, Doc-out)**  — MINHASH_LSH にサーバーサイドの MinHash 関数を追加します。Milvus は insert、bulk-insert、search の際に自動的にシグネチャを計算するため、重複排除、フィンガープリンティング、盗用検出ワークフローでアプリケーション側の前処理は不要です。

            詳細については、[MinHash Function](./minhash-function) を参照してください。

        **検索とランキング制御**

        - **Query / Search Order By** — 検索結果およびクエリ結果に対する複数フィールドでの並び替えをサポートし、フィールドごとに ASC / DESC を指定でき、カーネルにプッシュダウンされます。複合ランキングのために過剰取得してクライアント側で再ソートする必要がなくなります。

            詳細については、[Basic Vector Search](./single-vector-search#sort-search-results-by-scalar-fields)、[Grouping Search](./grouping-search#order-groups-by-a-scalar-field)、および [Query](./get-and-scalar-query#sort-query-results) を参照してください。

        **データライフサイクルと運用**

        - **Snapshot** — データをコピーせず、既存の segment を参照する collection の特定時点の読み取り専用ビューです。ライブ collection が書き込みを継続している間も、バッチジョブは MVCC スタイルの分離下で実行されるため、A/B 評価、重複排除、backfill 検証に適しています。

            詳細については、[Snapshots](./snapshots) と [Manage Snapshots](./manage-snapshots) を参照してください。

        - **Entity TTL (Row-level TTL)** — `Timestamptz` TTL フィールドによる行単位の有効期限設定です。期限切れの行は自動的に回収されるため、保持コンプライアンス、セッションデータ、会話履歴に対応でき、アプリケーション側のクリーンアップは不要です。

             詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください

        - **Force Merge** — オフピーク時間帯に segment compaction を明示的にトリガーします (同期または非同期)。これにより、segment の断片化によるクエリレイテンシのばらつきとストレージオーバーヘッドを削減します。

        **テキストおよび Spark ベースのデータ処理**

        - **カスタム辞書と tokenizer** *(プライベートプレビュー)* — FileResource メカニズムを通じて、カスタム tokenizer 辞書、同義語リスト、ストップワードリスト、decompounder ルールを登録できます。BM25、analyzer、および Text Match に反映され、アプリケーションコードの各所に分散させる代わりに一元的にバージョン管理できます。

        - **Spark Semantic Dedup** *(プライベートプレビュー)* — 大規模な Spark データ処理向けにセマンティック重複排除をサポートします。

        - **Spark Abnormal Detection** *(プライベートプレビュー)* — Spark ベースのデータ処理中に異常レコードまたは異常パターンを検出します。

            *上記いずれかの機能のプライベートプレビューに参加するには、[お問い合わせください](https://zilliz.com/contact-sales)。*

        ## External Volumes\{#external-volumes}

        Zilliz Cloud は、Managed Volumes に加えて External Volumes をサポートするようになりました。External Volume は、お客様自身のクラウドオブジェクトストレージ内の bucket またはパスへの読み取り専用参照であり、インポート、移行、external-collection ワークフローのために、Zilliz Cloud がソースデータをその場で読み取れるようにします。データを最初に Zilliz Cloud にコピーする必要はありません。

        - **既に存在する場所でデータを利用** — External Volume を AWS S3 または Google Cloud Storage のパスに向けます。データはお客様の bucket に保持され、Zilliz Cloud は必要なときだけそれを読み取ります。

        - **制御されたリージョナルアクセス** — アクセスは Storage Integration と Zilliz Cloud RBAC を通じて管理され、許可された project ユーザーのみが External Volumes を作成または管理できるようにします。

        詳細については、[External Volumes](./external-volume) を参照してください。

        ## Large TopK\{#large-topk}

        Large TopK が collection レベルでサポートされるようになり、有効化された collection では返却可能な entity の最大数が 16,384 から 1,000,000 に拡張されました。Serving Cluster と On-demand Compute の両方で利用でき、データマイニングやバッチ分析ワークロードに最適です。候補生成、モデル評価、大規模類似検索などのユースケースで、より広範な候補想起を実現します。

        詳細については、[Use Large TopK](./use-large-topk) を参照してください。

        ## 機能強化\{#enhancements}

        - **リージョン対応の project ガバナンス** — project にリージョン制約が含まれるようになり、企業がデータレジデンシーを管理し、リージョンごとのデータプレーンアクセスを明示的に保てるようになりました。このリージョンモデルは、Zilliz Cloud コンソールと API の両方に反映されています。

        - **Zilliz CLI の更新** — Zilliz CLI は、このリリースでの変更点に対応するよう更新されました。これには Lakebase、External Volumes、リージョン対応オペレーション、および価格関連の更新が含まれます。詳細については、[Zilliz CLI](https://github.com/zilliztech/zilliz-cli) の利用体験を参照してください。

    </div>

</Grid>

