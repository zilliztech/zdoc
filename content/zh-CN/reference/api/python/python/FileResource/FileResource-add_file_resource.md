---
title: "add_file_resource() | Python"
slug: /python/python/FileResource-add_file_resource
sidebar_label: "add_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "将已上传到为 Milvus 集群配置的对象存储中的文件注册为具名文件资源。注册后，可在接受外部词典的 Analyzer 参数中通过 `{\"type\" \"remote\", \"resourcename\": \"\", \"filename\": \"\"}` 引用该资源，例如 `extradictfile` `jieba` tokenizer 上的参数、`stopwordsfile` `stop` filter 上的参数、`wordlistfile` `decompounder` filter 上的参数，以及 `synonymsfile` `synonym` filter 上的参数。目标文件在调用此方法时必须已存在于对象存储中；服务器会同步验证 `path`，如果无法解析，请求将失败。 | Python"
type: docx
token: F9CHd2o4po3VC2xX3zHczWVan2c
sidebar_position: 1
keywords: 
  - llm 评估
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - zilliz
  - zilliz cloud
  - 云
  - add_file_resource()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_file_resource()

将已上传到为 Milvus 集群配置的对象存储中的文件注册为具名文件资源。注册后，可在接受外部词典的 Analyzer 参数中通过 `{"type": "remote", "resource_name": "<name>", "file_name": "<file_name>"}` 引用该资源，例如 `extra_dict_file` `jieba` tokenizer 上的参数、`stop_words_file` `stop` filter 上的参数、`word_list_file` `decompounder` filter 上的参数，以及 `synonyms_file` `synonym` filter 上的参数。目标文件在调用此方法时必须已存在于对象存储中；服务器会同步验证 `path`，如果无法解析，请求将失败。

## 请求语法\{#request-syntax}

```python
add_file_resource(
    name: str,
    path: str,
    timeout: float | None = None,
    **kwargs
)
```

**参数**：

- **name** (*str*) -<br/>
   用于注册该资源的唯一名称。稍后在引用此资源的 Analyzer 配置中，您需要将此值作为 `resource_name` 传入。

- **path** (*str*) -<br/>
   为 Milvus 集群配置的对象存储中文件的对象键，**包括 rootPath 前缀**。例如，如果集群的 `rootPath` 为 `file`，并且您将文件上传到了 `s3://<bucket>/file/dict.txt`，请将 `path` 设为 `"file/dict.txt"`。如果该路径无法解析为现有对象，此调用将因 `MilvusException` 而失败（`code=65535`、`message="file resource path not exist"`）。

- **timeout** (*float* | *None*) -<br/>
   此操作的超时时长（以秒为单位）。值为 `None` 表示不应用超时。

**返回**：

*None*

## 示例\{#examples}

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

