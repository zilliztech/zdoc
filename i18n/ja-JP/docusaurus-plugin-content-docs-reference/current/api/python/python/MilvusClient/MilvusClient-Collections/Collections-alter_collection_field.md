---
title: "alter_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_field
sidebar_label: "alter_collection_field()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された collection フィールドのパラメータを変更します。 | Python | MilvusClient"
type: docx
token: JdR3dVpCaoq6s2xSFmsc0e13nnh
sidebar_position: 2
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースはどのように動作するか
  - ベクトル db 比較
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_field()

この操作は、指定された collection フィールドのパラメータを変更します。

## リクエスト構文\{#request-syntax}

```python
alter_collection_field(
    collection_name: str, 
    field_name: str, 
    field_params: Dict,
    db_name="",
    timeout: Optional[float] = None,
    **kwargs,
)
```

**パラメータ:**

- **collection_name** (*str*) -

    対象 collection の名前。

- **field_name** (*str*) -

    対象フィールドの名前。

- **field_params** (*dict*) -

    変更するフィールドパラメータです。記載されていないプロパティは変更されません。指定可能なパラメータはフィールドタイプによって異なります。

    - **mmap_enabled** (*bool*) -

        Milvus がフィールドデータを完全にロードする代わりにメモリにマップするかどうか。詳細については、MMap-enabled Data Storage を参照してください。

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間。

    これを None に設定すると、何らかのレスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

<Admonition type="info" icon="📘" title="注意">

collection をロードする前に、フィールド設定を変更する必要があります。ロード済みの collection 上でフィールドを変更するとエラーが返されます。ロード済み collection の設定を変更するには、まず collection を release し、その後フィールドを変更してから再度ロードしてください。

</Admonition>

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
field_params = {"max_length": 1500}

client.alter_collection_field(
    collection_name="collection_name", 
    field_name="my_varchar",
    field_params=field_params
)
```

