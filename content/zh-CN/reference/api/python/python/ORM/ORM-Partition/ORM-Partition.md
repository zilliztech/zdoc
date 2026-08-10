---
title: "Partition | Python | ORM"
slug: /python/python/ORM-Partition
sidebar_label: "Partition"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Partition 实例表示 Collection 中的一个 Partition。 | Python | ORM"
type: docx
token: X9scdVMmxoBTuUxlKhecJXEunHd
sidebar_position: 7
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - Partition
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Partition

**Partition** 实例表示 Collection 中的一个 Partition。

```python
class pymilvus.Partition
```

## 构造函数\{#constructor}

通过名称、描述和其他参数在 Collection 中构造一个 Partition。 

<Admonition type="info" icon="📘" title="Notes">

使用 Partition 时，请确保 Collection Schema 中的 **enable_partition_key** 未设置为 **True**。否则会报错。

</Admonition>

```python
Partition(
    collection=collection, 
    name="string",
    description="string",
)
```

**参数：**

- **[collection](./ORM-Collection)** (*[Collection](./ORM-Collection)* | *str*) - 

    **[必填]**

    要在其中创建 Partition 的 Collection。 

    您可以引用一个 **[Collection](./ORM-Collection)** 对象或其名称。

    <Admonition type="info" icon="📘" title="Note">

    什么是 Collection？
    
        Collection 在一个列数固定、行数可变的二维表中收集数据。在该表中，每一列对应一个字段，每一行表示一个 Entity。
    
        一个 Collection 最多支持 64 个 Partition。

    </Admonition>

- **name** (*string*) - 

    **[必填]**

    要创建的 Partition 的名称。

- **description** (*string*) - 

    要创建的 Partition 的描述。

**返回类型：**

*Partition*

**返回值：**

一个 **Partition** 对象。

**异常：**

- **MilvusException**

    如果此操作期间发生任何错误，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection("book")

# Create a partition object in the current collection
partition = Partition(collection, "novel", "")
```

## 成员\{#members}

以下是 `Partition` 类的成员：

