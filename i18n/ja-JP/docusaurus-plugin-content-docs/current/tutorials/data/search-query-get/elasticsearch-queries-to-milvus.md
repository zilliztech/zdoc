---
title: "Elasticsearch クエリから Milvus へ | Cloud"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus へ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Elasticsearch は Apache Lucene をベースに構築された主要なオープンソース検索エンジンです。しかし、モダンな AI アプリケーションでは、更新コストの高さ、リアルタイム性能の低さ、非効率的なシャード管理、クラウドネイティブでない設計、過剰なリソース要求などの課題に直面しています。クラウドネイティブなベクトルデータベースとして、Milvus はストレージとコンピューティングの分離、高次元データの効率的なインデックス作成、モダンインフラとのシームレスな統合によりこれらの問題を克服します。AIワークロードへの優れた性能とスケーラビリティを提供します。| Cloud"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 12
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - elasticsearchクエリ
  - クエリマッピング
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化

---

import Admonition from '@theme/Admonition';


# Elasticsearch クエリから Milvus へ

Elasticsearch は Apache Lucene をベースに構築された主要なオープンソース検索エンジンです。しかし、モダンな AI アプリケーションでは、更新コストの高さ、リアルタイム性能の低さ、非効率的なシャード管理、クラウドネイティブでない設計、過剰なリソース要求などの課題に直面しています。クラウドネイティブなベクトルデータベースとして、Milvus はストレージとコンピューティングの分離、高次元データの効率的なインデックス作成、モダンインフラとのシームレスな統合によりこれらの問題を克服します。AIワークロードへの優れた性能とスケーラビリティを提供します。

この記事は、コードベースをElasticsearchからMilvusへ移行する手助けをし、クエリ変換の様々な例を提供することを目的としています。

## 概要\{#overview}

Elasticsearchでは、クエリコンテキスト内の操作は関連度スコアを生成するのに対し、フィルタコンテキスト内の操作は関連度スコアを生成しません。同様に、Milvusの検索は類似度スコアを生成し、フィルタのようなクエリは関連度スコアを生成しません。コードベースをElasticsearchからMilvusへ移行する際の主な原則は、Elasticsearchのクエリコンテキストで使用されるフィールドをベクトルフィールドに変換し、類似度スコア生成を可能にすることです。

以下の表には、いくつかのElasticsearchクエリパターンとそれに対応するMilvusの同等機能を示しています。

<table>
   <tr>
     <th><p>Elasticsearch クエリ</p></th>
     <th><p>Milvus 対応機能</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>全文検索クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match クエリ</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>両方とも類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>語句レベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>Elasticsearchのこれらのクエリがフィルタコンテキストで使用される場合、両方とも同じまたは類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">Prefix クエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Range クエリ</a></p></td>
     <td><p><code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">Term クエリ</a></p></td>
     <td><p><code>==</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">Terms クエリ</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">Wildcard クエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">Boolean クエリ</a></p></td>
     <td><p><code>AND</code> などの論理演算子</p></td>
     <td><p>フィルタコンテキストで使用される場合、両方とも類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクタクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN クエリ</a></p></td>
     <td><p>検索</p></td>
     <td><p>Milvus はより高度なベクトル検索機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>ハイブリッド検索</p></td>
     <td><p>Milvus は複数のリランキング戦略をサポートします。</p></td>
   </tr>
</table>

## 全文検索クエリ\{#full-text-queries}

Elasticsearchでは、全文検索クエリを使用すると、電子メールの本文などの解析済みテキストフィールドを検索できます。クエリ文字列は、インデックス作成時のフィールドに適用されたのと同じアナライザーを使用して処理されます。

### Match クエリ\{#match-query}

Elasticsearchでは、matchクエリは提供されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。提供されたテキストは一致前に解析されます。

以下は、matchクエリを使用したElasticsearch検索リクエストの例です。

