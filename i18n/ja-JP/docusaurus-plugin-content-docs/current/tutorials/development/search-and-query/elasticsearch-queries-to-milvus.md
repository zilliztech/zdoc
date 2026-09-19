---
title: "Elasticsearch クエリから Milvus へ | Cloud"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus へ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、現代の AI アプリケーションでは、更新コストの高さ、リアルタイム性能の低さ、非効率なシャード管理、クラウドネイティブでない設計、過剰なリソース要求といった課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的なインデックス作成、最新のインフラストラクチャとのシームレスな統合によって、これらの問題を克服します。AI ワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。 | Cloud"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Elasticsearch クエリから Milvus へ

Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、現代の AI アプリケーションでは、更新コストの高さ、リアルタイム性能の低さ、非効率なシャード管理、クラウドネイティブでない設計、過剰なリソース要求といった課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的なインデックス作成、最新のインフラストラクチャとのシームレスな統合によって、これらの問題を克服します。AI ワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。

この記事は、Elasticsearch から Milvus へのコードベースの移行を容易にすることを目的としており、両者の間でクエリを変換するさまざまな例を紹介します。

## 概要\{#overview}

Elasticsearch では、クエリコンテキストでの操作は関連度スコアを生成しますが、フィルターコンテキストでの操作は生成しません。同様に、Milvus の検索は類似度スコアを生成しますが、フィルターに似たクエリは生成しません。Elasticsearch から Milvus へコードベースを移行する際の重要な原則は、Elasticsearch のクエリコンテキストで使用されるフィールドをベクトルフィールドに変換し、類似度スコアを生成できるようにすることです。

以下の表は、いくつかの Elasticsearch クエリパターンと、それに対応する Milvus での等価表現の概要を示しています。

<table>
   <tr>
     <th><p>Elasticsearch クエリ</p></th>
     <th><p>Milvus での等価表現</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>全文検索クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match query</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Term-level クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらの Elasticsearch クエリがフィルターコンテキストで使用される場合、どちらも同じまたは類似の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">Prefix query</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Range query</a></p></td>
     <td><p><code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">Term query</a></p></td>
     <td><p><code>==</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">Terms query</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">Wildcard query</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">Boolean query</a></p></td>
     <td><p><code>AND</code> などの論理演算子</p></td>
     <td><p>フィルターコンテキストで使用される場合、どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクトルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN query</a></p></td>
     <td><p>Search</p></td>
     <td><p>Milvus はより高度なベクトル検索機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>Hybrid Search</p></td>
     <td><p>Milvus は複数の再ランキング戦略をサポートしています。</p></td>
   </tr>
</table>

## 全文検索クエリ\{#full-text-queries}

Elasticsearch では、full text queries を使用すると、メール本文のような分析済みテキストフィールドを検索できます。クエリ文字列は、インデックス作成時にそのフィールドに適用されたのと同じアナライザーを使用して処理されます。

### Match query\{#match-query}

Elasticsearch では、match query は、指定されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。指定されたテキストは、照合の前に分析されます。

以下は、match query を使用した Elasticsearch の検索リクエストの例です。

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

Milvus は、full-text search 機能を通じて同じ機能を提供します。上記の Elasticsearch クエリは、次のように Milvus に変換できます。

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse` は `message` という名前の VarChar フィールドから派生したスパースベクトルフィールドです。Milvus は BM25 埋め込みモデルを使用して `message` フィールドの値をスパースベクトル埋め込みに変換し、それらを `message_sparse` フィールドに格納します。検索リクエストを受け取ると、Milvus は同じ BM25 モデルを使用してプレーンテキストのクエリペイロードを埋め込み、スパースベクトル検索を実行して、対応する類似度スコアとともに `output_fields` パラメーターで指定された `id` フィールドと `message` フィールドを返します。

この機能を使用するには、`message` フィールドでアナライザーを有効にし、そこから `message_sparse` フィールドを導出する関数を定義する必要があります。Milvus でアナライザーを有効にして派生関数を作成する詳細な手順については、[Full Text Search](./full-text-search) を参照してください。

## Term-level クエリ\{#term-level-queries}

Elasticsearch では、term-level queries は、日付範囲、IP アドレス、価格、商品 ID など、構造化データ内の正確な値に基づいてドキュメントを検索するために使用されます。このセクションでは、いくつかの Elasticsearch term-level queries に対応する Milvus での等価表現の候補を紹介します。このセクションのすべての例は、Milvus の機能に合わせてフィルターコンテキスト内で動作するように調整されています。

### IDs\{#ids}

Elasticsearch では、フィルターコンテキストで ID に基づいて次のようにドキュメントを検索できます。

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

Milvus でも、次のように ID に基づいてエンティティを検索できます。

```python
# Use the filter parameter
res = client.query(
    collection_name="my_collection",
    filter="id in [1, 4, 100]",
    output_fields=["id", "title"]
)

