---
title: "drop_snapshot() | Python | MilvusClient"
slug: /python/python/Snapshot-drop_snapshot
sidebar_label: "drop_snapshot()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はスナップショットを完全に削除します。削除されると、スナップショットデータは復元できません。 | Python | MilvusClient"
type: docx
token: UknCdYmtRoVIZ9xWcLnc02b0ndZ
sidebar_position: 3
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - drop_snapshot()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_snapshot()

この操作はスナップショットを完全に削除します。削除されると、スナップショットデータは復元できません。

## Request Syntax\{#request-syntax}

```python
drop_snapshot(
    snapshot_name: str,
    timeout: Optional[float] = None,
    **kwargs
) -> None
```

**PARAMETERS:**

- **snapshot_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  削除するスナップショットの名前。

- **timeout** (*Optional[float]*) -<br/>
  RPC の実行に許可するタイムアウト時間（秒単位）。

**RETURN TYPE:**

*None*

**EXCEPTIONS:**

- **MilvusException**

    スナップショットが存在しないか、操作が失敗した場合。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.drop_snapshot(snapshot_name="backup_20260401")
```
