---
title: "Partition | Python | ORM"
slug: /python/python/ORM-Partition
sidebar_label: "Partition"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "一个 Partition 实例表示 collection 中的一个 partition。 | Python | ORM"
type: docx
token: X9scdVMmxoBTuUxlKhecJXEunHd
sidebar_position: 7
keywords: 
  - 视频相似度搜索
  - 向量检索
  - 音频相似度搜索
  - 弹性向量数据库
  - zilliz
  - zilliz cloud
  - cloud
  - Partition
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Partition

**Partition** 实例表示 collection 中的一个 partition。

```python
class pymilvus.Partition
```

## Constructor\{#constructor}

通过名称、描述和其他参数在 collection 中构造一个 partition。 

<Admonition type="info" icon="📘" title="说明">

使用 partition 时，请确保 collection schema 中的 **enable_partition_key** 未设置为 **True**。否则将发生错误。

</Admonition>

```python
Partition(
    collection=collection, 
    name="string",
    description="string",
)
```

**PARAMETERS:**

- **[collection](./ORM-Collection)** (*[Collection](./ORM-Collection)* | *str*) - 

    **[REQUIRED]**

    要在其中创建 partition 的 collection。 

    你既可以引用 **[Collection](./ORM-Collection)** 对象，也可以使用其名称。

    <Admonition type="info" icon="📘" title="说明">

    什么是 collection？
    
        collection 以具有固定列数和可变行数的二维表形式收集数据。在该表中，每一列对应一个字段，每一行代表一个实体。
    
        一个 collection 最多支持 64 个 partition。

    </Admonition>

- **name** (*string*) - 

    **[REQUIRED]**

    要创建的 partition 的名称。

- **description** (*string*) - 

    要创建的 partition 的描述。

**RETURN TYPE:**

*Partition*

**RETURNS:**

一个 **Partition** 对象。

**EXCEPTIONS:**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection("book")

# Create a partition object in the current collection
partition = Partition(collection, "novel", "")
```

## Members\{#members}

以下是 `Partition` 类的成员：