# Use the ids parameter
res = client.query(
    collection_name="my_collection",
    ids=[1, 4, 100],
    output_fields=["id", "title"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html) にあります。Milvus の query リクエストと get リクエスト、およびフィルター式の詳細については、[Query](./get-and-scalar-query) と [Filtering Explained](./filtering-overview) を参照してください。

### Prefix query\{#prefix-query}

Elasticsearch では、フィルターコンテキストで、指定したフィールドに特定のプレフィックスを含むドキュメントを次のように検索できます。

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

Milvus では、値が指定されたプレフィックスで始まるエンティティを次のように検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html) にあります。Milvus の `like` 演算子の詳細については、[Using ](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ for Pattern Matching](./basic-filtering-operators) を参照してください。

### Range query\{#range-query}

Elasticsearch では、指定された範囲内の term を含むドキュメントを次のように検索できます。

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

Milvus では、特定のフィールドの値が指定された範囲内にあるエンティティを次のように検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html) にあります。Milvus の比較演算子の詳細については、[Comparison operators](./basic-filtering-operators#comparison-operators) を参照してください。

### Term query\{#term-query}

Elasticsearch では、指定したフィールドに **完全一致** する term を含むドキュメントを次のように検索できます。

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

Milvus では、指定したフィールドの値が指定された term と完全に一致するエンティティを次のように検索できます。

```python
# use ==
res = client.query(
    collection_name="my_collection",
    filter='status=="retired"',
    output_fields=["id", "user", "status"]
)

# use TEXT_MATCH
res = client.query(
    collection_name="my_collection",
    filter='TEXT_MATCH(status, "retired")',
    output_fields=["id", "user", "status"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html) にあります。Milvus の比較演算子の詳細については、[Comparison operators](./basic-filtering-operators#comparison-operators) を参照してください。

### Terms query\{#terms-query}

Elasticsearch では、指定したフィールドに **完全一致** する term を 1 つ以上含むドキュメントを次のように検索できます。

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

Milvus にはこれに完全に対応するものはありません。ただし、指定したフィールドの値が、指定した term のいずれかであるエンティティを次のように検索できます。

```python
# use in
res = client.query(
    collection_name="my_collection",
    filter='degree in ["graduate", "post-graduate"]',
    output_fields=["id", "user", "degree"]
)

# use TEXT_MATCH
res = client.query(
    collection_name="my_collection",
    filter='TEXT_MATCH(degree, "graduate post-graduate")',
    output_fields=["id", "user", "degree"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html) にあります。Milvus の範囲演算子の詳細については、[Range operators](./basic-filtering-operators) を参照してください。

### Wildcard query\{#wildcard-query}

Elasticsearch では、ワイルドカードパターンに一致する term を含むドキュメントを次のように検索できます。

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

Milvus はフィルター条件でワイルドカードをサポートしていません。ただし、`like` 演算子を使用して、次のように同様の効果を得ることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) にあります。Milvus の範囲演算子の詳細については、[Range operators](./basic-filtering-operators) を参照してください。

## Boolean query\{#boolean-query}

Elasticsearch では、boolean query は、他のクエリのブール値の組み合わせに一致するドキュメントをマッチさせるクエリです。

次の例は、Elasticsearch のドキュメントの [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html) にある例を改変したものです。このクエリは、名前に `kimchy` を含み、`production` タグが付いたユーザーを返します。

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

Milvus では、次のように同様のことができます。

```python
filter = 

res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

上記の例では、対象のコレクションに **VarChar** 型の `user` フィールドと **Array** 型の `tags` フィールドがあることを前提としています。このクエリは、名前に `kimchy` を含み、`production` タグが付いたユーザーを返します。

## ベクトルクエリ\{#vector-queries}

Elasticsearch では、ベクトルクエリは、ベクトルフィールドを操作してセマンティック検索を効率的に実行する特殊なクエリです。

### Knn query\{#knn-query}

Elasticsearch は、近似的な kNN クエリと、厳密な総当たりの kNN クエリの両方をサポートしています。次のように、類似度メトリクスで測定して、クエリベクトルに最も近い *k* 個のベクトルをどちらの方法でも見つけることができます。

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

Milvus は専用のベクトルデータベースであり、インデックスタイプを使用してベクトル検索を最適化します。通常、高次元ベクトルデータに対しては近似最近傍（ANN）検索を優先します。FLAT インデックスタイプを使用した総当たりの kNN 検索は正確な結果を返しますが、時間とリソースの両方を大量に消費します。これに対し、AUTOINDEX やその他のインデックスタイプを使用した ANN 検索は速度と精度のバランスを取り、kNN よりも大幅に高速でリソース効率に優れたパフォーマンスを提供します。インデックスタイプと AUTOINDEX の詳細については、[Indexes](./indexes) と [AUTOINDEX Explained](./autoindex-explained) を参照してください。

上記のベクトルクエリに対する Milvus での類似の等価表現は、次のとおりです。

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector"
    data=[[-5, 9, -12]],
    limit=10
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html) にあります。Milvus の ANN 検索の詳細については、[Basic ANN Search](./single-vector-search) を参照してください。

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearch は、関連性の指標が異なる複数の結果セットを 1 つのランキング済み結果セットに結合する Reciprocal Rank Fusion（RRF）を提供しています。

次の例は、従来の term ベースの検索と k 近傍法（kNN）のベクトル検索を組み合わせて、検索の関連性を向上させる方法を示しています。

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
                            "query_vector": [1.25, 2, 3.5],  # Example vector; replace with your actual query vector
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

この例では、RRF は 2 つの retriever の結果を結合します。

- `text` フィールドに `"shoes"` という term を含むドキュメントを対象とした、標準的な term ベースの検索。

- 指定されたクエリベクトルを使用した、`vector` フィールドに対する kNN 検索。

各 retriever は最大 50 件の上位一致を提供し、それらは RRF によって再ランキングされ、最終的な上位 10 件の結果が返されます。

Milvus では、複数のベクトルフィールドにまたがる検索を組み合わせ、再ランキング戦略を適用し、結合されたリストから上位 K 件の結果を取得することで、同様のハイブリッド検索を実現できます。Milvus は RRF と重み付き reranker の両方の戦略をサポートしています。詳細については、[Weighted Ranker](./reranking-weighted-reranker) とその関連ページを参照してください。

以下は、上記の Elasticsearch の例に対応する、厳密ではない Milvus での等価表現です。

```python
search_params_dense = {
    "data": [[1.25, 2, 3.5]],
    "anns_field": "vector",
    "limit": 100
}

req_dense = ANNSearchRequest(**search_params_dense)

search_params_sparse = {
    "data": ["shoes"],
    "anns_field": "text_sparse"
}

req_sparse = ANNSearchRequest(**search_params_sparse)

res = client.hybrid_search(
    collection_name="my_collection",
    reqs=[req_dense, req_sparse],
    reranker=RRFRanker(),
    limit=10
)
```

この例は、以下を組み合わせた Milvus のハイブリッド検索を示しています。

1. **密ベクトル検索**: `vector` フィールドに対する近似最近傍（ANN）検索に内積（IP）メトリクスを使用します。

1. **スパースベクトル検索**: `text_sparse` フィールドで BM25 類似度メトリクスを使用します。

これらの検索の結果は個別に実行され、結合された後、Reciprocal Rank Fusion（RRF）ranker を使用して再ランキングされます。このハイブリッド検索は、再ランキングされたリストから上位 10 件のエンティティを返します。

Elasticsearch の RRF ランキングは標準的なテキストベースのクエリと kNN 検索の結果をマージしますが、これとは異なり、Milvus はスパースベクトル検索と密ベクトル検索の結果を組み合わせることで、マルチモーダルデータに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、term-level クエリ、boolean クエリ、全文検索クエリ、ベクトルクエリなど、典型的な Elasticsearch クエリを対応する Milvus のクエリへ変換する方法を説明しました。その他の Elasticsearch クエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。
