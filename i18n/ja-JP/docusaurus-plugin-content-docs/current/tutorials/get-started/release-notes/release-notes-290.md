---
title: "リリースノート（2024年6月18日） | Cloud"
slug: /release-notes-290
sidebar_label: "2024年6月18日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud は Milvus 2.4 を基盤とするさまざまな新機能を公開しました。これには、sparse vector のサポート、強化された multi-vector および hybrid search、高速なクエリを実現する inverted index と fuzzy matching、さらにドキュメントレベルの再現率向上のための grouping search が含まれます。また、検索効率を改善するために Float16 と BFloat16 のデータ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストでトークン使用量の統計を追跡できるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。 | Cloud"
type: origin
token: GanXwLnJkiymKVkNPhecdi9MnGf
sidebar_position: 1
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2024年6月18日）

このリリースでは、Zilliz Cloud は Milvus 2.4 を基盤とするさまざまな新機能を公開しました。これには、sparse vector のサポート、強化された multi-vector および hybrid search、高速なクエリを実現する inverted index と fuzzy matching、さらにドキュメントレベルの再現率向上のための grouping search が含まれます。また、検索効率を改善するために Float16 と BFloat16 のデータ型も導入されています。さらに、Pipelines 機能では、すべてのデータ取り込みおよび検索リクエストでトークン使用量の統計を追跡できるようになり、パフォーマンス監視が効率化されました。詳細な統計は請求書ページで確認できます。

### Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.3.x** と互換性があります。

クラスターを BETA にアップグレードしたい場合は、アップグレード後に **Milvus 2.4.x** の機能を利用できます。

## Zilliz Cloud で利用可能な Milvus 2.4.x の新機能\{#milvus-24x-new-features-available-on-zilliz-cloud}

Milvus 2.4 は、RAG とマルチモーダルデータ検索のための多くの効率的な機能を提供します。これらの新機能を試したい場合は、クラスターを BETA に更新できます。 

<Admonition type="info" icon="📘" title="注意">

Milvus 2.4 はまだ安定版に達していません。本番環境で Milvus 2.4 の機能を採用する際は注意してください。

</Admonition>

### Sparse Vector\{#sparse-vector}

sparse vector は dense vector とは異なり、次元数が数桁多い一方で、非ゼロの値を持つ次元はごくわずかである傾向があります。この機能は、その用語ベースの性質により解釈しやすく、特定の分野ではより効果的な場合があります。SPLADEv2/BGE-M3 のような学習済み sparse モデルは、一般的な第1段階のランキングタスクで有用であることが証明されています。この新機能の主なユースケースは、SPLADEv2/BGE-M3 のようなニューラルモデルや BM25 アルゴリズムのような統計モデルによって生成された sparse vector に対して、効率的な近似セマンティック最近傍探索を可能にすることです。Zilliz Cloud は現在、sparse vector の効果的かつ高性能な保存、index 作成、検索（MIPS, Maximum Inner Product Search）をサポートしています。

