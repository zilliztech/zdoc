---
title: "ElasticsearchクエリからMilvusへ | BYOC"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "ElasticsearchクエリからMilvusへ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ElasticsearchはApache Luceneを基盤としており、主要なオープンソース検索エンジンです。しかし、モダンなAIアプリケーションにおいては、高コストな更新、リアルタイム性能の低下、非効率なシャード管理、クラウドネイティブでない設計、過剰なリソース要求などの課題に直面しています。クラウドネイティブなベクトルデータベースとして、Milvusはこれらの問題を、ストレージとコンピューティングの分離、高次元データの効率的なインデックス作成、モダンなインフラとのシームレスな統合により克服しています。AIワークロード向けに優れたパフォーマンスとスケーラビリティを提供します。| BYOC"
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
  - フィルター式
  - フィルタリング
  - elasticsearchクエリ
  - クエリマッピング
  - nlp検索
  - hallucinations llm
  - マルチモーダル検索
  - ベクトル検索アルゴリズム

---

import Admonition from '@theme/Admonition';


# ElasticsearchクエリからMilvusへ

ElasticsearchはApache Luceneを基盤とした主要なオープンソース検索エンジンです。しかし、モダンなAIアプリケーションにおいては、高コストな更新、リアルタイム性能の低下、非効率なシャード管理、クラウドネイティブでない設計、過剰なリソース要求などの課題に直面しています。クラウドネイティブなベクトルデータベースとして、Milvusはこれらの問題を、ストレージとコンピューティングの分離、高次元データの効率的なインデックス作成、モダンなインフラとのシームレスな統合により克服しています。AIワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。

この記事では、ElasticsearchからMilvusへのコードベースの移行を促進するため、クエリ変換のさまざまな例を提供します。

## 概要\{#overview}

Elasticsearchでは、クエリコンテキストでの操作により関連性スコアが生成される一方、フィルターコンテキストでは生成されません。同様に、Milvusの検索では類似性スコアが生成されるのに対し、フィルターのようなクエリでは生成されません。ElasticsearchからMilvusへのコードベースの移行においては、Elasticsearchのクエリコンテキストで使用されるフィールドをベクトルフィールドに変換し、類似性スコアの生成を可能にするという基本原則があります。

以下の表は、ElasticsearchのクエリパターンとそのMilvusでの対応する同等機能を示しています。

<table>
   <tr>
     <th><p>Elasticsearchクエリ</p></th>
     <th><p>Milvusの同等機能</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>全文検索</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Matchクエリ</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>両方とも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>用語レベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらのElasticsearchクエリがフィルターコンテキストで使用されている場合、両方とも同じまたは同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">Prefixクエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Rangeクエリ</a></p></td>
     <td><p><code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">Termクエリ</a></p></td>
     <td><p><code>==</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">Termsクエリ</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">Wildcardクエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">Booleanクエリ</a></p></td>
     <td><p><code>AND</code> などの論理演算子</p></td>
     <td><p>フィルターコンテキストで使用されている場合、両方とも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクタークエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNNクエリ</a></p></td>
     <td><p>Search</p></td>
     <td><p>Milvusはより高度なベクトル検索機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>Hybrid Search</p></td>
     <td><p>Milvusは複数のリランキング戦略をサポートします。</p></td>
   </tr>
</table>

## 全文検索\{#full-text-queries}

Elasticsearchでは、全文検索クエリを使用して、メール本文などの解析済みテキストフィールドを検索できます。クエリ文字列は、インデックス作成時にフィールドに適用されたのと同じアナライザーを使用して処理されます。

### Matchクエリ\{#match-query}

Elasticsearchでは、Matchクエリは、提供されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。提供されたテキストは一致前に解析されます。

以下は、Matchクエリを使用したElasticsearch検索リクエストの例です。

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

Milvusでは、全文検索機能を通じて同じ機能が提供されます。上記のElasticsearchクエリを次のようにMilvusに変換できます。

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse`は`message`という名前のVarCharフィールドから派生したスパースベクトルフィールドです。MilvusはBM25埋め込みモデルを使用して`message`フィールドの値をスパースベクトル埋め込みに変換し、`message_sparse`フィールドに格納します。リクエストを受信すると、Milvusは同じBM25モデルを使用してプレーンテキストクエリペイロードを埋め込み、スパースベクトル検索を実行し、`output_fields`パラメータで指定された`id`と`message`フィールドと、対応する類似性スコアを返します。

この機能を使用するには、`message`フィールドでアナライザーを有効にする必要があります。Milvusでアナライザーを有効にし、派生関数を作成する詳細については、[全文検索](./full-text-search)を参照してください。

## 用語レベルクエリ\{#term-level-queries}

Elasticsearchでは、日付範囲、IPアドレス、価格、または製品IDなどの構造化データ内の正確な値に基づいてドキュメントを検索するために、用語レベルクエリが使用されます。このセクションでは、Elasticsearchのいくつかの用語レベルクエリのMilvusでの可能な代替手段について説明します。このセクションのすべての例は、Milvusの機能に合わせてフィルターコンテキストで動作するように調整されています。

### IDs\{#ids}

Elasticsearchでは、次のようにフィルターコンテキストでIDに基づいてドキュメントを検索できます。

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

Milvusでは、次のようにIDに基づいてエンティティを検索することもできます。

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

### Prefixクエリ\{#prefix-query}

Elasticsearchでは、次のようにフィルターコンテキストで指定されたフィールドに特定のプレフィックスが含まれるドキュメントを検索できます。

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

Milvusでは、次のように指定されたプレフィックスで始まる値を持つエンティティを検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html)で見つけることができます。Milvusの`like`演算子の詳細については、[パターンマッチングのための `LIKE` 演算子の使用](./basic-filtering-operators#example-2-using-like-for-pattern-matching)を参照してください。

### Rangeクエリ\{#range-query}

Elasticsearchでは、次のように提供された範囲内の用語を含むドキュメントを検索できます。

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

Milvusでは、次のように特定のフィールドの値が指定された範囲内にあるエンティティを検索できます。

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)で見つけることができます。Milvusの比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators)を参照してください。

### Termクエリ\{#term-query}

Elasticsearchでは、次のように指定されたフィールドに**正確な**用語が含まれるドキュメントを検索できます。

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

Milvusでは、次のように指定されたフィールドの値が正確に指定された用語であるエンティティを検索できます。

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

### Termsクエリ\{#terms-query}

Elasticsearchでは、次のように指定されたフィールドに1つ以上の**正確な**用語が含まれるドキュメントを検索できます。

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

Milvusにはこの機能の完全な同等機能はありません。ただし、次のように指定されたフィールドの値が指定された用語のいずれかであるエンティティを検索できます。

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

### Wildcardクエリ\{#wildcard-query}

Elasticsearchでは、次のようにワイルドカードパターンに一致する用語を含むドキュメントを検索できます。

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

Milvusはフィルター条件でのワイルドカードをサポートしていません。ただし、次のように`like`演算子を使用して同様の効果を得ることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearchの例は[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html)で見つけることができます。Milvusの範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators#range-operators)を参照してください。

## Booleanクエリ\{#boolean-query}

Elasticsearchでは、Booleanクエリは他のクエリのブール結合に一致するドキュメントを照合するクエリです。

以下の例は、Elasticsearchドキュメント[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)の例から改編されたものです。このクエリは、名前に`kimchy`が含まれる`production`タグを持つユーザーを返します。

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

Milvusでは、次のように同様のことを行うことができます。

```python
filter =

