---
title: "Elasticsearch クエリから Milvus へ | BYOC"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus へ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、高い更新コスト、低いリアルタイム性能、非効率なシャード管理、クラウドネイティブではない設計、過剰なリソース需要など、現代の AI アプリケーションでは課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的なインデックス作成、最新インフラとのシームレスな統合によって、これらの課題を克服します。AI ワークロードに優れたパフォーマンスとスケーラビリティを提供します。 | BYOC"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Elasticsearch クエリから Milvus へ

Apache Lucene 上に構築された Elasticsearch は、主要なオープンソース検索エンジンです。しかし、高い更新コスト、低いリアルタイム性能、非効率なシャード管理、クラウドネイティブではない設計、過剰なリソース需要など、現代の AI アプリケーションでは課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的なインデックス作成、最新インフラとのシームレスな統合によって、これらの課題を克服します。AI ワークロードに優れたパフォーマンスとスケーラビリティを提供します。

この記事は、コードベースを Elasticsearch から Milvus へ移行しやすくすることを目的としており、両者間でクエリを変換するさまざまな例を示します。

## 概要\{#overview}

Elasticsearch では、クエリコンテキストでの操作は関連度スコアを生成しますが、フィルターコンテキストでの操作は生成しません。同様に、Milvus の検索は類似度スコアを生成しますが、フィルターに類するクエリは生成しません。コードベースを Elasticsearch から Milvus へ移行する際の基本原則は、Elasticsearch のクエリコンテキストで使用されるフィールドをベクトルフィールドに変換し、類似度スコアを生成できるようにすることです。

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
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match クエリ</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>どちらも類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>タームレベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらの Elasticsearch クエリをフィルターコンテキストで使用する場合、どちらも同一または類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">Prefix クエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Range クエリ</a></p></td>
     <td><p><code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code> などの比較演算子</p></td>
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
     <td><p>フィルターコンテキストで使用する場合、どちらも類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクトルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN クエリ</a></p></td>
     <td><p>検索</p></td>
     <td><p>Milvus はより高度なベクトル検索機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal Rank Fusion</a></p></td>
     <td><p>ハイブリッド検索</p></td>
     <td><p>Milvus は複数のリランキング戦略をサポートしています。</p></td>
   </tr>
</table>

## 全文検索クエリ\{#full-text-queries}

Elasticsearch では、全文検索クエリを使用すると、メール本文などの解析済みテキストフィールドを検索できます。クエリ文字列は、インデックス作成時にそのフィールドに適用されたものと同じアナライザーを使用して処理されます。

### Match クエリ\{#match-query}

Elasticsearch では、Match クエリは、指定されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。指定されたテキストは、照合の前に解析されます。

以下は、Match クエリを使用した Elasticsearch の検索リクエストの例です。

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

