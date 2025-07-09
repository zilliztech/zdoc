---
title: "必要なGCP APIサービス | BYOC"
slug: /required-api-services-gcp
sidebar_label: "必要なGCP APIサービス"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloud Terraform Providerを使用してGCPリソースを作成するために必要なGoogle Cloud Platform（GCP）APIサービスをリストし、それらを有効にするためのいくつかの方法を提供しています。 | BYOC"
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
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison

---

import Admonition from '@theme/Admonition';


# 必要なGCP APIサービス

このページでは、Zilliz Cloud Terraform Providerを使用してGCPリソースを作成するために必要なGoogle Cloud Platform（GCP）APIサービスをリストし、それらを有効にするためのいくつかの方法を提供しています。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## 必要なAPIサービス{#required-api-services}

<table>
   <tr>
     <th><p>APIサービス</p></th>
     <th><p>目的</p></th>
   </tr>
   <tr>
     <td><p><a href="http://compute.googleapis.com">compute.googleapis.com</a></p></td>
     <td><p>VPC、サブネット、およびネットワークリソース</p></td>
   </tr>
   <tr>
     <td><p><a href="http://container.googleapis.com">container.googleapis.com</a></p></td>
     <td><p>GKEクラスタ管理</p></td>
   </tr>
   <tr>
     <td><p><a href="http://storage.googleapis.com">storage.googleapis.com</a></p></td>
     <td><p>GCSバケット操作</p></td>
   </tr>
   <tr>
     <td><p><a href="http://iam.googleapis.com">iam.googleapis.com</a></p></td>
     <td><p>サービスアカウントとIAMロール</p></td>
   </tr>
   <tr>
     <td><p><a href="http://servicenetworking.googleapis.com">servicenetworking.googleapis.com</a></p></td>
     <td><p>プライベートサービスコネクトとVPCピアリング</p></td>
   </tr>
   <tr>
     <td><p><a href="http://cloudresourcemanager.googleapis.com">cloudresourcemanager.googleapis.com</a></p></td>
     <td><p>プロジェクトレベルの権限とIAM</p></td>
   </tr>
</table>

## 必要なAPIサービスを有効にする{#enable-required-api-services}

GCPコンソールまたはgcloud CLIを使用して、詳細な手順については[この文書](https://cloud.google.com/endpoints/docs/openapi/enable-api#enabling_an_api)を参照して、これらのAPIサービスを有効にすることができます。gcloud CLIを使用して上記のAPIサービスを有効にするには、以下の手順を実行してください。

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

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>上記のコマンドを実行する前に、これらのサービスを有効にするための十分な権限があることを確認してください。そうでない場合は、まずGCPプロジェクトのセキュリティ管理者に問い合わせてください。</p></li>
<li><p>上記のコマンドの<code>PROJECT_ID</code>をGCPプロジェクトIDに置き換える必要があります。</p></li>
</ul>

</Admonition>

## 結果を確認する{#verify-the-results}

上記のAPIサービスが有効かどうかは、GCPコンソールまたはgcloud CLIを使用して確認できます。

### GCPコンソール上で{#on-the-gcp-console}

1. [API&サービスダッシュボード](https://console.cloud.google.com/apis/dashboard)にアクセスしてください。

1. プロジェクトを選択します。

1. ライブラリで有効なAPIを確認します。

### gcloud CLIの使い方{#using-the-gcloud-cli}

```bash
gcloud services list --enabled --project=PROJECT_ID
```

<Admonition type="info" icon="📘" title="ノート">

<p>上記のコマンドの<code>PROJECT_ID</code>をGCPプロジェクトIDに置き換える必要があります。</p>

</Admonition>

