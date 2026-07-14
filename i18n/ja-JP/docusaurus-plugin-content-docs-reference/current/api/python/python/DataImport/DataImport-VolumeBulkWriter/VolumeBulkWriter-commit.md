---
title: "commit() | Python"
slug: /python/python/VolumeBulkWriter-commit
sidebar_label: "commit()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、バッファされたデータをローカルファイルに永続化し、VolumeBulkWriter インスタンスで設定されたリモートボリュームにアップロードします。 | Python"
type: docx
token: RwmUdNd0WoQ75zxrCndcal6HnXT
sidebar_position: 2
keywords: 
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - zilliz
  - zilliz cloud
  - cloud
  - commit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# commit()

この操作は、バッファされたデータをローカルファイルに永続化し、VolumeBulkWriter インスタンスで設定されたリモートボリュームにアップロードします。

## リクエスト構文\{#request-syntax}

```python
VolumeBulkWriter.commit(
    **kwargs
)
```

**パラメータ:**

- **_async** (*bool*) -

    バッファを非同期にフラッシュするかどうかを指定します。

    `True` に設定すると、フラッシュ操作はバックグラウンドスレッドで実行され、メソッドは直ちに返ります。`False`（デフォルト）に設定すると、フラッシュが完了するまでメソッドはブロックされます。

- **call_back** (*Callable[[List[str]], List[str]]*) -

    ローカルファイルのフラッシュ後に呼び出されるオプションのコールバック関数です。VolumeBulkWriter では、このコールバックは内部的にファイルをリモートボリュームへアップロードするために使用されます。

**戻り値の型:**

*None*

このメソッドは値を返しません。

**例外:**

- **MilvusException**

    フラッシュまたはアップロード操作が失敗した場合に発生します。

## 例\{#examples}

```python
from pymilvus.bulk_writer.volume_bulk_writer import VolumeBulkWriter
from pymilvus import CollectionSchema, FieldSchema, DataType

fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=128),
]
schema = CollectionSchema(fields, "example_collection")

writer = VolumeBulkWriter(
    schema=schema,
    remote_path="/data/bulk_import",
    cloud_endpoint="https://your-cloud-endpoint.zillizcloud.com",
    api_key="your-api-key",
    volume_name="my-volume",
)

# Append data
for i in range(1000):
    writer.append_row({"id": i, "vector": [0.1] * 128})

# Commit and upload to remote volume
writer.commit()

print(f"Files uploaded to: {writer.data_path}")
```
