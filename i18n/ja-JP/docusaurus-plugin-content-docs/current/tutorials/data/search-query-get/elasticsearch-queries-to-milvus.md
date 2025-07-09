---
title: "ElasticsearchからMilvusへのクエリ | Cloud"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "ElasticsearchからMilvusへのクエリ"
beta: FALSE
notebook: FALSE
description: "Apache Lucene上に構築されたElasticsearchは、主要なオープンソースの検索エンジンです。しかし、高い更新コスト、低いリアルタイムパフォーマンス、非効率なシャード管理、非クラウドネイティブの設計、過剰なリソース要求など、現代のAIアプリケーションには課題があります。クラウドネイティブのベクトルデータベースであるMilvusは、分離されたストレージとコンピューティング、高次元データの効率的なインデックス作成、現代のインフラストラクチャとの滑らかな統合により、これらの問題を克服しています。AIワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。 | Cloud"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 12
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - elasticsearch queries
  - query mapping
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';


# ElasticsearchからMilvusへのクエリ

Apache Lucene上に構築されたElasticsearchは、主要なオープンソースの検索エンジンです。しかし、高い更新コスト、低いリアルタイムパフォーマンス、非効率なシャード管理、非クラウドネイティブの設計、過剰なリソース要求など、現代のAIアプリケーションには課題があります。クラウドネイティブのベクトルデータベースであるMilvusは、分離されたストレージとコンピューティング、高次元データの効率的なインデックス作成、現代のインフラストラクチャとの滑らかな統合により、これらの問題を克服しています。AIワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。

この記事は、ElasticsearchからMilvusへのコードベースの移行を容易にすることを目的としており、その間にクエリを変換するさまざまな例を提供しています。

## 概要について{#overview}

Elasticsearchでは、クエリコンテキスト内の操作は関連性スコアを生成しますが、フィルターコンテキスト内の操作は生成しません。同様に、Milvus検索は類似性スコアを生成しますが、フィルターのようなクエリは生成しません。ElasticsearchからMilvusにコードベースを移行する際の重要な原則は、Elasticsearchのクエリコンテキストで使用されるフィールドをベクトルフィールドに変換して類似性スコアを生成することです。 

以下の表は、いくつかのElasticsearchクエリパターンとMilvusでの対応するものを概説しています。

<table>
   <tr>
     <th><p>Elasticsearchクエリ</p></th>
     <th><p>ミルバス当量</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>全文クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">一致クエリ</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>両方とも似たような機能セットを提供しています。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>用語レベルのクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">ID</a></p></td>
     <td><p><code>in</code>オペレーター</p></td>
     <td rowspan="6"><p>これらのElasticsearchクエリがフィルターコンテキストで使用される場合、両方とも同じまたは類似した機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">プレフィックスクエリ</a></p></td>
     <td><p><code>like</code>オペレーター</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">範囲クエリ</a></p></td>
     <td><p><code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code>などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">用語クエリ</a></p></td>
     <td><p><code>==</code>のような比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">用語クエリ</a></p></td>
     <td><p><code>in</code>オペレーター</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">ワイルドカードクエリー</a></p></td>
     <td><p><code>like</code>オペレーター</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">ブールクエリ</a></p></td>
     <td><p><code>AND</code>のような論理演算子</p></td>
     <td><p>フィルターコンテキストで使用する場合、両方とも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクトルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNNクエリ</a></p></td>
     <td><p>検索する</p></td>
     <td><p>Milvusはより高度なベクトル検索機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">相互ランクフュージョン</a></p></td>
     <td><p>ハイブリッド検索</p></td>
     <td><p>ミルバスは複数の再ランキング戦略をサポートしています。</p></td>
   </tr>
</table>

## 全文クエリー{#full-text-queries}

Elasticsearchでは、フルテキストクエリを使用して、電子メールの本文などの分析されたテキストフィールドを検索できます。クエリ文字列は、インデックス作成時にフィールドに適用された同じアナライザを使用して処理されます。

### 一致クエリ{#match-query}

Elasticsearchでは、一致クエリは、提供されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。提供されたテキストは、一致する前に分析されます。 

以下は、一致クエリを使用したElasticsearch検索リクエストの例です。

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

Milvusは全文検索機能を通じて同じ機能を提供します。上記のElasticsearchクエリを以下のようにMilvusに変換できます。

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

