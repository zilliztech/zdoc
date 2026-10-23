---
title: "alter_index_properties() | Python | MilvusClient"
slug: /python/python/Management-alter_index_properties
sidebar_label: "alter_index_properties()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたインデックスプロパティを変更します。 | Python | MilvusClient"
type: docx
token: GzNUdJIhVoWjgLxEimrctGvUnJg
sidebar_position: 14
keywords: 
  - オープンソースのベクトルデータベース
  - ベクトルインデックス
  - ベクトルデータベース オープンソース
  - オープンソースのベクトル DB
  - zilliz
  - zilliz cloud
  - cloud
  - alter_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_index_properties()

この操作は、指定されたインデックスプロパティを変更します。

<Admonition type="info" title="Notes">

このメソッドは、専用のサービングクラスターとオンデマンドコンピュートにのみ適用されます。 

- サービングクラスター内のコレクションでこの操作を行うには、クラスターエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- オンデマンドコンピュート用のコレクションでこの操作を行うには、プロジェクトエンドポイントを使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のためにオンデマンドクラスターにアタッチするセッションを作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
alter_index_properties(
```

**PARAMETERS:**

- **collection_name** (*str*) -

    対象コレクションの名前です。

- **index_name** (*str*) -

    変更するインデックスファイルの名前です。

- **properties** (*dict*) -

    この操作後のプロパティとその値です。変更できるプロパティは次のとおりです。mmap.enabled (bool): 指定したインデックスに対して mmap を有効にするかどうかです。これを true に設定すると、指定したインデックスがディスクにオフロードされます。詳細は、Mmap-enabled Data Storage を参照してください。

- **timeout** (*Optional[float]*) -

    この操作のタイムアウト時間です。これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作がタイムアウトすることを示します。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

なし。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が発生します。この操作中に何らかのエラーが発生すると、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# update properties
properties = {"mmap.enabled": True}

client.alter_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    properties = properties
)
```
