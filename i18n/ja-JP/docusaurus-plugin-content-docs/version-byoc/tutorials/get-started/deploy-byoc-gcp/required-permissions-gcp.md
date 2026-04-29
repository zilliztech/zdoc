---
title: "必要な権限 | BYOC"
slug: /required-permissions-gcp
sidebar_key: required-permissions-gcp
sidebar_label: "必要な権限"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、お客様の VPC ネットワーク上に Zilliz BYOC データプレーンをデプロイする際に必要な IAM ポリシーを一覧表示します。| BYOC"
type: origin
token: ERIwwzvfuiLYIik9R4Ec0gCrnLb
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - 権限
  - 最小限の権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


# 必要な権限

このページでは、お客様の VPC ネットワーク上に Zilliz BYOC データプレーンをデプロイする際に必要な IAM ポリシーを一覧表示します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>中です。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud の営業担当者</a>までお問い合わせください。</p>

</Admonition>

## ストレージサービスアカウント\{#storage-service-account}

Zilliz Cloud がバケットにアクセスできるようサービスアカウントを引き受けることができるように、Cloud Storage バケットとストレージサービスアカウントを作成する必要があります。

以下の表は、ストレージサービスアカウントに割り当てるべきロールの一覧です。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Object Admin</a></p></td>
     <td><p>オブジェクトのリスト、作成、表示、削除を含む、オブジェクトの完全な制御を付与します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage バケット Viewer</a></p></td>
     <td><p>IAM ポリシーを除く、バケットとそのメタデータの表示権限を付与します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
</table>

## GKE サービスアカウント\{#gke-service-account}

Zilliz Cloud が GKE クラスタを管理できるようこのサービスアカウントを引き受けることができるように、GKE サービスアカウントを作成する必要があります。

以下の表は、GKE サービスアカウントに割り当てるべきロールの一覧です。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.defaultNodeServiceアカウント">Kubernetes Engine Default Node Service アカウント</a></p></td>
     <td><p>ログ記録やモニタリングなどの標準機能をサポートするために GKE ノードが必要とする最小限の権限セットです。</p></td>
     <td><p>--</p></td>
   </tr>
</table>

## クロスアカウントサービスアカウント\{#cross-account-service-account}

Zilliz Cloud がネットワークリソースを管理できるようこのサービスアカウントを引き受けることができるように、クロスアカウントサービスアカウントを作成する必要があります。

以下の表は、クロスアカウントサービスアカウントに割り当てるべきロールの一覧です。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage バケット Viewer</a></p></td>
     <td><p>IAM ポリシーを除く、バケットとそのメタデータの表示権限を付与します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.admin">Kubernetes Engine Admin</a></p></td>
     <td><p>クラスタとその Kubernetes API オブジェクトの完全な管理へのアクセスを提供します。</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">Instance Group Manager カスタムロール</a></p></td>
     <td><p>以下の権限をバインドします：</p><ul><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/get">compute.instanceGroupManagers.get</a></p></li><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/update">compute.instanceGroupManagers.update</a></p></li></ul></td>
     <td><p>作成する GKE クラスタの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">IAM カスタムロール</a></p></td>
     <td><p>以下の権限をバインドします：</p><ul><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceアカウントs/getIamPolicy">iam.serviceアカウントs.getIamPolicy</a></p></li><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceアカウントs/setIamPolicy">iam.serviceアカウントs.setIamPolicy</a></p></li></ul></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/iam#iam.serviceアカウントUser">Service アカウント User</a></p></td>
     <td><p>サービスアカウントとして操作を実行します。</p></td>
     <td><p>--</p></td>
   </tr>
</table>

