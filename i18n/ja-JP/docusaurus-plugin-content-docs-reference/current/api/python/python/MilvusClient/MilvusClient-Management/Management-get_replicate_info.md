---
title: "get_replicate_info() | Python | MilvusClient"
slug: /python/python/Management-get_replicate_info
sidebar_label: "get_replicate_info()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、ソースクラスターとソース pchannel のレプリケーションチェックポイント状態を取得します。 | Python | MilvusClient"
type: docx
token: C5UqdwH46o2mt1xleeRcx51knJA
sidebar_position: 22
keywords: 
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - zilliz
  - zilliz cloud
  - クラウド
  - get_replicate_info()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_replicate_info()

この操作では、ソースクラスターとソース pchannel のレプリケーションチェックポイント状態を取得します。

## リクエスト構文\{#request-syntax}

```python
get_replicate_info(
    source_cluster_id: str,
    target_pchannel: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**パラメーター:**

- **source_cluster_id** (*str*) -

    **[必須]**

    ソースクラスターの ID です。

- **target_pchannel** (*str*) -

    **[必須]**

    ソースクラスター内の物理チャネルの名前です。

- **timeout** (*Optional[float]*) -

    RPC の完了を待機する最大時間（秒）です。

- **kwargs** (*Any*) -

    追加のリクエストコンテキストオプションです。

**例外:**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
info = client.get_replicate_info(
    source_cluster_id="source-1",
    target_pchannel="by-dev-rootcoord-dml_0",
)
```
