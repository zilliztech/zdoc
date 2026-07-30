---
title: "describe_index() | Python | MilvusClient"
slug: /python/python/Management-describe_index
sidebar_label: "describe_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作描述指定索引。 | Python | MilvusClient"
type: docx
token: WhsHdyIgyoFlsQxNJt9cFCTxnDe
sidebar_position: 4
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - describe_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_index()

此操作描述指定索引。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专用服务集群和按需计算。 

- 对于服务集群中的集合上的此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的集合上的此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以附加到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
describe_index(
    collection_name: str,
    index_name: str,
    timeout: Optional[float] = None
) -> Dict
```

**参数：**

- **collection_name** (*str*) -

    **[REQUIRED]**

    现有集合的名称。

    将其设置为不存在的集合会导致 **MilvusException**。

- **index_name** (*str*) -

    **[REQUIRED]**

    要描述的索引名称。

    将其设置为不存在的集合会导致 **MilvusException**。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作超时。

**返回类型：** 

*Dict*

**返回：**

包含指定索引详细信息的字典。

```python
{
    'index_type': 'AUTOINDEX',
    'metric_type': 'IP',
    'M': 32,
    'efConstruction': 360,
    'total_rows': 0,
    'indexed_rows': 0,
    'pending_index_rows': 0,
    'state': 'Finished',
    'field_name': 'my_vector',
    'index_name': 'my_vector'
}
```

**参数：**

- **index_type** (*str*) -

    用于构建索引的算法。 

    在 Zilliz Cloud 上，该值始终为 **AUTOINDEX**。详情请参见 [AUTOINDEX Explained](/docs/autoindex-explained)。

- **metric_type** (*str*) -

    用于衡量向量之间相似度的算法。可能的值包括 **IP**、**L2** 和 **COSINE**。

    仅当指定字段是向量字段时，此项可用。 

- **total_rows** (*int*) -

    此索引目标字段中的行数。

- **indexed_rows** (*int*) -

    此索引目标字段中已建立索引的行数。

- **pending_index_rows** (*int*) -

    指定字段中待建立索引的行数。

- **state** (*str*) -

    索引构建过程的状态。

- **field_name** (*str*) -

    创建索引所基于的字段名称。

- **index_name** (*str*) -

    已创建索引的名称。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=False,
)

# 2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3. Create index parameters
index_params = client.prepare_index_params()

# 4. Add indexes
# - For a scalar field
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

# - For a vector field
index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="L2",
    params={"nlist": 1024}
)

# 5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema
)

# 6. Create indexes
client.create_index(
    collection_name="customized_setup",
    index_params=index_params
)

# 6. List indexes
client.list_indexes(collection_name="customized_setup")

# ['my_id', 'my_vector']

# 7. Describe the indexes
client.describe_index(
    collection_name="customized_setup",
    index_name="my_vector"
)

# {
#     'index_type': 'AUTOINDEX',
#     'metric_type': 'L2',
#     'field_name': 'my_vector',
#     'index_name': 'my_vector'
# }

client.describe_index(
    collection_name="customized_setup",
    index_name="my_id"    
)

# {
#     'index_type': 'STL_SORT',
#     'field_name': 'my_id', 
#     'index_name': 'my_id'
# }
```

## 相关方法\{#related-methods}

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

