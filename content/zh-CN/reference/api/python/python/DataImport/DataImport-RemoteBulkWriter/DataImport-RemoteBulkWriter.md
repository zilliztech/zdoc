---
title: "RemoteBulkWriter | Python"
slug: /python/python/DataImport-RemoteBulkWriter
sidebar_label: "RemoteBulkWriter"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "RemoteBulkWriter 实例会将您的原始数据写入 AWS S3 兼容存储桶中，并转换为 Zilliz Cloud 可识别的格式。 | Python"
type: docx
token: BDP4dew9to9tQoxNEMPcBR5xnZb
sidebar_position: 4
keywords: 
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - 向量维度
  - zilliz
  - zilliz cloud
  - 云
  - RemoteBulkWriter
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# RemoteBulkWriter

**RemoteBulkWriter** 实例会将您的原始数据写入 AWS S3 兼容存储桶中，并转换为 Zilliz Cloud 可识别的格式。

```python
class pymilvus.RemoteBulkWriter
```

## 构造函数\{#constructor}

使用一组参数（如 **schema**、**remote_path**、**connect_param** 等）构造 **RemoteBulkWriter** 对象。

<Admonition type="info" icon="📘" title="Notes">

**RemoteBulkWriter** 对象旨在将您的原始数据重写为 Zilliz Cloud 可识别的格式，并写入 AWS S3 兼容存储桶中。

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

**参数：**

- **schema** (*CollectionSchema*) -

    **[必需]**

    要导入重写后数据的目标 Collection 的 Schema。

- **remote_path** (*str*) -

    **[必需]**

    用于存放重写后数据的目录路径。

- **connect_param** (*[ConnectParam](./RemoteBulkWriter-S3ConnectParam)*) -

    用于连接远程存储桶的参数。

- **chunk_size** (*int*) -

    文件 Segment 的最大大小。

    在重写您的原始数据时，Zilliz Cloud 会将原始数据拆分为多个 Segment。

    默认值为 536,870,912 字节，即 512 MB。

    <Admonition type="info" icon="📘" title="Note">

    BulkWriter 如何将我的数据拆分为 Segment？
    
        **BulkWriter** 将数据拆分为 Segment 的方式会因目标文件类型而异。
    
        如果生成的文件超过指定的 Segment 大小，**BulkWriter** 会创建多个文件，并按顺序编号命名，每个文件都不会大于该 Segment 大小。

    </Admonition>

- **file_type** (*[BulkFileType](./DataImport-BulkFileType)*) -

    输出文件的类型。

    默认值为 **BulkFileType.PARQUET**。 

    可选值包括 **BulkFileType.JSON**、**BulkFileType.PARQUET**、**BulkFileType.CSV**。

- **config** (*dict*)

    用于指定处理 CSV 文件时可选配置的字典。仅当 **file_type** 设置为 **BulkFileType.CSV** 时，此参数才可用。配置示例：

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

**返回类型：**

*RemoteBulkWriter*

**返回值：**

一个 **RemoteBulkWriter** 对象。

**异常：**

- **SchemaNotReadyException**

    当提供的 Schema 无效时，将引发此异常。

## 属性\{#properties}

- **data_path** (*pathlib.PosixPath*) -

    输出目录的路径。

- **batch_files** (*str*) -

    生成的文件名列表。

## 类\{#classes}

以下是 `RemoteBulkWriter` 类的类：

- ConnectParam

## 方法\{#methods}

以下是 `RemoteBulkWriter` 类的方法：
