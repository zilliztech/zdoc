---
title: "describe_role() | Python | MilvusClient"
slug: /python/python/Authentication-describe_role
sidebar_label: "describe_role()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、role に付与された privileges と role の説明を返します。 | Python | MilvusClient"
type: docx
token: TYczdPuSNoV9lExR8iCcNIg9nGe
sidebar_position: 5
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - describe_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# describe_role()

この操作は、role に付与された privileges と role の説明を返します。

## リクエスト構文\{#request-syntax}

```python
describe_role(
    role_name: str,
    timeout: Optional[float] = None
) -> dict
```

**パラメーター:**

- **role_name** (*str*) -

    **[必須]**

    説明対象の role の名前。

- **timeout** (*float*) -

    この操作のタイムアウト時間。

**戻り値の型:**

*dict*

`role`、`description`、`privileges` を含む辞書。

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外が発生します。

- **ParamError**

    パラメーター値が無効な場合に、この例外が発生します。

## 例\{#examples}

```python
role_info = client.describe_role(role_name="analytics_reader")
print(role_info["description"])
print(role_info["privileges"])
```
