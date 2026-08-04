---
title: "prepare_index_params() | Python | MilvusClient"
slug: /python/python/Management-prepare_index_params
sidebar_label: "prepare_index_params()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于准备索引参数，以便为特定集合构建索引。 | Python | MilvusClient"
type: docx
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 11
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - prepare_index_params()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# prepare_index_params()

此操作用于准备索引参数，以便为特定集合构建索引。

<Admonition type="info" icon="📘" title="说明">

此方法仅适用于专有服务集群和按需计算。 

- 对于服务集群中的集合执行此操作，请使用集群端点创建 **[MilvusClient](./Client-MilvusClient)**。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- 对于按需计算中的集合执行此操作，请使用项目端点创建 **[MilvusClient](./Client-MilvusClient)**，然后创建一个会话并将其附加到按需集群以执行搜索。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## 请求语法\{#request-syntax}

```python
pymilvus.MilvusClient.prepare_index_params() -> IndexParams
```

**参数：**

无

**返回类型：**

*IndexParams*

**返回：**

一个 **IndexParams** 包含一组 **IndexParam** 对象。

- **IndexParams**

    一个由 **IndexParam** 对象组成的列表。

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

