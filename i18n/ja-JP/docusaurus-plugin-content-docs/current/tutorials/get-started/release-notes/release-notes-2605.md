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
sidebar_position: 1
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

        Zilliz Cloud BYOC が、単一プロジェクト内で複数のデータプレーンをサポートするようになりました。BYOC プロジェクトは複数のリージョンにまたがることができ、各データプレーンはリージョン固有のインフラストラクチャユニットを表します。

        - 1 つの BYOC プロジェクト配下での**複数データプレーン**と、データプレーン管理用の**新しいデータプレーンページ**

        - プロジェクト内で対象のリージョン/データプレーンを選択してクラスターを作成

        既存の BYOC プロジェクトとの互換性は維持され、データ移行は不要です。現在の BYOC プロジェクトは、1 つのデータプレーンを持つプロジェクトとして引き続き動作します。

        詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws)、[Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws)、[Deploy BYOC-I on Microsoft Azure](/docs/byoc/deploy-byoc-i-azure)、および [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="14,85">

    <div>

        **2026-05-09**

    </div>

    <div>

        ## Vector Lakebase パブリックプレビュー\{#vector-lakebase-public-preview}

        この大規模リリースにより、Zilliz Cloud はベクトルデータベース製品から Vector Lakebase プラットフォームへと進化します。

        アップグレード後、従来のベクトルデータベースサービスはレイテンシ重視のワークロード向けリアルタイムサービング層となり、プラットフォーム全体のデータおよびコンピュート機能が拡張され、現代の AI およびエージェントアプリケーションで必要とされるセマンティック検索と分析のワークフローループをより適切にサポートします。

        Vector Lakebase は、S3 ベースの統合データ基盤上に構築されており、以下の 3 つのアクセスモードを通じて AI およびエージェントのワークロードを支えます。

        - レイテンシ重視の本番サービング向けの **Real-time Retrieval**

        - インタラクティブかつ多段階の探索向けの **Iterative Discovery**

        - オフラインマイニングおよびデータセット最適化向けの **Batch Analytics**

        Vector Lakebase は、完全に分離されたストレージ・コンピュートアーキテクチャ上に構築されています。データは Databases に保存されます。これは任意のコンピュートクラスターから独立したプロジェクトレベルのベクトルストアであり、チームはテキスト、JSON、ラベル、地理空間データ、その他の属性タイプとともに、無制限のベクトルを保存できます。

        特に、Zilliz Vector Lakebase では以下の主要機能が導入されます。

        **On-Demand Search**

        インタラクティブな探索およびバッチ分析では、オンラインサービングより 1 桁から 3 桁大きいデータセットを扱うことが多く、これにはフィードバックデータ、ログ、エージェントノート、クローリング済みコーパスが含まれます。これらのワークロードは通常、継続的に稼働するのではなくタスク駆動型であり、コンピュートリソースは 97% 以上の時間アイドル状態のままとなります。そのため、常時稼働の大規模ベクトルデータベースクラスターを使用することは、コスト面で正当化しにくい場合があります。

        Zilliz On-Demand Search は、オブジェクトストレージとオンデマンドコンピュートに対して直接課金します。これは AWS Lambda と同様で、料金は主に割り当てリソースサイズと実行時間に基づき、ストレージコストは基盤となる S3 コストに近い水準に抑えられます。

        これらの常時稼働ではないワークロードでは、On-Demand Search と Serverless の両方が従量課金モデルに従います。ただし、当社の実験が示すように、月間累積アクティブコンピュート時間が 10 時間の 10 億ベクトルワークロードでは、On-Demand Search の総コストは Serverless の約 1/15 にすぎません (&#36;318 vs. &#36;4,937)。

        詳細については、[Quickstart to On-Demand Search](./quick-start-to-on-demand-search) および [On-Demand Compute Cost](./on-demand-compute-cost) を参照してください。

        **External Data Lake Search**

        Zilliz Vector Lakebase はフルマネージドのストレージとクエリコンピュートを提供すると同時に、既存のデータレイク基盤とガバナンスパイプラインを持つユーザーもサポートします。

        AI ワークロードにおける主要な課題は、レイクデータの上で直接、効率的な検索とセマンティック探索を可能にすることです。Spark や Ray のような従来システムは、インデックスで高速化されたセマンティック検索ではなく、全データスキャンや map-reduce 計算に最適化されています。

        これに対処するため、Zilliz は External Collection モードを提供します。これは、顧客所有のレイクテーブルへのゼロコピーの論理マッピングであり、その上に高性能なインデックス化とフルスペクトラムの検索機能を構築します。

        既存のデータレイクをインデックス化して高速化する方法については、[Quickstart to External Data Lake Search](./quick-start-to-external-data-lake-search) を参照してください。

        Vector Lakebase には、Zilliz Cloud コンソール、REST API、PyMilvus、Zilliz CLI からアクセスできます。また、Query CU、Indexing CU、Project Database Storage、Storage Requests を含む、コンピュート、ストレージ、およびストレージリクエスト全体にわたる使用量ベース課金が導入されます。

        ## Milvus 3.0 パブリックプレビュー\{#milvus-30-public-preview}

        Vector Lakebase のローンチとあわせて、Zilliz は Milvus 3.0 のパブリックプレビューもリリースします。このバージョンでは、Milvus はオープンデータ形式と既存のデータレイクおよび大規模データ処理エンジンとの広範な統合を通じて、ベクトルデータベースの機能を AI データインフラストラクチャスタックへと拡張します。

        <Admonition type="info" icon="📘" title="注意">

        このリリースでは、Milvus 3.0 の機能は On-demand Clusters でのみサポートされます。Serving Clusters はまだサポートされていません。

        </Admonition>

        **外部データとストレージ形式**

        - **External Collection** — データを Milvus にコピーすることなく、オブジェクトストレージ (Parquet、Lance、Vortex、Iceberg) 上のデータを直接参照します。Milvus はスキーマ、インデックス、クエリ実行のみを管理します。増分 Refresh により、ソースファイルの変更とコレクションの同期が保たれ、単一のデータセットを複数のインスタンスから同時に提供できます。 

            詳細については、[Create an External Collection](./create-external-collection) を参照してください。

        - **External Backfill** *(Private Preview)*  — 稼働中のコレクションでダウンタイムなしに埋め込みモデルをアップグレードします。`AddCollectionField` で新しいベクトルフィールドを追加し、Snapshot で一貫した開始時点を固定し、埋め込みジョブをオフラインで実行して、通常の取り込みパス経由で値を書き戻します。新しい列がインデックス化されると、アプリケーションは切り替わります。

            *External Backfill の Private Preview への参加をご希望の場合は、[お問い合わせください](https://zilliz.com/contact-sales)。*

        **スキーマとデータモデリング**

        - **Null Vector** — 6 種類すべてのベクトルタイプでベクトルフィールドを nullable にできます。NULL 行は検索時に自動的にスキップされ、検索品質に影響せず、NULL ベクトルは実質的にストレージを消費しません。既存のコレクションでも、`AddCollectionField` を使用して新しい nullable ベクトル列を再構築なしでオンライン追加できます。

            詳細については、[Nullable Fields](./nullable-fields) および [Default Values](./default-fields) を参照してください。

        - **EmbList + DiskANN**  — エンティティごとに可変長のベクトルリストを保存し、DiskANN を使用してディスク上でインデックス化します。長文ドキュメント、ColBERT のような late-interaction モデル、マルチモーダルエンティティに適しており、大規模コーパスサイズでも RAM 使用量を抑制します。

            詳細については、[StructArray Overview](./use-array-of-structs) および [StructArray Operators](./struct-array-filtering) を参照してください。

        - **MinHash DIDO (Doc-in, Doc-out)**  — MINHASH_LSH にサーバーサイドの MinHash 関数を追加します。Milvus は insert、bulk-insert、search の際に自動的にシグネチャを計算するため、重複排除、フィンガープリンティング、盗用検出ワークフローでアプリケーション側の前処理は不要です。

            詳細については、[MinHash Function](./minhash-function) を参照してください。

        **検索とランキングの制御**

        - **Query / Search Order By** — search および query 結果に対する複数フィールドの並び替えを、フィールドごとの ASC / DESC とともにカーネルへプッシュダウンします。複合ランキングのために過剰取得やクライアント側での再ソートを行う必要がなくなります。

            詳細については、[Basic Vector Search](./single-vector-search#sort-search-results-by-scalar-fields)、[Grouping Search](./grouping-search)、および [Query](./get-and-scalar-query) を参照してください。

        **データライフサイクルと運用**

        - **Snapshot** — データをコピーすることなく既存のセグメントを参照する、コレクションの特定時点における読み取り専用ビューです。バッチジョブは MVCC スタイルの分離の下で実行される一方、ライブコレクションは書き込みを継続できるため、A/B 評価、重複排除、backfill 検証に適しています。

            詳細については、[Snapshots](./snapshots) および [Manage Snapshots](./manage-snapshots) を参照してください。

        - **Entity TTL (Row-level TTL)** — `Timestamptz` TTL フィールドによる行単位の有効期限設定です。期限切れの行は自動的に回収されるため、保持ポリシー準拠、セッションデータ、会話履歴に対応でき、アプリケーション側のクリーンアップは不要です。

             詳細については、[Set Collection TTL](./set-collection-ttl) を参照してください

        - **Force Merge** — オフピーク時間帯にセグメントコンパクションを明示的にトリガーし (同期または非同期)、セグメントの断片化によるクエリレイテンシの揺らぎやストレージオーバーヘッドを低減します。

        **テキストと Spark によるデータ処理**

        - **Custom dictionaries and tokenizers** *(Private Preview)* — FileResource メカニズムを通じて、カスタム tokenizer 辞書、同義語リスト、ストップワードリスト、decompounder ルールを登録します。BM25、analyzer、Text Match に適用され、アプリケーションコードに分散するのではなく一元的にバージョン管理されます。

        - **Spark Semantic Dedup** *(Private Preview)* — 大規模な Spark データ処理向けにセマンティック重複排除をサポートします。

        - **Spark Abnormal Detection** *(Private Preview)* — Spark ベースのデータ処理中に異常なレコードやパターンを検出します。

            *上記いずれかの機能の Private Preview への参加をご希望の場合は、[お問い合わせください](https://zilliz.com/contact-sales)。*

        ## External Volumes\{#external-volumes}

        Zilliz Cloud では、Managed Volumes に加えて External Volumes もサポートされるようになりました。External Volume は、お客様自身のクラウドオブジェクトストレージ内のバケットまたはパスへの読み取り専用参照であり、インポート、移行、external-collection ワークフローのために、Zilliz Cloud がソースデータをその場で読み取れるようにします。これにより、最初にデータを Zilliz Cloud へコピーする必要がありません。

        - **データを既存の場所で利用** — External Volume を AWS S3 または Google Cloud Storage のパスに向けます。データはお客様のバケットに保持され、Zilliz Cloud は必要なときだけそれを読み取ります。

        - **制御されたリージョンアクセス** — アクセスは Storage Integration と Zilliz Cloud RBAC を通じて管理され、認可されたプロジェクトユーザーのみが External Volumes を作成または管理できるようにします。

        詳細については、[External Volumes](./external-volume) を参照してください。

        ## Large TopK\{#large-topk}

        Large TopK がコレクションレベルでサポートされるようになり、有効化されたコレクションでは返されるエンティティ数の上限が 16,384 から 1,000,000 に拡張されました。Serving Cluster と On-demand Compute の両方で利用可能であり、データマイニングやバッチ分析ワークロードに最適です。候補生成、モデル評価、大規模類似検索などのユースケースにおいて、より広い候補想起を実現します。

        詳細については、[Use Large TopK](./use-large-topk) を参照してください。

        ## 機能強化\{#enhancements}

        - **リージョン対応のプロジェクトガバナンス** — プロジェクトにリージョン制約が含まれるようになり、企業がデータレジデンシーを管理し、リージョンデータプレーンへのアクセスを明示的に維持しやすくなりました。このリージョンモデルは、Zilliz Cloud コンソールと API の両方に反映されています。

        - **Zilliz CLI の更新** — Zilliz CLI は、このリリースでの変更内容に対応するよう更新されました。これには Lakebase、External Volumes、リージョン対応操作、価格関連の更新が含まれます。詳細については、[Zilliz CLI](https://github.com/zilliztech/zilliz-cli) を参照してください。

    </div>

</Grid>

