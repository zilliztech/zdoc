---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "targetsize/targetsizeunit と正のサイズ検証を追加します。非同期バリアントは同期メソッドの契約を共有します。 | Python | MilvusClient"
type: docx
token: ZANCdUPeBoCis1xylRUcR90Pndb
sidebar_position: 2
keywords: 
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍検索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - compact()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# compact()

target_size/target_size_unit と正のサイズ検証を追加します。非同期バリアントは同期メソッドの契約を共有します。

## Request Syntax\{#request-syntax}

```python
compact(
    collection_name: str,
    is_clustering: Optional[bool] = False,
    is_l0: Optional[bool] = False,
    target_size: Optional[int] = None,
    target_size_unit: str = "mb",
    timeout: Optional[float] = None,
    **kwargs,
) -> int
```

**PARAMETERS:**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  compact する collection の名前。

- **is_clustering** (*Optional[bool]*) -<br/>
  デフォルト: `False`<br/>
  クラスタリング compaction を要求するフラグ。

- **is_l0** (*Optional[bool]*) -<br/>
  デフォルト: `False`<br/>
  level-zero compaction を要求するフラグ。

- **target_size** (*Optional[int]*) -<br/>
  デフォルト: `None`<br/>
  compaction 後の望ましいセグメントサイズ。値は正の整数である必要があります。省略した場合は、サーバーのデフォルトが使用されます。

- **target_size_unit** (*str*) -<br/>
  デフォルト: `"mb"`<br/>
  `target_size` の単位。サポートされる値は `b`、`kb`、`mb`、`gb`、`tb`、`pb` で、デフォルトは `mb` です。

- **timeout** (*Optional[float]*) -<br/>
  デフォルト: `None`<br/>
  RPC を待機する最大時間（秒）。省略した場合、クライアントはサーバーが応答するかエラーが発生するまで待機します。

- **kwargs** (*Any*) -<br/>
  追加のリクエストコンテキストオプション。

**RETURN TYPE:**

*int*

**RETURNS:**

Milvus によって返される compaction ジョブ識別子。

**EXCEPTIONS:**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## Examples\{#examples}

compact の使用方法を示します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
job_id = client.compact(collection_name="book_chunks", target_size=512, target_size_unit="mb")
print(job_id)
```
