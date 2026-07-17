---
title: "リリースノート（2024年9月4日） | Cloud"
slug: /release-notes-2100
sidebar_label: "2024年9月4日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "今回のリリースでは、まず自動スケーリングを提供し、最大50倍のコスト削減を実現する Zilliz Cloud Serverless の GA から始まり、Zilliz Cloud にいくつかの重要な更新がもたらされました。Milvus 2.4 の機能も GA となり、sparse vector、multi-vector hybrid search、fuzzy matching を備えた inverted index などの機能が導入されています。また、このリリースにはパブリックプレビューの multi-replica 機能も含まれており、複数の Availability Zone（AZ）にある replica 間でワークロードを分散することで、クエリスループットと可用性を向上できます。さらに、Zilliz Cloud の新しい Migration Service は、オープンソース Milvus、pgvector、Elasticsearch からの移行をサポートし、Zilliz Cloud 内での組織内および組織間のデータ移行も可能にします。backup、restore、migration、job management 向けに拡張された RESTful API により、ユーザーは自動化された運用ワークフローを構築できます。さらに、Project Read-only role のサポートや cluster と snapshot の名前変更機能も追加されています。 | Cloud"
type: origin
token: PJ4hwwD1DiVnv0kWPZBceLrdnSf
sidebar_position: 20
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年9月4日）

今回のリリースでは、まず **Zilliz Cloud Serverless の GA** から始まり、Zilliz Cloud にいくつかの重要な更新がもたらされました。これは自動スケーリングを提供し、最大50倍のコスト削減を実現します。**Milvus 2.4 の機能** も GA となり、sparse vector、multi-vector hybrid search、fuzzy matching を備えた inverted index などの機能が導入されています。また、このリリースにはパブリックプレビューの **multi-replica 機能** も含まれており、複数の Availability Zone（AZ）にある replica 間でワークロードを分散することで、クエリスループットと可用性を向上できます。さらに、Zilliz Cloud の新しい **Migration Service** は、オープンソース Milvus、pgvector、Elasticsearch からの移行をサポートし、Zilliz Cloud 内での組織内および組織間のデータ移行も可能にします。backup、restore、migration、job management 向けに拡張された **RESTful API** により、ユーザーは自動化された運用ワークフローを構築できます。さらに、Project Read-only role のサポートや cluster と snapshot の名前変更機能も追加されています。

### Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

### Serverless GA\{#serverless-ga}

1年にわたる改善を経て、Zilliz Cloud Serverless が一般提供となりました。GenAI アプリケーション向けの手間のかからない serverless vector database として設計された Zilliz Cloud Serverless は、アプリの需要に応じて調整される自動スケーリングを提供し、最大50倍のコスト削減を実現します。そのコスト効率は、DRAM、SSD、オブジェクトストレージ全体でデータ配置を最適化する階層型ストレージシステムによって実現されており、アクティブなデータへの高速アクセスを確保しつつ、使用頻度の低いデータのコストを削減します。これらはすべて手動介入なしで行われます。

Dedicated cluster とは異なり、serverless サービスでは使用した分だけ課金されるため、アイドル状態のサーバーにかかるコストがなくなります。便利な migration 機能により、オープンソース Milvus から Zilliz Cloud Serverless へ、または Serverless から Dedicated Cluster へと、変化するニーズに合わせて簡単にデータを移行できます。

