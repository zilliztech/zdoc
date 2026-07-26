---
title: "Elasticsearch 查询语句转换 | BYOC"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch 查询语句转换"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "基于 Apache Lucene 构建的 Elasticsearch 是领先的开源搜索引擎。然而，它在现代 AI 应用程序中面临挑战，包括高更新成本、较差的实时性能、低效的分片管理、非云原生设计以及过度的资源需求。作为云原生向量数据库，Zilliz Cloud 通过解耦的存储和计算、高维数据的高效索引以及与现代基础设施的无缝集成克服了这些问题，并为 AI 工作负载提供了卓越的性能和可扩展性。 | BYOC"
type: origin
token: QOwXwYCBMiR8pQkHDcKcL3z3nDh
sidebar_position: 13
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - query
  - 查询
  - filter
  - 过滤
  - 过滤表达式
  - elasticsearch
  - term-level query
  - match query
  - full-text query
  - mapping to Milvus

---

import Admonition from '@theme/Admonition';


# Elasticsearch 查询语句转换

基于 Apache Lucene 构建的 Elasticsearch 是领先的开源搜索引擎。然而，它在现代 AI 应用程序中面临挑战，包括高更新成本、较差的实时性能、低效的分片管理、非云原生设计以及过度的资源需求。作为云原生向量数据库，Zilliz Cloud 通过解耦的存储和计算、高维数据的高效索引以及与现代基础设施的无缝集成克服了这些问题，并为 AI 工作负载提供了卓越的性能和可扩展性。

本文将为您将代码库从 Elasticsearch 迁移到 Zilliz Cloud 提供各种转换查询的示例。

## 概述\{#overview}

在 Elasticsearch 中，查询上下文中的操作会生成相关性分数，而过滤上下文中的操作则不会。同样，Zilliz Cloud 的搜索操作会生成相似性分数，而其类似过滤器的查询操作则不会。将代码库从 Elasticsearch 迁移到 Zilliz Cloud 时，关键原则是将 Elasticsearch 查询上下文中使用的字段转换为向量字段，以实现相似性分数生成。 

下表罗列了 Elasticsearch 的若干查询模式及其在 Zilliz Cloud 中相应能力。

