---
title: "リリースノート（2024年9月4日） | Cloud"
slug: /release-notes-2100
sidebar_label: "リリースノート（2024年9月4日）"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud ServerlessのGAから始まり、自動スケーリングを提供し、最大50倍のコスト削減が可能になりました。Milvus 2.4機能がGAになり、スパースベクトル、マルチベクトルハイブリッド検索、ファジーマッチング付き逆インデックスなどの機能が導入されました。このリリースには、パブリックプレビューのマルチレプリカ機能も含まれており、複数の可用性ゾーン(AZ)のレプリカにワークロードを分散することで、クエリのスループットと可用性を向上させることができます。さらに、Zilliz Cloudの新しいMigration Serviceは、オープンソースのMilvus、pgvector、Elasticsearchからの移行をサポートし、Zilliz Cloud内での組織内および組織間のデータ移行を可能にします。バックアップ、リストア、移行、ジョブ管理のための拡張されたRESTful APIにより、ユーザーは自動化された運用ワークフローをその他の機能強化には、プロジェクトの読み取り専用ロールのサポート、クラスターとスナップショットの名前変更機能が含まれます。 | Cloud"
type: origin
token: IAMrwQHwWiHZHekyLuZcVMVunyg
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年9月4日）

このリリースでは、**Zilliz Cloud ServerlessのGA**から始まり、自動スケーリングを提供し、最大50倍のコスト削減が可能になりました。**Milvus 2.4機能**がGAになり、スパースベクトル、マルチベクトルハイブリッド検索、ファジーマッチング付き逆インデックスなどの機能が導入されました。このリリースには、パブリックプレビューの**マルチレプリカ機能**も含まれており、複数の可用性ゾーン(AZ)のレプリカにワークロードを分散することで、クエリのスループットと可用性を向上させることができます。さらに、Zilliz Cloudの新しい**Migration Service**は、オープンソースのMilvus、pgvector、Elasticsearchからの移行をサポートし、Zilliz Cloud内での組織内および組織間のデータ移行を可能にします。バックアップ、リストア、移行、ジョブ管理のための拡張された**RESTful API**により、ユーザーは自動化された運用ワークフローをその他の機能強化には、プロジェクトの読み取り専用ロールのサポート、クラスターとスナップショットの名前変更機能が含まれます。

### Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.4. x**と互換性があります。

### サーバーレスGA{#serverless-ga}

1年間の改良の後、Zilliz Cloud Serverlessが一般的に利用可能になりました。Gen AIアプリケーション向けの手間のかからないサーバーレスベクトルデータベースとして設計されたZilliz Cloud Serverlessは、アプリの要求に合わせて自動スケーリングを提供し、最大50倍のコスト削減を実現します。DRAM、SSD、オブジェクトストレージ全体にわたるデータ配置を最適化する段階的なストレージシステムにより、アクティブなデータへの迅速なアクセスを確保しながら、より頻繁に使用されないデータのコストを削減することができ、すべて手動の介入なしに実現されます。

専用クラスターとは異なり、サーバーレスサービスは使用した分だけ支払うことを保証し、アイドルサーバーのコストを排除します。便利な移行機能により、オープンソースのMilvusからZilliz Cloud Serverlessに、またはServerlessから専用クラスターにデータを簡単に転送して、変化するニーズに対応できます。