[詳細を見る、または無料トライアルを開始する。](https://zilliz.com/serverless)

### Milvus 2.4.x New Features GA on Zilliz Cloud\{#milvus-24x-new-features-ga-on-zilliz-cloud}

Milvus 2.4 は、RAG やマルチモーダルデータ検索に向けた実用性の高い多くの機能を提供します。これらの新機能を試したい場合は、cluster を Public Preview に更新できます。Milvus 2.4 はまだ安定版に達していないため、本番環境で Milvus 2.4 の機能を採用する際は注意してください。

#### Sparse Vector\{#sparse-vector}

Sparse vector は dense vector とは異なり、次元数が数桁多い一方で、非ゼロとなる次元はごくわずかである傾向があります。この機能は用語ベースの性質により高い解釈性を提供し、特定の分野ではより効果的です。SPLADEv2/BGE-M3 のような学習型 sparse model は、一般的な第1段階ランキングタスクで非常に有用であることが証明されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成された sparse vector に対し、効率的な近似セマンティック最近傍検索を可能にすることです。Zilliz Cloud は現在、sparse vector の効果的かつ高性能な保存、index 作成、検索（MIPS, Maximum Inner Product Search）をサポートしています。

サンプルコードは [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) にあります。

#### Multi-vector & Hybrid Search\{#multi-vector-and-hybrid-search}

Multi-vector のサポートは、マルチモデルデータ処理や dense vector と sparse vector の組み合わせを必要とするアプリケーションにとって中核となる機能です。Multi-vector のサポートにより、以下が可能になりました。

- 複数のモデルから生成された、非構造化テキスト、画像、音声サンプル向けの vector embedding を保存する。

- 各 entity の複数 vector を含む ANN 検索を実行する。

- 異なる embedding model に重みを割り当てて検索戦略をカスタマイズする。

- 最適なモデルの組み合わせを見つけるために、さまざまな embedding model を試す。

Multi-vector のサポートにより、collection 内で FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など異なる型の複数の vector field を保存、index 化し、reranking 戦略を適用できます。現在、2つの reranking 戦略が利用可能です: **Reciprocal Rank Fusion (RRF)** と **Average Weighted Scoring**。どちらの戦略も、異なる vector field からの検索結果を統合した結果セットにまとめます。RRF は元のランキングにおけるアイテムの位置を考慮し、複数のリストで上位にランクされるものをより重視し、異なる vector field に一貫して現れる entity を優先します。Average Weighted Scoring は、各 vector field の検索結果に重みを割り当て、最終的な結果セットにおける重要度を決定します。

サンプルコードは [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) にあります。

#### Improved Metadata Filtering and Substring Matching\{#improved-metadata-filtering-and-substring-matching}

このリリースでは、metadata filtering に2つの重要な改善を行いました。まず、新しい scalar inverted index の導入により、scalar data type の filtering 性能を向上させました。次に、metadata filtering 中の substring matching のサポートを拡張しました。

これまでの Milvus リリースでは、metadata filtering はメモリベースの binary search index と Marisa Trie index を用いて実装されていました。これらの手法はメモリ消費が大きいものでした。Zilliz Cloud の最新リリースでは、Tantivy ベースの inverted index を採用しており、これはすべての数値型および文字列型データに適用できます。この新しい index は、文字列に対する scalar query の性能を10倍向上させます。また、内部 index 構造にデータ圧縮と Memory-mapped storage（MMap）メカニズムを適用することで、メモリ消費も削減します。サンプルコードは [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) にあります。

このリリースではさらに、prefix、infix、postfix、wildcard pattern を含む、より柔軟な文字列マッチングもサポートしています。

#### Grouping Search\{#grouping-search}

特定の scalar field の値で検索結果を集約できるようになりました。これは RAG において、document chunk を取得するとともに、検索クエリに関連する一意の document ID を返すのに便利です。各 document が複数の chunk に分割され、各 chunk が vector embedding として表現される document collection を考えると、`search()` 操作で `group_by_field` 引数を使用して結果を document ID ごとにグループ化し、意味的に関連する chunk を検索しながら、関連 document のリストを見つけることができます。

サンプルコードは [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) にあります。

#### Float16 and BFloat- Vector DataType\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16 や BFloat のような half-precision data type がよく使用されます。これらの data type は、精度低下とのトレードオフで、query 効率を改善しメモリ使用量を削減できます。このリリースにより、Zilliz Cloud は vector field に対してこれらの data type をサポートするようになりました。

サンプルコードは [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/float16_example.py) と [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/bfloat16_example.py) にあります。

### Multi-replica\{#multi-replica}

Multi-replica が Zilliz Cloud で利用可能になり、cluster レベルの replication によって query throughput と可用性の両方を向上できるようになりました。

- **クエリ性能の向上**: 高い query-per-second（QPS）を必要とするユーザーにとって、multi-replica は query workload を replica 間で分散できます。この並列処理により、全体の throughput が向上し、レイテンシが低減され、query 集約型アプリケーションの効率が改善されます。ほとんどの場合、replica を追加することで全体の QPS は線形に向上します。

- **可用性の強化**: Multi-replica は、複数の Availability Zone（AZ）に replica を分散することで可用性を強化します。この構成により、AZ 障害が発生した場合でもデータへの継続的なアクセスが保証され、ミッションクリティカルなアプリケーションに対してより高い信頼性を提供します。

現在、multi-replica 機能はパブリックプレビューであり、Enterprise Plan で利用できます。詳細については、[Plan Cluster Scaling](./plan-cluster-scaling) を参照してください。

### Migration Service\{#migration-service}

Zilliz Cloud は現在、包括的な Migration Service を提供しており、ユーザーは migration タスクを容易に完了できます。現在、以下の3種類の migration がサポートされています。

- オープンソース Milvus から Zilliz Cloud へ移行する。移行先は Free Plan instance、Serverless instance、または Dedicated Cluster にできます。詳細は [Migrate from Milvus to Zilliz Cloud](./migrate-from-milvus) を参照してください。

- 他のオープンソース database から Zilliz Cloud へ移行する。現在は pgvector および Elasticsearch からの移行をサポートしています。移行先は Free Plan instance、Serverless instance、または Dedicated Cluster にできます。詳細は [Migrate from Elasticsearch to Zilliz Cloud](./migrate-from-elasticsearch) および [Migrate from pgvector to Zilliz Cloud](./migrate-from-pgvector) を参照してください。

- Zilliz Cloud 内でデータを移行する。組織内および組織間の両方のデータ migration をサポートしています。詳細は [Cross-Cluster Migrations](./offline-migration) を参照してください。

### Backup/Restore/Migration/Jobs RESTful API\{#backuprestoremigrationjobs-restful-api}

この更新により、Zilliz Cloud は control plane API を拡張し、backup、restore、migration、job management をサポートする新機能を導入しました。

これらの RESTful API により、ユーザーは独自の自動化された運用ワークフローを構築でき、データ管理および保守プロセスにおいてより高い柔軟性と制御性を得られます。

[API の詳細を見る。](/reference/restful)

### Other Enhancements\{#other-enhancements}

このリリースには、以下の一連の機能強化も含まれています。

- [Project Read-only Role](./project-users) のサポート

- cluster と snapshot の名前変更のサポート

