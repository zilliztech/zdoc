---
title: "optimize() | Python | MilvusClient"
slug: /python/python/Management-optimize
sidebar_label: "optimize()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "- isl0 (bool) - | Python | MilvusClient"
type: docx
token: MhRidjHwYorxaexS8WXcaxWQnjd
sidebar_position: 26
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルdb
  - zilliz
  - zilliz cloud
  - クラウド
  - optimize()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# optimize()

- **is_l0** (*bool*) -

    L0 compaction を実行するかどうか。

- **target_size** (*int*) -

    compaction 後のターゲットセグメントサイズ。正の整数である必要があります。省略した場合は、サーバーのデフォルト値が使用されます。

- **target_size_unit** (*str*) -

    `target_size` の単位。サポートされる値は `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"`、`"pb"` です。クライアントはリクエスト送信前にこの値を MB に変換します。

この操作は collection 内の小さなセグメントを compaction し、進行状況をポーリングできる compaction ジョブ ID を返します。

<Admonition type="warning" icon="🚧" title="警告">

これは本番環境以外でのみ使用するための Preview バージョン機能です（Benchmark、POC）。

</Admonition>

<Admonition type="info" icon="📘" title="注意">

このメソッドは dedicated serving cluster と on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行う場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 用の collection でこの操作を行う場合は、project endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand cluster にアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.optimize(
    collection_name: str,
    is_clustering: bool = False,
    is_l0: bool = False,
    target_size: int | None = None,
    target_size_unit: str = "mb",
    wait: bool = True,
    timeout: float | None = None,
)
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    最適化する collection の名前。

- **is_clustering** (*bool*) -

    ターゲットセグメントサイズ。形式: `"1000MB"`、`"1GB"`、`"1.2gb"`。指定しない場合は、システムデフォルトが使用されます。

- **wait** (*bool*) -

    最適化の完了を待機するかどうか。デフォルトは **True** です。**False** の場合、非同期追跡用の `OptimizeTask` を返します。

- **timeout** (*float*) -

    最適化を待機する最大時間（秒）。`wait=True` の場合にのみ適用されます。

**戻り値の型:**
*OptimizeResult | OptimizeTask*

`wait=True` の場合は `OptimizeResult` を返し、`wait=False` の場合は `OptimizeTask` を返します。

**戻り値:**

`wait=True` の場合、status、collection_name、compaction_id、target_size、progress を含む **OptimizeResult** を返します。`wait=False` の場合、`done()`、`progress()`、`result()`、`cancel()` をサポートする **OptimizeTask** を返します。

**例外:**

- **ParamError**

    `collection_name` が無効な場合、または `target_size` の形式が正しくない場合にこの例外が発生します。

- **MilvusException**

    インデックス構築の失敗、compaction の失敗、またはタイムアウトが発生した場合にこの例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Wait for completion
result = client.optimize(
    collection_name="book",
    target_size=512,
    target_size_unit="mb",
    wait=True,
)
print(result)

# Run asynchronously
task = client.optimize(
    collection_name="book",
    is_clustering=True,
    target_size=1,
    target_size_unit="gb",
    wait=False,
)
print(task.job_id)
```
