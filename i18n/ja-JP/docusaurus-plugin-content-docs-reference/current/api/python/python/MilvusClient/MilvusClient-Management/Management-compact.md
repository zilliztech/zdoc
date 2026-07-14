---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、collection 内の小さなセグメントをマージして、ストレージレイアウトとクエリ効率を向上させる compaction ジョブを開始します。 | Python | MilvusClient"
type: docx
token: ZANCdUPeBoCis1xylRUcR90Pndb
sidebar_position: 2
keywords: 
  - ハイブリッド検索
  - レキシカル検索
  - 最近傍探索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - クラウド
  - compact()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# compact()

この操作は、collection 内の小さなセグメントをマージして、ストレージレイアウトとクエリ効率を向上させる compaction ジョブを開始します。

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

**パラメータ:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    compaction を実行する collection の名前。

- **is_clustering** (*bool*) -

    clustering compaction をトリガーするかどうか。

- **is_l0** (*bool*) -

    L0 compaction をトリガーするかどうか。

- **target_size** (*int*) -

    compaction 後のターゲットセグメントサイズ（任意）。正の整数である必要があります。

- **target_size_unit** (*str*) -

    `target_size` の単位。サポートされる値は `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"`、`"pb"` です。

- **timeout** (*float*) -

    任意の RPC タイムアウト（秒）。

- **kwargs** (*dict*) -

    任意のリクエストコンテキストパラメータ。

**戻り値の型:**

*int*

後続のステータス照会に使用する compaction ジョブ ID。

**例外:**

- **ParamError**

    `target_size` が整数でない場合、または `target_size_unit` が無効な場合に発生します。

- **MilvusException**

    サーバーがリクエストを拒否した場合、または compaction RPC が失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")
job_id = client.compact(
    collection_name="book_catalog",
    is_clustering=True,
    target_size=512,
    target_size_unit="mb",
)

print(job_id)
```
