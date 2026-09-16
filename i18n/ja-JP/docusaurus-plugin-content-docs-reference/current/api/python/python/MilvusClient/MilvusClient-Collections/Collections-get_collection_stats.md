---
title: "get_collection_stats() | Python | MilvusClient"
slug: /python/python/Collections-get_collection_stats
sidebar_label: "get_collection_stats()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定のコレクションで収集された統計情報を一覧表示します。 | Python | MilvusClient"
type: docx
token: VfaldXzLUocBrJxffw6cJHPinlh
sidebar_position: 13
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - AIハルシネーション
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

この操作は、特定のコレクションで収集された統計情報を一覧表示します。

<Admonition type="info" title="Notes">

このメソッドは、専用のサービングクラスターとオンデマンドコンピュートに適用されます。 

- サービングクラスター内のコレクションの場合は、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート内のコレクションの場合は、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
get_collection_stats(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**パラメーター:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    コレクションの名前です。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、いずれかのレスポンスが返されるかエラーが発生した時点で、この操作はタイムアウトします。

- **\&ast;\&ast;kwargs** -

    将来の拡張性のための追加のキーワード引数です。

**戻り値の型:**

*dict*

**戻り値:**

指定されたコレクションで収集された統計情報を含む辞書です。

```python
{
    'row_count': 0
}
```

<Admonition type="info" title="Note">

行数が挿入されたエンティティ数と一致しないのはなぜですか？

挿入したデータは、最終的に保存される前に処理を経ます。最初に、データはデータストリームとして到着します。次に、エンティティとしてセグメントに保存されます。Milvus は、セグメントが上限に達して sealed になるまで、ストリーム内のデータを保存するために適切な growing セグメントを選択します。

ただし、ストリームデータが含まれないため、表示される行数は挿入されたレコード数と一致しない場合があることに注意してください。

</Admonition>

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

stats = client.get_collection_stats(
    collection_name="my_collection"
)

print(stats)
# Output: {'row_count': 100}
```