上記の例では、`message_sparse`は、`message`というVarCharフィールドから派生した疎ベクトルフィールドです。Milvusは、BM 25埋め込みモデルを使用して、`message`フィールドの値を疎ベクトル埋め込みに変換し、`message_sparse`フィールドに格納します。検索リクエストを受信すると、Milvusは同じBM 25モデルを使用してプレーンテキストクエリペイロードを埋め込み、疎ベクトル検索を実行し、`output_fields`パラメータで指定された`id`および`message`フィールドと対応する類似度スコアを返します。

この機能を使用するには、`message`フィールドでアナライザを有効にし、`message_sparse`フィールドを派生させる関数を定義する必要があります。Milvusでアナライザを有効にし、派生関数を作成する詳細な手順については、[フルテキスト検索](./full-text-search)を参照してください。

## 用語レベルのクエリ{#term-level-queries}

Elasticsearchでは、日付範囲、IPアドレス、価格、製品IDなどの構造化データ内の正確な値に基づいてドキュメントを検索するために用語レベルのクエリが使用されます。このセクションでは、Milvusの一部のElasticsearch用語レベルのクエリの可能な相当物について説明します。このセクションのすべての例は、Milvusの機能に合わせてフィルタコンテキスト内で動作するように適応されています。

### ID{#ids}

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

Milvusでは、以下のようにIDに基づいてエンティティを見つけることもできます。

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

[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html)でElasticsearchのサンプルを見つけることができます。QueryやGetリクエスト、Milvusのフィルター式の詳細については、[クエリ](./get-and-scalar-query)と[フィルタリング](./filtering)を参照してください。

### プレフィックスクエリ{#prefix-query}

Elasticsearchでは、指定されたフィールドに特定のプレフィックスを含むドキュメントを、次のようにフィルターコンテキストで検索できます。

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

Milvusでは、以下のように指定された接頭辞で始まる値を持つエンティティを見つけることができます:

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

Elasticsearchのサンプルは[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html)にあります。Milvusの`like`演算子の詳細については、[使用する ](./basic-filtering-operators#example-2-using-inlinecodeplaceholder0-for-pattern-matching) `LIKE` [ パターンマッチング](./basic-filtering-operators#example-2-using-inlinecodeplaceholder0-for-pattern-matching)を参照してください。

### 範囲クエリ{#range-query}

Elasticsearchでは、指定された範囲内の用語を含むドキュメントを次のように検索できます。

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

Milvusでは、特定のフィールドの値が指定された範囲内にあるエンティティを次のように見つけることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

Elasticsearchのサンプルは[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)にあります。Milvusの比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators)を参照してください。

### 用語クエリ{#term-query}

Elasticsearchでは、提供されたフィールドに**正確な**用語を含むドキュメントを次のように検索できます。

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

Milvusでは、指定されたフィールドの値が指定された用語と完全に一致するエンティティを次のように見つけることができます。

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

Elasticsearchのサンプルは[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html)にあります。Milvusの比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators)を参照してください。

### 用語クエリ{#terms-query}

Elasticsearchでは、提供されたフィールドに1つ以上の**正確な**用語を含むドキュメントを次のように検索できます。

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

Milvusはこれと完全に同等ではありません。ただし、指定されたフィールドの値が指定された項のいずれかであるエンティティを次のように見つけることができます:

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

