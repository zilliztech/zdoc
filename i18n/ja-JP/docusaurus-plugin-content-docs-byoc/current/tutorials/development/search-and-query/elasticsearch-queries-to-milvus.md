---
title: "Elasticsearch クエリから Milvus へ | BYOC"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus へ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、更新コストの高さ、リアルタイム性能の低さ、非効率な shard 管理、クラウドネイティブではない設計、過剰なリソース要求など、現代の AI アプリケーションでは課題があります。クラウドネイティブな vector database である Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的な index、そして最新インフラストラクチャとのシームレスな統合によって、これらの問題を解決します。AI ワークロードに対して優れた性能とスケーラビリティを提供します。 | BYOC"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Elasticsearch クエリから Milvus へ

Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、更新コストの高さ、リアルタイム性能の低さ、非効率な shard 管理、クラウドネイティブではない設計、過剰なリソース要求など、現代の AI アプリケーションでは課題があります。クラウドネイティブな vector database である Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的な index、そして最新インフラストラクチャとのシームレスな統合によって、これらの問題を解決します。AI ワークロードに対して優れた性能とスケーラビリティを提供します。

この記事は、両者間でクエリを変換するさまざまな例を示しながら、Elasticsearch から Milvus へのコードベース移行を容易にすることを目的としています。

## Overview\{#overview}

Elasticsearch では、query context 内の操作は relevance score を生成しますが、filter context 内の操作は生成しません。同様に、Milvus の search は similarity score を生成しますが、filter に似た query は生成しません。Elasticsearch から Milvus へコードベースを移行する際の基本原則は、Elasticsearch の query context で使用される field を vector field に変換し、similarity score を生成できるようにすることです。 

以下の表は、いくつかの Elasticsearch のクエリパターンと、それに対応する Milvus での等価表現を示しています。

<table>
   <tr>
     <th><p>Elasticsearch クエリ</p></th>
     <th><p>Milvus での等価表現</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>フルテキストクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match query</a></p></td>
     <td><p>Full-text search</p></td>
     <td><p>どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Term レベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらの Elasticsearch クエリが filter context で使用される場合、どちらも同じ、または類似の機能セットを提供します。</p></td>
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
     <td><p>filter context で使用する場合、どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Vector クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN query</a></p></td>
     <td><p>Search</p></td>
     <td><p>Milvus はより高度な vector search 機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>Hybrid Search</p></td>
     <td><p>Milvus は複数の reranking 戦略をサポートします。</p></td>
   </tr>
</table>

## Full-text queries\{#full-text-queries}

Elasticsearch では、full text queries を使用すると、メール本文のような解析済みテキスト field を検索できます。クエリ文字列は、index 作成時にその field に適用されたものと同じ analyzer を使って処理されます。

### Match query\{#match-query}

Elasticsearch では、match query は、指定されたテキスト、数値、日付、または boolean 値に一致する document を返します。指定されたテキストは一致判定の前に解析されます。 

以下は、match query を用いた Elasticsearch の search request の例です。

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