```bash
resp = client.search(
    query={
        "match": {
            "message": {
                "query": "this is a test"
            }
        }
    },
)

```

Milvusは、全文検索機能を通じて同じ機能を提供します。上記のElasticsearchクエリをMilvusに次のように変換できます：

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse`は`message`という名前のVarCharフィールドから派生したスパースベクトルフィールドです。MilvusはBM25埋め込みモデルを使用して`message`フィールドの値をスパースベクトル埋め込みに変換し、それを`message_sparse`フィールドに保存します。検索リクエストを受け取ると、Milvusは同じBM25モデルを使用してプレーンテキストクエリペイロードを埋め込み、スパースベクトル検索を実行し、`output_fields`パラメータで指定された`id`と`message`フィールドと対応する類似度スコアを返します。

この機能を使用するには、`message`フィールドでアナライザーを有効にし、`message_sparse`フィールドをそこから派生させる関数を定義する必要があります。Milvusでアナライザーを有効にする方法と派生関数を作成する手順の詳細については、[全文検索](./full-text-search)を参照してください。

## 語句レベルクエリ\{#term-level-queries}

Elasticsearchでは、語句レベルクエリは日付範囲、IPアドレス、価格、または製品IDなどの構造化データ内の正確な値に基づいてドキュメントを見つけるために使用されます。このセクションでは、Elasticsearchのいくつかの語句レベルクエリのMilvusにおける可能なかなりの等価機能について説明します。このセクションのすべての例は、Milvusの機能と一致するようにフィルタコンテキストで動作するように調整されています。

### IDs\{#ids}

Elasticsearchでは、以下のようにフィルタコンテキストでIDに基づいてドキュメントを見つけることができます：

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "ids": {
                    "values": [
                        "1",
                        "4",
                        "100"
                    ]
                }
            }
        }
    },
)
```

Milvusでは、以下のようにIDに基づいてエンティティを見つけることもできます：

```python
# filterパラメータを使用
res = client.query(
    collection_name="my_collection",
    filter="id in [1, 4, 100]",
    output_fields=["id", "title"]
)

# idsパラメータを使用
res = client.query(
    collection_name="my_collection",
    ids=[1, 4, 100],
    output_fields=["id", "title"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html)で見つけることができます。Milvusのクエリおよび取得リクエスト、およびフィルター式の詳細については、[クエリ](./get-and-scalar-query)および[フィルタリング](./filtering)を参照してください。

### Prefix クエリ\{#prefix-query}

Elasticsearchでは、以下のようにフィルタコンテキストで提供されたフィールドに特定のプレフィックスを含むドキュメントを見つけることができます：

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                 "prefix": {
                    "user": {
                        "value": "ki"
                    }
                }
            }
        }
    },
)

```

Milvusでは、次のように指定したプレフィックスで始まる値を持つエンティティを見つけることができます：

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html)で見つけることができます。Milvusの`like`演算子の詳細については、[パターンマッチングに ](./basic-filtering-operators#example-2-using-like-for-pattern-matching)[`LIKE`](./basic-filtering-operators#example-2-using-like-for-pattern-matching)[ を使用する](./basic-filtering-operators#example-2-using-like-for-pattern-matching)を参照してください。

### Range クエリ\{#range-query}

Elasticsearchでは、以下のように提供された範囲内の語句を含むドキュメントを見つけることができます：

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "range": {
                    "age": {
                        "gte": 10,
                        "lte": 20
                    }
                }
            }
        }
    },
)

```

Milvusでは、特定のフィールド内の値が提供された範囲内にあるエンティティを見つけることができます：

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)で見つけることができます。Milvusの比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators)を参照してください。

### Term クエリ\{#term-query}

Elasticsearchでは、以下のように提供されたフィールドに**正確な**語句を含むドキュメントを見つけることができます：

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "term": {
                    "status": {
                        "value": "retired"
                    }
                }
            }
        }
    },
)

```

