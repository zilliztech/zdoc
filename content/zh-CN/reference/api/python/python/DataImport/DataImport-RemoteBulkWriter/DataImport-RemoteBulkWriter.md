---
title: "RemoteBulkWriter | Python"
slug: /python/python/DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "RemoteBulkWriter 实例会将您的原始数据重写为 Zilliz Cloud 可理解的格式，并写入兼容 AWS S3 的 bucket 中。 | Python"
type: docx
token: BDP4dew9to9tQoxNEMPcBR5xnZb
sidebar_position: 4
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - RemoteBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

**RemoteBulkWriter** 实例会将您的原始数据重写为 Zilliz Cloud 可理解的格式，并写入兼容 AWS S3 的 bucket 中。

```python
class pymilvus.RemoteBulkWriter
```

## Constructor\{#constructor}

使用一组参数（如 **schema**、**remote_path**、**connect_param** 等）构造一个 **RemoteBulkWriter** 对象。

<Admonition type="info" icon="📘" title="Notes">

**RemoteBulkWriter** 对象旨在将您的原始数据重写为 Zilliz Cloud 可理解的格式，并写入兼容 AWS S3 的 bucket 中。

</Admonition>

```python
from pymilvus import CollectionSchema
from pymilvus.bulk_writer import RemoteBulkWriter, BulkFileType

writer = RemoteBulkWriter(
    schema=CollectionSchema(),
    remote_path="string",
    connect_param=RemoteBulkWriter.ConnectParam()
    chunk_size=512*1024*1024,
    file_type=BulkFileType.PARQUET
)
```

**PARAMETERS:**

- **schema** (*[CollectionSchema](./ORM-CollectionSchema)*) -

    **[REQUIRED]**

    目标集合的 schema，重写后的数据将被导入到该集合中。

- **remote_path** (*str*) -

    **[REQUIRED]**

    用于存放重写后数据的目录路径。

- **connect_param** (*[ConnectParam](./RemoteBulkWriter-S3ConnectParam)*) -

    用于连接远程 bucket 的参数。

- **chunk_size** (*int*) -

    单个文件分段的最大大小。

    在重写您的原始数据时，Zilliz Cloud 会将原始数据拆分为多个分段。

    该值默认为 536,870,912 字节，即 512 MB。

    <Admonition type="info" icon="📘" title="Note">

    BulkWriter 如何对我的数据进行分段？
    
        **BulkWriter** 对数据的分段方式会因目标文件类型而异。
    
        如果生成的文件超过指定的分段大小，**BulkWriter** 会创建多个文件，并按顺序编号命名，每个文件的大小都不会超过该分段大小。

    </Admonition>

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    输出文件的类型。

    该值默认为 **BulkFileType.PARQUET**。 

    可选值包括 **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV**。

- **config** (*dict*)

    一个字典，用于指定处理 CSV 文件时的可选配置。仅当 **file_type** 设置为 **BulkFileType.CSV** 时，此参数才可用。配置示例如下：

    ```python
    config={
        "sep": "\t",
        "nullkey": "NULL"
    }
    ```

    - **sep** (*string*)

        CSV 文件的分隔符。该值必须是长度为 1 的字符串，默认值为 `","`。不允许使用以下字符串：`"\0"`、`"\n"`、`"\r"`、`"""`。

    - **nullkey** (*string*)

        表示空值的特殊字符串。默认值为空字符串：`""`。

**RETURN TYPE:**

*RemoteBulkWriter*

**RETURNS:**

一个 **RemoteBulkWriter** 对象。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    当提供的 schema 无效时，将引发此异常。

## Properties\{#properties}

- **data_path** (*pathlib.PosixPath*) -

    输出目录的路径。

- **batch_files** (*str*) -

    已生成文件名的列表。

## Classes\{#classes}

以下是 `RemoteBulkWriter` 类的内部类：

- ConnectParam

## Methods\{#methods}

以下是 `RemoteBulkWriter` 类的方法：
