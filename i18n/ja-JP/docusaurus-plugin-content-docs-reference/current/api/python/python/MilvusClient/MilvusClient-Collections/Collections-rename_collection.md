---
title: "rename_collection() | Python | MilvusClient"
slug: /python/python/Collections-rename_collection
sidebar_label: "rename_collection()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は既存の collection の名前を変更します。 | Python | MilvusClient"
type: docx
token: WR4qdjFUXog2JHxuJpMcWcVlnEf
sidebar_position: 18
keywords: 
  - vector database の例
  - rag vector database
  - vector db とは
  - vector databases とは
  - zilliz
  - zilliz cloud
  - cloud
  - rename_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# rename_collection()

この操作は既存の collection の名前を変更します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは Dedicated serving cluster と on-demand compute に適用されます。 

- serving cluster 内の collection の場合は、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute 内の collection の場合は、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
rename_collection(
    old_name: str,
    new_name: str,
    target_db: Optional[str] = "",
    timeout: Optional[float] = None,
    **kwargs,
) -> None
```

**PARAMETERS:**

- **old_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前です。

    存在しない collection に設定すると、**MilvusException** が発生します。

- **new_name** (*str*) -

    **[REQUIRED]**

    この操作後の対象 collection の名前です。

    これを **old_name** の値に設定すると、**MilvusException** が発生します。

- **target_db** (*Optional[str]*) -

    collection の移動先となる対象 database の名前です。デフォルトは空文字列で、この場合 collection は現在の database にそのまま残ります。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、何らかのレスポンスが返るか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

なし

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が送出されます。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# Rename the collection
client.rename_collection(
    old_name="test_collection",
    new_name="test_collection_renamed"
)

# Move collection to another database
client.rename_collection(
    old_name="test_collection_renamed",
    new_name="test_collection",
    target_db="my_database"
)
```
