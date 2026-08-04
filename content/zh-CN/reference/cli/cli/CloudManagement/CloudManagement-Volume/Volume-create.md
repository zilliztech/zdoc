---
title: "create | Cloud"
slug: /cli/cli/Volume-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建新 volume。 | Cloud"
type: docx
token: H86odvFbDomzPjxjOtCc75jDnGf
sidebar_position: 1
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
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

此操作用于创建新 volume。

## 描述\{#description}

Volume 是一种对象存储，可保存结构化数据或非结构化数据文件集合。它为访问、存储、治理和组织这些数据资产提供了统一的位置。来自本地文件系统或云对象存储的结构化和非结构化数据会先上传到 Zilliz Cloud 中的 volume。之后，您可以将结构化数据直接导入或迁移到 collection，也可以运行 ETL 管道，将非结构化数据转换为 embedding，然后将这些 embedding 加载到 collection 中。

运行此命令时如果不带任何选项，将触发一组交互式提示，引导您设置该命令。

## 概要\{#synopsis}

```bash
zilliz volume create
--project-id <value>
--region <value>
--name <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    指定项目 ID。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--region** (*string*) -

    **[REQUIRED]**

    指定云区域。例如，`aws-us-west-2`。

    可能的值：

    - `aws-us-east-1`

    - `aws-us-east-2`

    - `aws-us-west-2`

    - `aws-ca-central-1`

    - `aws-eu-central-1`

    - `aws-eu-west-1`

    - `aws-ap-northeast-1`

    - `aws-ap-southeast-1`

    - `aws-ap-southeast-2`

    - `gcp-us-west1`

    - `gcp-us-east4`

    - `gcp-us-central1`

    - `gcp-asia-southeast1`

    - `az-eastus`

    - `az-eastus2`

    - `az-centralus`

    - `az-germanywestcentral`

    - `az-northeurope`

    - `az-centralindia`

- **--name** (*string*) -

    **[REQUIRED]**

    指定 volume 名称。 

    该值为最长 **255** 个字符的字母数字字符串，且必须以字母开头。

- **--output, -o** (*string*) -

    指定输出格式。可能的值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz volume create --project-id proj-xxxx \
--region aws-us-west-2 \
--name my-volume
```
