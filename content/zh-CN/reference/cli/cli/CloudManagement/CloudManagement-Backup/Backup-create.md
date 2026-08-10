---
title: "create | Cloud"
slug: /cli/cli/Backup-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为集群创建备份。 | Cloud"
type: docx
token: RriNdfGjjofQL4x8XlhcHug6nvd
sidebar_position: 1
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作会为集群创建备份。

## 说明\{#description}

在 Zilliz Cloud 中，备份是您的数据副本，可在数据丢失或系统故障时帮助您恢复整个集群或特定 Collection。

运行此命令时如果不带任何选项，系统会引导您完成一组交互式提示。

创建备份会产生额外费用，定价取决于备份存储所在的云区域。所有备份文件都存储在与源集群相同的云区域中。例如，位于 `AWS us-west-2` 的集群，其备份将存储在 `AWS us-west-2`。

<Admonition type="info" icon="📘" title="Notes">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz backup create
--cluster-id <value>
[--database <value>]
[--collection <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    表示集群 ID，类似于 `inxx-xxxxx`。

    如果集群是使用 `zilliz context set` 配置的，则在未配置此选项时会自动应用该配置。

- **--database** (*string*) -

    表示用于 Collection 级备份的 Database 名称。

- **--collection** (*string*) -

    表示 Collection 名称。进行完整集群备份时，您可以省略此项。

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

    与以下 Schema 匹配的原始 JSON 字符串。有关具体示例，请参见 [创建备份](/reference/restful/create-backup-v2)。

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "create backup",
        "type": "object",
        "properties": {
            "backupType": {
                "type": "string",
                "enum": [
                    "CLUSTER",
                    "COLLECTION"
                ]
            },
            "dbCollections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "dbName": {
                            "type": "string"
                        },
                        "collectionNames": {
                            "type": "array",
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                }
            },
            "crossRegionCopies": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "regionId": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "required": [
            "backupType"
        ]
    }
    ```

## 示例\{#example}

```bash
# Full cluster backup (default)
zilliz backup create --cluster-id in01-xxxxxxxxxxxx

# Collection-level backup
zilliz backup create --cluster-id in01-xxxxxxxxxxxx \
--database default \
--collection my_col
```
