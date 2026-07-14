---
title: "construct_from_dataframe() | Python | ORM"
slug: /python/python/Collection-construct_from_dataframe
sidebar_label: "construct_from_dataframe()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータフレームを使用してコレクションを作成します。 | Python | ORM"
type: docx
token: ISZadjHwyopWr5xRdJ2cqxVanEg
sidebar_position: 3
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dataframe()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dataframe()

この操作は、指定されたデータフレームを使用してコレクションを作成します。 

## Request Syntax\{#request-syntax}

```python
construct_from_dataframe(
    name: str, 
    primary_field: str,
    dataframe: pandas.DataFrame
)
```

**PARAMETERS:**

- **name** (*string*) -

    **[REQUIRED]**

    作成するコレクションの名前です。

- **primary_field** (*string*) -

    **[REQUIRED]**

    主キーフィールドの名前です。これは、以下のデータフレーム内の列ラベルの 1 つである必要があります。

- **dataframe** (*pandas.DataFrame*) 

    **[REQUIRED]**

    コレクションに挿入するデータを含むデータフレームです。

    [このページ](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.html)の **Example** セクションで示されているように、データフレームは任意の方法で作成できます。

    ```python
    dataframe = pd.DataFrame({
        "id": [5,6,7,8,9],
        "vector": [
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ]
    })
    ```

**RETURN TYPE:**

*tuple (Collection, MutationResults)*

**RETURNS:**

コレクションと、**insert()** 操作によって返される **MutationResult** オブジェクトを含むタプルです。

**MutationResult** オブジェクトには、次のフィールドが含まれます。

- **insert_count** (*int*)

    挿入されたエンティティの数です。

- **delete_count** (*int*)

    削除されたエンティティの数です。

- **upsert_count** (*int*)

    upsert されたエンティティの数です。

- **succ_count** (*int*)

    この操作中に正常に実行された回数です。

- **succ_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが成功した操作を示します。

- **err_count** (*int*)

    この操作中に失敗した実行回数です。

- **err_index** (*list*)

    0 から始まるインデックス番号のリストで、それぞれが失敗した操作を示します。

- **primary_keys** (*list*)

    挿入されたエンティティの主キーのリストです。

- **timestamp** (*int*)

    この操作が完了した時点のタイムスタンプです。

**EXCEPTIONS:**

- **SchemaNotReadyException**

    指定された主キーフィールドが有効でない場合に、この例外が発生します。

## Examples\{#examples}

```python
import pandas as pd
from pymilvus import Collection

collection, results = Collection.construct_from_dataframe(
    name="test_collection",
    primary_field="id",
    dataframe=pd.DataFrame({
        "id": [0,1,2,3,4],
        "vector": [
            [0.1,0.2,-0.3,-0.4,0.5],
            [0.3,-0.1,-0.2,-0.6,0.7],
            [-0.6,-0.3,0.2,0.8,0.7],
            [0.6,0.2,-0.3,-0.8,0.5],
            [0.3,0.1,-0.2,-0.6,-0.7],
        ]
    }),
)
```

## Related operations\{#related-operations}

次の操作は `construct_from_dataframe()` に関連しています。

- [Collection](./ORM-Collection)

- [CollectionSchema](./ORM-CollectionSchema)

- [FieldSchema](./ORM-FieldSchema)

