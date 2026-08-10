---
title: "restore-collection | Cloud"
slug: /cli/cli/Backup-restorecollection
sidebar_label: "restore-collection"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可从备份中恢复特定 Collection。 | Cloud"
type: docx
token: XvDzdZsb3ojqgXxhEjfcZBxbnNb
sidebar_position: 8
keywords: 
  - 向量数据库对比
  - openai 向量数据库
  - 自然语言处理 Database
  - 便宜的向量 Database
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

此操作可从备份中恢复特定 Collection。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您数据的一个副本，可用于在发生数据丢失或系统故障时恢复整个集群或特定 Collection。

恢复集群会创建一个新集群，并将所有已备份的 Collection 复制到其中。在不带选项的情况下运行此命令，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="Notes">

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

    如果集群是使用 `zilliz context set` 配置的，则在未配置此选项时会自动应用。

- **--backup-id** (*string*) -

    **[必需]**

    表示备份 ID，格式类似于 `backupx-xxxxx`。

- **--dest-cluster-id** (*string*) -

    **[必需]**

    表示目标集群 ID，格式类似于 `inxx-xxxxx`。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

- **--body** (*string*) -

    与以下 Schema 匹配的原始 JSON 字符串。具体示例请参见 [恢复 Collection 备份](/reference/restful/restore-collection-backup-v2)。

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
