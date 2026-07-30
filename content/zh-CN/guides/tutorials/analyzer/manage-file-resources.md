---
title: "管理文件资源 | Cloud"
slug: /manage-file-resources
sidebar_label: "管理文件资源"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "文件资源 是服务器端注册的外部词典文件引用，文本分析器可在运行时使用这些文件。在 Milvus 3.0 中，以下 4 个分析器组件可以从文件资源加载词典，而不是从内联数组加载词典： | Cloud"
type: origin
token: X37Jw3gFtiNnXXkkVm7cvcBensg
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 管理文件资源

**文件资源** 是服务器端注册的外部词典文件引用，文本分析器可在运行时使用这些文件。在 Milvus 3.0 中，以下 4 个分析器组件可以从文件资源加载词典，而不是从内联数组加载词典：

| **分析器组件** | **接受文件资源的参数** |
| --- | --- |
| [Jieba](./jieba-tokenizer) | `extra_dict_file` |
| [Stop](./stop-filter) | `stop_words_file` |
| [Decompounder](./decompounder-filter) | `word_list_file` |
| [Synonym](./synonym-filter) | `synonyms_file` |

文件资源可解决内联词典数组带来的两个实际问题：

- 真实词典通常很大。中文 Jieba 词表可能包含数万行；同义词表通常包含数千条规则。将这些内容内联到分析器配置中并不现实。

- 同一个词典通常会在多个 Collection 之间共享。只需注册一次词典，然后按名称引用，即可保持 Schema 简洁，并将词典更新变为单次操作。

## 文件资源类型\{#}

Milvus 支持两种文件资源类型，它们的管理职责不同：

| **类型** | **文件位置** | **文件管理方** | **适用场景** |
| --- | --- | --- | --- |
| **远程（Remote）** | Milvus 集群已配置使用的对象存储（MinIO / S3 / GCS / Azure）中 | Milvus，通过 `add_file_resource` / `remove_file_resource` / `list_file_resources` 客户端 API 管理 | 推荐用于大多数部署。 |
| **本地（Local）** | 每个 Milvus 组件（DataNode、QueryNode、StreamingNode）本地文件系统上的同一绝对路径 | 您自行挂载文件，例如通过 Kubernetes Volume | 适用于希望在 Milvus 外部自行管理词典文件的开源版 / 自托管场景。 |

本文其余部分将依次介绍这两种类型，并从更常用的远程类型开始。

## 前提条件\{#}

- Milvus 3.0 或更高版本。

- **基于 master 分支构建的 PyMilvus**（版本 `2.7.0rc202` 或更高版本）。更早的 PyPI 版本尚未暴露 `add_file_resource` / `remove_file_resource` / `list_file_resources`。

```shell
pip install -U "pymilvus @ git+https://github.com/milvus-io/pymilvus.git"
```

- 对于 **远程（Remote）** 文件资源，您的 Milvus 部署必须已配置对象存储。大多数部署默认已经配置对象存储。请检查 `milvus.yaml` 中的 `minio:` 部分（或等效的 Helm Chart Values），并记下 `bucketName` 和 `rootPath` 的值；注册文件资源时会用到这些值。

- 对于 **本地（Local）** 文件资源，您必须能够将文件放置到每个 Milvus Pod / Container 的同一绝对路径。具体方式取决于您的部署方式，例如 Bind Mount、基于 ConfigMap 的 Volume、Init Container 等。

## 注册远程文件资源\{#}

注册远程文件资源需要 3 个步骤：将文件 **上传** 到对象存储，使用选定名称将文件 **注册** 到 Milvus，然后在需要该文件的任意分析器中 **引用** 该文件。

### 步骤 1. 将词典文件上传到对象存储\{#1}

使用您自己的工具（例如 `mc`、`aws s3 cp`、`boto3` 或任何兼容 S3 的客户端）将文件放入 Milvus 配置使用的 Bucket。

例如，如果 `milvus.yaml` 包含以下配置：

```yaml
minio:bucketName: milvus-bucketrootPath: file
```

在上传名为 `chinese_terms.txt` 的文件时，如果以 `rootPath` 作为 Prefix，则该对象将位于 `s3://milvus-bucket/file/chinese_terms.txt`。

