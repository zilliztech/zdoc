---
title: "refresh_external_collection() | Python | MilvusClient"
slug: /python/python/Collections-refresh_external_collection
sidebar_label: "refresh_external_collection()"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。 | Python | MilvusClient"
type: docx
token: ZVs4dDpvmoXI0OxOnKhc9numnJd
sidebar_position: 30
keywords: 
  - スパースと Dense
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense 埋め込み
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

この操作では、スキーマで定義された外部ストレージ内のデータファイルをスキャンし、それらのデータファイルとのマッピング関係を記録するメタデータファイルを生成します。

<Admonition type="info" title="Notes">

これには、次のプロジェクトエンドポイントを使用して設定された MilvusClient が必要です：

`https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## リクエスト構文\{#request-syntax}

```python
refresh_external_collection(
```

**パラメーター：**

- **collection_name** (*string*) -

    **[必須]**

    既存の外部コレクションの名前です。

- **external_source** (*str*) -

    外部ソース URI です。AWS S3 オブジェクトパスと同様です。

- **external_spec** (*str*) -

    一連の補助パラメーターからなる外部ソースの仕様です。format (str)：対象のソースデータファイルの形式です。指定可能な値は parquet、vortex、lance-table、iceberg-table です。snapshot_id (str)：Iceberg テーブルの ID です。これは format が iceberg-table の場合にのみ適用されます。extfs (string)：文字列化された JSON 構造の外部ファイルシステム設定です。指定可能なオプションは次のとおりです。access_key_id (string)：オブジェクトストレージサービスのアクセスキー ID です。access_key_val (string)：オブジェクトストレージサービスのアクセスキー値です。cloud_provider (string)：オブジェクトストレージサービスのクラウドプロバイダーです。region (string)：オブジェクトストレージサービスのリージョンです。use_iam (string)：バケットアクセス認証に AWS IAM を使用するかどうかです。指定可能な値は "true" または "false" です。iam_endpoint (string)：AWS IAM STS エンドポイントです。use_ssl (string)：オブジェクトストレージバケットへのアクセスに SSL を使用するかどうかです。指定可能な値は "true" または "false" です。use_virtual_host (string)：バケットアクセスに仮想ホスティングを使用するかどうかです。詳細は、この記事を参照してください。storage_type (string)：ストレージタイプです。指定可能な値は remote です。role_arn (string)：バケット所有者から取得した AWS IAM ロール ARN です。external_id (string)：バケット所有者から取得した外部 ID です。load_frequency (string)：Milvus が一時認証情報を取得する間隔（秒）です。

- **timeout** (*float*) -

    この操作のタイムアウト時間です。None に設定した場合、応答の到着時またはエラーの発生時にこの操作がタイムアウトすることを示します。

- **external_source** (*str*) -

    外部ソース URI です。アクセス可能な外部ボリュームを指す `volume://` URI である必要があります。例：`volume://<volume-name>/path/to/folder/`。

- **external_spec** (*str*) -

    外部ソースの仕様です。これは一連の補助パラメーターです：

    - **format** (*str*) - 

        対象のソースデータファイルの形式です。

        指定可能な値は `parquet`、`vortex`、`lance-table`、`iceberg-table` です。

    - **snapshot_id** (*str*) -

        Iceberg テーブルの ID です。これは `format` が `iceberg-table` の場合にのみ適用されます。

**戻り値の型：**

*int*

**戻り値：**

作成された非同期ジョブを示す整数です。

## 例\{#examples}

```python
import time

from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
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
        break
    elif progress.state == "RefreshFailed":
        print(f"  Failed: {progress.reason}")
        break

    time.sleep(2)
```

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
