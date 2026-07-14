---
title: "generate-auth-materials | Cloud"
slug: /cli/cli/StorageIntegration-generateauthmaterials
sidebar_label: "generate-auth-materials"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、storage integration の認可マテリアルを生成します。外部ストレージアクセスを最終的に確定する前に必要な、クラウド側の認証情報マテリアルを取得するために使用します。 | Cloud"
type: docx
token: Wa4Bd7HvNont3WxgFNxcteFqn6g
sidebar_position: 4
keywords: 
  - 非構造化データとは
  - ベクトル埋め込み
  - ベクトルストア
  - オープンソースのベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - generate-auth-materials
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# generate-auth-materials

この操作は、storage integration の認可マテリアルを生成します。外部ストレージアクセスを最終的に確定する前に必要な、クラウド側の認証情報マテリアルを取得するために使用します。

## Synopsis\{#synopsis}

```bash
zilliz storage-integration generate-auth-materials --bucket-name <string> [OPTIONS]
```

**OPTIONS:**

- **--bucket-name** (*string*) -

    **[REQUIRED]**

    外部バケットまたはコンテナ名を指定します。

- **--project-id** (*string*) -

    project ID を指定します。

- **--region-id** (*string*) -

    `aws-us-east-1` などのクラウドリージョンを指定します。

- **--body** (*path*) -

    `file://authorization-materials.json` などの JSON ボディファイルを指定します。

## Example\{#example}

```bash
zilliz storage-integration generate-auth-materials --bucket-name my-bucket --region-id aws-us-east-1
```
