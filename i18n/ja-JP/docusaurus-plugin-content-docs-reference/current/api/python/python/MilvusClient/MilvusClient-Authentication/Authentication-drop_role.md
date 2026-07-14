---
title: "drop_role() | Python | MilvusClient"
slug: /python/python/Authentication-drop_role
sidebar_label: "drop_role()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作はカスタムロールを削除します。 | Python | MilvusClient"
type: docx
token: KUAXdm3o3opQPex8N69cMlPbnTh
sidebar_position: 8
keywords: 
  - llm hallucinations
  - hybrid search
  - lexical search
  - nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - drop_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_role()

この操作はカスタムロールを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_role(
    role_name: str,
    force_drop: bool = False,
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**パラメーター:**

- **role_name** (*str*) -

    **[必須]**

    削除するロールの名前です。

- **force_drop** (*bool*) -

    権限またはユーザーが割り当てられている場合でも、ロールを強制的に削除するかどうかを指定します。デフォルトは **False** です。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、エラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

- **BaseException**

    この操作が失敗した場合に、この例外がスローされます。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a role
client.create_role(role_name="read_only")

# Drop a role
client.drop_role(role_name="read_only")

# Force drop a role with assigned privileges
client.drop_role(role_name="custom_role", force_drop=True)
```
