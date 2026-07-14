---
title: "alter_database_properties() | Python | MilvusClient"
slug: /python/python/Database-alter_database_properties
sidebar_label: "alter_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたデータベースのプロパティを変更します。 | Python | MilvusClient"
type: docx
token: HCWBdorQdoONw2xaawacJWQkn1e
sidebar_position: 1
keywords: 
  - 最近傍探索
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - alter_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_database_properties()

この操作は、指定されたデータベースのプロパティを変更します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは Dedicated cluster にのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
alter_database_properties(
    db_name: str, 
    properties: Dict,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメータ:**

- **db_name** (*string*) -

    **[REQUIRED]**

    プロパティを変更する対象のデータベース名。

- **properties** (*dict* | *None*) -

    変更するプロパティと、変更後のそれらの値。指定可能なデータベースプロパティは次のとおりです。

    - **database.replica.number** (*int*) -

        データベースのレプリカ数。

    - **database.resource_groups** (*[]str*) -

        データベース専用の resource group。

    - **database.diskQuota.mb** (*int*) -

        データベースに割り当てられるディスククォータ（メガバイト単位、**MB**）。

    - **database.max.collections** (*int*) -

        データベースで許可される collection の最大数。

    - **database.force.deny.writing** (*bool*) -

        データベース内のすべての書き込み操作を拒否するかどうか。

    - **database.force.deny.reading** (*bool*) -

        データベース内のすべての読み取り操作を拒否するかどうか。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを *None* に設定すると、レスポンスまたはエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- `MilvusException` - この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.alter_database_properties(
    db_name="my_db",
    properties={"a": "f", "b": "g"}
)
```
