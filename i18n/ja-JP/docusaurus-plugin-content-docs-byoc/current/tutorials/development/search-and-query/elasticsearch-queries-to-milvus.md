---
title: "Elasticsearch クエリから Milvus へ | BYOC"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus へ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、高い更新コスト、低いリアルタイム性能、非効率な shard 管理、クラウドネイティブでない設計、過剰なリソース要求など、現代の AI アプリケーションでは課題に直面します。クラウドネイティブな vector database である Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的な indexing、そして最新インフラとのシームレスな統合によって、これらの問題を克服します。AI ワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。 | BYOC"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Elasticsearch Queries to Milvus

Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、高い更新コスト、低いリアルタイム性能、非効率な shard 管理、クラウドネイティブでない設計、過剰なリソース要求など、現代の AI アプリケーションでは課題に直面します。クラウドネイティブな vector database である Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的な indexing、そして最新インフラとのシームレスな統合によって、これらの問題を克服します。AI ワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。

この記事は、Elasticsearch から Milvus へのコードベース移行を容易にすることを目的としており、両者のクエリ変換例をさまざまに示します。

## Overview\{#overview}

Elasticsearch では、query コンテキストでの操作は関連度スコアを生成しますが、filter コンテキストでの操作は生成しません。同様に、Milvus の search は類似度スコアを生成しますが、その filter に似た query は生成しません。Elasticsearch から Milvus にコードベースを移行する際の基本原則は、Elasticsearch の query コンテキストで使用されている field を vector field に変換し、類似度スコアを生成できるようにすることです。 

以下の表は、いくつかの Elasticsearch クエリパターンと、それに対応する Milvus での等価表現を示しています。

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
     <td><p>Full-text search</p></td>
     <td><p>どちらも類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>タームレベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらの Elasticsearch クエリが filter コンテキストで使用される場合、どちらも同じ、または類似した機能セットを提供します。</p></td>
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
     <td><p>filter コンテキストで使用される場合、どちらも類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクトルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN query</a></p></td>
     <td><p>Search</p></td>
     <td><p>Milvus はより高度な vector search 機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>Hybrid Search</p></td>
     <td><p>Milvus は複数の reranking 戦略をサポートしています。</p></td>
   </tr>
</table>

## Full-text queries\{#full-text-queries}

Elasticsearch では、full text queries を使用すると、メール本文のような解析済みテキスト field を検索できます。クエリ文字列は、indexing 時にその field に適用されたものと同じ analyzer を使って処理されます。

### Match query\{#match-query}

Elasticsearch では、match query は、指定したテキスト、数値、日付、またはブール値に一致する document を返します。指定されたテキストは、マッチング前に解析されます。 

以下は、match query を使った Elasticsearch の search リクエストの例です。

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

Milvus は、full-text search 機能を通じて同じ機能を提供します。上記の Elasticsearch クエリは、以下のように Milvus に変換できます。

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse` は `message` という名前の VarChar field から導出された sparse vector field です。Milvus は BM25 embedding model を使用して `message` field の値を sparse vector embeddings に変換し、それらを `message_sparse` field に格納します。search リクエストを受け取ると、Milvus は同じ BM25 model を使用してプレーンテキストのクエリペイロードを embedding し、sparse vector search を実行して、対応する類似度スコアとともに `output_fields` パラメータで指定された `id` および `message` field を返します。

この機能を使用するには、`message` field で analyzer を有効化し、そこから `message_sparse` field を導出する関数を定義する必要があります。Milvus で analyzer を有効化し、導出関数を作成する詳細な手順については、[Full Text Search](./full-text-search) を参照してください。

## Term-level queries\{#term-level-queries}

Elasticsearch では、term-level queries は、日付範囲、IP アドレス、価格、商品 ID などの構造化データ内の正確な値に基づいて document を見つけるために使用されます。このセクションでは、いくつかの Elasticsearch term-level queries に対する Milvus での等価表現の可能性を説明します。このセクションのすべての例は、Milvus の機能に合わせるため、filter コンテキスト内で動作するよう調整されています。

### IDs\{#ids}

Elasticsearch では、以下のように filter コンテキストで ID に基づいて document を見つけることができます。

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

Milvus でも、以下のように ID に基づいて entity を見つけることができます。

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

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html) で確認できます。Milvus の query および get リクエスト、ならびに filter 式の詳細については、[Query](./get-and-scalar-query) および [Filtering Explained](./filtering-overview) を参照してください。

### Prefix query\{#prefix-query}

Elasticsearch では、以下のように filter コンテキストで、指定された field に特定の接頭辞を含む document を見つけることができます。

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

Milvus では、以下のように、値が指定された接頭辞で始まる entity を見つけることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html) で確認できます。Milvus の `like` 演算子の詳細については、[Using ](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ for Pattern Matching](./basic-filtering-operators) を参照してください。

### Range query\{#range-query}

Elasticsearch では、以下のように、指定された範囲内の term を含む document を見つけることができます。

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

Milvus では、以下のように、特定の field の値が指定された範囲内にある entity を見つけることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html) で確認できます。Milvus の比較演算子の詳細については、[Comparison operators](./basic-filtering-operators#comparison-operators) を参照してください。

### Term query\{#term-query}

Elasticsearch では、以下のように、指定された field に **完全に一致する** term を含む document を見つけることができます。

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

Milvus では、以下のように、指定された field の値が指定された term と完全に一致する entity を見つけることができます。

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

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html) で確認できます。Milvus の比較演算子の詳細については、[Comparison operators](./basic-filtering-operators#comparison-operators) を参照してください。

### Terms query\{#terms-query}

Elasticsearch では、以下のように、指定された field に 1 つ以上の **完全一致する** term を含む document を見つけることができます。

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

Milvus には、これに完全に対応するものはありません。ただし、以下のように、指定された field の値が指定された term のいずれかである entity を見つけることができます。

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

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html) で確認できます。Milvus の範囲演算子の詳細については、[Range operators](./basic-filtering-operators) を参照してください。

### Wildcard query\{#wildcard-query}

Elasticsearch では、以下のように、ワイルドカードパターンに一致する term を含む document を見つけることができます。

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

Milvus は filter 条件で wildcard をサポートしていません。ただし、以下のように `like` 演算子を使用して類似した効果を実現できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) で確認できます。Milvus の範囲演算子の詳細については、[Range operators](./basic-filtering-operators) を参照してください。 

## Boolean query\{#boolean-query}

Elasticsearch では、boolean query は、他のクエリのブール組み合わせに一致する document にマッチするクエリです。 

以下の例は、[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html) にある Elasticsearch ドキュメントの例をもとに調整したものです。このクエリは、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

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

Milvus では、以下のように同様のことができます。

```python
filter = 

