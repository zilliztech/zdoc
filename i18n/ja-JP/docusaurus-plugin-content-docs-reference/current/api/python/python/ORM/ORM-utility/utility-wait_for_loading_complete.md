---
title: "wait_for_loading_complete() | Python | ORM"
slug: /python/python/utility-wait_for_loading_complete
sidebar_label: "wait_for_loading_complete()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection がロードされるまで現在のプロセスをブロックします。 | Python | ORM"
type: docx
token: PLKXdUB1EoNX8gxKHruc9GcEnsg
sidebar_position: 44
keywords: 
  - managed milvus
  - Serverless vector database
  - milvus open source
  - milvus はどのように動作するか
  - zilliz
  - zilliz cloud
  - cloud
  - wait_for_loading_complete()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# wait_for_loading_complete()

この操作は、指定された collection がロードされるまで現在のプロセスをブロックします。

## リクエスト構文\{#request-syntax}

```python
wait_for_loading_complete(
    collection_name: str,
    partition_names: list[str] | None,
    timeout: float | None,
    using: str = "default",
)
```

**パラメータ:**
**collection_name** (*str*) -

- **partition_names** (*list[str]*) -

    partition 名のリスト。

    partition 名が指定されている場合、この操作は指定された partition がロードされるまで現在の進行をブロックします。

- **using** (*string*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**戻り値の型:**

*NoneType*

**戻り値:**

None

**例外:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection("test_collection")

# Load the collection data
collection.load()

# Wait until the load process completes
utility.wait_for_loading_complete(
    collection_name="test_collection",
    partition_names=["test_partition"],
    timeout=None,
    using="default",
)
```

## 関連操作\{#related-operations}

以下の操作は `wait_for_loading_complete()` に関連しています。

- [Partition](./ORM-Partition)

- [load()](./Collection-load)

- [release()](./Collection-release)

- [load_state()](./utility-load_state)

- [loading_progress()](./utility-loading_progress)

