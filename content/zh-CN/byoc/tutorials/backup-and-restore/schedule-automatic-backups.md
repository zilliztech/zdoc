---
title: "设置定时自动备份 | BYOC"
slug: /schedule-automatic-backups
sidebar_label: "设置定时自动备份"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持为集群设置定时自动备份，帮助您在发生异常问题时及时恢复数据。自动备份适用于整个集群，不支持单独为某个 Collection 设置定时自动备份。 | BYOC"
type: origin
token: TXyTwrfxCiStfek4hc7c2nKwnJc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 设置定时自动备份

Zilliz Cloud 支持为集群**设置定时自动备份**，帮助您在发生异常问题时及时恢复数据。自动备份适用于整个集群，不支持单独为某个 Collection 设置定时自动备份。

本文将介绍如何在 Zilliz Cloud 中设置定时自动备份。如需按需手动创建备份，请参见[创建备份](./create-backup)。

### 限制说明\{#limits}

- **访问控制**：仅项目管理员、组织管理员或拥有备份权限的自定义角色可执行备份操作。

- **不包含在备份中的内容**：

    - Collection 的 TTL 设置

    - Collection 和字段级别的 `mmap` 配置

    - 默认用户 `db_admin` 的密码（恢复时将重新生成新密码）

- **集群 Shard 设置**：集群的 Shard 信息会被备份，但如果在恢复集群过程中，您选择了减少集群 CU 规格，Shard 数量可能会根据 CU 规格有所调整，详见[使用限制](./limits#shards)。

- **备份任务限制**：

    - 定时自动备份执行期间无法发起手动备份。

    - 若当前有手动备份正在进行，定时自动备份仍将按计划执行。

## 开启定时自动备份\{#enable-automatic-backup}

定时自动备份为集群级别配置，默认处于关闭状态。由于备份会占用存储资源并产生费用，您可以根据实际需求决定是否开启定时自动备份以及自动备份的时间和频率。定时自动备份功能开启后，系统会立刻创建一个备份文件以实现数据保护。后续的备份将根据您设置的频率和时间自动创建。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何开启并配置定时自动备份：

<Supademo id="cmcsvbmq70k7d9st8g2772jpx" title=""  />

<Procedures>

1. 前往目标集群。

1. 点击**备份**页签。

1. 打开**备份策略**开关。

1. 设置定时自动备份的调度计划。

    - **时区**: 用于触发定时备份任务的时区。

    - **调度计划**: 从以下模式中选择一种以设置调度计划。

        - **基础**: 选择频率（每周或每月）并选择日期和时间。

        - **高级**: 通过输入 Cron 表达式来自定义调度计划。更多详情请参考 [Cron 表达式](./cron-expression)。

1. 点击**保存**。

</Procedures>

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何为指定集群开启定时自动备份。更多 API 参数细节，请参见[创建备份策略](https://docs.zilliz.com.cn/reference/restful/set-backup-policy-v2)。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "frequency": "1,2,3,5",
    "startTime": "02:00-04:00",
    "retentionDays": 7,
    "enabled": true
}'
```

示例返回结果如下。开启定时自动备份后，系统将立即创建一个备份任务，您可在项目下的[任务中心](./job-center)查看进度：

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED"
    }
}
```

## 查看定时自动备份设置\{#check-backup-schedule}

开启定时自动备份后，您可以查看当前的定时自动备份设置。

### 通过 Web 控制台\{#via-web-console}

以下 Demo 展示如何在 Zilliz Cloud 控制台中查看定时自动备份设置：

<Supademo id="cmcsvlqk403trxk0ielj7k9g6?utm_source=link" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何查询集群的定时自动备份策略。更多 API 参数细节，请参见[获取备份策略](https://docs.zilliz.com.cn/reference/restful/get-backup-policy-v2)。

```bash
curl --request GET \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

示例返回结果如下：

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED",
        "startTime": "02:00-04:00",
        "frequency": "1,2,3,5",
        "retentionDays": 7,
        "crossRegionPolicies": [
            {
                "regionId": "ali-cn-hangzhou",
                "retentionDays": 7,
                "region": "cn-hangzhou"
            },
            {
                "regionId": "ali-cn-shanghai",
                "retentionDays": 7,
                "region": "cn-shanghai"
            }
        ]
    }
}
```

## 关闭定时自动备份\{#disable-automatic-backup}

您也可以为集群关闭定时自动备份。

### 通过 Web 控制台\{#via-web-console}

以下演示展示如何通过控制台关闭自动备份：

<Supademo id="cmcsvo3k30kkz9st89plxmshd?utm_source=link" title=""  />

### 通过 RESTful API\{#via-restful-api}

以下示例展示如何关闭指定集群的定时自动备份。更多 API 参数细节，请参见[创建备份策略](https://docs.zilliz.com.cn/reference/restful/set-backup-policy-v2)。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "enabled": false
}'
```

示例返回结果如下：

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "DISABLED"
    }
}
```

## 常见问题\{#faqs}

**备份任务一般需要多久？**
备份所需时间取决于数据大小。备份 700 MB 数据大约需要 1 秒。如果集中包含超过 1,000 个 Collection，备份所需时间可能略有延长。

**备份过程中可以执行 DDL 操作吗？**
建议在备份任务进行时避免频繁执行 DDL 操作（如创建或删除 Collection），否则可能导致备份数据不一致。

**自动备份的文件会保留多久？**
 默认保留时间为 7 天，您可以根据需要调整，最长可设置为 30 天。

**删除集群后，自动创建的备份文件会被删除吗？**
会的。删除集群时，所有与该集群的自动备份文件也会一并被删除。