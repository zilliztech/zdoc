---
title: "責任の分担 | BYOC"
slug: /shared-responsibilities
sidebar_label: "責任の分担"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービス可用性、技術サポートに関するタスク分担を明確にするために、Zilliz Cloud と BYOC ユーザーそれぞれの責任を示しています。これにより、安全で効率的な運用環境を維持しながら、円滑なコラボレーションを実現します。 | BYOC"
type: origin
token: QqtGwq7lSimnHJk6IuXcM9synWg
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 責任の分担

このページでは、クラウド管理、アップグレード、セキュリティ、アクセス制御、サービス可用性、技術サポートに関するタスク分担を明確にするために、Zilliz Cloud と BYOC ユーザーそれぞれの責任を示しています。これにより、安全で効率的な運用環境を維持しながら、円滑なコラボレーションを実現します。

## クラウド管理\{#cloud-management}

| タスク | Zilliz BYOC | お客様 |
| --- | --- | --- |
| VPC のセットアップ |  | ✔ |
| EC2 インスタンスの管理 | ✔ |  |
| Kubernetes クラスターの管理 | ✔ |  |
| S3 バケットの管理 |  | ✔ |
| Milvus インスタンスのプロビジョニング | ✔ |  |

## アップグレードとセキュリティ\{#upgrade-and-security}

| タスク | Zilliz BYOC | お客様 |
| --- | --- | --- |
| Milvus インスタンスのアップグレード | ✔ |  |
| ソフトウェア脆弱性のパッチ適用 | ✔ |  |
| インフラストラクチャ脆弱性のパッチ適用 | ✔ | ✔ |
| リソースのスケーリング | ✔ | ✔ |

## アクセス制御\{#access-control}

| タスク | Zilliz BYOC | お客様 |
| --- | --- | --- |
| IAM ロールとサービスアカウントの管理 | ✔ | ✔ |
| アクセス制御と監査の実装 | ✔ | ✔ |

## サービス可用性\{#service-availability}

| タスク | Zilliz BYOC | お客様 |
| --- | --- | --- |
| 災害復旧 (DR) | ✔ | ✔ |
| サービスレベル契約 (SLA) | ✔ | ✔ |

## 技術サポート\{#technical-support}

| タスク | Zilliz BYOC | お客様 |
| --- | --- | --- |
| ログ記録 |  | ✔ |
| 監査ログ記録 | ✔ | ✔ |
| 監視 | ✔ |  |
| 緊急時アクセス | ✔ | ✔ |

