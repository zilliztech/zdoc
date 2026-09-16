---
title: "get_compact_state() | Python | MilvusClient"
slug: /python/python/Management-get_compact_state
sidebar_label: "get_compact_state()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: v2.6.x
notebook: false
description: "この操作は、指定された Compaction ジョブのステータスを返します。 | Python | MilvusClient"
type: docx
token: WEsjdspGLokueRxggM1cNFgknze
sidebar_position: 7
keywords: 
  - Milvus DB
  - Milvus ベクトル DB
  - Zilliz Cloud
  - Milvus とは
  - zilliz
  - zilliz cloud
  - クラウド
  - get_compact_state()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_compact_state()

この操作は、指定された Compaction ジョブのステータスを返します。

<Admonition type="info" title="Notes">

このメソッドは非推奨です。最新の同等の機能については、[get_compaction_state()](./Management-get_compaction_state) を参照してください。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
get_compaction_state(
    self,
    job_id: int,
    timeout: Optional[float] = None,
    **kwargs,
) -> str
```

**パラメーター:**

- **job_id** (*int*) -

    Compaction ジョブ ID。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間。

    これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*str*

**戻り値:**

指定された Compaction ジョブの状態。指定可能な値は次のとおりです。

- `UndefinedState`

- `Executing`

- `Completed`

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定された alias が存在しない場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

client.get_compact_state(
    job_id=45389273892800
)

# Completed
```

