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
  - クラウド
  - alter_collection_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_properties()

この操作は、指定されたコレクションのプロパティを変更します。

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Note">

これは外部コレクションには適用されません。

</Admonition>

<Admonition type="info" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
alter_collection_properties(
```

**パラメーター:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **properties** (*dict*) -

    辞書形式のプロパティとその新しい値です。辞書のキーとして使用できるものは次のとおりです。コレクション.ttl.seconds (int): コレクションの有効期間（TTL）を秒単位で指定します。ttl_field (str): エンティティレベルの TTL 期限切れの論理タイムスタンプとして使用する TIMESTAMPTZ フィールドの名前です。mmap.enabled (bool): コレクション内のすべてのフィールドの生データとインデックスに対して mmap を有効にするかどうかです。詳細は、Mmap-enabled Data Storage を参照してください。partitionkey.isolation (bool): パーティションキーの分離を有効にするかどうかです。詳細は、Use Partition Key を参照してください。dynamicfield.enabled (bool): 動的フィールドを有効にするかどうかです。詳細は、Dynamic Field を参照してください。allow_insert_auto_id (str): コレクションで AutoID が有効になっている場合に、コレクションがユーザー指定のプライマリキー値を受け入れることを許可するかどうかです。"true" に設定した場合: 挿入、アップサート、一括インポートでは、ユーザー指定のプライマリキーが存在すればそれが使用され、存在しなければプライマリキー値が自動生成されます。"false" に設定した場合: ユーザー指定のプライマリキー値は拒否または無視され、プライマリキー値は常に自動生成されます。デフォルトは "false" です。timezone (str): コレクションのデフォルトのタイムゾーンを設定します。値は有効な IANA タイムゾーン識別子である必要があります（例: Asia/Shanghai, America/Chicago, UTC）。詳細は、TIMESTAMPZ Field and Query を参照してください。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト期間です。これを None に設定すると、応答が到着したとき、またはエラーが発生したときに、この操作がタイムアウトすることを示します。

**戻り値の型:**

*NoneType*

**戻り値:**

*None*。

**例外:**

- **MilvusException**

    この例外は、この操作中にエラーが発生した場合に発生します。特に、指定されたエイリアスが存在しない場合に発生します。この例外は、この操作中にエラーが発生した場合に発生します。特に、指定されたエイリアスが存在しない場合に発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# upsert properties
properties = {"collection.ttl.seconds": 500, "mmap.enabled": True}

client.alter_collection_properties(
    collection_name="collection_name", 
    properties = properties
)
```