<table>
   <tr>
     <th><p>Elasticsearch 查询</p></th>
     <th><p>对应的 Zilliz Cloud 查询</p></th>
     <th><p>说明</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Full-text queries</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match query</a></p></td>
     <td><p>全文检索</p></td>
     <td><p>两者提供相同或相似的功能。</p></td>
   </tr>
   <tr>
     <td><p>[Non-scoring match query](./elasticsearch-queries-to-milvus#non-scoring-match-query-equivalent-in-Zilliz Cloud)</p></td>
     <td><p>文本匹配</p></td>
     <td><p>Zilliz Cloud 提供了一个不参与相似性得分的文本匹配能力。该能力与 Elasticsearch 的 match 子句能力相当。</p><p>注意，Elasticsearch 中所有的 match 子句均会产生相似性得分。因此，Elasticsearch 并不存在 Zilliz Cloud 中不输出相似性得分仅进行文本匹配的能力。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Term-level queries</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> operator</p></td>
     <td rowspan="6"><p>当在 Elasticsearch 的过滤器上下文中使用左侧相关子句时，与 Zilliz Cloud 提供提供相同或相似的能力。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Prefix query</a></p></td>
     <td><p><code>like</code> operator</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Range query</a></p></td>
     <td><p>Comparison operators like <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, and <code>&lt;=</code></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">Term query</a></p></td>
     <td><p>Comparison operators like <code>==</code></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">Terms query</a></p></td>
     <td><p><code>in</code> operator</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">Wildcard query</a></p></td>
     <td><p><code>like</code> operator</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">Boolean query</a></p></td>
     <td><p>Logical operators like <code>AND</code></p></td>
     <td><p>当在 Elasticsearch 的过滤器上下文中使用左侧相关子句时，与 Zilliz Cloud 提供提供相同或相似的能力。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Vector queries</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN query</a></p></td>
     <td><p>Search</p></td>
     <td><p>Zilliz Cloud 提供更加高级的向量检索能力。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>Hybrid Search</p></td>
     <td><p>Zilliz Cloud 提供更多结果重排策略。</p></td>
   </tr>
</table>

## 全文查询（Full-text queries）\{#full-text-queries}

在 Elasticsearch 中，全文检索允许您检索经过分析的文本字段，例如电子邮件的正文。这类检索会使用与字段索引相同的分析器，对检索字符串进行处理。

### Match query\{#match-query}

在 Elasticsearch 中，Match 查询会返回与提供的文本、数字、日期或布尔值匹配的文档。提供的文本在匹配之前会经过分析处理。

以下是一个使用 Match 查询的 Elasticsearch 检索请求案例：

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

Zilliz Cloud 通过全文检索功能提供了相同的能力。您可以将上述 Elasticsearch 查询转换为 Zilliz Cloud 查询，如下所示：

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

在上面的示例中，`message_sparse` 是一个从名称为 `message` 的 VarChar 字段，派生出的稀疏向量字段。Zilliz Cloud 使用 BM25 embedding 模型将 `message` 字段中的值，转换为稀疏向量 embedding，并将其存储在 `message_sparse` 字段中。当接收到检索请求时，Zilliz Cloud 使用相同的 BM25 模型，对纯文本查询进行 embedding，并执行稀疏向量检索，同时返回 `output_fields` 参数中指定的 `id` 和 `message` 字段，以及相应的相似度分数。  

要使用此功能，必须在 `message` 字段上启用分析器，并定义一个函数，从中派生出 `message_sparse` 字段。 相关操作，可以参考[全文搜索](./full-text-search)。

### 在Zilliz Cloud 中等效实现非评分 Match 查询\{#non-scoring-match-query-equivalent-in-Zilliz Cloud}

Elasticsearch 不支持非评分的 Match 查询，所有的 Match 查询都会生成相关性得分。然而，在 Zilliz Cloud 中，您可以通过结合使用 `TEXT_MATCH` 操作符，来实现精确的关键词匹配过滤，从而增强向量检索的效果。这种方法可以确保检索结果包含特定词项，从而提高召回率。

```python
# Filter entities whose message value contains the exact terms `Jamaica`
filter = "TEXT_MATCH(message, 'Jamaica')"

# Assuming 'message_vector' is the vector field and 'message' is the VARCHAR field
result = Zilliz CloudClient.search(
    collection_name="my_collection", 
    anns_field="message_vector", 
    data=[[1, -2.5, 3]], # vector embeddings of the phrase `How is the weather in Jamaica?` 
    filter=filter,
    
    limit=10, 
    output_fields=["id", "message"] 
)
```

和在 Match 查询中使用 Zilliz Cloud 生成稀疏向量 embedding 到派生字段不同，上述案例将 `message` 字段中的值转换为稠密向量，并使用 `TEXT_MATCH` 过滤器，来确保检索结果与“Jamaica”密切相关。具体来说，Zilliz Cloud 首先执行文本匹配，分析和过滤 `message` 字段中包含“Jamaica”一词的 Entity，然后在该过滤后的子集中执行向量检索，以提高检索的召回率。

## 词项级查询（Term-level queries）\{#term-level-queries}

在 Elasticsearch 中，词项级查询（Term-Level Queries）是根据结构化数据中的精确值查找文档，例如日期范围、IP 地址、价格或产品 ID。本节将介绍在 Zilliz Cloud 中实现一些 Elasticsearch 词项级查询的等价方法。本节中的所有示例都经过调整，以适应过滤器上下文的操作，以便与 Zilliz Cloud 的功能保持一致。

### IDs\{#ids}

在 Elasticsearch 中，可以在过滤上下文中，基于文档 ID 查找文档，如下所示：

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

在 Zilliz Cloud 中，您也可以根据 Entity 的 ID 进行查找，具体方法如下：

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

您可在[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html)找到 Elasticsearch 的相关示例可。关于如何在 Zilliz Cloud 中执行 Query 和 Get 操作以及过滤表达式的相关内容，可以参考 [Query](./get-and-scalar-query) 和[过滤表达式](./filtering)。

### 前缀查询（Prefix Query）\{#prefix-query}

在 Elasticsearch 中，您可以在过滤上下文中，查找包含特定前缀的指定字段的文档，方法如下：

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

在 Zilliz Cloud 中，您可以查找以指定前缀开头的值的 Entity，方法如下：

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

您可以[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html)找到 Elasticsearch 的相关示例。关于如何在 Zilliz Cloud 搜索和查询中使用 `like` 操作符，可以参考[使用 LIKE 操作符](./basic-filtering-operators#example-2-using-like-for-pattern-matching)一节的相关内容。

### 范围查询（Range query）\{#range-query}

在 Elasticsearch 中，您可以在指定范围内，查找包含指定词项的文档，方法如下：

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

在 Zilliz Cloud 中，您可以在指定范围内，查找有特定字段的值的 Entity，方法如下：

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

您可在[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html)找到 Elasticsearch 的相关操作示例。关于如何在 Zilliz Cloud 搜索和查询中使用比较操作符，可以参考[比较操作符](./basic-filtering-operators#comparison-operators)一节的相关内容。

### 词项查询（Term query）\{#term-query}

在 Elasticsearch 中，您可以在指定字段中，查找含有一个精确术语的文档，方法如下：

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

在 Zilliz Cloud 中，您可以查找指定字段的值完全匹配指定词项的 Entity，方法如下：

```python
res = client.query(
    collection_name="my_collection",
    filter='status == "retired"',
    output_fields=["id", "user", "status"]
)
```

您可在[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html)找到 Elasticsearch 的相关操作示例。关于如何在 Zilliz Cloud 搜索和查询中使用比较操作符，可以参考[比较操作符](./basic-filtering-operators#comparison-operators)一节的相关内容。

### 多词项查询（Terms query）\{#terms-query}

在 Elasticsearch 中，您可以在指定字段中，查找一个或多个精确词项的文档，方法如下：

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

Zilliz Cloud 并没有完全等效的功能。不过，您可以查找在指定字段里的值，属于一个指定词项的 Entity，方法如下：

```python
res = client.query(
    collection_name="my_collection",
    filter='degree in ["graduate", "post-graduate"]',
    output_fields=["id", "user", "degree"]
)
```

您可在[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html)找到 Elasticsearch 的相关操作示例。关于如何在 Zilliz Cloud 搜索和查询中使用比较操作符，可以参考[范围操作符](./basic-filtering-operators#range-operators)一节的相关内容。

### 通配符查询（Wildcard query）\{#wildcard-query}

在 Elasticsearch 中，您可以查找包含与通配符模式匹配的词项的文档，方法如下：

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

Zilliz Cloud 的过滤条件不支持通配符。不过，您可以使用 `LIKE` 操作符来实现类似的效果，方法如下：

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

您可在[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html)找到 Elasticsearch 的相关操作示例。关于如何在 Zilliz Cloud 搜索和查询中使用比较操作符，可以参考[范围操作符](./basic-filtering-operators#range-operators)一节的相关内容。

## 布尔查询（Boolean query）\{#boolean-query}

在 Elasticsearch 中，布尔查询是一种组合查询，包括布尔查询和其他多个查询。

以下例子改编自 Elasticsearch 文档[此页](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html)中的示例，这个查询将返回名称中包含 `kimchy` ，且带有 `production` 标签的结果。

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

在Zilliz Cloud中，您可以做类似的操作，如下：

```python
filter = 

res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

上述例子中，假设目标集合中包含一个 VarChar 类型的 `user` 字段，和一个 Array 类型的 `tags` 字段。该查询将返回一个名称中包含 `kimchy` 且带有 `production` 标签的回复。

## 向量查询（Vector queries）\{#vector-queries}

在 Elasticsearch 中，向量查询是一种专门用于向量字段的查询，可以高效执行语义检索。

### Knn query\{#knn-query}

Elasticsearch 支持近似 kNN 查询和精确的暴力 kNN 查询。您可以根据相似度度量，来找到最近邻的向量 $k$，方法如下：

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

Zilliz Cloud 作为一款专门的向量数据库，使用索引类型来优化向量检索。通常，它优先采用近似最近邻（ANN）检索来处理高维向量数据。虽然使用 `FLAT` 索引类型的暴力 kNN 检索能够提供精确结果，但它既耗时又耗资源。相比之下，使用 `AUTOINDEX` 或其他索引类型的 ANN 检索，能更好地平衡速度和准确性，提供比 KNN 更快的性能，且更节省资源。关于索引类型和 AUTOINDEX 的相关内容，可以参考[管理 Index](./manage-indexes)  和 [AUTOINDEX](./autoindex-explained)。

在 Zilliz Cloud 中，与上述向量查询类似的操作如下：

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector"
    data=[[-5, 9, -12]],
    limit=10
)
```

您可在[此页面](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html)找到 Elasticsearch 的相关操作示例。关于如何在 Zilliz Cloud 搜索和查询中使用比较操作符，可以参考[基本 Vector Search](./single-vector-search) 的相关内容。

### 倒数秩融合（Reciprocal Rank Fusion）\{#reciprocal-rank-fusion}

Elasticsearch 提供了倒数排序融合（Reciprocal Rank Fusion, RRF）功能，可以将具有不同相关性指标的多个结果集，合并为一个排序结果集。  

以下例子展示了如何将传统的基于词项的检索，与 k 近邻（kNN）向量检索相结合，以提高检索的相关性：

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

在这个例子中，RRF 结合了两个检索器的结果：  

- 一个标准的基于词项的检索，用于查找在`text` 字段中包含`"shoes"` 词项的文档。

- 在`vector` 字段上，使用提供的查询向量进行 kNN 检索。

每个检索器最多贡献 50 个匹配项，这些匹配项通过 RRF 重新排序，最终返回前 10 个结果。

在 Zilliz Cloud 中，您可以通过结合多个向量字段的检索、使用重排策略，并从组合列表中检索前 K 个结果，来实现类似的混合检索。Zilliz Cloud 支持 RRF 和加权重排策略。更多内容可以参考 [重排](./reranking)。

以下是上述 Elasticsearch 示例在 Zilliz Cloud 中的非严格等效实现：

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

这个示例演示了 Zilliz Cloud 中的混合检索，它结合了以下两种检索方式：  

1. **稠密向量检索（Dense vector search）**：在`vector`字段上使用内积（IP）度量，以执行近似最近邻（ANN）检索。

1. **稀疏向量检索（Sparse vector search）**：在 `text_sparse` 字段上使用 BM25 相似度度量。

这些检索的结果被分别执行后，通过倒数排序融合（RRF）排序器进行组合和重排。混合检索返回重排列表中的前 10 个 Entity。  

与 Elasticsearch 的 RRF 排序（基于标准文本查询和 kNN 检索的结合）不同，Zilliz Cloud 结合了稀疏向量和稠密向量检索，提供了一种专门优化多模态数据的独特混合检索方法。

## 总结\{#recap}

在本文中，我们介绍了如何将经典的 Elasticsearch 查询，等效地在 Zilliz Cloud 中的进行转换，包括词项级查询、布尔查询、全文查询和向量查询。如果您对转换其他 Elasticsearch 查询有问题，欢迎随时联系我们。

