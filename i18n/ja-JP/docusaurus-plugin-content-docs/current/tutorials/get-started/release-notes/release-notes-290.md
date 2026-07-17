---
title: "リリースノート（2024年6月18日） | Cloud"
slug: /release-notes-290
sidebar_label: "2024年6月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は Milvus 2.4 を基盤とするさまざまな新機能を公開しました。これには、sparse vector のサポート、強化された multi-vector および hybrid search、より高速なクエリを実現する inverted index と fuzzy matching、そしてドキュメントレベルのリコールを実現する grouping search が含まれます。また、検索効率を向上させる Float16 および BFloat16 データ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストでトークン使用量の統計を追跡できるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 22
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年6月18日）

このリリースでは、Zilliz Cloud は Milvus 2.4 を基盤とするさまざまな新機能を公開しました。これには、sparse vector のサポート、強化された multi-vector および hybrid search、より高速なクエリを実現する inverted index と fuzzy matching、そしてドキュメントレベルのリコールを実現する grouping search が含まれます。また、検索効率を向上させる Float16 および BFloat16 データ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストでトークン使用量の統計を追跡できるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。

### Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

クラスターを BETA にアップグレードしたい場合は、アップグレード後に **Milvus 2.4.x** の機能を利用できます。

## Zilliz Cloud で利用可能な Milvus 2.4.x の新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4 は、RAG とマルチモーダルデータ検索向けに多くの高効率な機能を提供します。これらの新機能を試したい場合は、クラスターを BETA に更新できます。 

<Admonition type="info" icon="📘" title="注意">

Milvus 2.4 はまだ安定版に達していません。本番環境で Milvus 2.4 の機能を採用する際は注意してください。

</Admonition>

### Sparse Vector\{#sparse-vector}

Sparse vector は dense vector とは異なり、次元数がはるかに多い一方で、非ゼロとなる要素はごくわずかです。この機能は、用語ベースの性質により解釈しやすく、特定のドメインではより効果的である場合があります。SPLADEv2/BGE-M3 のような学習済み sparse model は、一般的な第一段階のランキングタスクで有用であることが証明されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成された sparse vector に対し、効率的な近似意味最近傍探索を可能にすることです。Zilliz Cloud は現在、sparse vector の効果的かつ高性能な保存、インデックス作成、検索（MIPS, Maximum Inner Product Search）をサポートしています。

詳細については、[Sparse Vector](./use-sparse-vector) ガイドおよび [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud クラスターの認証情報に更新してください。*

### Multi Embedding & Hybrid Search\{#multi-embedding-and-hybrid-search}

Multi-vector のサポートは、マルチモデルのデータ処理や dense vector と sparse vector の組み合わせを必要とするアプリケーションにとって基盤となる機能です。Multi-vector のサポートにより、次のことが可能になりました。

- 複数のモデルから、非構造化テキスト、画像、音声サンプル向けに生成された vector embedding を保存する。

- 各 entity に複数の vector を持つ collection に対して ANN 検索を実行する。

- 異なる embedding model に重みを割り当てて検索戦略をカスタマイズする。

- 最適なモデルの組み合わせを見つけるために、さまざまな embedding model を試す。

Multi-vector のサポートにより、FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など異なる型の複数の vector field を 1 つの collection に保存、インデックス作成し、reranking 戦略を適用できます。現在、2 つの reranking 戦略が利用可能です。**Reciprocal Rank Fusion (RRF)** と **Average Weighted Scoring** です。どちらの戦略も、異なる vector field からの検索結果を 1 つの統合結果セットにまとめます。前者は、さまざまな vector field の検索結果に一貫して現れる entity を優先し、後者は各 vector field の検索結果に重みを割り当てて最終結果セットにおける重要度を決定します。

詳細については、[Basic ANN Search](./single-vector-search) および [Hybrid Search](./hybrid-search) ガイド、ならびに [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud クラスターの認証情報に更新してください。*

### Inverted Index and Fuzzy Match\{#inverted-index-and-fuzzy-match}

Milvus の以前のリリースでは、scalar field のインデックス作成にメモリベースの二分探索インデックスおよび Marisa Trie インデックスが使用されていました。しかし、これらの手法はメモリ消費が大きいものでした。最新の Zilliz Cloud リリースでは、これらのメカニズムを最適化するために auto-index を採用しており、これはすべての数値型および文字列型データに適用できます。この新しいインデックスにより scalar query のパフォーマンスが大幅に向上し、文字列中のキーワードに対するクエリは 10 倍高速化されます。さらに、データ圧縮および内部インデックス構造の Memory-mapped storage (MMap) メカニズムにおける追加の最適化により、inverted index のメモリ消費も抑えられています。

このリリースでは、scalar filtering における fuzzy match もサポートしており、prefix、infix、suffix を使用できます。

詳細については、[Binary Vector](./use-binary-vector)、[INVERTED](./inverted-index-type)、および [Use the ](./basic-filtering-operators)[`like`](./basic-filtering-operators)[ Operator](./basic-filtering-operators) ガイド、ならびに [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) と [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud クラスターの認証情報に更新し、代わりに AUTOINDEX を使用してください。*

### Grouping Search\{#grouping-search}

検索結果を、特定の scalar field の値ごとに集約できるようになりました。これにより、RAG アプリケーションでドキュメントレベルのリコールを実装しやすくなります。たとえば、複数のドキュメントからなる collection があり、各ドキュメントが複数の passage に分割されているとします。各 passage は 1 つの vector embedding で表され、1 つのドキュメントに属しています。分散した passage ではなく、最も関連性の高いドキュメントを見つけるには、**search()** 操作に **group_by_field** 引数を含めて、結果をドキュメント ID ごとにグループ化できます。

詳細については、[Grouping Search](./grouping-search) ガイドおよび [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud クラスターの認証情報に更新してください。*

### Float16 and BFloat- Vector DataType\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16 や BFloat- のような半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させ、メモリ使用量を削減できる一方で、精度が低下するというトレードオフがあります。このリリースにより、Zilliz Cloud は vector field に対してこれらのデータ型をサポートするようになりました。

詳細については、[Dense Vector](./use-dense-vector) および [float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) と [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) のサンプルコードを参照してください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud クラスターの認証情報に更新してください。*

### Refined MilvusClient Interfaces\{#refined-milvusclient-interfaces}

MilvusClient は、ORM モジュールに代わる使いやすい選択肢です。サーバーとのやり取りを簡素化するために、完全に関数型のアプローチを採用しています。接続プールを維持する代わりに、各 MilvusClient はサーバーへの gRPC 接続を確立します。MilvusClient モジュールは、ORM モジュールの機能の大半を実装しています。MilvusClient モジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus) および [reference documents](/reference/python) をご覧ください。

## Pipelines\{#pipelines}

Zilliz Cloud では、pipeline リクエストのトークン使用量を監視できるようになり、詳細は請求書ページおよび各 API レスポンス内で確認できます。ただし、この機能が一般提供されるまでは課金されません。

画像 embedding model は、より幅広い要件に対応するため、従来の `clip-vit-base-patch16` から `clip-vit-base-patch32` にアップグレードされました。さらに、多言語テキスト embedding のサポートも近日中に実装される予定です。

### Enhancements\{#enhancements}

このリリースには、一連の機能強化も含まれています。

- Dedicated cluster をセルフサービス方式で 256 CU までスケールできるようになりました。さらに大規模な cluster が必要な場合は、お問い合わせいただくこともできます。