Milvus は、full-text search 機能によって同じ機能を提供します。上記の Elasticsearch クエリは、以下のように Milvus に変換できます。

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse` は `message` という名前の VarChar field から派生した sparse vector field です。Milvus は BM25 embedding model を使用して `message` field の値を sparse vector embeddings に変換し、それを `message_sparse` field に保存します。search request を受け取ると、Milvus は同じ BM25 model を使用してプレーンテキストの query payload を embedding し、sparse vector search を実行して、対応する similarity score とともに `output_fields` パラメータで指定された `id` と `message` field を返します。

この機能を使用するには、`message` field で analyzer を有効にし、そこから `message_sparse` field を派生させる function を定義する必要があります。Milvus で analyzer を有効化し、派生 function を作成するための詳細な手順については、[Full Text Search](./full-text-search) を参照してください。

## Term-level queries\{#term-level-queries}

Elasticsearch では、term-level queries は、日付範囲、IP アドレス、価格、製品 ID などの構造化データにおける正確な値に基づいて document を検索するために使用されます。このセクションでは、いくつかの Elasticsearch term-level queries に対する Milvus での等価表現を示します。このセクション内のすべての例は、Milvus の機能に合わせるため、filter context 内で動作するように調整されています。

### IDs\{#ids}

Elasticsearch では、filter context で以下のように ID に基づいて document を検索できます。

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

Milvus でも、以下のように ID に基づいて entity を検索できます。

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

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html) で確認できます。Milvus における query および get request、ならびに filter expressions の詳細については、[Query](./get-and-scalar-query) および [Filtering Explained](./filtering-overview) を参照してください。

### Prefix query\{#prefix-query}

Elasticsearch では、filter context で以下のように、指定された field に特定の接頭辞を含む document を検索できます。

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

Milvus では、以下のように、値が指定された接頭辞で始まる entity を検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html) で確認できます。Milvus の `like` 演算子の詳細については、[Using ](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ for Pattern Matching](./basic-filtering-operators) を参照してください。

### Range query\{#range-query}

Elasticsearch では、以下のように、指定された範囲内の term を含む document を検索できます。

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

Milvus では、以下のように、特定の field の値が指定された範囲内にある entity を検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html) で確認できます。Milvus の比較演算子の詳細については、[Comparison operators](./basic-filtering-operators#comparison-operators) を参照してください。

### Term query\{#term-query}

Elasticsearch では、以下のように、指定された field に **正確に一致する** term を含む document を検索できます。

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

Milvus では、以下のように、指定された field の値が指定された term と完全に一致する entity を検索できます。

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

Elasticsearch では、以下のように、指定された field に 1 つ以上の **正確な** term を含む document を検索できます。

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

Milvus にはこれに完全に対応するものはありません。ただし、以下のように、指定された field の値が指定された term のいずれか 1 つである entity を検索できます。

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

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html) で確認できます。Milvus の range operators の詳細については、[Range operators](./basic-filtering-operators) を参照してください。

### Wildcard query\{#wildcard-query}

Elasticsearch では、以下のように、wildcard パターンに一致する term を含む document を検索できます。

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

Milvus は filtering conditions で wildcard をサポートしていません。ただし、以下のように `like` 演算子を使用して同様の効果を得ることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) で確認できます。Milvus の range operators の詳細については、[Range operators](./basic-filtering-operators) を参照してください。 

## Boolean query\{#boolean-query}

Elasticsearch では、boolean query は、他の query の boolean な組み合わせに一致する document にマッチする query です。 

以下の例は、[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html) にある Elasticsearch ドキュメントの例をもとに調整したものです。この query は、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

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

Milvus では、以下のように同様のことを実行できます。

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

Elasticsearch では、vector queries は vector field 上で動作し、semantic search を効率的に実行するための特化型 query です。

### Knn query\{#knn-query}

Elasticsearch は approximate kNN query と exact brute-force kNN query の両方をサポートしています。類似度メトリックによって測定される、query vector に最も近い *k* 個の vector を、以下のようにどちらの方法でも見つけることができます。

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

特化型 vector database である Milvus は、vector search を最適化するために index types を使用します。通常、高次元 vector data に対しては approximate nearest neighbor (ANN) search を優先します。FLAT index type を用いた brute-force kNN search は正確な結果を返しますが、時間もリソースも多く消費します。これに対して、AUTOINDEX やその他の index types を使用した ANN search は、速度と精度のバランスを取りながら、kNN よりも大幅に高速で、かつリソース効率の高い性能を提供します。index types および AUTOINDEX の詳細については、[Indexes](./indexes) および [AUTOINDEX Explained](./autoindex-explained) を参照してください。

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

Elasticsearch は、異なる relevance indicator を持つ複数の result set を 1 つの ranked result set に統合するために Reciprocal Rank Fusion (RRF) を提供します。

以下の例では、従来の term ベース検索と k-nearest neighbors (kNN) vector search を組み合わせて、検索の relevance を向上させる方法を示しています。

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

この例では、RRF は 2 つの retriever からの結果を結合します。

- `text` field に `"shoes"` という term を含む document を対象とした標準的な term ベース検索。

- 指定された query vector を使用した `vector` field に対する kNN search。

各 retriever は最大 50 件の上位一致結果を提供し、それらは RRF によって rerank され、最終的に上位 10 件の結果が返されます。

Milvus では、複数の vector field に対する search を組み合わせ、reranking 戦略を適用し、結合されたリストから top-K の結果を取得することで、同様の hybrid search を実現できます。Milvus は RRF と weighted reranker の両方をサポートしています。詳細については、[Weighted Ranker](./reranking-weighted-reranker) および関連ページを参照してください。

以下は、上記の Elasticsearch の例に対する Milvus での厳密ではない等価表現です。

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

この例は、Milvus における hybrid search が以下を組み合わせることを示しています。

1. **Dense vector search**: `vector` field に対する approximate nearest neighbor (ANN) search に inner product (IP) metric を使用。

1. **Sparse vector search**: `text_sparse` field に対して BM25 similarity metric を使用。

これらの search の結果は個別に実行され、結合され、Reciprocal Rank Fusion (RRF) ranker を使用して rerank されます。hybrid search は、rerank 後のリストから上位 10 件の entity を返します。

標準的なテキストベース query と kNN search の結果をマージする Elasticsearch の RRF ranking とは異なり、Milvus は sparse vector search と dense vector search の結果を組み合わせ、マルチモーダルデータ向けに最適化された独自の hybrid search 機能を提供します。

## Recap\{#recap}

この記事では、term-level queries、boolean queries、full-text queries、vector queries を含む、典型的な Elasticsearch クエリをそれに対応する Milvus の表現へ変換する方法を紹介しました。他の Elasticsearch クエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。
