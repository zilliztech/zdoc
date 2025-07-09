---
title: "必要な権限 | BYOC"
slug: /required-permissions-gcp
sidebar_label: "必要な権限"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、VPCネットワーク上でZilliz BYOCデータプレーンを展開する際に必要なIAMポリシーをリストしています。 | BYOC"
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
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search

---

import Admonition from '@theme/Admonition';


# 必要な権限

このページでは、VPCネットワーク上でZilliz BYOCデータプレーンを展開する際に必要なIAMポリシーをリストしています。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## ストレージサービスアカウント{#storage-service-account}

Cloud Storageバケットとストレージサービスアカウントを作成して、Zilliz Cloudがバケットにアクセスできるようにします。

次の表に、ストレージサービスアカウントに割り当てる必要があるロールを示します。

<table>
   <tr>
     <th><p>役割</p></th>
     <th><p>説明する</p></th>
     <th><p>コンディション</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">ストレージオブジェクト管理者</a></p></td>
     <td><p>オブジェクトのリスト、作成、表示、削除を含むオブジェクトの完全な制御を許可します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">ストレージバケットビューアー</a></p></td>
     <td><p>IAMポリシーを除くバケットとそのメタデータを表示する権限を付与します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
</table>

## GKEサービスアカウント{#gke-service-account}

GKEクラスタを管理するために、Zilliz Cloudがこのサービスアカウントを使用できるように、GKEサービスアカウントを作成する必要があります。

次の表に、GKEサービスアカウントに割り当てる必要があるロールを示します。

<table>
   <tr>
     <th><p>役割</p></th>
     <th><p>説明する</p></th>
     <th><p>コンディション</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.defaultNodeServiceAccount">Kubernetes Engineのデフォルトノードサービスアカウント</a></p></td>
     <td><p>ログや監視などの標準機能をサポートするためにGKEノードが必要とする最小限の権限セット。</p></td>
     <td><p>--</p></td>
   </tr>
</table>

## クロスアカウントサービスアカウント{#cross-account-service-account}

Zilliz Cloudがネットワークリソースを管理するために、クロスアカウントサービスアカウントを作成する必要があります。

次の表に、アカウント間サービスアカウントに割り当てる必要があるロールを示します。

<table>
   <tr>
     <th><p>役割</p></th>
     <th><p>説明する</p></th>
     <th><p>コンディション</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">ストレージバケットビューアー</a></p></td>
     <td><p>IAMポリシーを除くバケットとそのメタデータを表示する権限を付与します。</p></td>
     <td><p>対象バケットの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.admin">Kubernetesエンジンの管理</a></p></td>
     <td><p>クラスターとそのKubernetes APIオブジェクトの完全な管理にアクセスできます。</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">インスタンスグループマネージャーのカスタムロール</a></p></td>
     <td><p>以下の権限をバインドします:</p><ul><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/get">. getinstanceGroupManagers計算</a></p></li><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/update">計算します。instanceGroupManagers. update</a></p></li></ul></td>
     <td><p>作成するGKEクラスタの名前</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">IAMカスタムロール</a></p></td>
     <td><p>以下の権限をバインドします:</p><ul><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/getIamPolicy">iam. serviceAccounts.getIamPolicyの設定</a></p></li><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/setIamPolicy">iam. serviceAccounts.setIamポリシー</a></p></li></ul></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/iam#iam.serviceAccountUser">サービスアカウントのユーザー</a></p></td>
     <td><p>サービスアカウントとして操作を実行します。</p></td>
     <td><p>--</p></td>
   </tr>
</table>

