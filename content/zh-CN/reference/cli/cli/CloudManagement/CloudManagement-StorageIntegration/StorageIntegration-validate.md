---
title: "验证 | Cloud"
slug: /cli/cli/StorageIntegration-validate
sidebar_label: "验证"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作可在创建集成之前或之后验证外部存储集成配置。 | Cloud"
type: docx
token: UCq8dJomCoUqZixRiXsczdtqnfg
sidebar_position: 6
keywords: 
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - 多模态向量 Database 检索
  - zilliz
  - zilliz cloud
  - cloud
  - 验证
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# validate

此操作可在创建集成之前或之后验证外部存储集成配置。

## 概要\{#synopsis}

```bash
zilliz storage-integration validate --bucket-name <string> [OPTIONS]
```

**选项：**

- **--bucket-name** (*string*) -

    **[必需]**

    指定要验证的外部存储桶或容器名称。

- **--project-id** (*string*) -

    指定项目 ID。

- **--region-id** (*string*) -

    指定云区域，例如 `aws-us-east-1`。

- **--role-arn** (*string*) -

    指定 AWS IAM 角色 ARN。

- **--external-id** (*string*) -

    指定 AWS 外部 ID。此值会从本地命令历史记录中隐藏。

- **--account-name** (*string*) -

    指定 Azure 存储账户名称。

- **--client-id** (*string*) -

    指定 Azure 客户端 ID。

- **--tenant-id** (*string*) -

    指定 Azure 租户 ID。

- **--gcp-project-id** (*string*) -

    指定 GCP 项目 ID。

- **--service-account-email** (*string*) -

    指定 GCP 服务账户电子邮件。

- **--body** (*path*) -

    当平铺标志不足以满足需求时，指定一个 JSON 正文文件，例如 `file://integration.json`。

## 示例\{#example}

```bash
zilliz storage-integration validate --bucket-name my-bucket --region-id aws-us-east-1 --role-arn arn:aws:iam::123456789012:role/my-role --external-id ext-1
```
