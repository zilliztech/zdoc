---
title: "必要な GCP API サービス | BYOC"
slug: /required-api-services-gcp
sidebar_label: "必要な GCP API サービス"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud Terraform Provider を使用して GCP リソースを作成するために必要な Google Cloud Platform (GCP) API サービスを一覧で示し、それらを有効化するいくつかの方法を提供します。 | BYOC"
type: origin
token: WOQHwAlG0ibUgQkM18PcArMWnOc
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 必要な GCP API サービス

このページでは、Zilliz Cloud Terraform Provider を使用して GCP リソースを作成するために必要な Google Cloud Platform (GCP) API サービスを一覧で示し、それらを有効化するいくつかの方法を提供します。

<Admonition type="info" icon="📘" title="注記">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## 必要な API サービス\{#required-api-services}

| API サービス | 用途 |
| --- | --- |
| [compute.googleapis.com](http://compute.googleapis.com) | VPC、サブネット、およびネットワークリソース |
| [container.googleapis.com](http://container.googleapis.com) | GKE クラスター管理 |
| [storage.googleapis.com](http://storage.googleapis.com) | GCS バケット操作 |
| [iam.googleapis.com](http://iam.googleapis.com) | サービス アカウントと IAM ロール |
| [servicenetworking.googleapis.com](http://servicenetworking.googleapis.com) | Private Service Connect と VPC ピアリング |
| [cloudresourcemanager.googleapis.com](http://cloudresourcemanager.googleapis.com) | プロジェクト レベルの権限と IAM |

## 必要な API サービスを有効化する\{#enable-required-api-services}

これらの API サービスは、GCP コンソール上、または gcloud CLI を使用して有効化できます。詳細な手順については [このドキュメント](https://cloud.google.com/endpoints/docs/openapi/enable-api#enabling_an_api) を参照してください。上記の API サービスを gcloud CLI を使用して有効化するには、次のようにします。

```shell
gcloud services enable \
  compute.googleapis.com \
  container.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  servicenetworking.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project=PROJECT_ID
```

<Admonition type="info" icon="📘" title="注記">

- 上記のコマンドを実行する前に、これらのサービスを有効化するための十分な権限があることを確認してください。権限がない場合は、まず GCP プロジェクトのセキュリティ管理者に依頼してください。

- 上記のコマンド内の `PROJECT_ID` は、使用している GCP プロジェクト ID に置き換える必要があります。

</Admonition>

## 結果を確認する\{#verify-the-results}

上記の API サービスが有効になっているかどうかは、GCP コンソール上、または gcloud CLI を使用して確認できます。

### GCP コンソールで確認する\{#on-the-gcp-console}

1. [API & Services Dashboard](https://console.cloud.google.com/apis/dashboard) にアクセスします。

1. 対象のプロジェクトを選択します。

1. ライブラリで有効化されている API を確認します。

### gcloud CLI を使用する\{#using-the-gcloud-cli}

```bash
gcloud services list --enabled --project=PROJECT_ID
```

<Admonition type="info" icon="📘" title="注記">

上記のコマンド内の `PROJECT_ID` は、使用している GCP プロジェクト ID に置き換える必要があります。

</Admonition>