Milvusでは、指定されたフィールドの値が正確に指定された語句であるエンティティを見つけることができます：

```python
# == を使用
res = client.query(
    collection_name="my_collection",
    filter='status=="retired"',
    output_fields=["id", "user", "status"]
)

# TEXT_MATCH を使用
res = client.query(
    collection_name="my_collection",
    filter='TEXT_MATCH(status, "retired")',
    output_fields=["id", "user", "status"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html)で見つけることができます。Milvusの比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators)を参照してください。

### Terms クエリ\{#terms-query}

Elasticsearchでは、以下のように提供されたフィールドに1つ以上の**正確な**語句を含むドキュメントを見つけることができます：

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "terms": {
                    "degree": [
                        "graduate",
                        "post-graduate"
                    ]
                }
            }
        }
    }
)

```

Milvusにはこれと完全に同等の機能は存在しません。ただし、指定されたフィールドの値が指定された語句のいずれかであるエンティティを見つけることができます：

```python
# in を使用
res = client.query(
    collection_name="my_collection",
    filter='degree in ["graduate", "post-graduate"]',
    output_fields=["id", "user", "degree"]
)

# TEXT_MATCH を使用
res = client.query(
    collection_name="my_collection",
    filter='TEXT_MATCH(degree, "graduate post-graduate")',
    output_fields=["id", "user", "degree"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html)で見つけることができます。Milvusの範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators#range-operators)を参照してください。

### Wildcard クエリ\{#wildcard-query}

Elasticsearchでは、以下のようにワイルドカードパターンに一致する語句を含むドキュメントを見つけることができます：

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "wildcard": {
                    "user": {
                        "value": "ki*y"
                    }
                }
            }
        }
    },
)

```

Milvusではフィルタリング条件でのワイルドカードをサポートしていません。ただし、`like`演算子を使用して次のように同様の効果を得ることができます：

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html)で見つけることができます。Milvusの範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators#range-operators)を参照してください。

## Boolean クエリ\{#boolean-query}

Elasticsearchでは、booleanクエリは他のクエリのブール結合に一致するドキュメントを一致させるクエリです。

以下の例は、[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)のElasticsearchドキュメントの例から調整されています。このクエリは、名前に`kimchy`が含まれており、`production`タグを持つユーザーを返します。

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "term": {
                    "user": "kimchy"
                }
            },
            "filter": {
                "term": {
                    "tags": "production"
                }
            }
        }
    },
)

```

Milvusでは、次のように同様のことを行うことができます：

```python
filter =

res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

上記の例では、対象のコレクションに**VarChar**型の`user`フィールドと**Array**型の`tags`フィールドがあると仮定しています。このクエリは、名前に`kimchy`が含まれており、`production`タグを持つユーザーを返します。

## ベクタクエリ\{#vector-queries}

Elasticsearchでは、ベクタクエリはベクトルフィールド上で動作し、効率的に意味検索を実行するための専門的なクエリです。

### Knn クエリ\{#knn-query}

Elasticsearchは、近似kNNクエリと正確なブルートフォースkNNクエリの両方をサポートしています。以下のように、類似度メトリックで測定されたクエリベクトルに最も近い*k*個のベクトルをいずれかの方法で見つけることができます：

```python
resp = client.search(
    index="my-image-index",
    size=3,
    query={
        "knn": {
            "field": "image-vector",
            "query_vector": [
                -5,
                9,
                -12
            ],
            "k": 10
        }
    },
)

```

Milvusは専門的なベクトルデータベースとして、インデックスタイプを使用してベクトル検索を最適化します。通常、高次元ベクトルデータでは近似最近傍（ANN）検索を優先します。FLATインデックスタイプを使用したブルートフォースkNN検索は正確な結果を提供しますが、時間がかかり、リソースを消費します。対照的に、AUTOINDEXや他のインデックスタイプを使用したANN検索は速度と正確さのバランスを取り、kNNよりはるかに高速でリソース効率的なパフォーマンスを提供します。インデックスタイプとAUTOINDEXの詳細については、[インデックスの管理](./manage-indexes)および[AUTOINDEXの説明](./autoindex-explained)を参照してください。

