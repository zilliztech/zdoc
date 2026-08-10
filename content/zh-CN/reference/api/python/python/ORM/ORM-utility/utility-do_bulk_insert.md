---
title: "do_bulk_insert() | Python | ORM"
slug: /python/python/utility-do_bulk_insert
sidebar_label: "do_bulk_insert()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从指定文件中批量插入数据。 | Python | ORM"
type: docx
token: BpqpdBWdyoxbmzx0GGCcQxksnBc
sidebar_position: 8
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库
  - 向量 Database 示例
  - zilliz
  - zilliz cloud
  - 云
  - do_bulk_insert()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# do_bulk_insert()

此操作从指定文件中批量插入数据。

## 请求语法\{#request-syntax}

```python
do_bulk_insert(
    collection_name: str,
    files: list,
    partition_name: str | None,
    timeout: float | None,
    using: str = "default",
    **kwargs,
)
```

**参数：**

- **collection_name** (*str*) -

    **[必填]**

    此操作目标 Collection 的名称。

- **files** (*list[str]*) -

    **[必填]**

    包含源数据的文件路径列表。 

    <Admonition type="info" icon="📘" title="Note">

    如何准备源数据文件？
    
        - 您可以使用一个 JSON 文件 (*.json*) 或一组 NumPy 文件 (*.npy*) 作为源数据文件。
    
            - 有效的 JSON 文件包含一个名为 **rows** 的根键，其值为字典列表，其中每个字典表示一个与目标 Collection 的 Schema 匹配的 Entity。
    
                如果目标 Collection 允许动态字段，请在每个 Entity 字典中包含动态字段及其值。
    
            - 一组有效的 NumPy 文件应以目标 Collection 的 Schema 中的字段命名，且其中的数据应与相应字段定义匹配。 
    
                如果目标 Collection 允许动态字段，请创建一个名为 **&#36;meta.npy** 的额外文件，以包含动态字段及其值。
    
            有关如何准备源数据文件的详细信息，请参见 [从文件插入 Entity](https://milvus.io/docs/bulk_insert.md)。
    
        - 在运行此操作之前，您必须先将源数据文件上传到 Milvus 配置中由 `minio.bucketname` 定义的 bucket。 
    
            以使用 Docker Compose 设置的 Milvus 实例为例，bucket 名称为 `a-bucket`。
    
            - 如果您将源数据文件上传到此 bucket，则应仅在 **files** 列表中包含带扩展名的文件名。例如，`files=["id.npy", "vector.npy"]` 或 `files=["data.json"]`。
    
            - 如果您将源数据文件上传到此 bucket 的某个子目录中，则应包含相对于 bucket 的文件路径。例如，如果子目录为 `data`，则参数设置应为 `files=["data/id.npy", "data/vector.py"]` 或 `files=["data.json"]`。
    
        - 要查找您的 Milvus 实例所使用的 MinIO bucket 名称，只需登录 MinIO 服务器进行查看即可。 

    </Admonition>

- **partition_name** (*str*) -

    指定 Collection 中某个 Partition 的名称。

    设置此参数后，Milvus 会将数据批量插入到指定的 Partition 中。

    如果将此参数设置为不存在的 Partition 名称，则会导致 **MilvusException**。

- **using** (*str*) - 

    所使用连接的别名。

    默认值为 **default**，表示此操作使用默认连接。

- **timeout** (*float* | *None*)  

    此操作的超时时长。将其设置为 **None** 表示当收到任何响应或发生任何错误时，此操作才会超时。

**返回类型：**

*int*

**返回：**
批量插入任务 ID。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Bulk-insert data from a set of NumPy files already uploaded to the MioIO server
utility.do_bulk_insert(
    collection_name="test_collection",
    files=["data/id.npy", "data/vector.npy"],
)

# 446781855410073001

# Bulk-insert data from a JSON file already uploaded to the MioIO server
utility.do_bulk_insert(
    collection_name="test_collection",
    files=["data/data.json"],
) 

# 446781855410077319
```

## 相关操作\{#related-operations}

以下操作与 `do_bulk_insert()` 相关：

- [BulkInsertState](./utility-BulkInsertState)

- [get_bulk_insert_state()](./utility-get_bulk_insert_state)

- [list_bulk_insert_tasks()](./utility-list_bulk_insert_tasks)

