---
title: "create_index() | Python | MilvusClient"
slug: /python/python/Management-create_index
sidebar_label: "create_index()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为指定的 Collection 创建索引。 | Python | MilvusClient"
type: docx
token: B3n3db0idoia02xXxJfcONK8nRh
sidebar_position: 3
keywords: 
  - 大语言模型
  - 向量化
  - k 最近邻算法
  - ANNS
  - zilliz
  - zilliz cloud
  - 云
  - create_index()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_index()

此操作为指定的 Collection 创建索引。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated serving 集群和按需计算。

- 要在 serving 集群的 Collection 中执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 要在按需计算的 Collection 中执行此操作，请使用项目 Endpoints 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话以附加到按需集群进行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
create_index(
    collection_name: str,
    index_params: IndexParams,
    timeout: Optional[float] = None,
    **kwargs,    
)
```

**参数：**

- **collection_name** (*str*) -

    **[必需]**

    现有 Collection 的名称。

- **index_params** (*IndexParams*) -

    **[必需]**

    包含 **IndexParam** 对象列表的 **IndexParams** 对象。

- **timeout** (*float* | *None*) -

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作即超时。

- **kwargs** -

    - **sync** (*bool*)

        控制索引构建与客户端请求之间的关系。有效值如下：

        - `True`（默认）：客户端会等待索引完全构建完成后再返回。这意味着在过程完成之前，您不会收到响应。

        - `False`：客户端在请求被接收后立即返回，索引将在后台构建。要确认索引创建是否已完成，请使用 [`describe_index()`](./Management-describe_index) 方法。

**返回类型：**

*NoneType*

**返回值：**

None

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

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
    field_name="my_id"
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
```

## 相关方法\{#related-methods}

- [add_index()](./Management-add_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

- [prepare_index_params()](./Management-prepare_index_params)

