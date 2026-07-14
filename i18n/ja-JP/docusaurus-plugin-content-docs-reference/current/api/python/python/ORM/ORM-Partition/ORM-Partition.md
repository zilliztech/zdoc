---
title: "Partition | Python | ORM"
slug: /python/python/ORM-Partition
sidebar_label: "Partition"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Partition インスタンスは、collection 内の partition を表します。 | Python | ORM"
type: docx
token: X9scdVMmxoBTuUxlKhecJXEunHd
sidebar_position: 7
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic vector database
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

**Partition** インスタンスは、collection 内の partition を表します。

```python
class pymilvus.Partition
```

## Constructor\{#constructor}

名前、説明、その他のパラメータを指定して、collection 内に partition を構築します。 

<Admonition type="info" icon="📘" title="Notes">

partitions を使用する場合は、collection schema で **enable_partition_key** が **True** に設定されていないことを確認してください。そうでない場合、エラーが発生します。

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

    partition を作成する collection。 

    **[Collection](./ORM-Collection)** オブジェクト、またはその名前のいずれかを参照できます。

    <Admonition type="info" icon="📘" title="Note">

    collection とは何ですか？
    
        collection は、固定数の列と可変数の行を持つ二次元テーブルにデータを格納します。テーブル内では、各列が field に対応し、各行が entity を表します。
    
        1 つの collection は最大 64 個の partitions をサポートできます。

    </Admonition>

- **name** (*string*) - 

    **[REQUIRED]**

    作成する partition の名前。

- **description** (*string*) - 

    作成する partition の説明。

**RETURN TYPE:**

*Partition*

**RETURNS:**

**Partition** オブジェクト。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection("book")

# Create a partition object in the current collection
partition = Partition(collection, "novel", "")
```

## Members\{#members}

以下は `Partition` クラスのメンバーです:

