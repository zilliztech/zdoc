---
title: "add_file_resource() | Python"
slug: /python/python/FileResource-add_file_resource
sidebar_label: "add_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "将已上传到为 Milvus 集群配置的对象存储中的文件注册为具名文件资源。注册后，该资源可以在接受外部词典的分析器参数中被引用——例如 `jieba` tokenizer 上的 `extradictfile`、`stop` filter 上的 `stopwordsfile`、`decompounder` filter 上的 `wordlistfile` 以及 `synonym` filter 上的 `synonymsfile`——使用 `{\"type\" \"remote\", \"resourcename\": \"\", \"filename\": \"\"}`。目标文件在调用时必须已存在于对象存储中；服务器会同步校验 `path`，如果无法解析则请求失败。 | Python"
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

将已上传到为 Milvus 集群配置的对象存储中的文件注册为具名文件资源。注册后，该资源可以在接受外部词典的分析器参数中被引用——例如 `jieba` tokenizer 上的 `extra_dict_file`、`stop` filter 上的 `stop_words_file`、`decompounder` filter 上的 `word_list_file` 以及 `synonym` filter 上的 `synonyms_file`——使用 `{"type": "remote", "resource_name": "<name>", "file_name": "<file_name>"}`。目标文件在调用时必须已存在于对象存储中；服务器会同步校验 `path`，如果无法解析则请求失败。

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
   用于注册该资源的唯一名称。后续在引用此资源的分析器配置中，您需要将此值作为 `resource_name` 传入。

- **path** (*str*) -<br/>
   为 Milvus 集群配置的对象存储中文件的对象键，**包括 rootPath 前缀**。例如，如果集群的 `rootPath` 为 `file`，且您将文件上传到了 `s3://<bucket>/file/dict.txt`，则应将 `path` 设置为 `"file/dict.txt"`。如果该路径无法解析为现有对象，则调用会因 `MilvusException` 失败（`code=65535`，`message="file resource path not exist"`）。

- **timeout** (*float* | *None*) -<br/>
   此操作的超时时长（以秒为单位）。值为 `None` 表示不设置超时。

**返回值**：

*None*

## 示例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

# 先以带外方式将文件上传到集群的对象存储
# （例如通过 mc、boto3 或 AWS CLI），然后在此处注册它。
client.add_file_resource(
    name="zh_terms",
    path="file/zh_terms.txt",
)

# 现在可以在分析器配置中引用已注册的资源。
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

