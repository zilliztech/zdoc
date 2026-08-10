---
title: "modify | Cloud"
slug: /cli/cli/Cluster-modify
sidebar_label: "modify"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改集群配置，例如扩缩容已分配的 CU 数量或要创建的副本数。 | Cloud"
type: docx
token: AYlXdnqMKoQOzRxSbWScn0A5nqf
sidebar_position: 6
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - cloud
  - modify
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# modify

此操作用于修改集群配置，例如扩缩容已分配的 CU 数量或要创建的副本数。

## 说明\{#description}

您可以使用此命令更改指定集群的 CU 规格和副本数量。此命令仅适用于 Dedicated 集群。

运行

## 概要\{#synopsis}

```bash
zilliz cluster modify
--cluster-id <value>
[--cu-size <value>]
[--replica <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    表示要修改的集群 ID。

    如果集群是使用 `zilliz context set` 配置的，则在未配置此选项时会自动应用。

- **--cu-size** (*integer*) -

    表示此操作后的计算单元（CU）数量。

    CU 是用于数据并行处理的计算资源基本单位，不同类型的 CU 由不同组合的 CPU、内存和存储构成。CU 的概念仅适用于 **Dedicated** 集群。

    - 对于 **Standard** 项目中的 **Dedicated** 集群，其 CU 规格与副本数量的乘积必须小于或等于 32。

    - 对于 **Enterprise** 项目中的 **Dedicated** 集群，其 CU 规格与副本数量的乘积必须小于或等于 1,024。

- **--replica** (*integer*) -

    表示此操作后的副本数量。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

- **--body** (*string*) -

    表示与以下 Schema 匹配的 JSON 负载。有关具体示例，请参见 [修改集群](/reference/restful/modify-cluster-v2)。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "modify cluster",
        "type": "object",
        "properties": {
            "cuSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1024
            },
            "replica": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1024
            }
        },
        "required": [
            "cuSize"
        ]
    }
    ```

## 示例\{#example}

```bash
# Scale to 2 CUs
zilliz cluster modify --cluster-id in01-xxxxxxxxxxxx --cu-size 2

# Set replicas
zilliz cluster modify --cluster-id in01-xxxxxxxxxxxx --replica 2
```