res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

上記の例では、ターゲットコレクションに**VarChar**型の`user`フィールドと**Array**型の`tags`フィールドがあると仮定しています。このクエリは、名前に`kimchy`が含まれる`production`タグを持つユーザーを返します。

## ベクトルクエリ\{#vector-queries}

Elasticsearchでは、ベクトルクエリはベクトルフィールド上で動作してセマンティック検索を効率的に実行する専門のクエリです。

### Knnクエリ\{#knn-query}

Elasticsearchは、近似kNNクエリと正確なブルートフォースkNNクエリの両方をサポートしています。次のように、類似性メトリックで測定されるクエリベクトルに最も近い*k*個のベクトルをいずれかの方法で見つけることができます。

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

Milvusは、専門のベクトルデータベースとして、インデックスタイプを使用してベクトル検索を最適化します。通常、高次元ベクトルデータの近似最近傍(ANN)検索を優先します。FLATインデックスタイプによるブルートフォースkNN検索は正確な結果を提供しますが、時間とリソースを多く消費します。対照的に、AUTOINDEXまたはその他のインデックスタイプを使用するANN検索は、速度と精度のバランスを取り、kNNよりもはるかに高速でリソース効率が良い性能を提供します。インデックスタイプとAUTOINDEXの詳細については、[インデックスの管理](./manage-indexes)と[AUTOINDEXの説明](./autoindex-explained)を参照してください。

上記のベクトルクエリと同様の同等機能はMilvusでは次のようになります。

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

Elasticsearchでは、Reciprocal Rank Fusion(RRF)を提供し、異なる関連性指標を持つ複数の結果セットを単一のランキング付き結果セットに結合できます。

以下の例では、従来の用語ベース検索とk近傍(kNN)ベクトル検索を組み合わせて、検索関連性を向上させる方法を示しています。

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
                            "query_vector": [1.25, 2, 3.5],  # 例のベクトルです; 実際のクエリベクトルに置き換えてください
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

この例では、RRFは2つの検索器からの結果を組み合わせています。

- `text`フィールドに用語`"shoes"`を含むドキュメントの標準用語ベース検索。

- 提供されたクエリベクトルを使用した`vector`フィールドのkNN検索。

各検索器は最大50個の上位マッチを提供し、RRFによって再ランク付けされ、最終的な上位10個の結果が返されます。

Milvusでは、複数のベクトルフィールドを横断して検索を組み合わせ、リランキング戦略を適用し、結合されたリストから上位K個の結果を取得することで、同様のハイブリッド検索を実現できます。MilvusはRRFと重み付きリランカー戦略の両方をサポートしています。詳細については、[リランキング](./reranking)を参照してください。

以下は、上記Elasticsearch例のMilvusにおける非厳密な同等機能です。

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

この例では、Milvusのハイブリッド検索のデモンストレーションを行っています。これは次を組み合わせています。

1. **密ベクトル検索**: `vector`フィールド上で近似最近傍(ANN)検索を行うための内部積(IP)メトリックを使用しています。

1. **スパースベクトル検索**: `text_sparse`フィールド上のBM25類似性メトリックを使用し、`drop_ratio_search`パラメータを0.2としています。

これらの検索からの結果は個別に実行され、結合され、相互ランク融合(RRF)ランカーを使用して再ランク付けされます。ハイブリッド検索は、再ランク付けされたリストから上位10個のエンティティを返します。

標準テキストベースクエリとkNN検索からの結果をマージするElasticsearchのRRFランキングとは異なり、Milvusはスパースおよび密ベクトル検索からの結果を組み合わせ、マルチモーダルデータに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、用語レベルクエリ、Booleanクエリ、全文検索、ベクトルクエリを含む、典型的なElasticsearchクエリをMilvusの同等機能に変換する方法を説明しました。その他のElasticsearchクエリの変換についてさらにご質問がある場合は、いつでもお気軽にお問い合わせください。