---
title: "リリースノート（2024年6月18日） | Cloud"
slug: /release-notes-290
sidebar_label: "2024年6月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud が Milvus 2.4 に支えられた多数の新機能を公開しました。これには、sparse vector のサポート、強化された multi-vector と hybrid search、高速なクエリのための inverted index と fuzzy matching、そしてドキュメントレベルのリコールのための grouping search が含まれます。また、検索効率を向上させるために Float16 と BFloat16 のデータ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストで token 使用統計を追跡できるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 22
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年6月18日）

このリリースでは、Zilliz Cloud が Milvus 2.4 に支えられた多数の新機能を公開しました。これには、sparse vector のサポート、強化された multi-vector と hybrid search、高速なクエリのための inverted index と fuzzy matching、そしてドキュメントレベルのリコールのための grouping search が含まれます。また、検索効率を向上させるために Float16 と BFloat16 のデータ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストで token 使用統計を追跡できるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

cluster を BETA にアップグレードしたい場合、アップグレード後に **Milvus 2.4.x** の機能を利用できます。

## Zilliz Cloud で利用可能な Milvus 2.4.x の新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4 は、RAG とマルチモーダルデータ検索のための多くの効率的な機能を提供します。これらの新機能を試したい場合は、cluster を BETA に更新できます。 

<Admonition type="info" icon="📘" title="注意">

Milvus 2.4 はまだ安定版に達していません。本番環境で Milvus 2.4 の機能を採用する際は注意してください。

</Admonition>

### Sparse Vector\{#sparse-vector}

sparse vector は dense vector と異なり、次元数が桁違いに多い一方で、非ゼロの値を持つ次元はわずかです。この機能は、用語ベースの性質により解釈性が高く、特定のドメインではより効果的である場合があります。SPLADEv2/BGE-M3 などの学習済み sparse model は、一般的な第1段階ランキングタスクに有用であることが証明されています。この新機能の主な用途は、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成された sparse vector に対して、効率的な近似セマンティック最近傍検索を可能にすることです。Zilliz Cloud は現在、sparse vector の効果的かつ高性能な保存、index 作成、および検索（MIPS, Maximum Inner Product Search）をサポートしています。

詳細については、[Sparse Vector](./use-sparse-vector) ガイドと [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud cluster の認証情報に更新してください。*

### Multi Embedding & Hybrid Search\{#multi-embedding-and-hybrid-search}

multi-vector のサポートは、マルチモデルデータ処理や dense vector と sparse vector の混在を必要とするアプリケーションの基盤です。multi-vector サポートにより、次のことが可能になりました。

- 複数のモデルから生成された、非構造化テキスト、画像、または音声サンプルの vector embedding を保存する。

- 各 entity に複数の vector を持つ collection に対して ANN 検索を実行する。

- 異なる embedding model に重みを割り当てて検索戦略をカスタマイズする。

- 最適な model の組み合わせを見つけるために、さまざまな embedding model を試す。

multi-vector サポートにより、FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など、異なる型の複数の vector field を 1 つの collection に保存、index 作成し、reranking 戦略を適用できます。現在、2 つの reranking 戦略が利用可能です: **Reciprocal Rank Fusion (RRF)** と **Average Weighted Scoring**。どちらの戦略も、異なる vector field からの検索結果を 1 つの統合結果セットにまとめます。前者の戦略では、さまざまな vector field の検索結果に一貫して現れる entity が優先され、後者の戦略では、各 vector field からの検索結果に重みを割り当てて、最終結果セットにおける重要度を決定します。

詳細については、[Basic ANN Search](./single-vector-search) および [Hybrid Search](./hybrid-search) ガイドと、[hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud cluster の認証情報に更新してください。*

### Inverted Index と Fuzzy Match\{#inverted-index-and-fuzzy-match}

以前の Milvus リリースでは、scalar field の index 作成にメモリベースの二分探索 index と Marisa Trie index が使用されていました。しかし、これらの方法はメモリ消費が大きいものでした。Zilliz Cloud の最新リリースでは、これらの仕組みを最適化するために auto-index を採用しており、これはすべての数値型および文字列型のデータに適用できます。この新しい index により scalar クエリのパフォーマンスが大幅に向上し、文字列内のキーワードに対するクエリは 10 倍高速化されます。さらに、データ圧縮と内部 index 構造の Memory-mapped storage（MMap）メカニズムの追加最適化により、inverted index のメモリ消費も少なくなっています。

このリリースでは、接頭辞、部分一致、接尾辞を使用した scalar filtering における fuzzy match もサポートしています。

詳細については、[Binary Vector](./use-binary-vector)、[INVERTED](./inverted-index-type)、[Use the ](./basic-filtering-operators)[`like`](./basic-filtering-operators)[ Operator](./basic-filtering-operators) ガイド、および [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) と [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud cluster の認証情報に更新し、代わりに AUTOINDEX を使用してください。*

### Grouping Search\{#grouping-search}

特定の scalar field の値によって検索結果を集約できるようになりました。これにより、RAG アプリケーションでドキュメントレベルのリコールを実装しやすくなります。複数のドキュメントからなる collection を考えてみましょう。各ドキュメントはさまざまな passage に分割されます。各 passage は 1 つの vector embedding で表現され、1 つのドキュメントに属します。passage が分散するのではなく、最も関連性の高いドキュメントを見つけるには、**search()** 操作で **group_by_field** 引数を含めて、ドキュメント ID ごとに結果をグループ化できます。

詳細については、[Grouping Search](./grouping-search) ガイドと [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud cluster の認証情報に更新してください。*

### Float16 と BFloat- Vector DataType\{#float16-and-bfloat-vector-datatype}

機械学習とニューラルネットワークでは、Float16 や BFloat- などの半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させ、メモリ使用量を削減できる一方で、精度が低下するというトレードオフがあります。このリリースにより、Zilliz Cloud は vector field に対してこれらのデータ型をサポートするようになりました。

詳細については、[Dense Vector](./use-dense-vector) と、[float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) および [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) のサンプルコードを参照してください。*サンプルコード内の接続情報は、必ずご利用の Zilliz Cloud cluster の認証情報に更新してください。*

### 洗練された MilvusClient インターフェース\{#refined-milvusclient-interfaces}

MilvusClient は、ORM モジュールの使いやすい代替手段です。サーバーとのやり取りを簡素化するために、純粋な関数型アプローチを採用しています。接続プールを維持する代わりに、各 MilvusClient はサーバーへの gRPC 接続を確立します。MilvusClient モジュールは、ORM モジュールの機能の大部分を実装しています。MilvusClient モジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus) と [リファレンスドキュメント](/reference/python) をご覧ください。

## Pipelines\{#pipelines}

Zilliz Cloud は現在、pipeline リクエストの token 使用量を監視しており、その詳細は請求書ページおよび各 API レスポンス内で確認できます。ただし、この機能が一般提供されるまでは課金されません。

画像 embedding model は、より幅広い要件に対応するため、以前の `clip-vit-base-patch16` から `clip-vit-base-patch32` にアップグレードされました。さらに、多言語テキスト embedding のサポートも近日中に実装予定です。

### 機能強化\{#enhancements}

このリリースには、以下の一連の機能強化も含まれています。

- dedicated cluster をセルフサービス方式で 256 CU までスケールできるようになりました。さらに大規模な cluster が必要な場合は、お問い合わせください。

