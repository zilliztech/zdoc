---
title: "必要な GCP API サービス | BYOC"
slug: /required-api-services-gcp
sidebar_label: "必要な GCP API サービス"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud Terraform プロバイダーを使用して GCP リスを作成するために必要な Google Cloud Platform (GCP) API サービスを一覧表示し、それらを有効にするいくつかの方法を提供します。 | BYOC"
type: origin
token: WOQHwAlG0ibUgQkM18PcArMWnOc
sidebar_position: 6
keywords:
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Vector embeddings
  - Vector store
  - open source vector database
  - Vector index

---

import Admonition from '@theme/Admonition';


# 必要な GCP API サービス

このページでは、Zilliz Cloud Terraform プロバイダーを使用して GCP リスを作成するために必要な Google Cloud Platform (GCP) API サービスを一覧表示し、それらを有効にするいくつかの方法を提供します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## 必要な API サービス\{#required-api-services}

<table>
   <tr>
     <th><p>API サービス</p></th>
     <th><p>目的</p></th>
   </tr>
   <tr>
     <td><p><a href="http://compute.googleapis.com">compute.googleapis.com</a></p></td>
     <td><p>VPC、サブネット、およびネットワークリソース</p></td>
   </tr>
   <tr>
     <td><p><a href="http://container.googleapis.com">container.googleapis.com</a></p></td>
     <td><p>GKE クラスターマネジメント</p></td>
   </tr>
   <tr>
     <td><p><a href="http://storage.googleapis.com">storage.googleapis.com</a></p></td>
     <td><p>GCS バケット操作</p></td>
   </tr>
   <tr>
     <td><p><a href="http://iam.googleapis.com">iam.googleapis.com</a></p></td>
     <td><p>サービスアカウントと IAM ロール</p></td>
   </tr>
   <tr>
     <td><p><a href="http://servicenetworking.googleapis.com">servicenetworking.googleapis.com</a></p></td>
     <td><p>プライベートサービスコネクトおよび VPC ピアリング</p></td>
   </tr>
   <tr>
     <td><p><a href="http://cloudresourcemanager.googleapis.com">cloudresourcemanager.googleapis.com</a></p></td>
     <td><p>プロジェクトレベルの権限と IAM</p></td>
   </tr>
</table>

## 必要な API サービスを有効化\{#enable-required-api-services}

GCP コンソールでこれらの API サービスを有効にするか、gcloud CLI を使用して詳細な手順については[このドキュメント](https://cloud.google.com/endpoints/docs/openapi/enable-api#enabling%20an%20api)を参照してください。gcloud CLI を使用して上記で一覧された API サービスを有効にするには、以下のようにします：

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

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>上記のコマンドを実行する前に、これらのサービスを有効化するのに十分な権限を持っていることを確認してください。そうでない場合は、まず GCP プロジェクトのセキュリティ管理者に確認してください。</p></li>
<li><p>上記のコマンド内で <code>PROJECT_ID</code> を自分の GCP プロジェクト ID に置き換える必要があります。</p></li>
</ul>

</Admonition>

## 結果の確認\{#verify-the-results}

GCP コンソールで上記で一覧された API サービスが有効かどうか確認するか、gcloud CLI を使用して確認できます。

### GCP コンソールでの確認\{#on-the-gcp-console}

1. [API & Services ダッシュボード](https://console.cloud.google.com/apis/dashboard) にアクセスします。

1. プロジェクトを選択します。

1. ライブラリで有効化された API を確認します。

### gcloud CLI の使用\{#using-the-gcloud-cli}

```bash
gcloud services list --enabled --project=PROJECT_ID
```

<Admonition type="info" icon="📘" title="Notes">

<p>上記のコマンド内で <code>PROJECT_ID</code> を自分の GCP プロジェクト ID に置き換える必要があります。</p>

</Admonition>
