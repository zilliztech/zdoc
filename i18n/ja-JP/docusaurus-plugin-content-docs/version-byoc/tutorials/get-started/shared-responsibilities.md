---
title: "責任の共有 | BYOC"
slug: /shared-responsibilities
sidebar_key: shared-responsibilities
sidebar_label: "責任の共有"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービスの可用性、技術サポートに関連するタスクの分担を明確にし、安全かつ効率的な運用環境を維持しながら円滑な連携を実現するために、Zilliz Cloud と BYOC ユーザーのそれぞれの責任について説明します。| BYOC"
type: origin
token: QqtGwq7lSimnHJk6IuXcM9synWg
sidebar_position: 15
keywords: 
  - zilliz
  - byoc
  - milvus
  - ベクトルデータベース
  - 責任の共有

---

import Admonition from '@theme/Admonition';


# 共有責任

このページでは、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービス可用性、および技術サポートに関連するタスクの分担を明確にし、安全かつ効率的な運用環境を維持しながら円滑な連携を実現するために、Zilliz Cloud と BYOC ユーザーのそれぞれの責任について説明します。

## クラウド管理\{#cloud-management}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>顧客</p></th>
   </tr>
   <tr>
     <td><p>VPC の設定</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>EC2 インスタンスの管理</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>Kubernetes クラスターの管理</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>S3 バケットの管理</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>Milvus インスタンスのプロビジョニング</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
</table>

## アップグレードとセキュリティ\{#upgrade-and-security}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>顧客</p></th>
   </tr>
   <tr>
     <td><p>Milvus インスタンスのアップグレード</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>ソフトウェアの脆弱性へのパッチ適用</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>インフラストラクチャの脆弱性へのパッチ適用</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>リソースのスケーリング</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## アクセス制御\{#access-control}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>顧客</p></th>
   </tr>
   <tr>
     <td><p>IAM ロールとサービスアカウントの管理</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>アクセス制御と監査の実装</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## サービス可用性\{#service-availability}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>顧客</p></th>
   </tr>
   <tr>
     <td><p>災害復旧 (DR)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>サービスレベル契約 (SLA)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

## 技術サポート\{#technical-support}

<table>
   <tr>
     <th><p>タスク</p></th>
     <th><p>Zilliz BYOC</p></th>
     <th><p>顧客</p></th>
   </tr>
   <tr>
     <td><p>ログ記録</p></td>
     <td></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>監査ログ記録</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>モニタリング</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>緊急アクセス（Break-glass アクセス）</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>