您在步骤 2 中传递给 `add_file_resource` 的 `path` 参数是 **完整对象 Key，包括 rootPath Prefix**。在上面的示例中，应使用 `path="file/chinese_terms.txt"`。如果路径不包含 Prefix（例如仅使用 `"chinese_terms.txt"`），请求会被拒绝，并返回错误 `file resource path not exist`。

### 步骤 2. 使用 `add_file_resource` 注册文件\{#2-addfileresource}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.add_file_resource(
    name="chinese_terms",                # 后续引用时使用的简短唯一名称
    path="file/chinese_terms.txt",       # 完整 S3 对象 Key，包括 rootPath Prefix
)
```

`add_file_resource` 会同步校验文件：只有当 Milvus 确认配置的对象存储中存在 `path` 指向的对象后，该调用才会返回。如果对象不存在，该调用会抛出 `MilvusException(code=65535, "file resource path not exist")`。请先上传文件，然后重试。

该调用是幂等的。使用相同的 `name` 和 `path` 调用 `add_file_resource` 两次不会创建重复资源。

### 步骤 3. 在分析器中引用文件资源\{#3}

在接受文件引用的分析器参数（`extra_dict_file`、`stop_words_file`、`word_list_file`、`synonyms_file`）中，使用标准远程格式：

```python
{
    "type": "remote",
    "resource_name": "chinese_terms",    # 必须与 add_file_resource 中的 name 匹配"file_name": "chinese_terms.txt",    # 仅文件名；Milvus 使用该字段在资源中识别文件
}
```

所有 4 个分析器参数都使用同样的对象结构；只有外层的分析器 Key 不同。

参数名是 `resource_name` 和 `file_name`，不是 `name` 和 `file`。如果使用 `name` / `file`（或使用 `"type": "resource"` 而不是 `"type": "remote"`），分析器创建时会抛出 `MilvusException`，并显示类似 `resource name of remote file ... must be set` 的错误信息。

## 列出文件资源\{#}

```python
resources = client.list_file_resources()
for r in resources:
    print(r.name, r.path)
# chinese_terms file/chinese_terms.txt
```

`list_file_resources()` 返回 `FileResourceInfo` 对象列表，每个对象都有 `.name` 和 `.path` 属性。空集群会返回 `[]`。目前没有按单个资源查询的 `get` API；`list_file_resources` 是唯一的读取 API。

## 删除文件资源\{#}

```python
client.remove_file_resource(name="chinese_terms")
```

`remove_file_resource` 是幂等的：如果传入的名称不存在，该调用会返回 `None`，且不会抛出异常。

删除文件资源前，请先 Drop 或修改所有分析器配置引用该资源的 Collection。保留文件资源直到没有 Collection 依赖它，可以避免资源删除后分析器查找失败的风险。

## 使用本地文件资源\{#}

**本地（Local）** 文件资源直接指向每个 Milvus 组件本地文件系统上的路径。使用本地文件资源时无需调用 `add_file_resource`，因为 Milvus 不会跟踪本地资源。您需要自行将文件放置到每个相关 Pod 或 Container 的同一绝对路径，然后通过路径引用该文件：

```python
{
    "type": "local",
    "path": "/var/lib/milvus/dicts/chinese_terms.txt",
}
```

本地文件资源仅适用于您可以控制 DataNode、QueryNode 和 StreamingNode 文件系统的部署，通常是裸金属上的自托管 Milvus，或允许添加 Volume Mount 的 Kubernetes 集群。该文件必须在每个组件上都位于完全相同的绝对路径；否则，部分节点在加载分析器时会失败。

分析器首次创建时会打开该文件。如果此时路径不存在，分析器创建会失败，并抛出 `MilvusException(code=2000, "IOError: No such file or directory")`。

## 生命周期说明\{#}

- **集群级可用性不是即时的。** `add_file_resource` 返回后，Milvus 会将文件同步到需要该文件的每个组件。在这个短暂窗口内，引用该资源的 Collection 在尚未完成同步的节点上可能创建失败。通常的修复方式是等待几秒后重试创建调用。

- **仅在没有 Collection 依赖该资源时删除。** 调用 `remove_file_resource` 前，请先 Drop 或修改所有分析器配置引用该资源的 Collection，以避免分析器查找文件失败。

- **仅包含元数据。** `list_file_resources()` 返回 `name` 和 `path`，不返回大小、Checksum、上传时间或其他元数据。如果您需要跟踪词典版本，请使用自己的命名约定。

