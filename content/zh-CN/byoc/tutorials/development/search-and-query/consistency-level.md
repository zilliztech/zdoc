---
title: "一致性水平 | BYOC"
slug: /consistency-level
sidebar_label: "一致性水平"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "作为一款分布式向量数据库，Zilliz Cloud 提供了多种一致性水平来确保在数据读写期间每个节点或副本都能获取到相同的数据。当前，支持使用的一致性水平包括 Strong、Bounded、Eventually 。其中，Bounded 是默认使用的一致性水平。 | BYOC"
type: origin
token: IJhRwKG2Qi8m1skZoD7ckUkxnBe
sidebar_position: 21
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 一致性水平

作为一款分布式向量数据库，Zilliz Cloud 提供了多种一致性水平来确保在数据读写期间每个节点或副本都能获取到相同的数据。当前，支持使用的一致性水平包括 **Strong**、**Bounded**、**Eventually** 。其中，**Bounded** 是默认使用的一致性水平。

## 概述\{#overview}

Zilliz Cloud 是一个存储计算分离的系统。其中，DataNodes 负责数据的数据的持久化，并最终将数据落实到 MinIO/S3 之类的分布式对象存储中。QueryNodes 负责 Search 之类的计算任务。这些任务会涉及批式数据和流式数据的处理。简单来说，批式数据可以被理解为已经落实到对象存储中的数据，而流式数据可以被理解为尚未落实到对象存储中的数据。由于网络时延的关系，QueryNodes 往往并不会持有最新的流式数据。在没有其它保障的情况下，直接在流式数据上做 Search 会损失许多尚未落实的数据，影响搜索结果的精度。

![URlRwSlh9hGEBPbbUqAc3ObKn4f](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/URlRwSlh9hGEBPbbUqAc3ObKn4f.png)

如上图所示，QueryNodes 在收到 Search 请求后，可以同时获得流式数据和批式数据。但是 QueryNodes 获取到的流式数据因为网络时延的关系，可能会有缺失。

为了解决这个问题，Zilliz Cloud 会为数据队列中的每条记录都打上一个时间戳，并不间断地向数据队列中插入同步时间戳。每当收到同步时间戳时， QueryNodes 就将其设置为 Service Time，意味着 QueryNodes 能看到该 Service Time 之前的所有数据。基于 ServiceTime， Zilliz Cloud 就能够根据不同用户对一致性以及可用性的需求向外提供保证时间戳 （GuaranteeTs）。用户可以通过在 Search 请求中指定 GuaranteeTs 的方式告知 QueryNodes 其必须要将指定时间点前的数据纳入搜索范围。 

![F8hbbpcC4o6C2yxElIYc4CG7nVg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/f8hbbpcc4o6c2yxeliyc4cg7nvg.png "F8hbbpcC4o6C2yxElIYc4CG7nVg")

如上图所示，如果 GuaranteeTs 小于 ServiceTime，意味着指定时间点前的数据已经全部落盘，QueryNodes 可以立即执行 Search 操作。当 GuaranteeTs 大于 ServiceTime 时，QueryNodes 必须等待直至 ServiceTime 大于 GuaranteeTs 时才能执行 Search 操作。

用户需要在查询精度和查询时延间做出取舍。如果用户对一致性有较高要求，而对查询时延不敏感，可以将 GuaranteeTs 设置成一个尽可能大的值；如果用户希望尽快得到搜索结果，而对查询精度有较高的容忍程度，那么 GuaranteeTs 可以设置为一个较小值。

在 Zilliz Cloud 中，不同的 GuaranteeTs 分别对应四种不同的一致性水平。

![T7m4bdc9TooFcmxzZM0cOqj0nqh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/t7m4bdc9toofcmxzzm0coqj0nqh.png "T7m4bdc9TooFcmxzZM0cOqj0nqh")

- **强一致性（Strong Consistency）**

    GuaranteeTs 设为系统最新时间戳，QueryNodes 需要等待 ServiceTime 推进到当前最新时间戳才能执行该 Search 请求；

- **最终一致性（Eventual Consistency）**

    GuaranteeTs 设为一个特别小的值（比如说设为 1），跳过一致性检查，立刻在当 前已有数据上执行 Search 查询；

