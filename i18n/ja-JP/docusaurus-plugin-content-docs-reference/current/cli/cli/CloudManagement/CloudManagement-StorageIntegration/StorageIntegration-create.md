---
title: "create | Cloud"
slug: /cli/cli/StorageIntegration-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は外部ストレージ統合を作成します。これを使用して AWS、Azure、または GCP のバケット認証情報を登録し、Zilliz Cloud が外部データソースにアクセスできるようにします。 | Cloud"
type: docx
token: YCXuddx10oBOujxOcLscTAg0nKc
sidebar_position: 1
keywords: 
  - 類似性検索
  - マルチモーダル RAG
  - llm hallucinations
  - ハイブリッド検索
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

この操作は外部ストレージ統合を作成します。これを使用して AWS、Azure、または GCP のバケット認証情報を登録し、Zilliz Cloud が外部データソースにアクセスできるようにします。

## Synopsis\{#synopsis}

```bash
zilliz storage-integration create --name <string> --bucket-name <string> [OPTIONS]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    ストレージ統合名を指定します。

- **--bucket-name** (*string*) -

    **[REQUIRED]**

    外部バケットまたはコンテナ名を指定します。

- **--project-id** (*string*) -

    所有元のプロジェクト ID を指定します。

- **--description** (*string*) -

    統合についての人間が読める説明を指定します。

- **--region-id** (*string*) -

    `aws-us-east-1` などのクラウドリージョンを指定します。

- **--role-arn** (*string*) -

    AWS IAM ロール ARN を指定します。

- **--external-id** (*string*) -

    AWS external ID を指定します。この値はローカルのコマンド履歴では秘匿化されます。

- **--account-name** (*string*) -

    Azure ストレージアカウント名を指定します。

- **--client-id** (*string*) -

    Azure クライアント ID を指定します。

- **--tenant-id** (*string*) -

    Azure テナント ID を指定します。

- **--gcp-project-id** (*string*) -

    GCP プロジェクト ID を指定します。

- **--service-account-email** (*string*) -

    GCP サービスアカウントのメールアドレスを指定します。

- **--body** (*path*) -

    フラットフラグでは不十分な場合に、`file://integration.json` のような JSON ボディファイルを指定します。

## Example\{#example}

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
