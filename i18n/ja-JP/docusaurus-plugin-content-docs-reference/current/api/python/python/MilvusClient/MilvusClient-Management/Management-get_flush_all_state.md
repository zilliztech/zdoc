---
title: "get_flush_all_state() | Python | MilvusClient"
slug: /python/python/Management-get_flush_all_state
sidebar_label: "get_flush_all_state()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "flush-all 操作が完了したかどうかを返します。`flushall()` を呼び出した後に、flush のステータスを確認するために使用します。 | Python | MilvusClient"
type: docx
token: G31wdmzVFo687JxZTAGctQlKnir
sidebar_position: 20
keywords: 
  - AI チャットボット
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - zilliz
  - zilliz cloud
  - クラウド
  - get_flush_all_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_flush_all_state()

この操作は、flush-all 操作が完了したかどうかを返します。`flush_all()` を呼び出した後に、flush のステータスを確認するために使用します。

<Admonition type="info" title="Notes">

これはマネージドコレクションにのみ適用されます。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.get_flush_all_state(
    timeout: float = None
) -> bool
```

**パラメーター:**

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するとき、または何らかのエラーが発生したときに、この操作はタイムアウトします。

**戻り値の型:**

*bool*

**戻り値:**

flush-all 操作が完了している場合は **True**、それ以外の場合は **False** です。

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に送出されます。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.flush_all()

# Check if flush completed
is_done = client.get_flush_all_state()
print(is_done)  # True or False
```
