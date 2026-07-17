---
title: "リリースノート（2024年9月4日） | Cloud"
slug: /release-notes-2100
sidebar_label: "2024年9月4日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、まず **Zilliz Cloud Serverless の GA** をはじめとする、Zilliz Cloud に対する複数の重要なアップデートが提供されます。これにより自動スケーリングが可能になり、最大 50 倍のコスト削減を実現します。**Milvus 2.4 の機能** も GA となり、疎ベクトル、マルチベクトルハイブリッド検索、あいまい一致を備えた inverted index などの機能が導入されました。また、このリリースには**マルチレプリカ機能**のパブリックプレビューも含まれており、複数の Availability Zone（AZ）にまたがるレプリカにワークロードを分散することで、クエリスループットと可用性を向上させることができます。さらに、Zilliz Cloud の新しい **Migration Service** は、オープンソース Milvus、pgvector、Elasticsearch からの移行をサポートし、Zilliz Cloud 内での組織内および組織間のデータ移行も可能にします。バックアップ、リストア、移行、ジョブ管理向けに拡張された **RESTful API** により、ユーザーは自動化された運用ワークフローを構築できます。さらに、Project Read-only ロールのサポートや、cluster と snapshot の名前変更機能も追加されています。 | Cloud"
type: origin
token: PJ4hwwD1DiVnv0kWPZBceLrdnSf
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年9月4日）

このリリースでは、まず **Zilliz Cloud Serverless の GA** をはじめとする、Zilliz Cloud に対する複数の重要なアップデートが提供されます。これにより自動スケーリングが可能になり、最大 50 倍のコスト削減を実現します。**Milvus 2.4 の機能** も GA となり、疎ベクトル、マルチベクトルハイブリッド検索、あいまい一致を備えた inverted index などの機能が導入されました。また、このリリースには**マルチレプリカ機能**のパブリックプレビューも含まれており、複数の Availability Zone（AZ）にまたがるレプリカにワークロードを分散することで、クエリスループットと可用性を向上させることができます。さらに、Zilliz Cloud の新しい **Migration Service** は、オープンソース Milvus、pgvector、Elasticsearch からの移行をサポートし、Zilliz Cloud 内での組織内および組織間のデータ移行も可能にします。バックアップ、リストア、移行、ジョブ管理向けに拡張された **RESTful API** により、ユーザーは自動化された運用ワークフローを構築できます。さらに、Project Read-only ロールのサポートや、cluster と snapshot の名前変更機能も追加されています。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

### Serverless GA\{#serverless-ga}

1 年にわたる改良を経て、Zilliz Cloud Serverless が一般提供になりました。GenAI アプリケーション向けの手間のかからない serverless vector database として設計された Zilliz Cloud Serverless は、アプリの需要に応じて調整される自動スケーリングを提供し、最大 50 倍のコスト削減を実現します。そのコスト効率は、DRAM、SSD、object storage 間でデータ配置を最適化する階層型ストレージシステムによって支えられており、アクティブなデータへの高速アクセスを確保しつつ、使用頻度の低いデータのコストを削減します。しかも、これらはすべて手動介入なしで行われます。

Dedicated cluster とは異なり、この serverless サービスでは使用した分だけ課金されるため、アイドル状態のサーバーに対するコストが発生しません。便利な移行機能により、オープンソース Milvus から Zilliz Cloud Serverless へ、または Serverless から Dedicated Cluster へと、変化するニーズに合わせて簡単にデータを移行できます。