res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

上記の例では、対象の collection に **VarChar** 型の `user` field と **Array** 型の `tags` field があることを前提としています。この query は、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

## Vector queries\{#vector-queries}

Elasticsearch では、vector queries は、vector field 上で動作してセマンティック検索を効率的に実行するための特化クエリです。

### Knn query\{#knn-query}

Elasticsearch は、近似 kNN query と厳密な総当たり方式の kNN query の両方をサポートしています。以下のように、類似度指標によって測定される、クエリベクトルに最も近い *k* 個のベクトルを、どちらの方法でも見つけることができます。

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

特化した vector database である Milvus は、vector search を最適化するために index type を使用します。通常、高次元 vector データに対しては approximate nearest neighbor (ANN) search を優先します。FLAT index type による総当たり kNN search は正確な結果を提供しますが、時間もリソースも多く消費します。一方、AUTOINDEX やその他の index type を使用した ANN search は、速度と精度のバランスを取り、kNN よりも大幅に高速でリソース効率の高い性能を提供します。index type と AUTOINDEX の詳細については、[Indexes](./indexes) および [AUTOINDEX Explained](./autoindex-explained) を参照してください。

上記の vector query に対する Mlivus での類似した等価表現は、次のようになります。

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector"
    data=[[-5, 9, -12]],
    limit=10
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html) で確認できます。Milvus の ANN search の詳細については、[Basic ANN Search](./single-vector-search) を参照してください。

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearch は、異なる関連性指標を持つ複数の結果セットを 1 つのランク付けされた結果セットに統合するために、Reciprocal Rank Fusion (RRF) を提供しています。

次の例は、従来の用語ベース検索と k-nearest neighbors (kNN) ベクトル検索を組み合わせて、検索の関連性を向上させる方法を示しています。

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

この例では、RRF は 2 つの retriever からの結果を統合します。

- `text` フィールドで `"shoes"` という用語を含むドキュメントに対する標準的な用語ベース検索。

- 指定されたクエリベクトルを使用して `vector` フィールドに対して実行する kNN 検索。

各 retriever は最大 50 件の上位一致結果を提供し、それらは RRF によって再ランキングされ、最終的な上位 10 件の結果が返されます。

Milvus では、複数のベクトルフィールドにまたがる検索を組み合わせ、再ランキング戦略を適用し、統合リストから上位 K 件の結果を取得することで、同様のハイブリッド検索を実現できます。Milvus は RRF と weighted reranker の両方の戦略をサポートしています。詳細については、[Weighted Ranker](./reranking-weighted-reranker) とその関連ページを参照してください。

以下は、上記の Elasticsearch の例に対応する、Milvus における厳密ではない同等例です。

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

この例は、Milvus における次の要素を組み合わせたハイブリッド検索を示しています。

1. **Dense vector search**: `vector` フィールドに対する近似最近傍 (ANN) 検索に inner product (IP) メトリックを使用します。

1. **Sparse vector search**: `text_sparse` フィールドに対して BM25 類似度メトリックを使用します。

これらの検索結果は個別に実行され、その後に統合され、Reciprocal Rank Fusion (RRF) ranker を使用して再ランキングされます。ハイブリッド検索は、再ランキングされたリストから上位 10 件の entity を返します。

標準的なテキストベースクエリと kNN 検索の結果を統合する Elasticsearch の RRF ランキングとは異なり、Milvus は sparse vector search と dense vector search の結果を統合し、マルチモーダルデータ向けに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、term-level クエリ、boolean クエリ、full-text クエリ、vector クエリを含む、典型的な Elasticsearch クエリを Milvus の同等機能に変換する方法を説明しました。他の Elasticsearch クエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。
