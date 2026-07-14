---
title: "get_collection_stats() | Python | MilvusClient"
slug: /python/python/Collections-get_collection_stats
sidebar_label: "get_collection_stats()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection で収集された統計情報を一覧表示します。 | Python | MilvusClient"
type: docx
token: VfaldXzLUocBrJxffw6cJHPinlh
sidebar_position: 13
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - クラウド
  - get_collection_stats()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_collection_stats()

この操作は、特定の collection で収集された統計情報を一覧表示します。

<Admonition type="info" icon="📘" title="注意">

このメソッドは、Dedicated serving cluster および on-demand compute に適用されます。 

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
get_collection_stats(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    collection の名前。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

- **\&ast;\&ast;kwargs** -

    将来の拡張性のための追加のキーワード引数です。

**RETURN TYPE:**

*dict*

**RETURNS:**

指定された collection で収集された統計情報を含む辞書。

```python
{
    'row_count': 0
}
```

<Admonition type="info" icon="📘" title="注意">

なぜ row count が挿入したエンティティ数と一致しないのですか？

挿入したデータは、最終的に保存される前に処理されます。最初はデータストリームとして到着します。その後、エンティティとして segments に保存されます。Milvus は、上限に達して sealed になるまで、ストリーム内のデータを保存するための適切な growing segment を選択します。

ただし、ストリームデータは含まれないため、表示される row count は挿入されたレコード数と一致しない場合があることに注意してください。

</Admonition>

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

stats = client.get_collection_stats(
    collection_name="my_collection"
)

print(stats)
# Output: {'row_count': 100}
```
