---
title: "validate | Cloud"
slug: /cli/cli/StorageIntegration-validate
sidebar_label: "validate"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在创建外部存储集成之前或之后，对其配置进行验证。 | Cloud"
type: docx
token: UCq8dJomCoUqZixRiXsczdtqnfg
sidebar_position: 6
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - validate
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# validate

此操作会在创建外部存储集成之前或之后，对其配置进行验证。

## 概述\{#synopsis}

```bash
zilliz storage-integration validate --bucket-name <string> [OPTIONS]
```

**选项：**

- **--bucket-name** (*string*) -

    **[必填]**

    指定要验证的外部 bucket 或容器名称。

- **--project-id** (*string*) -

    指定项目 ID。

- **--region-id** (*string*) -

    指定云区域，例如 `aws-us-east-1`。

- **--role-arn** (*string*) -

    指定 AWS IAM 角色 ARN。

- **--external-id** (*string*) -

    指定 AWS external ID。此值会从本地命令历史记录中隐藏。

- **--account-name** (*string*) -

    指定 Azure 存储账户名称。

- **--client-id** (*string*) -

    指定 Azure 客户端 ID。

- **--tenant-id** (*string*) -

    指定 Azure 租户 ID。

- **--gcp-project-id** (*string*) -

    指定 GCP 项目 ID。

- **--service-account-email** (*string*) -

    指定 GCP 服务账号电子邮件地址。

- **--body** (*path*) -

    当扁平化标志不足以表达配置时，指定 JSON 正文文件，例如 `file://integration.json`。

## 示例\{#example}

```bash
zilliz storage-integration validate --bucket-name my-bucket --region-id aws-us-east-1 --role-arn arn:aws:iam::123456789012:role/my-role --external-id ext-1
```
