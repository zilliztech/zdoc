---
title: "create | Cloud"
slug: /cli/cli/StorageIntegration-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建外部存储集成。使用它可注册 AWS、Azure 或 GCP 的存储桶凭证，以便 Zilliz Cloud 访问外部数据源。 | Cloud"
type: docx
token: YCXuddx10oBOujxOcLscTAg0nKc
sidebar_position: 1
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
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

此操作用于创建外部存储集成。使用它可注册 AWS、Azure 或 GCP 的存储桶凭证，以便 Zilliz Cloud 访问外部数据源。

## 概要\{#synopsis}

```bash
zilliz storage-integration create --name <string> --bucket-name <string> [OPTIONS]
```

**选项：**

- **--name** (*string*) -

    **[必需]**

    指定存储集成名称。

- **--bucket-name** (*string*) -

    **[必需]**

    指定外部存储桶或容器名称。

- **--project-id** (*string*) -

    指定所属项目 ID。

- **--description** (*string*) -

    指定该集成的易于理解的描述。

- **--region-id** (*string*) -

    指定云区域，例如 `aws-us-east-1`。

- **--role-arn** (*string*) -

    指定 AWS IAM 角色 ARN。

- **--external-id** (*string*) -

    指定 AWS external ID。此值会从本地命令历史中隐藏。

- **--account-name** (*string*) -

    指定 Azure 存储账户名称。

- **--client-id** (*string*) -

    指定 Azure client ID。

- **--tenant-id** (*string*) -

    指定 Azure tenant ID。

- **--gcp-project-id** (*string*) -

    指定 GCP 项目 ID。

- **--service-account-email** (*string*) -

    指定 GCP 服务账号电子邮箱。

- **--body** (*path*) -

    当扁平参数不足以满足需求时，指定 JSON 请求体文件，例如 `file://integration.json`。

## 示例\{#example}

```bash
# AWS

zilliz storage-integration create --name s3-int --bucket-name my-bucket --region-id aws-us-east-1 --role-arn arn:aws:iam::123456789012:role/my-role --external-id ext-1

# Azure

zilliz storage-integration create --name az-int --bucket-name my-container --region-id azure-eastus --account-name myacct --client-id <client> --tenant-id <tenant>

# GCP

zilliz storage-integration create --name gcs-int --bucket-name my-bucket --region-id gcp-us-central1 --gcp-project-id my-proj --service-account-email sa@my-proj.iam.gserviceaccount.com

# Raw body escape hatch

zilliz storage-integration create --body file://integration.json
```
