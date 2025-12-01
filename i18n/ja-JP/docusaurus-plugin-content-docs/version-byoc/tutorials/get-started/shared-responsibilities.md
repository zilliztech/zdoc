---
title: "共有責任 | BYOC"
slug: /shared-responsibilities
sidebar_label: "共有責任"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud と BYOC ユーザーの責任を概説し、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービス可用性、技術サポートに関連するタスクの役割分担を明確にし、安全で効率的な運用環境を維持しながらスムーズな協力を確保します。 | BYOC"
type: origin
token: QqtGwq7lSimnHJk6IuXcM9synWg
sidebar_position: 11
keywords:
  - zilliz
  - byoc
  - milvus
  - vector database
  - shared responsibilities
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database

---

import Admonition from '@theme/Admonition';


# 共有責任

このページでは、Zilliz Cloud と BYOC ユーザーの責任を概説し、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービス可用性、技術サポートに関連するタスクの役割分担を明確にし、安全で効率的な運用環境を維持しながらスムーズな協力を確保します。

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
     <td><p>ソフトウェアの脆弱性パッチ適用</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>インフラストラクチャの脆弱性パッチ適用</p></td>
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
     <td><p>IAM ロールおよびサービスアカウントの管理</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>アクセス制御および監査の実装</p></td>
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
     <td><p>ディザスタリカバリー (DR)</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>サービスレベルアグリーメント (SLA)</p></td>
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
     <td><p>監査ログ</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
   <tr>
     <td><p>監視</p></td>
     <td><p>✔</p></td>
     <td></td>
   </tr>
   <tr>
     <td><p>緊急アクセス</p></td>
     <td><p>✔</p></td>
     <td><p>✔</p></td>
   </tr>
</table>
