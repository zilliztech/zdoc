---
title: "refresh_external_collection() | Python | MilvusClient"
slug: /python/python/Collections-refresh_external_collection
sidebar_label: "refresh_external_collection()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。 | Python | MilvusClient"
type: docx
token: ZVs4dDpvmoXI0OxOnKhc9numnJd
sidebar_position: 29
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - refresh_external_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_external_collection()

この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。

<Admonition type="info" icon="📘" title="注意">

これには、以下のように project endpoint を使用して設定された MilvusClient が必要です。

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
refresh_external_collection(
    collection_name: str,
    external_source: str = "",
    external_spec: str = "",
    timeout: Optional[float] = None,
    **kwargs,    
) -> int
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    既存の external collection の名前。

- **external_source** (*str*) -

    外部ソース URI。アクセス可能な外部 volume を指す `volume://` URI である必要があります。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様で、一連の副次的なパラメータです。

    - **format** (*str*) - 

        対象ソースデータファイルの形式。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg table の ID。これは `format` が `iceberg-table` の場合にのみ適用されます。

- **timeout** (*float*) -

    この操作のタイムアウト時間。 

    これを **None** に設定すると、レスポンスが到着した時点またはエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*int*

**RETURNS:**

作成された非同期ジョブを示す整数。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_PROJECT_ENDPOINT",
    token="YOUR_API_KEY"
)

job_id = client.refresh_external_collection(
    collection_name="test_collection"
)

while True:
    progress = client.get_refresh_external_collection_progress(job_id=job_id)
    print(f"  {progress.state}: {progress.progress}%")

    if progress.state == "RefreshCompleted":
        elapsed = progress.end_time - progress.start_time
        print(f"  Completed in {elapsed}ms")
        return job_id
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        return job_id

    time.sleep(2)
```

