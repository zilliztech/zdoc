---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の小さなセグメントをマージするための手動 Compaction をトリガーし、Compaction ジョブ ID を返します。 | Python | MilvusClient"
type: docx
token: ZANCdUPeBoCis1xylRUcR90Pndb
sidebar_position: 2
keywords: 
  - ハイブリッド検索
  - 字句検索
  - 最近傍探索
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

この操作は、コレクション内の小さなセグメントをマージするための手動 Compaction をトリガーし、Compaction ジョブ ID を返します。

## リクエスト構文\{#request-syntax}

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

**パラメーター：**

- **collection_name** (*str*) -<br/>
  **[必須]**<br/>
  Compaction するコレクションの名前。

- **is_clustering** (*Optional[bool]*) -<br/>
  デフォルト： `False`<br/>
  クラスタリング Compaction を要求するフラグ。

- **is_l0** (*Optional[bool]*) -<br/>
  デフォルト： `False`<br/>
  レベルゼロ Compaction を要求するフラグ。

- **target_size** (*Optional[int]*) -<br/>
  デフォルト： `None`<br/>
  Compaction 後の目標セグメントサイズ。値は正の整数である必要があります。省略した場合はサーバーのデフォルトが使用されます。

- **target_size_unit** (*str*) -<br/>
  デフォルト： `"mb"`<br/>
  `target_size` の単位。サポートされている値は `b`、`kb`、`mb`、`gb`、`tb`、`pb` です。デフォルトは `mb` です。

- **timeout** (*Optional[float]*) -<br/>
  デフォルト： `None`<br/>
  RPC を待機する最大時間（秒）。省略した場合、クライアントはサーバーが応答するか、エラーが発生するまで待機します。

- **kwargs** (*Any*) -<br/>
  追加のリクエストコンテキストオプション。

**戻り値の型：**

*int*

**戻り値：**

Milvus によって返される Compaction ジョブ ID。

**例外：**

- **MilvusException**<br/>
  サーバーがリクエストを拒否した場合、または RPC が失敗した場合にスローされます。正確な失敗の詳細については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

compact() の使用例を示します。

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
job_id = client.compact(collection_name="book_chunks", target_size=512, target_size_unit="mb")
print(job_id)
```