[もっと学ぶか、無料トライアルを受けてください。](https://zilliz.com/serverless)

### Zilliz CloudでMilvus 2.4. xの新機能がGAしました。{#milvus-24x-new-features-ga-on-zilliz-cloud}

Milvus 2.4は、RAGおよびマルチモーダルデータ検索のための多くの非常に実用的な機能を提供しています。これらの新機能を試したい場合は、クラスタをパブリックプレビューに更新することができます。Milvus 2.4は安定したバージョンに達していないため、本番環境でMilvus 2.4の機能を採用する際には注意が必要です。

#### 疎ベクトル{#sparse-vector}

疎ベクトルは、非ゼロのものがわずかしかなく、次元数が数桁高くなる傾向があるため、密ベクトルとは異なります。この機能は、用語ベースの性質により、より良い解釈性を提供し、特定の領域でより効果的になることがあります。SPLADE v 2/BGE-M 3などの学習済み疎モデルは、一般的な第一段階のランキングタスクに非常に役立つことが証明されています。この新機能の主な用途は、SPLADE v 2/BGE-M 3などのニューラルモデルやBM 25アルゴリズムなどの統計モデルによって生成された疎ベクトルに対する効率的な近似意味最近傍探索を可能にすることです。Zilliz Cloudは、疎ベクトルの効果的かつ高性能なストレージ、インデックス付け、および検索(MIPS、最大内積検索)をサポートしています。

サンプルコードは[hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py)にあります。

#### マルチベクトル&ハイブリッド検索{#multi-vector-and-hybrid-search}

マルチベクトルサポートは、マルチモデルデータ処理や密なベクトルと疎なベクトルの混合を必要とするアプリケーションの基盤となります。マルチベクトルサポートにより、以下のことが可能になります:

- 複数のモデルから生成された非構造化テキスト、画像、またはオーディオサンプルのベクトル埋め込みを保存します。

- 各エンティティの複数のベクトルを含むANN検索を実行してください。

- 異なる埋め込みモデルに重みを割り当てることで、検索戦略をカスタマイズできます。

- 最適なモデルの組み合わせを見つけるために、さまざまな埋め込みモデルを実験してください。

マルチベクトルサポートにより、FLOAT_VECTORやSPARSE_FLOAT_VECTORなど、異なるタイプの複数のベクトルフィールドに対して、コレクション内に格納、インデックス化、再ランキング戦略を適用することができます。現在、2つの再ランキング戦略が利用可能です。**Reciprocal Rank Fusion(RRF)**と**Average Weighted Scoring**です。両方の戦略は、異なるベクトルフィールドからの検索結果を統一された結果セットに結合します。RRFは、元のランキング内のアイテムの位置を考慮し、複数のリストで上位にランクされるアイテムに高い重要性を与え、異なるベクトルフィールドに一貫して表示されるエンティティに優先順位を付けます。Average Weighted Scoringは、各ベクトルフィールドの検索結果に重みを割り当て、最終結果セットでの重要性を決定します。

サンプルコードは[hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py)にあります。

#### メタデータのフィルタリングと部分文字列のマッチングの改善{#improved-metadata-filtering-and-substring-matching}

今回のリリースでは、メタデータフィルタリングに2つの重要な改善を加えました。1つ目は、新しいスカラー反転インデックスを導入することで、スカラーデータ型のフィルタリングのパフォーマンスを向上させました。2つ目は、メタデータフィルタリング中の部分文字列マッチングのサポートを拡大しました

Milvusの以前のリリースでは、メモリベースのバイナリサーチインデックスとMarisa Trieインデックスを使用してメタデータフィルタリングが実装されていました。これらの方法はメモリを大量に消費します。Zilliz Cloudの最新リリースでは、すべての数値および文字列データ型に適用できるTantivyベースの逆インデックスが使用されています。この新しいインデックスは、文字列に対するスカラークエリのパフォーマンスを10倍向上させます。また、内部インデックス構造にデータ圧縮とメモリマップドストレージ(MMap)メカニズムを適用することで、より少ないメモリを消費します。サンプルコードは以下にあります[inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py)

このリリースでは、プレフィックス、インフィックス、ポストフィックス、ワイルドカードパターンなど、より柔軟な文字列マッチングのサポートも追加されています。

#### グループ検索{#grouping-search}

特定のスカラーフィールドの値によって検索結果を集計できるようになりました。これは、検索クエリに関連する一意のドキュメントIDを返すだけでなく、ドキュメントチャンクを取得するためにRAGで役立ちます。各ドキュメントが複数のチャンクに分割され、各チャンクがベクトル埋め込みで表されるドキュメントのコレクションを考慮すると、`group_by_field`引数を`search()`操作で使用して、ドキュメントIDによって結果をグループ化し、意味的に関連するチャンクを検索しながら関連するドキュメントのリストを見つけることができます。

サンプルコードは[example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py)にあります。

#### Float 16とBFloatベクトルデータ型{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークは、しばしばFloat 16やBFloatなどの半精度データ型を使用します。これらのデータ型は、クエリの効率を向上させ、メモリ使用量を減らすことができますが、精度は低下します。このリリースにより、Zilliz Cloudはベクトルフィールドに対してこれらのデータ型をサポートするようになりました。

サンプルコードは[float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py)と[bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py)にあります。

### マルチレプリカ{#multi-replica}

Zilliz Cloudでマルチレプリカが利用可能になりました。これにより、クラスターレベルのレプリケーションが可能になり、クエリのスループットと可用性の両方が向上します。

- **改善されたクエリパフォーマンス**:高いクエリ毎秒(QPS)を必要とするユーザーにとって、マルチレプリカはクエリワークロードをレプリカ全体に分散させることができます。この並列処理により、全体的なスループットが向上し、レイテンシが減少し、クエリ集中型アプリケーションの効率が向上します。ほとんどの場合、レプリカが追加されるにつれて、全体的なQPSは線形に改善されます。

- **拡張可用性**:マルチレプリカは、複数の可用性ゾーン(AZ)にレプリカを配布することで可用性を強化します。この設定により、AZの障害が発生してもデータへの継続的なアクセスが確保され、ミッションクリティカルなアプリケーションの信頼性が向上します。

現在、マルチレプリカ機能はパブリックプレビューであり、Enterprise Planで利用可能です。詳細については、「[レプリカの管理](./manage-replica)」をご覧ください。

### マイグレーションサービス{#migration-service}

Zilliz Cloudは、ユーザーが簡単に移行タスクを完了できる包括的な移行サービスを提供しています。現在、3種類の移行がサポートされています。

- オープンソースのMilvusからZilliz Cloudへの移行を行います。移行対象は、Free Planインスタンス、Serverlessインスタンス、Dedicated Clusterのいずれかです。詳細については、「[MilvusからZilliz Cloudへの移行](./migrate-from-milvus)」を参照してください。

- 他のオープンソースデータベースからZilliz Cloudへの移行をサポートしています。現在、pgvectorとElasticsearchからの移行がサポートされています。移行対象は、Free Planインスタンス、Serverlessインスタンス、またはDedicated Clusterです。詳細については、「[ElasticsearchからZilliz Cloudへの移行](./migrate-from-elasticsearch)」と「[Postgre SQLからZilliz Cloudに移行](./migrate-from-tencent-cloud)」を参照してください。

- Zilliz Cloud内でデータを移行し、組織内および組織間のデータ移行をサポートします。詳細については、[クラスタ間の移行](./migrate-between-clusters)を参照してください。

### バックアップ/復元/移行/ジョブRESTful API{#backuprestoremigrationjobs-restful-api}

このアップデートにより、Zilliz CloudはコントロールプレーンAPIを拡張し、バックアップ、リストア、移行、ジョブ管理をサポートする新しい機能を導入しました。

これらのRESTful APIにより、ユーザーは独自の自動化された運用ワークフローを構築し、データ管理およびメンテナンスプロセスに対するより大きな柔軟性と制御を提供できます。

[APIの詳細については、こちらをご覧ください。](/reference/restful)

### その他の機能強化{#other-enhancements}

このリリースには、一連の機能強化も含まれています。

- プロジェクトの[読み取り専用ロールのサポート](./project-users)

- クラスタとスナップショットの名前変更のサポート

