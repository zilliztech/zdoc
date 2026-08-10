---
title: "query() | Python | MilvusClient"
slug: /python/python/Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用指定的布尔表达式执行标量过滤。 | Python | MilvusClient"
type: docx
token: ShzCdNgEGozKi3xa3lUcHpxQnaf
sidebar_position: 4
keywords: 
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - zilliz
  - zilliz cloud
  - 云
  - query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# query()

此操作使用指定的布尔表达式执行标量过滤。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 服务集群和按需计算。

- 如果要在服务集群的 Collection 中执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如果要在按需计算的 Collection 中执行此操作，请使用项目 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以附加到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
query(
    collection_name: str,
    filter: str,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> List[dict]
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

- **filter** (*str*) -

    **[必需]**

    用于过滤匹配 Entity 的标量过滤条件。

    您可以将此参数设置为空字符串以跳过标量过滤。要构建标量过滤条件，请参阅 [Filtering Overview](/docs/filtering-overview)。

- **output_fields** (*list[str]* | *None*) -

    返回时要包含在每个 Entity 中的字段名称列表。

    默认值为 **None**。

    <Admonition type="info" icon="📘" title="Notes">

    - 将其设置为 `output_fields=["\*"]` 时，会输出所有字段。
    
    - 将其设置为 `output_fields=["count(\*)"]` 时，会输出与 **filter** 参数中指定条件匹配的已加载 Entity。
    
    - 与 `group_by_fields` 一起使用时，此列表还接受聚合表达式：`count(*)`、`count(<field>)`、`min(<field>)`、`max(<field>)`、`sum(<field>)` 和 `avg(<field>)`。聚合值会按组计算，并与组键一同返回。

    </Admonition>

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当任意响应到达或发生任意错误时，此操作即超时。

- **partition_names** (*list[str]* | *None*) -

    Partition 名称列表。

    默认值为 **None**。如果指定，则仅在指定的 Partition 中执行查询。

- **kwargs** -

    - **consistency_level** (*str* | *int*) -

        目标 Collection 的一致性级别。

        默认值为您创建当前 Collection 时指定的值，可选项包括 **Strong** (**0**)、**Bounded** (**1**)、**Session** (**2**) 和 **Eventually** (**3**)。

        <Admonition type="info" icon="📘" title="Note">

        什么是一致性级别？
        
                在分布式 Database 中，一致性特指这样一种属性：在给定时刻写入或读取数据时，确保每个节点或副本看到的数据视图相同。
        
                Zilliz Cloud 提供三种一致性级别：**Strong**、**Bounded Staleness** 和 **Eventually**，其中默认值为 **Bounded Staleness**。
        
                在执行向量相似性搜索或查询时，您可以轻松调整一致性级别，使其更适合您的应用。

        </Admonition>

    - **guarantee_timestamp** (*int*) -

        一个有效的时间戳。

        如果设置了此参数，则  仅在此时间戳之前插入的所有 Entity 对查询节点可见时才会执行查询。

        <Admonition type="info" icon="📘" title="Notes">

        此参数在使用默认一致性级别时有效。

        </Admonition>

    - **graceful_time** (*int*) -

        以秒为单位的一段时间。

        默认值为 **5**。如果设置了此参数，则  会通过从当前时间戳中减去该值来计算 guarantee timestamp。

        <Admonition type="info" icon="📘" title="Notes">

        此参数在使用非默认一致性级别时有效。

        </Admonition>

    - **offset** (*int*) -

        查询结果中要跳过的记录数。

        您可以将此参数与 `limit` 结合使用以启用分页。

        此值与 `limit` 的总和应小于 16,384。

    - **limit** (*int*) -

        查询结果中要返回的记录数。

        您可以将此参数与 `offset` 结合使用以启用分页。

        此值与 `offset` 的总和应小于 16,384。

    - **timezone** (*str*)

        通过设置一个 [IANA identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)（例如 **Asia/Shanghai**, **America/Chicago**, 或 **UTC**），可在单次查询中临时覆盖 Collection 或 Database 的默认时区。这仅控制该操作期间如何解释、显示和比较 `TIMESTAMPTZ` 值；不会修改存储的数据或 Collection 设置。

        更多信息，请参阅 [TIMESTAMPZ Field](/docs/use-timestamptz-field)。

    - **time_fields** (*str*)

        在查询或搜索操作期间，从 `TIMESTAMPTZ` 字段中提取特定时间组成部分。请使用逗号分隔的列表指定要提取的元素。支持的元素包括：`year`、`month`、`day`、`hour`、`minute`、`second` 和 `microsecond`。

        更多信息，请参阅 TIMESTAMPZ Field。

    - **order_by** (*list[str]*)

        按查询结果排序的字段列表。每个元素都遵循格式 `"field_name:direction"`，其中 direction 可以是 `asc`（升序）或 `desc`（降序）。请注意，`asc` 和 `desc` 区分大小写。

        支持的字段类型：INT8、INT16、INT32、INT64、FLOAT、DOUBLE 和 VARCHAR。不支持按向量、JSON 或 ARRAY 字段排序。

        此参数必须与 `limit` 一起使用。对可为空字段排序时，升序排序会将 NULL 值放在末尾（NULLS LAST），降序排序会将 NULL 值放在开头（NULLS FIRST）。

    - **group_by_fields** (*list[str]*) -

        按查询结果分组的标量字段列表。设置后，`query()` 会针对指定字段值的每个唯一组合返回一行，并按组计算 `output_fields` 中的任意聚合表达式（`count(*)`、`count(<f>)`、`min(<f>)`、`max(<f>)`、`sum(<f>)`、`avg(<f>)`）。

        支持的字段类型：INT8、INT16、INT32、INT64、FLOAT、DOUBLE、VARCHAR 和 TIMESTAMPTZ。按向量、JSON 或 Array 字段分组会返回错误。

        聚合类型规则：

        - `sum` 和 `avg` 仅适用于数值类型。将它们应用于 `VarChar` 字段会返回错误。

        - `sum(int*)` 返回 `INT64`；`sum(float|double)` 返回 `DOUBLE`；`avg(...)` 始终返回 `DOUBLE`；`count(...)` 返回 `INT64`；`min`/`max` 保留列类型。

        您可以将 `group_by_fields` 与 `limit` 结合使用，以限制返回的组数。

**返回类型：**

*list[dict]*

**返回：**

字典列表，其中每个字典表示一个查询到的 Entity。

<Admonition type="info" icon="📘" title="Notes">

如果返回的 Entity 数量少于预期，则您的 Collection 中可能存在重复 Entity。

</Admonition>

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

- **DataTypeNotMatchException**

    当参数值与所需数据类型不匹配时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection and a partition
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

client.create_partition(
    collection_name="test_collection",
    partition_name="partitionA"
)

# 3. Insert data
client.insert(
    collection_name="test_collection",
    data=[
         {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
         {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
         {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
         {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
         {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
         {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
         {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
         {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
         {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
         {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
     ],
)

# {'insert_count': 10}

# 4. Conduct queries

# Query without any scalar filtering condition
# This query returns entities with their ids from 0 to 4.
res = client.query(
    collection_name="test_collection",
    filter="",
    limit=5,
) 

print(res)

# [{'id': 0,
#   'vector': [0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385],
#   'color': 'pink_8682'},
#  {'id': 1,
#   'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295],
#   'color': 'red_7025'},
#  {'id': 2,
#   'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794],
#   'color': 'orange_6781'},
#  {'id': 3,
#   'vector': [0.3172005, 0.97190446, -0.36981148, -0.48608947, 0.9579189],
#   'color': 'pink_9298'},
#  {'id': 4,
#   'vector': [0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748],
#   'color': 'red_4794'}]

# Query with pagination
# This query returns entities with their ids from 5 to 9.
res = client.query(
    collection_name="test_collection",
    filter="",
    offset=5,
    limit=5
)

print(res)

# [{'vector': [0.9858251, -0.81446517, 0.6299267, 0.12069069, -0.14462778],
#   'color': 'yellow_4222',
#   'id': 5},
#  {'vector': [0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948],
#   'color': 'red_9392',
#   'id': 6},
#  {'vector': [-0.33445147, -0.2567135, 0.898754, 0.9402996, 0.5378065],
#   'color': 'grey_8510',
#   'id': 7},
#  {'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361],
#   'color': 'white_9381',
#   'id': 8},
#  {'vector': [0.57182807, 0.24070318, -0.37379134, -0.067269325, -0.6980532],
#   'color': 'purple_4976',
#   'id': 9}]

# Query with a scalar filtering condition
res = client.query(
    collection_name="test_collection",
    filter="id in [6,7,8]",
)

print(res)

# [{'vector': [0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948],
#   'color': 'red_9392',
#   'id': 6},
#  {'vector': [-0.33445147, -0.2567135, 0.898754, 0.9402996, 0.5378065],
#   'color': 'grey_8510',
#   'id': 7},
#  {'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361],
#   'color': 'white_9381',
#   'id': 8}]

# Query within a partition
res = client.query(
    collection_name="test_collection",
    filter="id in [6,7,8]",
    partition_names=["partitionA"],
)

# []

# Query with specified output fields
res = client.query(
    collection_name="test_collection",
    filter="id in [6,7,8]",
    output_fields=["id", "vector"],
)

print(res)

# [{'id': 6,
#   'vector': [0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948]},
#  {'id': 7,
#   'vector': [-0.33445147, -0.2567135, 0.898754, 0.9402996, 0.5378065]},
#  {'id': 8,
#   'vector': [0.3952472, 0.40002573, -0.5890507, -0.86505026, -0.6140361]}]

# Query with a customized consistency level
res = client.query(
    collection_name="test_collection",
    filter="",
    limit=5,
    consistency_level=3,
    graceful_time=6
)

print(res)

# [{'color': 'pink_8682',
#   'id': 0,
#   'vector': [0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385]},
#  {'color': 'red_7025',
#   'id': 1,
#   'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295]},
#  {'color': 'orange_6781',
#   'id': 2,
#   'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794]},
#  {'color': 'pink_9298',
#   'id': 3,
#   'vector': [0.3172005, 0.97190446, -0.36981148, -0.48608947, 0.9579189]},
#  {'color': 'red_4794',
#   'id': 4,
#   'vector': [0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748]}]

# Query with outputting all fields
res = client.query(
    collection_name="test_collection",
    filter="id < 5",
    output_fields=["*"]
)

# [{'vector': [0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385],
#   'color': 'pink_8682',
#   'id': 0},
#  {'vector': [0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295],
#   'color': 'red_7025',
#   'id': 1},
#  {'vector': [0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794],
#   'color': 'orange_6781',
#   'id': 2},
#  {'vector': [0.3172005, 0.97190446, -0.36981148, -0.48608947, 0.9579189],
#   'color': 'pink_9298',
#   'id': 3},
#  {'vector': [0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748],
#   'color': 'red_4794',
#   'id': 4}]

# Count the loaded entities that match specific conditions
res = client.query(
    collection_name="test_collection",
    filter="color like \"red_%\"",
    output_fields=["count(*)"]
)

# [{'count(*)': 3}]
```