- **有界一致性（Bounded Staleness）**

    GuaranteeTs 是一个比系统最新时间稍微靠前的时间（Graceful Time），在可容忍范围内可以立刻执行查询；

其中， Zilliz Cloud 默认提供有界一致性，如果用户不传入 GuaranteeTs，那么会将 GuaranteeTs 设为 Service Time 最新时间戳。

## 设置一致性水平\{#set-consistency-level}

您可以在创建 Collection 时指定在该 Collection 中进行搜索和查询时使用的一致性水平。您还可以在 Search 和 Query 请求中指定不同的一致性水平。

### 在创建 Collection 中指定一致性水平\{#set-consistency-level-upon-creating-collection}

在创建 Collection 时，您可以指定在该 Collection 中进行搜索和查询时使用的一致性水平。如下示例将 Collection 的一致性水平设置为 **Bounded**。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="my_collection",
    schema=schema,
    # highlight-next-line
    consistency_level="Bounded",
)
```

</TabItem>

<TabItem value='java'>

```java
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
        .collectionName("my_collection")
        .collectionSchema(schema)
        // highlight-next-line
        .consistencyLevel(ConsistencyLevel.Bounded)
        .build();
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.CreateCollection(ctx,
    milvusclient.NewCreateCollectionOption("my_collection", schema).
        WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
        "autoId": true,
        "enabledDynamicField": false,
        "fields": [
            {
                "fieldName": "id",
                "dataType": "Int64",
                "isPrimary": true
            },
            {
                "fieldName": "vector",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "5"
                }
            },
            {
                "fieldName": "my_varchar",
                "dataType": "VarChar",
                "isClusteringKey": true,
                "elementTypeParams": {
                    "max_length": 512
                }
            }
        ]
    }'

export params='{
    "consistencyLevel": "Bounded"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"collectionName\": \"my_collection\",
    \"schema\": $schema,
    \"params\": $params
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateCollection(milvus::CreateSimpleCollectionRequest()
                                          .WithCollectionName("my_collection")
                                          .WithCollectionSchema(schema)
                                          .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

参数 `consistency_level` 可用的取值为 `Strong`、`Bounded`、`Eventually`、`Session`。

### 在 Search 时指定一致性水平\{#set-consistency-level-in-search}

您可以在某个具体的 Search 请求中修改需要使用的一致性水平。如下示例将当前 Search 请求使用的一致性水平设置为 Customized，并指定了 QueryNodes 在执行该 Search 请求时需要参考的 GuaranteeTs。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    limit=3
    # highlight-start
    consistency_level="Bounded",
    # highlight-next
)
```

</TabItem>

<TabItem value='java'>

```java
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .searchParams(params)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClBounded).
    WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "limit": 3,
    "consistencyLevel": "Bounded"
}'
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                           .WithCollectionName("my_collection")
                           .WithLimit(3)
                           .AddFloatVector(std::move(query_vector))
                           .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

此参数在 Hybrid Search 和 Search Iterator 中也可以使用。参数 `consistency_level` 可用的取值为`Strong`、`Bounded`、`Eventually`、`Session` 和 `Customized`。

### 在 Query 时指定一致性水平\{#set-consistency-level-in-query}

您可以在某个具体的 Query 请求中修改使用的一致性水平。如下示例将当前 Query 请求使用的一致性水平设置为 Customized，并指定了 QueryNodes 在执行该 Query 请求时需要参考的 GuaranteeTs。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3，
    # highlight-start
    consistency_level="Bounded",
    # highlight-next
)
```

</TabItem>

<TabItem value='java'>

```java
QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("vector", "color"))
        .limit(3)
        .consistencyLevel(ConsistencyLevel.Bounded)
        .build();
        
 QueryResp getResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("color like \"red%\"").
    WithOutputFields("vector", "color").
    WithLimit(3).
    WithConsistencyLevel(entity.ClBounded))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "color like \"red_%\"",
    "consistencyLevel": "Bounded",
    "limit": 3
}'
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .WithFilter(R"(color like "red%")")
                       .WithLimit(3)
                       .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

此参数在 Query Iterator 中也可以使用。参数 `consistency_level` 可用的取值为`Strong`、`Bounded`、`Eventually`。