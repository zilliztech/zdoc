---
title: "Partition | Python | ORM"
slug: /python/python/ORM-Partition
sidebar_label: "Partition"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Partition 实例表示集合中的一个分区。 | Python | ORM"
type: docx
token: X9scdVMmxoBTuUxlKhecJXEunHd
sidebar_position: 7
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
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

**Partition** 实例表示集合中的一个分区。

```python
class pymilvus.Partition
```

## 构造函数\{#constructor}

通过名称、描述和其他参数在集合中构造一个分区。

<Admonition type="info" icon="📘" title="说明">

使用分区时，请确保集合 schema 中的 **enable_partition_key** 未设置为 **True**。否则，将会发生错误。

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

    **[必需]**

    要在其中创建分区的集合。

    您既可以引用 **[Collection](./ORM-Collection)** 对象，也可以使用其名称。

    <Admonition type="info" icon="📘" title="说明">

    什么是集合？
    
        集合以一个具有固定列数和可变行数的二维表来组织数据。在该表中，每一列对应一个字段，每一行代表一个实体。
    
        一个集合最多可以支持 64 个分区。

    </Admonition>

- **name** (*string*) - 

    **[必需]**

    要创建的分区名称。

- **description** (*string*) - 

    要创建的分区描述。

**返回类型：**

*Partition*

**返回：**

一个 **Partition** 对象。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

```python
from pymilvus import Collection, Partition

# 获取现有集合
collection = Collection("book")

# 在当前集合中创建一个分区对象
partition = Partition(collection, "novel", "")
```

## 成员\{#members}

以下是 `Partition` 类的成员：

