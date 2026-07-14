---
title: "validate | Cloud"
slug: /cli/cli/StorageIntegration-validate
sidebar_label: "validate"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、統合の作成前または作成後に外部ストレージ統合設定を検証します。 | Cloud"
type: docx
token: UCq8dJomCoUqZixRiXsczdtqnfg
sidebar_position: 6
keywords: 
  - コサイン距離
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
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

この操作は、統合の作成前または作成後に外部ストレージ統合設定を検証します。

## Synopsis\{#synopsis}

```bash
zilliz storage-integration validate --bucket-name <string> [OPTIONS]
```

**OPTIONS:**

- **--bucket-name** (*string*) -

    **[REQUIRED]**

    検証する外部 bucket またはコンテナ名を指定します。

- **--project-id** (*string*) -

    プロジェクト ID を指定します。

- **--region-id** (*string*) -

    `aws-us-east-1` などのクラウドリージョンを指定します。

- **--role-arn** (*string*) -

    AWS IAM role ARN を指定します。

- **--external-id** (*string*) -

    AWS external ID を指定します。この値はローカルのコマンド履歴では伏せ字になります。

- **--account-name** (*string*) -

    Azure ストレージアカウント名を指定します。

- **--client-id** (*string*) -

    Azure client ID を指定します。

- **--tenant-id** (*string*) -

    Azure tenant ID を指定します。

- **--gcp-project-id** (*string*) -

    GCP project ID を指定します。

- **--service-account-email** (*string*) -

    GCP service account のメールアドレスを指定します。

- **--body** (*path*) -

    フラットフラグだけでは不十分な場合に、`file://integration.json` などの JSON ボディファイルを指定します。

## Example\{#example}

```bash
zilliz storage-integration validate --bucket-name my-bucket --region-id aws-us-east-1 --role-arn arn:aws:iam::123456789012:role/my-role --external-id ext-1
```
