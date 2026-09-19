---
title: "2026年5月 リリースノート | Cloud"
slug: /release-notes-2605
sidebar_label: "2026年5月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: NRF1wGr3AiWWC1kVfWucZD6Xneb
sidebar_position: 5
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

        Zilliz Cloud BYOC は、単一のプロジェクト内で複数のデータプレーンをサポートするようになりました。BYOC プロジェクトは複数のリージョンにまたがることができるようになり、各データプレーンはリージョン固有のインフラストラクチャ単位を表します。

        - 1 つの BYOC プロジェクト配下で**複数のデータプレーン**を利用でき、データプレーン管理用の**新しいデータプレーンページ**が用意されています

        - プロジェクト内で対象のリージョン/dataplane を選択してクラスターを作成します。

        既存の BYOC プロジェクトは互換性が保たれ、データ移行は不要です。既存の BYOC プロジェクトは、引き続き 1 つのデータプレーンを持つプロジェクトとして動作します。

        詳細については、[AWS に BYOC をデプロイ](/docs/byoc/deploy-byoc-aws)、[AWS に BYOC-I をデプロイする](/docs/byoc/deploy-byoc-i-aws)、[Microsoft Azure に BYOC-I をデプロイする](/docs/byoc/deploy-byoc-i-azure)、および [GCP に BYOC をデプロイ](/docs/byoc/deploy-byoc-gcp) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## ベクトル Lakebase パブリックプレビュー\{#vector-lakebase-public-preview}

        このメジャーリリースにより、Zilliz Cloud はベクトルデータベース製品からベクトル Lakebase プラットフォームへと進化します。

        アップグレード後、従来のベクトルデータベースサービスは、レイテンシーが重要なワークロード向けのリアルタイムサービングレイヤーとなり、プラットフォームはデータとコンピュートの機能全体を拡張して、最新の AI アプリケーションおよびエージェントアプリケーションに必要なセマンティック検索と分析のワークフローループをより適切にサポートします。

        ベクトル Lakebase は、S3 ベースの統合データ基盤の上に構築されており、3 つのアクセスモードを通じて AI およびエージェントのワークロードを支えます。

        - **Real-time Retrieval**: レイテンシーが重要な本番サービング向け

        - **Iterative Discovery**: 対話型かつ多段階の探索向け

        - **Batch Analytics**: オフラインマイニングおよびデータセット最適化向け

        ベクトル Lakebase は、完全に分離されたストレージ・コンピュートアーキテクチャ上に構築されています。データはデータベースに保存されます。データベースは、いずれのコンピュートクラスターにも依存しないプロジェクトレベルのベクトルストアであり、チームはここに、テキスト、JSON、ラベル、地理空間データ、その他の種類の属性とともに、無制限のベクトルを保存できます。

        特に、Zilliz ベクトル Lakebase は、いくつかの主要な機能を導入します。

        **On-Demand Search**

        対話型の探索とバッチ分析では、オンラインサービングよりも 1 ～ 3 桁大きいデータセットを扱うことが多く、これにはフィードバックデータ、ログ、エージェントのメモ、クロールされたコーパスなどが含まれます。これらのワークロードは通常、継続的に稼働するものではなくタスク駆動型であるため、コンピュートリソースは 97% 以上の時間アイドル状態のままです。その結果、大規模な常時稼働のベクトルデータベースクラスターの利用は、コストの観点から正当化が難しいことがよくあります。

        Zilliz On-Demand Search は、オブジェクトストレージとオンデマンドコンピュートに対して直接課金します。これは AWS Lambda に似ており、料金は主に割り当てられたリソースサイズと実行時間に基づいて決まり、ストレージコストは基盤となる S3 のコストに近い水準に保たれます。

        こうした常時稼働ではないワークロードでは、On-Demand Search と Serverless のどちらも従量課金モデルに従います。ただし、当社の実験結果が示すとおり、月あたり累計 10 時間のアクティブコンピュートを伴う 10 億ベクトルのワークロードでは、On-Demand Search の総コストは Serverless の約 1/15 にすぎません（&#36;318 対 &#36;4,937）。

        詳細については、[オンデマンド検索のクイックスタート](./quick-start-to-on-demand-search) および [オンデマンドコンピュートコスト](./on-demand-compute-cost) を参照してください。

        **External Data Lake Search**

        Zilliz ベクトル Lakebase は、フルマネージドのストレージとクエリコンピュートを提供すると同時に、既存のデータレイクインフラストラクチャとガバナンスパイプラインを運用しているお客様もサポートします。

        AI ワークロードでは、データレイク上のデータに対して直接、効率的な検索とセマンティック探索を可能にすることが重要な課題です。Spark や Ray などの従来のシステムは、インデックスで高速化されたセマンティック検索ではなく、全データのスキャンと map-reduce コンピューティングに最適化されています。

        これに対応するため、Zilliz は外部コレクションモードを提供します。これは、お客様が所有するレイクテーブルへのゼロコピーの論理マッピングであり、その上に高性能なインデックス作成と全スペクトラムの検索機能が構築されます。

        既存のデータレイクにインデックスを作成して高速化する方法については、[Quickstart to External Data Lake Search](./quick-start-to-external-data-lake-search) を参照してください。

        ベクトル Lakebase には、Zilliz Cloud コンソール、REST API、PyMilvus、Zilliz CLI からアクセスできます。コンピュート、ストレージ、storage request にわたる従量課金が導入されており、これには Query CU、Indexing CU、Project データベースストレージ、および Storage Requests が含まれます。

        ## Milvus 3.0 パブリックプレビュー\{#milvus-30-public-preview}

        ベクトル Lakebase のローンチに合わせて、Zilliz は Milvus 3.0 のパブリックプレビューもリリースします。このバージョンでは、Milvus はオープンなデータフォーマットと、既存のデータレイクや大規模データ処理エンジンとのより広範な統合を通じて、ベクトルデータベースの機能を AI データインフラストラクチャスタックへと拡張します。

        <Admonition type="info" title="Notes">

        このリリースでは、Milvus 3.0 の機能はオンデマンドクラスターでのみサポートされます。サービングクラスターはまだサポートされていません。

        </Admonition>

        **外部データとストレージフォーマット**

        - **外部コレクション** — Milvus にコピーすることなく、オブジェクトストレージ（Parquet、Lance、Vortex、Iceberg）上のデータを直接参照します。Milvus が管理するのはスキーマ、インデックス、クエリ実行のみです。増分リフレッシュにより、コレクションはソースファイルの変更と同期され、1 つのデータセットを複数のインスタンスから同時に提供できます。

            詳細については、[外部コレクションの作成](./create-external-collection) を参照してください。

        - **External Backfill** *(プライベートプレビュー)* — ダウンタイムなしで、稼働中のコレクションの埋め込みモデルをアップグレードします。`AddCollectionField` を使用して新しいベクトルフィールドを追加し、Snapshot で一貫した開始点を固定し、埋め込みジョブをオフラインで実行して、通常の取り込みパスを通じて値を書き戻します。新しいカラムにインデックスが作成されると、アプリケーションが切り替わります。

            *External Backfill のプライベートプレビューに参加するには、[お問い合わせください](https://zilliz.com/contact-sales)。*

        **スキーマとデータモデリング**

        - **Null ベクトル** — 6 種類すべてのベクトル型でベクトルフィールドを nullable にできます。NULL 行は検索時に自動的にスキップされるため検索品質に影響せず、NULL ベクトルは実質的にストレージを消費しません。既存のコレクションでは、`AddCollectionField` を使用して、再構築なしで新しい nullable なベクトル列をオンラインで追加できます。

            詳細については、[Nullable Fields](./nullable-fields) および [デフォルト値](./default-fields) を参照してください。

        - **EmbList + DiskANN** — エンティティごとに可変長のベクトルリストを保存し、DiskANN によってディスク上にインデックスが作成されます。長いドキュメント、ColBERT のようなレイトインタラクションモデル、マルチモーダルエンティティに適しており、大規模なコーパスサイズでも RAM を抑えられます。

            詳細については、[StructArray の概要](./use-array-of-structs) および [StructArray 演算子](./struct-array-filtering) を参照してください。

        - **MinHash DIDO (Doc-in, Doc-out)** — MINHASH_LSH にサーバー側の MinHash 関数を追加します。Milvus は挿入時、一括挿入時、検索時にシグネチャを自動的に計算するため、重複排除、フィンガープリンティング、盗用検出のワークフローにアプリケーション側の前処理は不要です。

            詳細については、[MinHash 関数](./minhash-function) を参照してください。

        **検索とランキングの制御**

        - **Query / Search Order By** — 検索結果とクエリ結果に対する複数フィールドでの並べ替えです。フィールドごとの ASC / DESC がカーネルにプッシュダウンされます。複合ランキングのために過剰にフェッチしてクライアント側で並べ替え直す必要はなくなりました。

            詳細については、[基本的なベクトル検索](./single-vector-search#sort-search-results-by-scalar-fields)、[Grouping Search](./grouping-search#order-groups-by-a-scalar-field)、および [クエリ](./get-and-scalar-query#sort-query-results) を参照してください。

        **データライフサイクルと運用**

        - **Snapshot** — データをコピーせずに既存のセグメントを参照する、コレクションの特定時点の読み取り専用ビューです。ライブコレクションが書き込みを受け付け続ける間、バッチジョブは MVCC スタイルの分離の下で実行されます。A/B 評価、重複排除、バックフィル検証に適しています。

            詳細については、[Snapshots](./snapshots) および [スナップショットの管理](./manage-snapshots) を参照してください。

        - **Entity TTL (Row-level TTL)** — `Timestamptz` TTL フィールドによる行単位の有効期限です。期限切れの行は自動的に回収されるため、保持コンプライアンス、セッションデータ、会話履歴に対応でき、アプリケーション側のクリーンアップは不要です。

             詳細については、[コレクション TTL の設定](./set-collection-ttl) を参照してください。

        - **Force Merge** — オフピーク時間帯にセグメントの Compaction を明示的にトリガーします（同期または非同期）。これにより、セグメントの断片化によるクエリレイテンシーのばらつきとストレージオーバーヘッドが軽減されます。

        **テキストと Spark によるデータ処理**

        - **カスタム辞書とトークナイザー** *(プライベートプレビュー)* — FileResource の仕組みを通じて、カスタムのトークナイザー辞書、同義語リスト、ストップワードリスト、decompounder ルールを登録できます。BM25、アナライザー、Text Match に反映され、アプリケーションコードのあちこちに分散させるのではなく、一元管理されたバージョン管理が可能になります。

        - **Spark Semantic Dedup** *(プライベートプレビュー)* — 大規模な Spark データ処理向けのセマンティック重複排除をサポートします。

        - **Spark Abnormal Detection** *(プライベートプレビュー)* — Spark ベースのデータ処理中に異常なレコードやパターンを検出します。

            *上記のいずれかの機能のプライベートプレビューに参加するには、[お問い合わせください](https://zilliz.com/contact-sales)。*

        ## 外部ボリューム\{#external-volumes}

        Zilliz Cloud は、マネージドボリュームに加えて外部ボリュームをサポートするようになりました。外部ボリュームは、お客様自身のクラウドオブジェクトストレージ内のバケットまたはパスへの読み取り専用の参照であり、Zilliz Cloud がソースデータをその場で読み取って、インポート、移行、外部コレクションのワークフローに利用できるようにします。その際、データを先に Zilliz Cloud へコピーする必要はありません。

        - **データが既にある場所でそのまま利用** — 外部ボリュームを AWS S3 または Google Cloud Storage のパスに指定します。データはお客様のバケットに保持され、Zilliz Cloud は必要なときにのみそれを読み取ります。

        - **制御されたリージョン単位のアクセス** — アクセスは Storage Integration と Zilliz Cloud RBAC を通じて管理され、許可されたプロジェクトユーザーのみが外部ボリュームを作成または管理できます。

        詳細については、[外部ボリューム](./external-volume) を参照してください。

        ## Large TopK\{#large-topk}

        Large TopK がコレクションレベルでサポートされるようになり、有効化されたコレクションでは、返されるエンティティの最大数が 16,384 から 1,000,000 に拡張されました。サービングクラスターとオンデマンドコンピュートの両方で利用でき、データマイニングやバッチ分析のワークロードに最適です。候補生成、モデル評価、大規模な類似検索といったユースケースで、より広範な候補の再現率を実現します。

        詳細については、[Large TopK を使用する](./use-large-topk) を参照してください。

        ## 機能強化\{#enhancements}

        - **リージョン対応のプロジェクトガバナンス** — プロジェクトにリージョン制約が含まれるようになり、企業がデータレジデンシーを管理し、リージョンのデータプレーンアクセスを明示的に保つことができます。このリージョンモデルは、Zilliz Cloud コンソールと API の両方に反映されています。

        - **Zilliz CLI の更新** — Zilliz CLI は、Lakebase、外部ボリューム、リージョン対応の操作、価格関連の更新など、このリリースでの変更をカバーするように更新されました。詳細については、[Zilliz CLI](https://github.com/zilliztech/zilliz-cli) の利用体験を参照してください。

    </div>

</Grid>

