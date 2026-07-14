---
title: "必要な権限 | BYOC"
slug: /required-permissions-gcp
sidebar_label: "必要な権限"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、お客様の VPC ネットワーク上に Zilliz BYOC データプレーンをデプロイする際に必要な IAM ポリシーを一覧表示します。 | BYOC"
type: origin
token: ERIwwzvfuiLYIik9R4Ec0gCrnLb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 必要な権限

このページでは、お客様の VPC ネットワーク上に Zilliz BYOC データプレーンをデプロイする際に必要な IAM ポリシーを一覧表示します。

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセスおよび実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## ストレージサービスアカウント\{#storage-service-account}

Zilliz Cloud がこのサービスアカウントを引き受けてバケットにアクセスできるように、Cloud Storage バケットとストレージサービスアカウントを作成する必要があります。

次の表は、ストレージサービスアカウントに割り当てる必要があるロールを示しています。

| ロール | 説明 | 条件 |
| --- | --- | --- |
| [Storage Object Admin](https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin) | オブジェクトの一覧表示、作成、表示、削除を含む、オブジェクトに対する完全な制御を付与します。 | 対象バケットの名前 |
| [Storage Bucket Viewer](https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin) | IAM ポリシーを除き、バケットとそのメタデータを表示する権限を付与します。 | 対象バケットの名前 |

## GKE サービスアカウント\{#gke-service-account}

Zilliz Cloud がこのサービスアカウントを引き受けて GKE クラスターを管理できるように、GKE サービスアカウントを作成する必要があります。

次の表は、GKE サービスアカウントに割り当てる必要があるロールを示しています。

| ロール | 説明 | 条件 |
| --- | --- | --- |
| [Kubernetes Engine Default Node Service Account](https://cloud.google.com/iam/docs/roles-permissions/container#container.defaultNodeServiceAccount) | ロギングやモニタリングなどの標準機能をサポートするために、GKE ノードに必要な最小限の権限セットです。 | -- |

## クロスアカウントサービスアカウント\{#cross-account-service-account}

Zilliz Cloud がこのサービスアカウントを引き受けてネットワークリソースを管理できるように、クロスアカウントサービスアカウントを作成する必要があります。

次の表は、クロスアカウントサービスアカウントに割り当てる必要があるロールを示しています。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Bucket Viewer</a></p></td>
     <td><p>IAM ポリシーを除き、バケットとそのメタデータを表示する権限を付与します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.admin">Kubernetes Engine Admin</a></p></td>
     <td><p>クラスターおよびその Kubernetes API オブジェクトの完全な管理へのアクセスを提供します。</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">Instance Group Manager Custom Role</a></p></td>
     <td><p>次の権限をバインドします:</p><ul><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/get">compute.instanceGroupManagers.get</a></p></li><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/update">compute.instanceGroupManagers.update</a></p></li></ul></td>
     <td><p>作成する GKE クラスターの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">IAM Custom Role</a></p></td>
     <td><p>次の権限をバインドします:</p><ul><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/getIamPolicy">iam.serviceAccounts.getIamPolicy</a></p></li><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/setIamPolicy">iam.serviceAccounts.setIamPolicy</a></p></li></ul></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/iam#iam.serviceAccountUser">Service Account User</a></p></td>
     <td><p>サービスアカウントとして操作を実行します。</p></td>
     <td><p>--</p></td>
   </tr>
</table>

