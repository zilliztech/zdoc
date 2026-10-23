---
title: "compact() | Python | MilvusClient"
slug: /python/python/Management-compact
sidebar_label: "compact()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の小さなセグメントをマージしてストレージレイアウトとクエリ効率を改善する Compaction ジョブを開始します。 | Python | MilvusClient"
type: docx
token: CQawdFCJcodv5lx91kBck7rLnwh
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

この操作は、コレクション内の小さなセグメントをマージしてストレージレイアウトとクエリ効率を改善する Compaction ジョブを開始します。

## リクエスト構文\{#request-syntax}

```python
compact(
```

**パラメーター：**

- **collection_name** (*str*) -

    **[必須]**

    対象コレクションの名前。

- **is_clustering** (*bool*) -

    クラスタリング Compaction を実行するかどうかを示すフラグです。

- **is_l0** (*bool*) -

    L0 Compaction を実行するかどうかを示すフラグです。

- **target_size** (*int*) -

    Compaction 後のターゲットセグメントサイズを指定するオプションです。正の整数である必要があります。単位は target_size_unit で指定します（デフォルトは MB）。指定しない場合は、サーバーのデフォルトのターゲットサイズが使用されます。

- **target_size_unit** (*str*) -

    target_size の単位を指定するオプションです。サポートされる値は "b"、"kb"、"mb"（デフォルト）、"gb"、"tb"、"pb" です。この値は、サーバーに送信される前に MB に変換されます。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点で、この操作はタイムアウトします。

- **kwargs** (*dict*) -

    リクエストコンテキストのオプションパラメーター。

**戻り値の型：**

*int*

**戻り値：**

後続のステータスクエリに使用する Compaction ジョブ ID です。Compaction ステータスの取得に使用できる Compaction ジョブ ID です。

**例外：**

- **ParamError**

    `target_size` が整数でない場合、または `target_size_unit` が無効な場合に発生します。`target_size` が整数でない場合、または `target_size_unit` が無効な場合に発生します。

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。この操作中に何らかのエラーが発生すると、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)
job_id = client.compact(
    collection_name="book_catalog",
    is_clustering=True,
    target_size=512,
    target_size_unit="mb",
)

print(job_id)
```
