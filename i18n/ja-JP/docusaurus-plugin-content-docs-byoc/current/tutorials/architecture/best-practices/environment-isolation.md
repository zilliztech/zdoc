---
title: "Environment Isolation | BYOC"
slug: /environment-isolation
sidebar_label: "Environment Isolation"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Proper environment isolation and access control are essential in enterprise application development and deployment. Zilliz Cloud offers flexible isolation through a hierarchical structure of Organizations, Projects, and クラスター. This guide helps you select the most appropriate strategy based on your operational, security, and financial requirements. | BYOC"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 環境の分離

適切な環境の分離とアクセス制御は、エンタープライズアプリケーションの開発とデプロイにおいて不可欠です。Zilliz Cloud は、**Organizations**、**Projects**、**クラスター** の階層構造を通じて柔軟な分離を提供します。このガイドでは、運用、セキュリティ、財務の要件に基づいて最適な戦略を選択する方法を説明します。

## プロジェクトレベルの分離\{#project-level-isolation}

このオプションは、請求の分離が不要なほとんどのエンタープライズ向け本番デプロイに推奨されます。

**最適な用途:**

- 中程度の分離レベルでユーザーの [roles](./manage-platform-roles#manage-project-roles) を管理する場合

**メリット:**

- [project](./manage-projects) レベルでのきめ細かなユーザーアクセス制御

- 環境ごとの使用量追跡に対応した一括請求

- ほとんどのエンタープライズユースケースに十分な分離レベル

## クラスターレベルの分離\{#cluster-level-isolation}

最も俊敏かつ軽量なオプションです。

**最適な用途:**

- 迅速なイテレーションを重視する小規模チーム

- 最小限のアクセス制御要件

- 基本的なワークロード分離

**特徴:**

- 同じプロジェクト内の複数の [クラスター](./manage-cluster)

- 各クラスターはワークロード分離専用の compute/storage リソースを保有

- 一元化された [monitoring](./metrics-alerts-reference) による運用管理の簡素化

## 適切な分離戦略の選択\{#choosing-the-right-isolation-strategy}

以下のフローに沿って判断してください。

1. **請求や請求書の分離が必要ですか？**
 → はい：**組織レベルの分離**を使用

1. **環境ごとにロールベースのアクセス制御が必要ですか？**
 → はい：**プロジェクトレベルの分離**を使用

1. **上記のいずれにも該当しない場合**
 → シンプルな **クラスターレベルの分離** を使用

個別のご相談については、[Zilliz Cloud Support Team](https://support.zilliz.com/hc/en-us) までお問い合わせください。

