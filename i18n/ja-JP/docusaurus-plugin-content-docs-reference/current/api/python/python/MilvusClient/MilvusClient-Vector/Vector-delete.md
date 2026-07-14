---
title: "delete() | Python | MilvusClient"
slug: /python/python/Vector-delete
sidebar_label: "delete()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ID またはブール式を使用してエンティティを削除します。 | Python | MilvusClient"
type: docx
token: DWLXdSCYnoPT4ExktRKceEqLnAd
sidebar_position: 1
keywords: 
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pinecone ベクトルデータベース
  - 音声検索
  - zilliz
  - zilliz cloud
  - cloud
  - delete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# delete()

この操作は、ID またはブール式を使用してエンティティを削除します。

<Admonition type="info" icon="📘" title="Notes">

外部 collection はこの操作をサポートしていません。

</Admonition>

## Request syntax\{#request-syntax}

```python
delete(
    collection_name: str,
    ids: Optional[Union[list, str, int]] = None,
    timeout: Optional[float] = None,
    filter: Optional[str] = "",
    partition_name: Optional[str] = "",
    **kwargs,
) -> dict
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前。

- **ids** (*list* | *str* | *int*) -

    **[REQUIRED]**

    特定のエンティティ ID、またはエンティティ ID のリスト。

    デフォルト値は **None** で、scalar フィルタリング条件が適用されることを示します。**ids** と **filter** の両方を設定すると、**ParamError** 例外が発生します。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが返されるか、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **filter** (*str*) -

    一致するエンティティを絞り込むための scalar フィルタリング条件。 

    デフォルト値は空文字列で、条件が適用されないことを示します。**ids** と **filter** の両方を設定すると、**ParamError** 例外が発生します。

    scalar フィルタリングをスキップするには、このパラメータを空文字列に設定できます。scalar フィルタリング条件の構築方法については、[Boolean Expression Rules](https://milvus.io/docs/boolean.md) を参照してください。 

    <Admonition type="info" icon="📘" title="Notes">

    filter 式を使用してエンティティを削除する場合は、collection がロードされていることを確認してください。そうでない場合、Zilliz Cloud はエラーを返します。

    </Admonition>

- **partition_name** (*str* | *""*) -

    エンティティを削除する partition の名前。

    デフォルト値は空文字列です。指定した場合、エンティティは指定された partition から削除されます。

**RETURN TYPE:**

*dict*

**RETURNS:**

削除されたエンティティ数を含む辞書。

```python
{
    "delete_cnt": int
}
```

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **ParamError**

    **ids** と **filter** の両方が指定された場合に、この例外が発生します。

- **DataTypeNotMatchException**

    パラメータ値が必要なデータ型と一致しない場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Insert data
client.insert(
    collection_name="test_collection",
    data=[
        {"id": 0, "vector": [0.5, 0.09, 0.2, 0.15, 0.05], "color": "green"},
        {"id": 1, "vector": [0.04, 0.09, 0.33, 0.03, 0.35], "color": "blue"},
        {"id": 2, "vector": [0.1, 0.21, 0.41, 0.36, 0.9], "color": "orange"},
        {"id": 3, "vector": [0.75, 0.24, 0.09, 0.81, 0.41], "color": "red"},
        {"id": 4, "vector": [0.13, 0.27, 0.3, 0.23, 0.17], "color": "yellow"},
        {"id": 5, "vector": [0.17, 0.3, 0.13, 0.9, 0.29], "color": "white"},
        {"id": 6, "vector": [0.33, 0.22, 0.39, 0.17, 0.18], "color": "black"},
        {"id": 7, "vector": [0.16, 0.13, 0.03, 0.13, 0.12], "color": "purple"},
        {"id": 8, "vector": [0.12, 0.16, 0.25, 0.2, 0.16], "color": "pink"},
        {"id": 9, "vector": [0.07, 0.38, 0.36, 0.03, 0.47], "color": "brown"}
    ]
)

# {'insert_count': 10}

# 4. Delete entities
client.delete(
    collection_name="test_collection",
    ids=[3, 6, 7]
)

# {'delete_count': 3}

client.delete(
    collection_name="test_collection",
    filter="id in [1, 8, 9] and color like 'b%'"
)

# {'delete_count': 2}
```