Elasticsearchのサンプルは[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html)にあります。Milvusの範囲演算子の詳細については、[レンジ演算子](./basic-filtering-operators#range-operators)を参照してください。

### ワイルドカードクエリー{#wildcard-query}

Elasticsearchでは、次のようにワイルドカードパターンに一致する用語を含むドキュメントを見つけることができます。

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

Milvusはフィルタリング条件でワイルドカードをサポートしていません。しかし、`like`演算子を使用することで、以下のような効果を得ることができます。

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

Elasticsearchのサンプルは[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html)にあります。Milvusの範囲演算子の詳細については、[レンジ演算子](./basic-filtering-operators#range-operators)を参照してください。 

## ブールクエリ{#boolean-query}

Elasticsearchでは、ブールクエリは、他のクエリのブール組み合わせに一致するドキュメントに一致するクエリです。 

次の例は、[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)に関するElasticsearchドキュメントの例から適応されています。クエリは、`production`タグを持つ`kimchy`を名前に持つユーザーを返します。

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

Milvusでは、以下のように同様のことができます。

```python
filter = 

res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

上記の例は、ターゲットコレクションに**VarChar**タイプの`user`フィールドと**Array**タイプの`tags`フィールドがあることを前提としています。クエリは、`production`タグを持つ`kimchy`を名前に持つユーザーを返します。

## ベクトルクエリ{#vector-queries}

Elasticsearchにおいて、ベクトルクエリはベクトルフィールドに対して機能する特殊なクエリであり、セマンティック検索を効率的に実行します。

### Knnクエリ{#knn-query}

Elasticsearchは、近似kNNクエリと正確なブルートフォースkNNクエリの両方をサポートしています。以下のように、類似性メトリックによって測定されたクエリベクトルに最も近い*k*ベクトルをどちらの方法でも見つけることができます:

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

Milvusは、専門的なベクトルデータベースとして、インデックスタイプを使用してベクトル検索を最適化しています。通常、高次元ベクトルデータに対して近似最近傍(ANN)検索を優先します。FLATインデックスタイプを使用したブルートフォースkNN検索は正確な結果を提供しますが、時間とリソースがかかります。一方、AUTOINDEXやその他のインデックスタイプを使用したANN検索は、kNNよりも速度と精度をバランス良く保ち、大幅に高速かつリソース効率の高いパフォーマンスを提供します。インデックスの種類とAUTOINDEXの詳細については、[インデックスの管理](./manage-indexes)と[AUTOINDEXの説明](./autoindex-explained)を参照してください。

Mlivusにおける上記のベクトルクエリと同様の等価性は、次のようになります:

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector"
    data=[[-5, 9, -12]],
    limit=10
)
```

Elasticsearchのサンプルは[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html)にあります。MilvusでのANN検索の詳細については、[基本的なANN検索](./single-vector-search)を参照してください。

### 相互ランクフュージョン{#reciprocal-rank-fusion}

Elasticsearchは、異なる関連性指標を持つ複数の結果セットを単一のランク付けされた結果セットに結合するための相互ランクフュージョン（RRF）を提供しています。

次の例は、従来の用語ベースの検索とk最近傍(kNN)ベクトル検索を組み合わせて、検索の関連性を向上させる方法を示しています

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

この例では、RRFは2つのレトリーバーの結果を組み合わせています。

- `text`フィールドに`"shoes"`という用語を含むドキュメントの標準的な用語ベースの検索。

- 提供されたクエリベクトルを使用して、`vector`フィールドでkNN検索を行います。

各レトリーバーは最大50のトップマッチに貢献し、RRFによって再ランク付けされ、最終的なトップ10の結果が返されます。

Milvusでは、複数のベクトル場を横断する検索を組み合わせ、再ランキング戦略を適用し、結合されたリストからトップKの結果を取得することで、同様のハイブリッド検索を実現できます。MilvusはRRF戦略と重み付け再ランキング戦略の両方をサポートしています。詳細については、[リランキング](./reranking)を参照してください。

以下は、Milvusにおける上記のElasticsearchの例の厳密でない等価性です。

```python
search_params_dense = {
    "data": [[1.25, 2, 3.5]],
    "anns_field": "vector",
    "param": {
        "metric_type": "IP",
        "params": {"nprobe": 10}, 
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

この例は、Milvusで組み合わせたハイブリッド検索を示しています

1. 密集ベクトル検索: `nprobe`を10に設定した内積(IP)メトリックを使用して、`vector`フィールドで近似最近傍(ANN)検索を行います。

1. **スパースベクトル検索**: `text_sparse`フィールドの`drop_ratio_search`パラメータが0.2のBM 25類似度メトリックを使用します。

これらの検索の結果は別々に実行され、結合され、相互ランクフュージョン(RRF)ランカーを使用して再ランク付けされます。ハイブリッド検索は、再ランク付けされたリストからトップ10のエンティティを返します。

ElasticsearchのRRFランキングは、標準的なテキストベースのクエリとkNN検索の結果を統合しますが、Milvusは疎なベクトル検索と密なベクトル検索の結果を組み合わせ、マルチモーダルデータに最適化されたユニークなハイブリッド検索機能を提供します。

## まとめ{#recap}

この記事では、用語レベルのクエリ、ブールクエリ、全文クエリ、ベクトルクエリを含む、典型的なElasticsearchクエリのMilvus相当への変換について説明しました。他のElasticsearchクエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。