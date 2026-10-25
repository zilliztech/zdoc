---
title: "dump_messages() | Python | MilvusClient"
slug: /python/python/Management-dump_messages
sidebar_label: "dump_messages()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたメッセージ ID とタイムティックの間にある物理チャネルのメッセージをダンプします。 | Python | MilvusClient"
type: docx
token: W2HMdGNjrokVNvxQqYEcFR5Yn4g
sidebar_position: 16
keywords: 
  - DiskANN
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - zilliz
  - zilliz cloud
  - cloud
  - dump_messages()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# dump_messages()

この操作は、指定されたメッセージ ID とタイムティックの間にある物理チャネルのメッセージをダンプします。

## リクエスト構文\{#request-syntax}

```python
dump_messages(
    pchannel: str,
    start_message_id: Dict,
    start_timetick: int = 0,
    end_timetick: int = 0,
    timeout: Optional[float] = None,
    **kwargs
)
```

**パラメーター：**

- **pchannel** (*str*) -

    **[REQUIRED]**

    メッセージをダンプする物理チャネルの名前です。

- **start_message_id** (*Dict*) -

    **[REQUIRED]**

    書き込み前ログの開始位置です。`id` と `wal_name` を持つオブジェクトとして指定します。`get_replicate_info()` から取得した `message_id` を直接渡すこともできます。

- **start_timetick** (*int*) -

    下限を含むタイムティックの境界です。下限を省略するには `0` を使用します。

- **end_timetick** (*int*) -

    上限を含むタイムティックの境界です。RPC がキャンセルされるまでストリーミングを継続するには `0` を使用します。

- **timeout** (*Optional[float]*) -

    ストリーム全体に許可される最大時間（秒）です。

- **kwargs** (*Any*) -

    基盤となるクライアントまたはリクエストに渡される追加のキーワード引数です。

**例外：**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
messages = client.dump_messages(
    pchannel="by-dev-rootcoord-dml_0_449019091。",
    start_message_id={},
)
```
