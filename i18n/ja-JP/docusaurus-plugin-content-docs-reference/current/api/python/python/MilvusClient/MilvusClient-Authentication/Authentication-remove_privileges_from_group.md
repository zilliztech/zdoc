---
title: "remove_privileges_from_group() | Python | MilvusClient"
slug: /python/python/Authentication-remove_privileges_from_group
sidebar_label: "remove_privileges_from_group()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、グループから指定された権限を削除します。 | Python | MilvusClient"
type: docx
token: Vm7vddGfYo6dYsxJi1Ycjuycnad
sidebar_position: 16
keywords: 
  - Milvus とは
  - Milvus データベース
  - Milvus Lite
  - Milvus ベンチマーク
  - zilliz
  - Zilliz Cloud
  - クラウド
  - remove_privileges_from_group()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_privileges_from_group()

この操作は、グループから指定された権限を削除します。

## リクエスト構文\{#request-syntax}

```python
remove_privileges_from_group(
```

**パラメーター:**

- **group_name** (*str*) -

    対象の権限グループの名前です。

- **privileges** (*List[str]*) -

    削除する権限のリストです。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

*None* です。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に送出されます。この例外は、この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に送出されます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.remove_privileges_from_group(
    group_name="my_privilege_group",
    privileges=["ListDatabases", "DescribeDatabase"]
)
```