Milvus は、全文検索機能を通じて同じ機能を提供します。上記の Elasticsearch クエリは、次のように Milvus に変換できます。

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse` は、`message` という名前の VarChar フィールドから派生したスパースベクトルフィールドです。Milvus は BM25 埋め込みモデルを使用して、`message` フィールドの値をスパースベクトル埋め込みに変換し、`message_sparse` フィールドに保存します。検索リクエストを受信すると、Milvus は同じ BM25 モデルを使用してプレーンテキストのクエリペイロードを埋め込み、スパースベクトル検索を実行して、`output_fields` パラメーターで指定された `id` および `message` フィールドを、対応する類似度スコアとともに返します。

この機能を使用するには、`message` フィールドでアナライザーを有効にし、そこから `message_sparse` フィールドを派生させる関数を定義する必要があります。Milvus でアナライザーを有効にして派生関数を作成する詳細な手順については、[全文検索](./full-text-search) を参照してください。

## タームレベルクエリ\{#term-level-queries}

Elasticsearch では、タームレベルクエリは、日付範囲、IP アドレス、価格、製品 ID など、構造化データ内の正確な値に基づいてドキュメントを検索するために使用されます。このセクションでは、一部の Elasticsearch タームレベルクエリに対応する可能性のある Milvus での等価表現を概説します。このセクションのすべての例は、Milvus の機能に合わせてフィルターコンテキスト内で動作するように調整されています。

### IDs\{#ids}

Elasticsearch では、次のように、フィルターコンテキストで ID に基づいてドキュメントを検索できます。

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

Milvus では、次のように、ID に基づいてエンティティを検索することもできます。

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

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html) にあります。Milvus でのクエリおよび get リクエストとフィルター式の詳細については、[クエリ](./get-and-scalar-query) と [フィルタリングの解説](./filtering-overview) を参照してください。

### Prefix クエリ\{#prefix-query}

Elasticsearch では、次のように、フィルターコンテキストで、指定されたフィールドに特定のプレフィックスを含むドキュメントを検索できます。

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

Milvus では、次のように、値が指定されたプレフィックスで始まるエンティティを検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html) にあります。Milvus の `like` 演算子の詳細については、[パターンマッチングに ](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ を使用する方法](./basic-filtering-operators) を参照してください。

### Range クエリ\{#range-query}

Elasticsearch では、次のように、指定された範囲内のタームを含むドキュメントを検索できます。

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

Milvus では、次のように、特定のフィールドの値が指定された範囲内にあるエンティティを検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html) にあります。Milvus の比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators) を参照してください。

### Term クエリ\{#term-query}

Elasticsearch では、次のように、指定されたフィールドに**正確な**タームを含むドキュメントを検索できます。

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

Milvus では、次のように、指定されたフィールドの値が指定されたタームと完全に一致するエンティティを検索できます。

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

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html) にあります。Milvus の比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators) を参照してください。

### Terms クエリ\{#terms-query}

Elasticsearch では、次のように、指定されたフィールドに 1つ以上の**正確な**タームを含むドキュメントを検索できます。

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

Milvus には、これに完全に対応するものはありません。ただし、次のように、指定されたフィールドの値が指定されたタームのいずれかであるエンティティを検索できます。

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

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html) にあります。Milvus の範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators) を参照してください。

### Wildcard クエリ\{#wildcard-query}

Elasticsearch では、次のように、ワイルドカードパターンに一致するタームを含むドキュメントを検索できます。

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

Milvus はフィルタリング条件でワイルドカードをサポートしていません。ただし、次のように `like` 演算子を使用すると、同様の効果を得られます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) にあります。Milvus の範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators) を参照してください。

## Boolean クエリ\{#boolean-query}

Elasticsearch では、Boolean クエリとは、他のクエリのブール結合に一致するドキュメントにマッチするクエリです。

次の例は、Elasticsearch ドキュメントの [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html) の例を基にしています。このクエリは、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

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

上記の例は、対象のコレクションに **VarChar** 型の `user` フィールドと **Array** 型の `tags` フィールドがあることを前提としています。このクエリは、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

## ベクトルクエリ\{#vector-queries}

Elasticsearch では、ベクトルクエリは、ベクトルフィールドを対象として効率的にセマンティック検索を実行するための専用クエリです。

### kNN クエリ\{#knn-query}

Elasticsearch は、近似 kNN クエリと、厳密な総当たり方式の kNN クエリの両方をサポートしています。次のように、いずれの方法でも、類似度メトリクスで測定して、クエリベクトルに最も近い *k* 個のベクトルを見つけることができます。

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

Milvus は専用のベクトルデータベースとして、インデックスタイプを使用してベクトル検索を最適化します。通常、高次元ベクトルデータには近似最近傍（ANN）検索を優先します。FLAT インデックスタイプを使用した総当たり kNN 検索は正確な結果を返しますが、時間とリソースの両方を消費します。これに対して、AUTOINDEX またはその他のインデックスタイプを使用した ANN 検索は速度と精度のバランスを取り、kNN よりも大幅に高速でリソース効率の高いパフォーマンスを提供します。インデックスタイプと AUTOINDEX の詳細については、[インデックス](./indexes) と [AUTOINDEX の解説](./autoindex-explained) を参照してください。

上記のベクトルクエリに類似する Milvus での等価表現は次のとおりです。

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector"
    data=[[-5, 9, -12]],
    limit=10
)
```

Elasticsearch の例は [こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html) にあります。Milvus での ANN 検索の詳細については、[基本ベクトル検索](./single-vector-search) を参照してください。

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearch は、関連性指標の異なる複数の結果セットを 1つのランク付けされた結果セットに統合するために、Reciprocal Rank Fusion（RRF）を提供しています。

次の例は、検索の関連性を高めるために、従来のタームベースの検索と k 近傍法（kNN）によるベクトル検索を組み合わせる方法を示しています。

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

この例では、RRF は 2つのレトリーバーの結果を統合します。

- `text` フィールドに `"shoes"` というタームを含むドキュメントを対象とする、標準的なタームベースの検索です。

- 指定されたクエリベクトルを使用した、`vector` フィールドに対する kNN 検索です。

各レトリーバーは最大 50 件の上位一致を提供し、それらは RRF によって再ランク付けされ、最終的な上位 10 件の結果が返されます。

Milvus では、複数のベクトルフィールドにまたがる検索を組み合わせ、リランキング戦略を適用し、統合されたリストから top-K 件の結果を取得することで、同様のハイブリッド検索を実現できます。Milvus は RRF と重み付きリランカーの両方の戦略をサポートしています。詳細については、[Weighted Ranker](./reranking-weighted-reranker) とその関連ページを参照してください。

以下は、上記の Elasticsearch の例に対応する、Milvus での厳密ではない等価表現です。

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

この例は、以下を組み合わせた Milvus でのハイブリッド検索を示しています。

1. **高密度ベクトル検索**: `vector` フィールドに対する近似最近傍（ANN）検索に内積（IP）メトリクスを使用します。

1. **スパースベクトル検索**: `text_sparse` フィールドで BM25 類似度メトリクスを使用します。

これらの検索の結果は個別に実行され、統合された後、Reciprocal Rank Fusion（RRF）ランカーを使用して再ランク付けされます。ハイブリッド検索は、再ランク付けされたリストから上位 10 件のエンティティを返します。

標準的なテキストベースのクエリと kNN 検索の結果を統合する Elasticsearch の RRF ランキングとは異なり、Milvus はスパースベクトル検索と高密度ベクトル検索の結果を組み合わせ、マルチモーダルデータに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、タームレベルクエリ、Boolean クエリ、全文検索クエリ、ベクトルクエリなど、一般的な Elasticsearch クエリから Milvus での等価表現への変換について説明しました。他の Elasticsearch クエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。
