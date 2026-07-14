---
title: "create_role() | Python | MilvusClient"
slug: /python/python/Authentication-create_role
sidebar_label: "create_role()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ロールベースのアクセス制御のためのロールを作成します。 | Python | MilvusClient"
type: docx
token: HRqudGOOnokInhxczclcADBDn8g
sidebar_position: 3
keywords: 
  - milvus とは
  - milvus データベース
  - milvus lite
  - milvus ベンチマーク
  - zilliz
  - zilliz cloud
  - クラウド
  - create_role()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# create_role()

この操作は、ロールベースのアクセス制御のためのロールを作成します。

## Request Syntax\{#request-syntax}

```python
create_role(
    role_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **role_name** (*str*) -

    **[REQUIRED]**

    作成するロールの名前です。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。

**RETURN TYPE:**

*None*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

- **ParamError**

    この例外は、パラメータ値が無効な場合に発生します。

## Examples\{#examples}

```python
client.create_role(role_name="analytics_reader")
```
