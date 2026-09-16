---
title: "Partition | Python | ORM"
slug: /python/python/ORM-Partition
sidebar_label: "Partition"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "Partition インスタンスは、コレクション内のパーティションを表します。 | Python | ORM"
type: docx
token: X9scdVMmxoBTuUxlKhecJXEunHd
sidebar_position: 7
keywords: 
  - 動画類似検索
  - ベクトル検索
  - 音声類似検索
  - Elastic ベクトルデータベース
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

**Partition** インスタンスは、コレクション内のパーティションを表します。

```python
class pymilvus.Partition
```

## コンストラクター\{#constructor}

名前、説明、およびその他のパラメータを指定して、コレクション内にパーティションを作成します。 

<Admonition type="info" title="Notes">

パーティションを使用する場合は、コレクションのスキーマで **enable_partition_key** が **True** に設定されていないことを確認してください。そうでない場合、エラーが発生します。

</Admonition>

```python
Partition(
    collection=collection, 
    name="string",
    description="string",
)
```

**PARAMETERS:**

- **[コレクション](./ORM-Collection)** (*[コレクション](./ORM-Collection)* | *str*) - 

    **[REQUIRED]**

    パーティションを作成するコレクションです。 

    **[コレクション](./ORM-Collection)** オブジェクト、またはその名前のいずれかを参照できます。

    <Admonition type="info" title="Note">

    コレクションとは何ですか？
    
        コレクションは、固定数の列と可変数の行を持つ二次元テーブルにデータを収集します。テーブルでは、各列がフィールドに対応し、各行がエンティティを表します。
    
        1 つのコレクションは、最大 64 個のパーティションをサポートできます。

    </Admonition>

- **name** (*string*) - 

    **[REQUIRED]**

    作成するパーティションの名前です。

- **description** (*string*) - 

    作成するパーティションの説明です。

**RETURN TYPE:**

*Partition*

**RETURNS:**

**Partition** オブジェクトです。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import Collection, Partition

# Get an existing collection
collection = Collection("book")

# Create a partition object in the current collection
partition = Partition(collection, "novel", "")
```

## メンバー\{#members}

以下は `Partition` クラスのメンバーです:

