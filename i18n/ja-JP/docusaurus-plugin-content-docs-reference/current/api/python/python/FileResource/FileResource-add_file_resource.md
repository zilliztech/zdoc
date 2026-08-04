---
title: "add_file_resource() | Python"
slug: /python/python/FileResource-add_file_resource
sidebar_label: "add_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus cluster 用に設定されたオブジェクトストアにすでにアップロードされているファイルを、名前付きファイルリソースとして登録します。登録後、このリソースは外部辞書を受け付ける analyzer パラメータ — たとえば `jieba` tokenizer の `extradictfile`、`stop` filter の `stopwordsfile`、`decompounder` filter の `wordlistfile`、`synonym` filter の `synonymsfile` — から、`{\"type\" \"remote\", \"resourcename\": \"\", \"filename\": \"\"}` を使用して参照できます。対象ファイルはこの呼び出し時点でオブジェクトストアに存在している必要があります。サーバーは `path` を同期的に検証し、解決できない場合はリクエストを失敗させます。 | Python"
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

Milvus cluster 用に設定されたオブジェクトストアにすでにアップロードされているファイルを、名前付きファイルリソースとして登録します。登録後、このリソースは外部辞書を受け付ける analyzer パラメータ — たとえば `jieba` tokenizer の `extra_dict_file`、`stop` filter の `stop_words_file`、`decompounder` filter の `word_list_file`、`synonym` filter の `synonyms_file` — から、`{"type": "remote", "resource_name": "<name>", "file_name": "<file_name>"}` を使用して参照できます。対象ファイルはこの呼び出し時点でオブジェクトストアに存在している必要があります。サーバーは `path` を同期的に検証し、解決できない場合はリクエストを失敗させます。

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

- **name** (*str*) -<br/>
   リソースを登録する際の一意な名前です。この値は、後でこのリソースを参照する analyzer 設定で `resource_name` として渡します。

- **path** (*str*) -<br/>
   Milvus cluster 用に設定されたオブジェクトストア内のファイルのオブジェクトキーで、**rootPath プレフィックスを含みます**。たとえば、cluster の `rootPath` が `file` で、ファイルを `s3://<bucket>/file/dict.txt` にアップロードした場合、`path` を `"file/dict.txt"` に設定します。既存のオブジェクトに解決されないパスを指定すると、呼び出しは `MilvusException`（`code=65535`, `message="file resource path not exist"`）で失敗します。

- **timeout** (*float* | *None*) -<br/>
   この操作のタイムアウト時間（秒単位）です。`None` を指定すると、タイムアウトは適用されません。

**RETURNS**:

*None*

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

# まずファイルを cluster のオブジェクトストアに帯域外でアップロードし、
# （例: mc、boto3、または AWS CLI を使用）、その後ここで登録します。
client.add_file_resource(
    name="zh_terms",
    path="file/zh_terms.txt",
)

# 登録したリソースは analyzer 設定から参照できるようになります。
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

