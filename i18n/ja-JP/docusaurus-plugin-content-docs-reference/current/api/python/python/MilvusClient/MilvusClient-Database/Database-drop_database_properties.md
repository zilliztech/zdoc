---
title: "drop_database_properties() | Python | MilvusClient"
slug: /python/python/Database-drop_database_properties
sidebar_label: "drop_database_properties()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたプロパティの設定を削除します。 | Python | MilvusClient"
type: docx
token: AdSXdtNDsoTMnJx1QoGcSsnZnWd
sidebar_position: 5
keywords: 
  - マルチモーダル検索
  - ベクトル search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - drop_database_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_database_properties()

この操作は、指定されたプロパティの設定を削除します。

## リクエスト構文\{#request-syntax}

```python
drop_database_properties(
    db_name: str,
    property_keys: List[str],
    **kwargs,
)
```

**パラメータ:**

- **db_name** (*str*) -

    **[REQUIRED]**

    プロパティを削除するデータベースの名前。

- **property_keys** (*list[str]*) -

    **[REQUIRED]**

    削除するプロパティの名前。使用可能なデータベースプロパティは次のとおりです。

    - **データベース.replica.number** (*int*) - Number of replicas for the データベース.

    - **データベース.resource_groups** (*list[str]*) - Resource groups dedicated to the データベース.

    - **データベース.diskQuota.mb** (*int*) - Disk quota allocated to the データベース in megabytes (**MB**).

    - **データベース.max.コレクション** (*int*) - Maximum number of コレクション allowed in the データベース.

    - **データベース.force.deny.writing** (*bool*) - Whether to deny all write operations in the データベース.

    - **データベース.force.deny.reading** (*bool*) - Whether to deny all read operations in the データベース.

    - **データベース.replica.number** (*int*) - Number of replicas for the データベース.

    - **データベース.resource_groups** (*list[str]*) - Resource groups dedicated to the データベース.

    - **データベース.diskQuota.mb** (*int*) - Disk quota allocated to the データベース in megabytes (**MB**).

    - **データベース.max.コレクション** (*int*) - Maximum number of コレクション allowed in the データベース.

    - **データベース.force.deny.writing** (*bool*) - Whether to deny all write operations in the データベース.

    - **データベース.force.deny.reading** (*bool*) - Whether to deny all read operations in the データベース.

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外がスローされます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

client.drop_database_properties(
    db_name="my_db",
    property_keys=["database.replica.number", "database.diskQuota.mb"]
)
```