詳細については、[Sparse Vector](./use-sparse-vector) ガイドと [hello_sparse.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hello_sparse.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud cluster の認証情報に更新してください。*

### Multi Embedding & Hybrid Search\{#multi-embedding-and-hybrid-search}

multi-vector のサポートは、複数モデルのデータ処理や dense vector と sparse vector の混在を必要とするアプリケーションの中核となる機能です。multi-vector のサポートにより、以下が可能になります。

- 複数のモデルから生成された、非構造化テキスト、画像、または音声サンプルの vector embedding を保存する。

- 各 entity に複数の vector を持つ collection に対して ANN 検索を実行する。

- 異なる embedding モデルに重みを割り当てて検索戦略をカスタマイズする。

- 最適なモデルの組み合わせを見つけるために、さまざまな embedding モデルを試す。

multi-vector のサポートにより、FLOAT_VECTOR や SPARSE_FLOAT_VECTOR など、異なる型の複数の vector field を collection に保存、index 作成し、reranking 戦略を適用できます。現在、利用可能な reranking 戦略は **Reciprocal Rank Fusion (RRF)** と **Average Weighted Scoring** の2つです。どちらの戦略も、異なる vector field からの検索結果を1つの結果セットに統合します。前者は、さまざまな vector field の検索結果に一貫して現れる entity を優先し、後者は各 vector field の検索結果に重みを割り当てて、最終的な結果セットにおける重要度を決定します。

詳細については、[Basic ANN Search](./single-vector-search) および [Hybrid Search](./hybrid-search) ガイド、ならびに [hybrid_search.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/hybrid_search.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud cluster の認証情報に更新してください。*

### Inverted Index and Fuzzy Match\{#inverted-index-and-fuzzy-match}

以前の Milvus リリースでは、scalar field の index 作成にメモリベースの binary search index と Marisa Trie index が使用されていました。しかし、これらの方法はメモリ消費が大きいものでした。Zilliz Cloud の最新リリースでは、これらの仕組みを最適化するために auto-index を採用しており、これはすべての数値型および文字列型データに適用できます。この新しい index は scalar クエリの性能を大幅に向上させ、文字列内のキーワード検索を10倍高速化します。さらに、データ圧縮の追加最適化と内部 index 構造の Memory-mapped storage (MMap) メカニズムにより、inverted index はより少ないメモリを消費します。

このリリースでは、scalar filtering におけるプレフィックス、中間一致、サフィックスを使用した fuzzy match もサポートしています。

詳細については、[Binary Vector](./use-binary-vector)、[INVERTED](./inverted-index-type)、および [Use the ](./basic-filtering-operators)[`like`](./basic-filtering-operators)[ Operator](./basic-filtering-operators) ガイド、ならびに [inverted_index_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/inverted_index_example.py) と [fuzzy_match.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/fuzzy_match.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud cluster の認証情報に更新し、代わりに AUTOINDEX を使用してください。*

### Grouping Search\{#grouping-search}

特定の scalar field 内の値によって検索結果を集約できるようになりました。これは、RAG アプリケーションがドキュメントレベルの再現率を実装するのに役立ちます。各ドキュメントが複数の passage に分割された document collection を考えてみましょう。各 passage は1つの vector embedding で表現され、1つのドキュメントに属します。passage が分散するのではなく、最も関連性の高いドキュメントを見つけるには、**search()** 操作に **group_by_field** 引数を含めて、ドキュメント ID ごとに結果をグループ化できます。

詳細については、[Grouping Search](./grouping-search) ガイドと [example_group_by.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/example_group_by.py) のサンプルコードをご覧ください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud cluster の認証情報に更新してください。*

### Float16 and BFloat- Vector DataType\{#float16-and-bfloat-vector-datatype}

機械学習やニューラルネットワークでは、Float16 や BFloat- のような半精度データ型がよく使用されます。これらのデータ型はクエリ効率を向上させ、メモリ使用量を削減できますが、その代償として精度が低下するというトレードオフがあります。このリリースにより、Zilliz Cloud は vector field に対してこれらのデータ型をサポートするようになりました。

詳細については、[Dense Vector](./use-dense-vector) と、[float16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/float16_example.py) および [bfloat16_example.py](https://github.com/milvus-io/pymilvus/blob/2.4/examples/datatypes/bfloat16_example.py) のサンプルコードを参照してください。*サンプルコード内の接続情報は、必ずお使いの Zilliz Cloud cluster の認証情報に更新してください。*

### 改良された MilvusClient インターフェース\{#refined-milvusclient-interfaces}

MilvusClient は、ORM モジュールの使いやすい代替手段です。サーバーとのやり取りを簡素化するために、純粋な関数型アプローチを採用しています。接続プールを維持する代わりに、各 MilvusClient はサーバーへの gRPC 接続を確立します。MilvusClient モジュールは、ORM モジュールの機能の大部分を実装しています。MilvusClient モジュールの詳細については、[pymilvus](https://github.com/milvus-io/pymilvus) および [reference documents](/reference/python) をご覧ください。

## Pipelines\{#pipelines}

Zilliz Cloud は現在、pipeline リクエストに対するトークン使用量を監視しており、その詳細は請求書ページおよび各 API レスポンス内で確認できます。ただし、この機能が一般提供されるまでは課金されません。

画像 embedding モデルは、より幅広い要件に対応するため、従来の `clip-vit-base-patch16` から `clip-vit-base-patch32` にアップグレードされました。さらに、多言語テキスト embedding のサポートも近日中に実装される予定です。

### 改善点\{#enhancements}

このリリースには、次のような一連の改善も含まれています。

- dedicated cluster をセルフサービスで 256 CU までスケールできるようになりました。さらに大規模な cluster が必要な場合は、お問い合わせいただくこともできます。