上記のベクタクエリと同等のMilvusでの例：

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector"
    data=[[-5, 9, -12]],
    limit=10
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html)で見つけることができます。MilvusのANN検索の詳細については、[基本ANN検索](./single-vector-search)を参照してください。

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearchでは、Reciprocal Rank Fusion (RRF)を使用して、異なる関連性インジケーターを持つ複数の結果セットを単一のランク付き結果セットに結合できます。

以下の例は、従来の語句ベース検索とk最近傍（kNN）ベクトル検索を組み合わせて検索関連性を改善する方法を示しています：

```python
client.search(
    index="my_index",
    size=10,
    query={
        "retriever": {
            "rrf": {
                "retrievers": [
                    {
                        "standard": {
                            "query": {
                                "term": {
                                    "text": "shoes"
                                }
                            }
                        }
                    },
                    {
                        "knn": {
                            "field": "vector",
                            "query_vector": [1.25, 2, 3.5],  # 例のベクトルです。実際のクエリベクトルに置き換えてください
                            "k": 50,
                            "num_candidates": 100
                        }
                    }
                ],
                "rank_window_size": 50,
                "rank_constant": 20
            }
        }
    }
)
```

この例では、RRFは2つの取得機能の結果を結合します：

- `text`フィールドに語句`"shoes"`を含むドキュメントの標準語句ベース検索。

- 与えられたクエリベクトルを使用した`vector`フィールドのkNN検索。

各取得機能は最大50位までの一致を提供し、RRFによって再ランク付けされ、最終的な上位10件の結果が返されます。

Milvusでは、複数のベクトルフィールド間で検索を組み合わせ、リランキング戦略を適用し、結合されたリストから上位K件の結果を取得することで、類似したハイブリッド検索を実現できます。MilvusはRRFと加重リランキング戦略の両方をサポートしています。詳細については、[リランキング](./reranking)を参照してください。

以下は、上記のElasticsearch例のMilvusでの非厳密な同等機能です。

```python
search_params_dense = {
    "data": [[1.25, 2, 3.5]],
    "anns_field": "vector",
    "param": {
        "metric_type": "IP",

    },
    "limit": 100
}

req_dense = ANNSearchRequest(**search_params_dense)

search_params_sparse = {
    "data": ["shoes"],
    "anns_field": "text_sparse",
    "param": {
        "metric_type": "BM25",
        "params": {"drop_ratio_search": 0.2}
    }
}

req_sparse = ANNSearchRequest(**search_params_sparse)

res = client.hybrid_search(
    collection_name="my_collection",
    reqs=[req_dense, req_sparse],
    reranker=RRFRanker(),
    limit=10
)
```

この例では、Milvusのハイブリッド検索が以下を組み合わせていることを示しています：

1. **密ベクトル検索**：内積（IP）メトリックを使用した近似最近傍（ANN）検索を`vector`フィールド上で実行。
2. **スパースベクトル検索**：BM25類似度メトリックと`drop_ratio_search`パラメータ0.2を使用して`text_sparse`フィールド上で実行。

これらの検索から得られた結果は個別に実行され、結合され、相互ランク融合（RRF）ランカーを使用して再ランク付けされます。ハイブリッド検索は再ランク付けされたリストから上位10個のエンティティを返します。

標準テキストベースクエリとkNN検索の結果を結合するElasticsearchのRRFランク付けとは異なり、Milvusはスパースベクトル検索と密ベクトル検索の結果を結合し、マルチモーダルデータに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、語句レベルクエリ、ブールクエリ、全文検索クエリ、およびベクトルクエリを含む一般的なElasticsearchクエリをMilvusの同等機能に変換する方法を説明しました。他のElasticsearchクエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。