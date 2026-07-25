---
title: "跨地域备份 | Cloud"
slug: /backup-to-other-regions
sidebar_key: backup-to-other-regions
sidebar_label: "跨地域备份"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 的跨区域备份通过将备份复制到多个云地域来增强数据保护。它可防范区域性故障，并通过降低本地故障带来的风险，支持灾难恢复、业务连续性和高可用性。 | Cloud"
type: origin
token: DwklwhvhBi1xiQkdaxVcbIK0ned
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 备份
  - 快照
  - 跨地域备份

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 跨地域备份

Zilliz Cloud 的跨区域备份通过将备份复制到多个云地域来增强数据保护。它可防范区域性故障，并通过降低本地故障带来的风险，支持灾难恢复、业务连续性和高可用性。

本指南将带您了解如何在 Zilliz Cloud 上将备份复制到其他区域。

跨地域备份功能暂不适用于腾讯云。

<Admonition type="info" icon="📘" title="说明">

请[提交工单](http://support.zilliz.com.cn)开通此功能。

</Admonition>

## 限制说明\{#limits}

- **访问控制**：仅项目管理员、组织管理员或拥有备份权限的自定义角色可执行备份操作。

- **不包含在备份中的内容**：

    - Collection 的 TTL 设置

    - Collection 和字段级别的 `mmap` 配置

    - 默认用户 `db_admin` 的密码（恢复时将重新生成新密码）

- **集群 Shard 设置**：集群的 Shard 信息会被备份，但如果在恢复集群过程中，您选择了减少集群 CU 规格，Shard 数量可能会根据 CU 规格有所调整，详见[使用限制](./limits#shards)。

- **备份任务限制**：系统将先执行在原地域的创建备份的任务。任务完成后，将继续开始执行跨地域备份任务。

## 操作步骤\{#procedure}

您可以在[手动创建备份](./create-snapshot)或[设置定时自动备份](./schedule-automatic-backups)时启用跨地域备份。

- **手动备份：** 如果在手动创建备份时选择开启跨地域备份，所有跨地域备份将被永久保留。

- **设置定时自动备份：** 如果在设置定时自动备份时选择开启跨地域备份，您必须为每个地域的备份文件设置保留时长。

<Admonition type="info" icon="📘" title="说明">

您只能选择与集群云地域相同云服务商下的其他区域。

</Admonition>

以下示例介绍如何手动创建跨地域备份。如需了解如何在设置定时自动备份时设置跨地域备份策略，请参考[设置定时自动备份](./schedule-automatic-backups)。

<Supademo id="cmgkgzjgk2e2ukrn9fmfc0zjb?utm_source=link" title=""  />

您也可以使用 Zilliz Cloud RESTful API 在为集群创建同地域备份的同时将该备份同步到指定的其它地域。

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "backupType": "COLLECTION",
    "dbCollections": [
        {
            "dbName": "my_database",
            "collectionNames": [
                "collection_1",
                "collection_2"
            ]
        }
    ],
    "crossRegionCopies": [
        {
            "regionId": "ali-cn-hangzhou"
        },
        {
            "regionId": "ali-cn-shanghai"
        }
    ]
}'
```

接口调用结果如下：

```json
{
    "code": 0,
    "data": {
        "backupId": "backupx_xxxxxxxxxxxxxxx",
        "backupName": "Dedicated_01",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxxx"
    }
}
```

在[任务中心](./job-center)列表中，您会先看到原始备份任务。任务完成后，会出现跨地域备份的任务，每个地域对应一条任务记录。

## 计费说明\{#billing-implications}

当您将备份文件复制到其他云服务地域时，可能会产生两类费用：

- **存储费用**：取决于复制的备份文件所在的地域。如需了解如何计算存储费用，请参见[存储费用](./storage-cost)。

- **数据传输费用**：取决于源地域与目标地域之间的流量。如需了解如何计算数据传输费用，请参见[数据传输费用](./data-transfer-cost)。

详细费率请参见 [Zilliz Cloud 定价详情](https://zilliz.com.cn/pricing/pricing-guide)。

### 示例\{#example}

假设您的集群部署在**阿里云华东1（杭州）**，您需要将该集群的备份文件复制到两个不同的地域：**阿里云华东2（上海）**和**阿里云美国（弗吉尼亚）**：

- **原始备份文件大小**：20 GB

- **跨区备份文件保留天数**：1 个月

- **单价**：

    - 阿里云备份存储单价为 **¥0.50/GB/月**。

    - 从阿里云华东1（杭州）到阿里云华东2（上海）的数据传输，按同一大洲跨地域费率 **¥0.50/GB** 计费。

    - 从阿里云华东1（杭州）到阿里云美国（弗吉尼亚）的数据传输，按跨大洲跨地域费率 **¥5.6/GB**  计费。

**费用计算如下**：

- **存储费用**：`20 GB × ¥0.50/GB/月 × 1 个月 × 2 份备份文件 = ¥20.00`

- **数据传输费用**：`(20 GB × ¥0.50/GB ) + (20 GB × ¥5.6/GB) = ¥122.00`

- **总费用**：`¥20.00（存储） + ¥122.00（数据传输） = ¥142.00`

