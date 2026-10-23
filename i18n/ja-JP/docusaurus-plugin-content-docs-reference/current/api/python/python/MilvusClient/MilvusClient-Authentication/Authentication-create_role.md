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

## リクエスト構文\{#request-syntax}

```python
create_role(
```

**パラメーター:**

- **role_name** (*str*) -

    **[必須]**

    作成するロールの名前です。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。

- **description** (*str*) -

    作成するロールの説明です。デフォルトは空文字列です。

**戻り値の型:**

*None*

**戻り値:**

この操作は値を返しません。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

- **ParamError**

    この例外は、パラメーター値が無効な場合にスローされます。この例外は、パラメーター値が無効な場合にスローされます。

## 例\{#examples}

```python
client.create_role(role_name="analytics_reader")
```
