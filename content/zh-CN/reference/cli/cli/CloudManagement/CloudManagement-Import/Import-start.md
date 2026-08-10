---
title: "start | Cloud"
slug: /cli/cli/Import-start
sidebar_label: "start"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会启动一个数据导入作业。 | Cloud"
type: docx
token: KXgLdSiiZoMou6xEvnQcdVe3n25
sidebar_position: 2
keywords: 
  - Milvus Lite
  - Milvus benchmark
  - 托管式 Milvus
  - Serverless 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - start
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# start

此操作会启动一个数据导入作业。

## 说明\{#description}

要导入数据，请确保其已转换为可接受的格式。有关详细信息，请参阅 [使用 BulkWriter](/docs/use-bulkwriter)。

## 概要\{#synopsis}

```bash
zilliz import start
--cluster-id <value>
--collection <value>
[--output <value>]
[--query <value>]
[--no-header]
--body <value>
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    表示目标集群 ID，类似于 `inxx-xxxxx`。

    如果使用 `zilliz context set` 配置了集群，则在未配置此选项时会自动应用该配置。

- **--collection** (*string*) -

    **[必需]**

    表示目标 Collection 名称。

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

    **[必需]**

    表示请求体，应为包含多个文件路径的字符串化 JSON 对象，或单个文件或文件夹的路径。有关应用存储选项和格式选项，请参阅 [存储选项](/docs/data-import-storage-options) 和 [格式选项](/docs/data-import-format-options)。

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

## 示例\{#example}

```bash
# Import from S3
zilliz import start --cluster-id in01-xxxx --collection my_col --body '{"files": [["s3://bucket/data.json"]]}'

# Import using a JSON file
zilliz import start --cluster-id in01-xxxx --collection my_col --body file://import-spec.json
```
