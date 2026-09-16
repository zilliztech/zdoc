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
  - スパースと密
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - 密埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - refresh_external_collection()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# refresh_external_collection()

この操作は、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。

<Admonition type="info" title="Notes">

これには、次のようにプロジェクトエンドポイントを使用して設定された MilvusClient が必要です。

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
refresh_external_collection(
    collection_name: str,
    external_source: str = "",
    external_spec: str = "",
    timeout: Optional[float] = None,
    **kwargs,    
) -> int
```

**パラメーター:**

- **collection_name** (*string*) -

    **[必須]**

    既存の外部コレクションの名前です。

- **external_source** (*str*) -

    外部ソースの URI です。アクセス可能な外部ボリュームを指す `volume://` URI を指定する必要があります。たとえば、`volume://<volume-name>/path/to/folder/` です。

- **external_spec** (*str*) -

    外部ソースの仕様です。一連の副次的なパラメーターです。

    - **format** (*str*) - 

        対象のソースデータファイルの形式です。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。 

    これを **None** に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点で、この操作はタイムアウトします。

**戻り値の型:**

*int*

**戻り値:**

作成された非同期ジョブを示す整数です。

## 例\{#examples}

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

