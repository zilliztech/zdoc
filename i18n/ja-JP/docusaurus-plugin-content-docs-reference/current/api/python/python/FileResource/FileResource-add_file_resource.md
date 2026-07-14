---
title: "add_file_resource() | Python"
slug: /python/python/FileResource-add_file_resource
sidebar_label: "add_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus cluster 用に設定された object store にすでにアップロードされているファイルを、名前付き file resource として登録します。登録後、この resource は、外部辞書を受け付ける analyzer パラメーター（`jieba` tokenizer の `extradictfile`、`stop` filter の `stopwordsfile`、`decompounder` filter の `wordlistfile`、`synonym` filter の `synonymsfile` など）から、`{\"type\" \"remote\", \"resourcename\": \"\", \"filename\": \"\"}` を使用して参照できます。対象ファイルはこの呼び出し時点で object store に存在している必要があります。サーバーは `path` を同期的に検証し、解決できない場合はリクエストを失敗させます。 | Python"
type: docx
token: F9CHd2o4po3VC2xX3zHczWVan2c
sidebar_position: 1
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - add_file_resource()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_file_resource()

Milvus cluster 用に設定された object store にすでにアップロードされているファイルを、名前付き file resource として登録します。登録後、この resource は、外部辞書を受け付ける analyzer パラメーター（`jieba` tokenizer の `extra_dict_file`、`stop` filter の `stop_words_file`、`decompounder` filter の `word_list_file`、`synonym` filter の `synonyms_file` など）から、`{"type": "remote", "resource_name": "<name>", "file_name": "<file_name>"}` を使用して参照できます。対象ファイルはこの呼び出し時点で object store に存在している必要があります。サーバーは `path` を同期的に検証し、解決できない場合はリクエストを失敗させます。

## Request syntax\{#request-syntax}

```python
add_file_resource(
    name: str,
    path: str,
    timeout: float | None = None,
    **kwargs
)
```

**PARAMETERS**:

- **name** (*str*) -
 resource を登録する際の一意な名前です。この値は、後でこの resource を参照する analyzer 設定で `resource_name` として渡します。

- **path** (*str*) -
 Milvus cluster 用に設定された object store 内のファイルの object key です。**rootPath プレフィックスを含める必要があります**。たとえば、cluster の `rootPath` が `file` で、ファイルを `s3://<bucket>/file/dict.txt` にアップロードした場合、`path` は `"file/dict.txt"` に設定します。既存の object に解決できない path を指定すると、呼び出しは `MilvusException`（`code=65535`、`message="file resource path not exist"`）で失敗します。

- **timeout** (*float* | *None*) -
 この操作のタイムアウト時間（秒）です。`None` の場合、タイムアウトは適用されません。

**RETURNS**:

*None*

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

# Upload the file to the cluster's object store out-of-band first
# (e.g., via mc, boto3, or the AWS CLI), then register it here.
client.add_file_resource(
    name="zh_terms",
    path="file/zh_terms.txt",
)

# The registered resource can now be referenced from analyzer configs.
analyzer_params = {
    "tokenizer": {
        "type": "jieba",
        "dict": ["_default_"],
        "extra_dict_file": {
            "type": "remote",
            "resource_name": "zh_terms",
            "file_name": "zh_terms.txt",
        },
    },
}
```