[詳細を見る、または無料トライアルを開始する。](https://zilliz.com/serverless)

### Zilliz Cloud 上での Milvus 2.4.x 新機能 GA\{#milvus-24x-new-features-ga-on-zilliz-cloud}

Milvus 2.4 は、RAG やマルチモーダルデータ検索において非常に実用的な多くの機能を提供します。これらの新機能を試したい場合は、cluster を Public Preview に更新できます。Milvus 2.4 はまだ安定版に達していないため、本番環境で Milvus 2.4 の機能を採用する際は注意してください。

#### 疎ベクトル\{#sparse-vector}

疎ベクトルは、その密ベクトル版とは異なり、桁違いに多い次元数を持ちながら、非ゼロの値を持つ次元はごくわずかである傾向があります。この機能は、用語ベースの性質により解釈性が高く、特定のドメインではより効果的である場合があります。SPLADEv2/BGE-M3 のような学習済み疎モデルは、一般的な第 1 段階ランキングタスクで非常に有用であることが証明されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成された疎ベクトルに対して、効率的な近似セマンティック最近傍検索を可能にすることです。Zilliz Cloud は現在、疎ベクトルの効果的かつ高性能な保存、index 作成、検索（MIPS, Maximum Inner Product Search）をサポートしています。

サンプルコードは [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) にあります。

#### マルチベクトルとハイブリッド検索\{#multi-vector-and-hybrid-search}

マルチベクトルサポートは、マルチモデルデータ処理や dense vector と sparse vector の混在を必要とするアプリケーションの基盤です。マルチベクトルサポートにより、次のことが可能になります。

- 複数のモデルから、非構造化テキスト、画像、音声サンプル向けに生成された vector embedding を保存する。

- 各 entity の複数の vector を含む ANN 検索を実行する。

- 異なる埋め込みモデルに重みを割り当てて検索戦略をカスタマイズする。

- さまざまな埋め込みモデルを試して、最適なモデルの組み合わせを見つける。

マルチベクトルサポートでは、collection 内の FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など異なる型の複数の vector field を保存、index 化し、reranking 戦略を適用できます。現在、2 つの reranking 戦略が利用可能です: **Reciprocal Rank Fusion (RRF)** と **Average Weighted Scoring**。どちらの戦略も、異なる vector field からの検索結果を 1 つの結果セットに統合します。RRF は元のランキングにおけるアイテムの位置を考慮し、複数のリストで上位にランクされるものをより重視し、異なる vector field に一貫して現れる entity を優先します。Average Weighted Scoring は、各 vector field の検索結果に重みを割り当て、最終結果セットにおける重要度を決定します。

サンプルコードは [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) にあります。

#### 改善されたメタデータフィルタリングと部分文字列一致\{#improved-metadata-filtering-and-substring-matching}

このリリースでは、メタデータフィルタリングに対して 2 つの重要な改善を行いました。1 つ目は、新しい scalar inverted index を導入することで、scalar データ型のフィルタリング性能を向上させたことです。2 つ目は、メタデータフィルタリング中の部分文字列一致のサポートを拡張したことです。

これまでの Milvus リリースでは、メタデータフィルタリングはメモリベースの二分探索 index と Marisa Trie index によって実装されていました。これらの方式はメモリ消費が大きいものでした。Zilliz Cloud の最新リリースでは、現在 Tantivy ベースの inverted index を採用しており、これはすべての数値型および文字列型データに適用できます。この新しい index により、文字列に対する scalar query の性能が 10 倍向上します。また、内部 index 構造にデータ圧縮と Memory-mapped storage（MMap）メカニズムを適用することで、メモリ消費も抑えられます。サンプルコードは [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) にあります。

このリリースではさらに、prefix、infix、postfix、および wildcard パターンを含む、より柔軟な文字列一致もサポートしています。

#### グルーピング検索\{#grouping-search}

特定の scalar field の値によって検索結果を集約できるようになりました。これは、RAG において document chunk を取得すると同時に、検索クエリに関連する一意の document ID を返す場合に役立ちます。各 document が複数の chunk に分割され、各 chunk が vector embedding で表現される document collection を考えると、`search()` 操作で `group_by_field` 引数を使用して結果を document ID ごとにグループ化できます。これにより、意味的に関連する chunk を検索しながら、関連 document の一覧を見つけることができます。

サンプルコードは [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) にあります。

#### Float16 および BFloat- Vector DataType\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16 や BFloat のような半精度データ型がよく使用されます。これらのデータ型は、精度低下と引き換えにクエリ効率を改善し、メモリ使用量を削減できます。このリリースにより、Zilliz Cloud は vector field に対してこれらのデータ型をサポートするようになりました。

サンプルコードは [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/float16_example.py) および [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/bfloat16_example.py) にあります。

### マルチレプリカ\{#multi-replica}

マルチレプリカが Zilliz Cloud で利用可能になり、cluster レベルのレプリケーションによってクエリスループットと可用性の両方を向上させます。

- **クエリ性能の向上**: 高い query-per-second（QPS）を必要とするユーザーにとって、マルチレプリカによりクエリワークロードを複数のレプリカに分散できます。この並列処理によって全体のスループットが向上し、レイテンシが低減され、クエリ集約型アプリケーションの効率が改善されます。ほとんどの場合、全体の QPS はレプリカ追加に応じて線形に向上します。

- **可用性の強化**: マルチレプリカは、複数の Availability Zone（AZ）にレプリカを分散することで可用性を強化します。この構成により、AZ 障害が発生した場合でもデータへの継続的なアクセスが確保され、ミッションクリティカルなアプリケーションに対してより高い信頼性を提供します。

現在、マルチレプリカ機能はパブリックプレビュー中であり、Enterprise Plan で利用可能です。詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

### Migration Service\{#migration-service}

Zilliz Cloud は現在、包括的な Migration Service を提供しており、ユーザーは移行タスクを容易に完了できます。現在、次の 3 種類の移行がサポートされています。

- オープンソース Milvus から Zilliz Cloud へ移行する。移行先は Free Plan instance、Serverless instance、または Dedicated Cluster を選択できます。詳細は [Migrate from Milvus to Zilliz Cloud](./migrate-from-milvus) を参照してください。

- 他のオープンソースデータベースから Zilliz Cloud へ移行する。現在は pgvector および Elasticsearch からの移行をサポートしています。移行先は Free Plan instance、Serverless instance、または Dedicated Cluster を選択できます。詳細は [Migrate from Elasticsearch to Zilliz Cloud](./migrate-from-elasticsearch) および [Migrate from pgvector to Zilliz Cloud](./migrate-from-pgvector) を参照してください。

- Zilliz Cloud 内でデータを移行する。これには組織内および組織間のデータ移行の両方が含まれます。詳細は [Cross-Cluster Migrations](./offline-migration) を参照してください。

### Backup/Restore/Migration/Jobs RESTful API\{#backuprestoremigrationjobs-restful-api}

このアップデートにより、Zilliz Cloud はコントロールプレーン API を拡張し、バックアップ、リストア、移行、ジョブ管理をサポートする新機能を導入しました。

これらの RESTful API により、ユーザーは独自の自動化された運用ワークフローを構築でき、データ管理およびメンテナンスプロセスに対してより高い柔軟性と制御を得られます。

[API の詳細を見る。](/reference/restful)

### その他の機能強化\{#other-enhancements}

このリリースには、次のような一連の機能強化も含まれています。

- [Project Read-only Role](./project-users) のサポート

- cluster と snapshot の名前変更のサポート

