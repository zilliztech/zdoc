---
title: "alter_collection_properties() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_properties
sidebar_label: "alter_collection_properties()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクションのプロパティを変更します。 | Python | MilvusClient"
type: docx
token: SJ1FdUQQnohtObxhNgpcHalMnUc
sidebar_position: 3
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースとは何か
  - ベクトルデータベースの比較
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_properties()

この操作は、指定されたコレクションのプロパティを変更します。

<Admonition type="info" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
alter_collection_properties(
    self, 
    collection_name: str, 
    properties: dict, 
    timeout: Optional[float] = None, 
    **kwargs
)
```

**パラメータ:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **properties** (*dict*) -

    プロパティとその新しい値を辞書で指定します。使用可能な辞書キーは次のとおりです。

    - **コレクション.ttl.seconds** (*int*) -

        コレクションの有効期間（TTL）を秒単位で指定します。

    - **ttl_field** (*str*)

        エンティティレベルの TTL 有効期限の論理タイムスタンプとして使用する `TIMESTAMPTZ` フィールドの名前です。

    - **mmap.enabled** (*bool*) -

        コレクション内のすべてのフィールドの生データとインデックスに対して mmap を有効にするかどうかを指定します。詳細は、[mmap を使用する](/docs/use-mmap) を参照してください。

    - **partitionkey.isolation** (bool) -

        パーティションキー分離を有効にするかどうかを指定します。詳細は、[Partition Key を使用する](/docs/use-partition-key) を参照してください。

    - **dynamicfield.enabled** (bool) -

        動的フィールドを有効にするかどうかを指定します。詳細は、[Dynamic Field](/docs/enable-dynamic-field) を参照してください。

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間です。

    これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*

**例外:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合、特に指定された alias が存在しない場合に発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": true}

client.alter_collection_properties(
    collection_name="collection_name", 
    properties = properties
)
```

