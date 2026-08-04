---
title: "restore-collection | Cloud"
slug: /cli/cli/Backup-restorecollection
sidebar_label: "restore-collection"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从备份中恢复特定集合。 | Cloud"
type: docx
token: XvDzdZsb3ojqgXxhEjfcZBxbnNb
sidebar_position: 8
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - restore-collection
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# restore-collection

此操作从备份中恢复特定集合。

## 描述\{#description}

在 Zilliz Cloud 中，备份是数据的副本，可帮助您在数据丢失或系统故障时恢复整个集群或特定集合。

恢复集群会创建一个新集群，并将所有已备份的集合复制到其中。不带任何选项运行此命令将触发一组交互式提示。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopisis}

```bash
zilliz backup restore-collection
--cluster-id <value>
--backup-id <value>
--dest-cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

**选项：**

- **--cluster-id** (*string*) -

    **[必需]**

    表示源集群 ID，格式类似于 `inxx-xxxxx`。

    如果已使用 `zilliz context set` 配置集群，则在未配置此选项时会自动应用该集群。

- **--backup-id** (*string*) -

    **[必需]**

    表示备份 ID，格式类似于 `backupx-xxxxx`。

- **--dest-cluster-id** (*string*) -

    **[必需]**

    表示目标集群 ID，格式类似于 `inxx-xxxxx`。

- **--output, -o** (*string*) -

    表示输出格式。可选值：

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

    与以下模式匹配的原始 JSON 字符串。具体示例请参见 [恢复集合备份](/reference/restful/restore-collection-backup-v2)。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "Restore Collection",
        "type": "object",
        "properties": {
            "destClusterId": {
                "type": "string"
            },
            "dbCollections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "dbName": {
                            "type": "string"
                        },
                        "destDbName": {
                            "type": "string"
                        },
                        "collections": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "collectionName": {
                                        "type": "string"
                                    },
                                    "destCollectionName": {
                                        "type": "string"
                                    },
                                    "destCollectionStatus": {
                                        "type": "string",
                                        "enum": [
                                            "LOADED",
                                            "UNLOADED"
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "required": [
            "destClusterId"
        ]
    }
    ```

## 示例\{#example}

```bash
zilliz backup restore-collection /
--cluster-id in01-xxxx /
--backup-id backup-xxxx /
--dest-cluster-id in01-yyyy
```
