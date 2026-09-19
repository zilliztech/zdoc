---
title: "リリースノート（2024年9月4日） | Cloud"
slug: /release-notes-2100
sidebar_label: "2024年9月4日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "今回のリリースでは、Zilliz Cloud にいくつかの重要なアップデートが導入されています。まず、Zilliz Cloud Serverless の GA により、自動スケーリングが提供され、最大 50 倍のコスト削減が可能になります。Milvus 2.4 の機能も GA となり、疎ベクトル、マルチベクトルハイブリッド検索、あいまい一致に対応した転置インデックスなどの機能が導入されました。また、このリリースにはパブリックプレビューのマルチレプリカ機能が含まれており、複数の Availability Zones（AZ）にまたがるレプリカにワークロードを分散することで、クエリスループットと可用性を向上できます。さらに、Zilliz Cloud の新しい Migration Service は、オープンソース Milvus、pgvector、Elasticsearch からの移行をサポートし、Zilliz Cloud 内での組織内および組織間のデータ移行を可能にします。バックアップ、復元、移行、ジョブ管理向けに拡張された RESTful API により、ユーザーは自動化された運用ワークフローを構築できます。その他の機能強化として、Project Read-only ロールのサポートや、クラスターとスナップショットの名前変更が含まれています。 | Cloud"
type: origin
token: PJ4hwwD1DiVnv0kWPZBceLrdnSf
sidebar_position: 21
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年9月4日）

今回のリリースでは、Zilliz Cloud にいくつかの重要なアップデートが導入されています。まず、**Zilliz Cloud Serverless の GA** により、自動スケーリングが提供され、最大 50 倍のコスト削減が可能になります。**Milvus 2.4 の機能** も GA となり、疎ベクトル、マルチベクトルハイブリッド検索、あいまい一致に対応した転置インデックスなどの機能が導入されました。また、このリリースにはパブリックプレビューの **マルチレプリカ機能** が含まれており、複数の Availability Zones（AZ）にまたがるレプリカにワークロードを分散することで、クエリスループットと可用性を向上できます。さらに、Zilliz Cloud の新しい **Migration Service** は、オープンソース Milvus、pgvector、Elasticsearch からの移行をサポートし、Zilliz Cloud 内での組織内および組織間のデータ移行を可能にします。バックアップ、復元、移行、ジョブ管理向けに拡張された **RESTful API** により、ユーザーは自動化された運用ワークフローを構築できます。そのほか、Project Read-only ロールのサポートや、クラスターとスナップショットの名前変更機能も追加されています。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.4.x** と互換性があります。

### Serverless の GA\{#serverless-ga}

1 年にわたる改良を経て、Zilliz Cloud Serverless が一般提供となりました。GenAI アプリケーション向けの手間のかからないサーバーレスベクトルデータベースとして設計された Zilliz Cloud Serverless は、アプリの需要に合わせて調整される自動スケーリングを提供し、最大 50 倍のコスト削減を実現します。そのコスト効率は、DRAM、SSD、オブジェクトストレージにまたがってデータの配置を最適化する階層型ストレージシステムによって実現されており、アクティブなデータへの迅速なアクセスを確保しながら、使用頻度の低いデータのコストを削減します。これらはすべて、手動による介入なしで行われます。

Dedicated クラスターとは異なり、Serverless サービスでは使用した分だけを支払うことになり、アイドル状態のサーバーにかかるコストを排除できます。便利な移行機能により、オープンソース Milvus から Zilliz Cloud Serverless へ、または Serverless から Dedicated クラスターへと、変化するニーズに合わせてデータを簡単に移行できます。

