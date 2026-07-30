---
title: "LocalBulkWriter | Python"
slug: /python/python/DataImport-LocalBulkWriter
sidebar_label: "LocalBulkWriter"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "LocalBulkWriter 实例会在本地将原始数据重写为 Zilliz Cloud 可理解的格式。 | Python"
type: docx
token: RcvXdmCVBog9M8xNyUFcwefnneh
sidebar_position: 3
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - LocalBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# LocalBulkWriter

LocalBulkWriter 实例会在本地将原始数据重写为 Zilliz Cloud 可理解的格式。

```python
class pymilvus.LocalBulkWriter
```

## Constructor\{#constructor}

根据 schema、输出路径、分段大小和文件类型构造一个 LocalBulkWriter 对象。

<Admonition type="info" icon="📘" title="Notes">

**LocalBulkWriter** 对象旨在将您的原始数据在本地重写为 Zilliz Cloud 可理解的格式。

</Admonition>

```python
from pymilvus import CollectionSchema
from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType

writer = LocalBulkWriter(
    schema=CollectionSchema(),
    local_path="string",
    chunk_size=512*1024*1024,
    file_type=BulkFileType.PARQUET
)
```

**PARAMETERS:**

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) -

    **[REQUIRED]**

    要导入重写后数据的目标集合的 schema。

- **local_path** (*str*) -

    **[REQUIRED]**

    用于存放重写后数据的目录路径。

- **chunk_size** (*int*) -

    单个文件分段的最大大小。

    在重写原始数据时，Zilliz Cloud 会将原始数据拆分为多个分段。

    默认值为 **536,870,912** 字节，即 **512** MB。

    <Admonition type="info" icon="📘" title="Note">

    BulkWriter 如何对我的数据进行分段？
    
        **BulkWriter** 对数据的分段方式会因目标文件类型而异。
    
        如果生成的文件超过指定的分段大小，**BulkWriter** 会创建多个文件，并按顺序编号命名，每个文件都不会大于该分段大小。

    </Admonition>

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    输出文件的类型。

    默认值为 **BulkFileType.PARQUET**。 

    可选值包括 **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV**。

- **config** (*dict*)

    一个字典，用于指定处理 CSV 文件时的可选配置。仅当 **file_type** 设置为 **BulkFileType.CSV** 时，此参数可用。配置示例：

    ```python
    config={
        "sep": "\t",
        "nullkey": "NULL"
    }
    ```

    - **sep** (*string*)

        CSV 文件的分隔符。该值必须是长度为 1 的字符串，默认值为 `","`。不允许使用以下字符串：`"\0"`、`"\n"`、`"\r"`、`"""`。

    - **nullkey** (*string*)

        表示 null 值的特殊字符串。默认值为空字符串：`""`。

**RETURN TYPE:**

*LocalBulkWriter*

**RETURNS:**

一个 **LocalBulkWriter** 对象。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    当提供的 schema 无效时，将引发此异常。

## Properties\{#properties}

- **uuid** (*str*) -

    随机生成的 UUID，用于命名输出文件或目录，支持 JSON、Parquet 和 NumPy 格式。

- **data_path** (*pathlib.PosixPath*) -

    输出目录的路径。

- **batch_files** (*str*) -

    已生成文件名称的列表。

## Methods\{#methods}

以下是 **LocalBulkWriter** 类的方法：

