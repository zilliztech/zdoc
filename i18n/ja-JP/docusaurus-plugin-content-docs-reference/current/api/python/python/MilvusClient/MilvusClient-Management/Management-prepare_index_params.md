---
title: "prepare_index_params() | Python | MilvusClient"
slug: /python/python/Management-prepare_index_params
sidebar_label: "prepare_index_params()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションのインデックスを構築するためのインデックスパラメーターを準備します。 | Python | MilvusClient"
type: docx
token: CAzpdAw3wo4ZqrxhjTLcEGBBn1S
sidebar_position: 11
keywords: 
  - milvus データベース
  - milvus lite
  - milvus ベンチマーク
  - managed milvus
  - zilliz
  - zilliz cloud
  - クラウド
  - prepare_index_params()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# prepare_index_params()

この操作は、特定のコレクションのインデックスを構築するためのインデックスパラメーターを準備します。

<Admonition type="info" title="Notes">

このメソッドは、Dedicated serving クラスターと on-demand compute にのみ適用されます。 

- serving クラスターのコレクションでこの操作を行うには、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute のコレクションでこの操作を行うには、project エンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand クラスターにアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
pymilvus.MilvusClient.prepare_index_params() -> IndexParams
```

**パラメーター:**

N/A

**戻り値の型:**

*IndexParams*

**戻り値:**

**IndexParams** には、**IndexParam** オブジェクトのリストが含まれます。

- **IndexParams**

    **IndexParam** オブジェクトのリスト。

    ```python
    ├── IndexParams 
    │       └── add_index()
    ```

    リストにインデックスを追加するための **[add_index()](./Management-add_index)** メソッドを提供します。

**例外:**

なし

## 例\{#examples}

```python
from pymilvus import MilvusClient

index_params = MilvusClient.prepare_index_params()
```

- [add_index()](./Management-add_index)

- [create_index()](./Management-create_index)

- [describe_index()](./Management-describe_index)

- [drop_index()](./Management-drop_index)

- [list_indexes()](./Management-list_indexes)

