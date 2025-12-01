---
title: "必要な権限 | BYOC"
slug: /required-permissions-gcp
sidebar_label: "必要な権限"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、VPC ネットワーク上に Zilliz BYOC データプレーンを展開中に必要な IAM ポリシーを一覧表示します。 | BYOC"
type: origin
token: ERIwwzvfuiLYIik9R4Ec0gCrnLb
sidebar_position: 5
keywords:
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';


# 必要な権限

このページでは、VPC ネットワーク上に Zilliz BYOC データプレーンを展開中に必要な IAM ポリシーを一覧表示します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## ストレージサービスアカウント\{#storage-service-account}

Zilliz Cloud がサービスアカウントを想定してバケットにアクセスできるように、Cloud Storage バケットとストレージサービスアカウントを作成する必要があります。

以下の表は、ストレージサービスアカウントに割り当てるべきロールを一覧表示します。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Object Admin</a></p></td>
     <td><p>オブジェクトのリスト表示、作成、表示、削除を含む、オブジェクトの完全制御を許可します。</p></td>
     <td><p>対象のバケット名</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Bucket Viewer</a></p></td>
     <td><p>IAM ポリシーを除く、バケットとそのメタデータを表示する権限を付与します。</p></td>
     <td><p>対象のバケット名</p></td>
   </tr>
</table>

## GKE サービスアカウント\{#gke-service-account}

Zilliz Cloud がサービスアカウントを想定して GKE クラスターを管理できるように、GKE サービスアカウントを作成する必要があります。

以下の表は、GKE サービスアカウントに割り当てるべきロールを一覧表示します。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.defaultNodeServiceAccount">Kubernetes Engine Default Node Service Account</a></p></td>
     <td><p>ログ記録や監視などの標準機能をサポートするために GKE ノードが必要とする最小限の権限セット。</p></td>
     <td><p>--</p></td>
   </tr>
</table>

## クロスアカウントサービスアカウント\{#cross-account-service-account}

Zilliz Cloud がサービスアカウントを想定してネットワークリソースを管理できるように、クロスアカウントサービスアカウントを作成する必要があります。

以下の表は、クロスアカウントサービスアカウントに割り当てるべきロールを一覧表示します。

<table>
   <tr>
     <th><p>ロール</p></th>
     <th><p>説明</p></th>
     <th><p>条件</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Bucket Viewer</a></p></td>
     <td><p>IAM ポリシーを除く、バケットとそのメタデータを表示する権限を付与します。</p></td>
     <td><p>対象のバケット名</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.admin">Kubernetes Engine Admin</a></p></td>
     <td><p>クラスターとその Kubernetes API オブジェクトの完全管理へのアクセスを提供します。</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">インスタンスグループマネージャーカスタムロール</a></p></td>
     <td><p>以下の権限をバインドします：</p><ul><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/get">compute.instanceGroupManagers.get</a></p></li><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/update">compute.instanceGroupManagers.update</a></p></li></ul></td>
     <td><p>作成する GKE クラスター名</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">IAM カスタムロール</a></p></td>
     <td><p>以下の権限をバインドします：</p><ul><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/getIamPolicy">iam.serviceAccounts.getIamPolicy</a></p></li><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/setIamPolicy">iam.serviceAccounts.setIamPolicy</a></p></li></ul></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/iam#iam.serviceAccountUser">Service Account User</a></p></td>
     <td><p>サービスアカウントとして操作を実行します。</p></td>
     <td><p>--</p></td>
   </tr>
</table>