[詳細を確認するか、無料トライアルをお試しください。](https://zilliz.com/serverless)

### Milvus 2.4.x の新機能が Zilliz Cloud で GA\{#milvus-24x-new-features-ga-on-zilliz-cloud}

Milvus 2.4 は、RAG やマルチモーダルデータ検索に非常に実用的な多くの機能を提供します。これらの新機能を試したい場合は、クラスターを Public Preview にアップデートできます。Milvus 2.4 はまだ安定版に達していないため、本番環境で Milvus 2.4 の機能を採用する際は注意してください。

#### 疎ベクトル\{#sparse-vector}

疎ベクトルは、密ベクトルとは異なり、次元数が数桁大きくなる一方で、非ゼロの値はごくわずかであるという傾向があります。この機能は、用語ベースの性質により解釈性が高く、特定の領域ではより効果を発揮します。SPLADEv2/BGE-M3 のような学習済みの疎モデルは、一般的な第 1 段階のランキングタスクに非常に有用であることが証明されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成された疎ベクトルに対して、効率的な近似セマンティック最近傍検索を可能にすることです。Zilliz Cloud は、疎ベクトルの効果的かつ高性能なストレージ、インデックス作成、検索（MIPS、Maximum Inner Product Search）をサポートするようになりました。

サンプルコードは [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) にあります。

#### マルチベクトル & ハイブリッド検索\{#multi-vector-and-hybrid-search}

マルチベクトルサポートは、マルチモデルのデータ処理や、密ベクトルと疎ベクトルの組み合わせを必要とするアプリケーションの基盤です。マルチベクトルサポートにより、次のことが可能になりました。

- 複数のモデルから生成された、非構造化テキスト、画像、音声サンプルのベクトル埋め込みを保存できます。

- 各エンティティの複数のベクトルを含む ANN 検索を実行できます。

- 異なる埋め込みモデルに重みを割り当てることで、検索戦略をカスタマイズできます。

- さまざまな埋め込みモデルを試して、最適なモデルの組み合わせを見つけることができます。

マルチベクトルサポートでは、コレクション内の FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など、型の異なる複数のベクトルフィールドに対して、保存、インデックス作成、再ランキング戦略の適用を行えます。現在、**Reciprocal Rank Fusion（RRF）** と **Average Weighted Scoring** の 2 つの再ランキング戦略を利用できます。どちらの戦略も、異なるベクトルフィールドの検索結果を 1 つの結果セットに統合します。RRF は元のランキングにおけるアイテムの位置を考慮し、複数のリストで上位にランクされるアイテムをより重要視するとともに、異なるベクトルフィールドに一貫して出現するエンティティを優先します。Average Weighted Scoring は、各ベクトルフィールドの検索結果に重みを割り当てて、最終的な結果セットにおける重要度を決定します。

サンプルコードは [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) にあります。

#### メタデータフィルタリングと部分文字列マッチングの改善\{#improved-metadata-filtering-and-substring-matching}

今回のリリースでは、メタデータフィルタリングに 2 つの重要な改善を加えました。まず、新しいスカラーの転置インデックスを導入することで、スカラーデータ型のフィルタリング性能を向上させました。次に、メタデータフィルタリング中の部分文字列マッチングのサポートを拡張しました。

以前の Milvus リリースでは、メタデータフィルタリングはメモリベースの二分探索インデックスと Marisa Trie インデックスで実装されていました。これらの方法はメモリを大量に消費します。Zilliz Cloud の最新リリースでは、すべての数値型と文字列型に適用できる Tantivy ベースの転置インデックスを採用しています。この新しいインデックスは、文字列に対するスカラークエリの性能を 10 倍に向上させます。また、内部のインデックス構造にデータ圧縮とメモリマップドストレージ（MMap）の仕組みを適用することで、メモリの消費も抑えられます。サンプルコードは [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) にあります。

このリリースでは、プレフィックス、インフィックス、ポストフィックス、ワイルドカードパターンなど、より柔軟な文字列マッチングのサポートも追加されています。

#### グループ化検索\{#grouping-search}

特定のスカラーフィールドの値で検索結果を集約できるようになりました。これは RAG において、ドキュメントチャンクを取得すると同時に、検索クエリに関連する一意のドキュメント ID を返す場合に役立ちます。各ドキュメントが複数のチャンクに分割され、各チャンクがベクトル埋め込みで表現されるドキュメントのコレクションを考えてみます。`search()` 操作で `group_by_field` 引数を使用すると、結果をドキュメント ID でグループ化できるため、意味的に関連するチャンクを検索しながら、関連するドキュメントの一覧を見つけることができます。

サンプルコードは [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) にあります。

#### Float16 と BFloat のベクトルデータ型\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16 や BFloat などの半精度データ型がよく使用されます。これらのデータ型は、精度の低下と引き換えに、クエリ効率を向上させ、メモリ使用量を削減できます。このリリースにより、Zilliz Cloud はベクトルフィールドでこれらのデータ型をサポートするようになりました。

サンプルコードは [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/float16_example.py) および [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/bfloat16_example.py) にあります。

### マルチレプリカ\{#multi-replica}

マルチレプリカが Zilliz Cloud で利用可能になり、クラスターレベルのレプリケーションによってクエリスループットと可用性の両方を向上できるようになりました。

- **クエリ性能の向上**: 高い QPS（1 秒あたりのクエリ数）を必要とするユーザー向けに、マルチレプリカではクエリワークロードをレプリカ間に分散できます。この並列処理により、全体的なスループットが向上し、レイテンシが削減され、クエリ集約型アプリケーションの効率が改善されます。ほとんどの場合、レプリカを追加するにつれて全体の QPS を線形に向上させることができます。

- **可用性の強化**: マルチレプリカは、複数の Availability Zones（AZ）にレプリカを分散することで可用性を強化します。この構成により、AZ の障害が発生した場合でもデータへの継続的なアクセスが確保され、ミッションクリティカルなアプリケーションに対してより高い信頼性が提供されます。

現在、マルチレプリカ機能はパブリックプレビューであり、Enterprise Plan で利用できます。詳細については、[クラスタースケーリングの計画](./plan-cluster-scaling) を参照してください。

### Migration Service\{#migration-service}

Zilliz Cloud は、包括的な Migration Service を提供するようになり、ユーザーは移行タスクを簡単に完了できます。現在、3 種類の移行がサポートされています。

- オープンソース Milvus から Zilliz Cloud への移行。移行先には、Free Plan インスタンス、Serverless インスタンス、または Dedicated クラスターを指定できます。詳細については、[Milvus から Zilliz Cloud への移行](./migrate-from-milvus) を参照してください。

- 他のオープンソースデータベースから Zilliz Cloud への移行。現在は pgvector および Elasticsearch からの移行をサポートしています。移行先には、Free Plan インスタンス、Serverless インスタンス、または Dedicated クラスターを指定できます。詳細については、[Elasticsearch から Zilliz Cloud への移行](./migrate-from-elasticsearch) および [pgvector から Zilliz Cloud への移行](./migrate-from-pgvector) を参照してください。

- Zilliz Cloud 内でのデータ移行。組織内および組織間のデータ移行の両方をサポートしています。詳細については、[クラスター間の移行](./offline-migration) を参照してください。

### Backup/Restore/Migration/Jobs RESTful API\{#backuprestoremigrationjobs-restful-api}

このアップデートにより、Zilliz Cloud はコントロールプレーン API を拡張し、バックアップ、復元、移行、ジョブ管理をサポートする新機能を導入しました。

これらの RESTful API により、ユーザーは独自の自動化された運用ワークフローを構築でき、データ管理および保守プロセスに対してより大きな柔軟性と制御を得られます。

[Learn more about the API details.](/reference/restful)

### その他の機能強化\{#other-enhancements}

このリリースには、次のような一連の機能強化も含まれています。

- [Project Read-only Role](./manage-platform-roles#predefined-project-roles) のサポート

- クラスターとスナップショットの名前変更のサポート

