---
title: "导出备份文件 | Cloud"
slug: /export-backup-files
sidebar_label: "导出备份文件"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "您可以通过 Zilliz Cloud 控制台将备份文件导出至对象存储。 | Cloud"
type: origin
token: WXBjwo4sgiCDX8kZvBwcJrJCnyg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 导出备份文件

您可以通过 Zilliz Cloud 控制台将备份文件导出至对象存储。

<Admonition type="info" icon="📘" title="说明">

此功能目前仅对 **Dedicated** 集群提供**内测**（Private Preview）。如需启用此功能或了解相关费用，请联系 [Zilliz Cloud 支持团队](http://support.zilliz.com.cn)。

</Admonition>

## 开始前\{#before-you-start}

- 您已完成对象存储的集成操作。有关具体信息，请参考[阿里云对象存储](./integrate-with-alibaba-cloud-oss)或 [Amazon S3](./integrate-with-amazon-s3-cn)。

- 您是目标组织中的**组织管理员**或**项目管理员**。

## 操作步骤\{#procedure}

您可以选择通过 Zilliz Cloud 控制台或调用 RESTful API 的方式来导出备份文件。

### 通过 Zilliz Cloud 控制台导出\{#export-via-zilliz-cloud-console}

<Procedures>

1. 登录 Zilliz Cloud 控制台。

1. 在左侧导航栏中，选择**备份**。

1. 在**备份**页面，找到目标备份文件，然后从**操作**列中选择**导出备份文件**。

    <Admonition type="info" icon="📘" title="说明">

    只有处于**创建完成**状态的备份文件可以被导出。

    </Admonition>

1. 在**导出备份文件**对话框中，配置备份相关设置：

    1. **备份文件集群云服务地域**：显示导出备份文件所在的云地域。

    1. **集成**：与 Zilliz Cloud 集成的对象存储提供商。目前支持阿里云对象存储服务（OSS）。

    1. **集成配置**：选择配置的存储空间，用于存储导出的备份文件。

    1. **导出路径**：指定存储空间中的文件路径。

1. 点击**导出**。

    ![export-backup-file-zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/export-backup-file-zh.png "export-backup-file-zh")

</Procedures>

### 通过调用 RESTful API 接口导出\{#export-through-restful-api}

在您通过调用导出备份文件 RESTful API 接口导出备份文件之前，您需要将您的对象存储桶集成到 Zilliz Cloud 并获取该对象存储桶的集成 ID。关于如何获取对象存储桶的集成 ID，可以查看[获取集成 ID](./integrate-with-alibaba-cloud-oss#obtain-the-integration-id)。

```bash
export BASE_URL="https://api.cloud.zilliz.com.cn"
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
export BACKUP_ID="backup-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/export" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "integrationId": "inter-xxxxxxx",
    "directory": "destdir/"
}'
```

上述请求的响应中会包含已创建的导出任务的 ID。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-0396450098cglufig6afm9"
    }
}
```

## 查看导出进度\{#monitor-export-progress}

点击**导出**后，系统会自动生成一个导出任务：

<Procedures>

1. 在左侧导航栏中进入**任务**页面。

1. 监控任务的**状态**：

    - **进行中**：文件正在导出中。

    - **成功**：备份文件已成功导出，您可以在指定的存储空间中访问该文件。

    - **失败**：任务失败。这可能是由于导出过程中使用的资源（例如角色 ARN 或备份文件）在任务执行期间被删除所导致。

</Procedures>

## 取消导出任务\{#cancel-export-job}

如果任务持续显示为**进行中**状态，但您决定终止操作，可以点击**操作**列中的**取消**按钮取消任务。

<Admonition type="info" icon="📘" title="说明">

取消任务不会移除已上传至存储空间的数据。

</Admonition>

