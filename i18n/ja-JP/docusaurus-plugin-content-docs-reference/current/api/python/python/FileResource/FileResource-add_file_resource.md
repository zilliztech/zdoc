---
title: "add_file_resource() | Python"
slug: /python/python/FileResource-add_file_resource
sidebar_label: "add_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus クラスター用に構成されたオブジェクトストアにすでにアップロードされているファイルを、名前付きファイルリソースとして登録します。登録後、このリソースは、外部辞書を受け付けるアナライザーパラメーター（`jieba` トークナイザーの `extradictfile`、`stop` フィルターの `stopwordsfile`、`decompounder` フィルターの `wordlistfile`、`synonym` フィルターの `synonymsfile` など）から、`{\"type\" \"remote\", \"resourcename\": \"\", \"filename\": \"\"}` を使用して参照できます。対象のファイルは、この呼び出しの時点でオブジェクトストアに存在している必要があります。サーバーは `path` を同期的に検証し、解決できない場合はリクエストを失敗させます。 | Python"
type: docx
token: F9CHd2o4po3VC2xX3zHczWVan2c
sidebar_position: 1
keywords: 
  - LLM 評価
  - スパースと高密度
  - 高密度ベクトル
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - クラウド
  - add_file_resource()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_file_resource()

Milvus クラスター用に構成されたオブジェクトストアにすでにアップロードされているファイルを、名前付きファイルリソースとして登録します。登録後、このリソースは、外部辞書を受け付けるアナライザーのパラメーター（`jieba` トークナイザーの `extra_dict_file`、`stop` フィルターの `stop_words_file`、`decompounder` フィルターの `word_list_file`、`synonym` フィルターの `synonyms_file` など）から、`{"type": "remote", "resource_name": "<name>", "file_name": "<file_name>"}` を使用して参照できます。対象のファイルは、この呼び出しの時点でオブジェクトストアに存在している必要があります。サーバーは `path` を同期的に検証し、解決できない場合はリクエストを失敗させます。

## リクエスト構文\{#request-syntax}

```python
add_file_resource(
    name: str,
    path: str,
    timeout: float | None = None,
    **kwargs
)
```

**パラメーター**:

- **name** (*str*) -<br/>
   リソースを登録する際の一意な名前です。この値は、後でこのリソースを参照するアナライザー設定において `resource_name` として渡すものです。

- **path** (*str*) -<br/>
   Milvus クラスター用に構成されたオブジェクトストア内のファイルのオブジェクトキーです。**`rootPath` プレフィックスを含みます**。たとえば、クラスターの `rootPath` が `file` で、ファイルを `s3://<bucket>/file/dict.txt` にアップロードした場合は、`path` に `"file/dict.txt"` を設定します。既存のオブジェクトに解決されないパスを指定した場合、呼び出しは `MilvusException`（`code=65535`、`message="file resource path not exist"`）で失敗します。

- **timeout** (*float* | *None*) -<br/>
   この操作のタイムアウト時間（秒単位）です。値が `None` の場合、タイムアウトは適用されません。

**戻り値**:

*None*

## 例\{#examples}

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

