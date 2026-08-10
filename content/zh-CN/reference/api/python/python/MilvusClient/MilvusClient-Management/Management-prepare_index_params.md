---
title: "prepare_index_params() | Python | MilvusClient"
slug: /python/python/Management-prepare_index_params
sidebar_label: "prepare_index_params()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于准备索引参数，以便为特定 Collection 构建索引。 | Python | MilvusClient"
type: docx
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 11
keywords: 
  - milvus Database
  - milvus lite
  - milvus benchmark
  - 托管 milvus
  - zilliz
  - zilliz cloud
  - 云
  - prepare_index_params()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# prepare_index_params()

此操作用于准备索引参数，以便为特定 Collection 构建索引。

<Admonition type="info" icon="📘" title="Notes">

此方法仅适用于 Dedicated 服务集群和按需计算。

- 如果要在服务集群的 Collection 中执行此操作，请使用集群 Endpoint 创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 如果要在按需计算的 Collection 中执行此操作，请使用项目 Endpoints 创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话，将其附加到按需集群以执行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
pymilvus.MilvusClient.prepare_index_params() -> IndexParams
```

**参数：**

N/A

**返回类型：**

*IndexParams*

**返回值：**

**IndexParams** 包含一个 **IndexParam** 对象列表。

- **IndexParams**

    **IndexParam** 对象列表。

    ```python
    ├── IndexParams 
    │       └── add_index()
    ```

    它提供 **[add_index()](./Management-add_index)** 方法，用于向列表中添加索引。

**异常：**

无

## 示例\{#examples}

```python
from pymilvus import MilvusClient

index_params = MilvusClient.prepare_index_params()
```

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

