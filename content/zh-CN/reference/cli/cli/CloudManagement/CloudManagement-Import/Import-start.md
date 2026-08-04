---
title: "start | Cloud"
slug: /cli/cli/Import-start
sidebar_label: "start"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于启动一个数据导入任务。 | Cloud"
type: docx
token: KXgLdSiiZoMou6xEvnQcdVe3n25
sidebar_position: 2
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - start
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# start

此操作用于启动一个数据导入任务。

## Description\{#description}

要导入数据，请确保其已转换为可接受的格式。详情请参见 [Use BulkWriter](/docs/use-bulkwriter)。

## Synopsis\{#synopsis}

```bash
zilliz import start
--cluster-id <value>
--collection <value>
[--output <value>]
[--query <value>]
[--no-header]
--body <value>
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    指定目标集群 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未显式配置此选项时会自动应用该集群。

- **--collection** (*string*) -

    **[REQUIRED]**

    指定目标 collection 名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--body** (*string*) -

    **[REQUIRED]**

    指定请求体。其应为一个字符串化的 JSON 对象，包含多个文件路径，或者是单个文件或文件夹的路径。有关应用程序存储选项和格式选项，请参见 [Storage Options](/docs/data-import-storage-options) 和 [Format Options](/docs/data-import-format-options)。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "data paths",
        "type": "array",
        "items": {
            "type": "array",
            "items": {
                "type": "string",
            }
        }
    }
    ```

## Example\{#example}

```bash
# 从 S3 导入
zilliz import start --cluster-id in01-xxxx --collection my_col --body '{"files": [["s3://bucket/data.json"]]}'

# 使用 JSON 文件导入
zilliz import start --cluster-id in01-xxxx --collection my_col --body file://import-spec.json
```
