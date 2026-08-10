---
title: "update-policy | Cloud"
slug: /cli/cli/Backup-updatepolicy
sidebar_label: "update-policy"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于更新集群的备份策略。| Cloud"
type: docx
token: PJsSdI8JBoUchVx1IkrcmakLnCc
sidebar_position: 9
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - cloud
  - update-policy
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update-policy

此操作用于更新集群的备份策略。

## 说明\{#description}

Zilliz Cloud 支持为您的集群启用**自动备份**，帮助您在发生意外问题时确保数据可恢复。自动备份适用于**整个集群**，不支持自动备份单个 Collection。

您可以运行此命令来更新自动备份策略。运行此命令时如果不带任何选项，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="Notes">

此功能仅适用于 **Dedicated** 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz backup update-policy
--cluster-id <value>
--auto-backup
--frequency <value>
--start-time <value>
--rentention-days <value>
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## 选项\{#options}

- **--cluster-id** (*string*) -

    **[必需]**

    表示集群 ID，类似于 `inxx-xxxxx`。

    如果集群使用 `zilliz context set` 进行了配置，则在未配置此选项时会自动生效。

- **--auto-backup** (*boolean*) -

    **[必需]**

    表示是否启用或禁用自动备份。

- **--frequency** (*string*) -

    表示自动备份作业的运行频率。当 `--auto-backup` 为 `true` 时，此选项为必需。可能的值包括：

    - `daily`

    - `weekdays`

    - `weekends`，或

    - `1-7`（1=周一，7=周日）。例如，`1,3,5`。

- **--start-time** (*string*) -

    表示 UTC 时区的开始小时，例如 `02:00`。当 `--auto-backup` 为 `true` 时，此选项为必需。

- **--retention-days** (*integer*) -

    备份保留天数（1-30）。当 `--auto-backup` 为 `true` 时为必需。

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

    与以下 Schema 匹配的原始 JSON 字符串。具体示例请参见 [设置备份策略](/reference/restful/set-backup-policy-v2)。

    ```json
    {
        "type": "object",
        "properties": {
            "frequency": {
                "type": "string",
                "example": "1,2,5"
            },
            "startTime": {
                "type": "string",
                "example": "02:00-04:00"
            },
            "retentionDays": {
                "type": "integer",
                "minimum": 1,
                "maximum": 30,
                "example": 7
            },
            "enabled": {
                "type": "boolean",
                "example": true
            },
            "crossRegionCopies": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "regionId": {
                            "type": "string",
                            "example": "aws-us-west-2"
                        },
                        "retentionDays": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 30,
                            "example": 7
                        }
                    }
                }
            }
        },
        "required": [
            "enabled"
        ]
    }
    ```

## 示例\{#example}

```bash
# Enable daily backup at 2am UTC with 7-day retention
zilliz backup update-policy --cluster-id in01-xxxx \
--auto-backup true \
--frequency daily \
--start-time 02:00 \
--retention-days 7

# Enable backup on Mon/Wed/Fri at 3am UTC
zilliz backup update-policy \
--cluster-id in01-xxxx \
--auto-backup true \
--frequency 1,3,5 \
--start-time 03:00-05:00 \
--retention-days 14

# Disable auto-backup
zilliz backup update-policy --cluster-id in01-xxxx --auto-backup false
```
