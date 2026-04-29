---
title: "環境分離 | Cloud"
slug: /environment-isolation
sidebar_key: environment-isolation
sidebar_label: "環境分離"
beta: FALSE
notebook: FALSE
description: "適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発およびデプロイにおいて不可欠です。Zilliz Cloud は、組織、プロジェクト、クラスターの階層構造を通じて柔軟な分離を提供します。このガイドでは、運用、セキュリティ、財務の要件に基づいて最適な戦略を選択する方法を説明します。| Cloud"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - マルチテナンシー

---

import Admonition from '@theme/Admonition';


# 環境分離

適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発およびデプロイにおいて不可欠です。Zilliz Cloud は、**組織**、**プロジェクト**、**Clusters** の階層構造を通じて柔軟な分離を提供します。このガイドでは、運用上、セキュリティ上、財務上の要件に基づいて、最も適切な戦略を選択する方法を説明します。

## 組織レベルの分離\{#organization-level-isolation}

組織レベルの分離は、最も安全なオプションです。

**以下に最適です：**

- 請求アカウントの分離（例：複数の異なる AWS サブスクリプションアカウント）

- 独立した請求書およびコスト管理

- 環境間での厳格なユーザーアクセス境界

**実装方法：**

- 各環境（例：本番、開発、テスト）ごとに個別の [組織](./organizations) を作成する

- 各組織を固有の [支払い方法](/docs/payment-billing) にリンクできる

- デフォルトでは、Zilliz Cloud でサポートされる組織は 1 つのみです。複数の組織が必要な場合は、[サポートポータル](https://support.zilliz.com/hc/en-us) からリクエストを送信してください。

## プロジェクトレベルの分離\{#project-level-isolation}

このオプションは、請求の分離が不要なほとんどのエンタープライズグレードの本番デプロイメントにおすすめです。

**以下に最適です：**

- 単一の支払い方法の下で環境間で請求を共有すること

- 環境別のリソース [使用量](/docs/analyze-cost) の追跡

- 中程度の分離を伴うユーザー [ロール](./project-users#invite-a-user-to-a-project) の管理

**メリット：**

- [プロジェクト](./projects) レベルできめ細かいユーザーアクセス制御

- 環境別の使用量追跡を伴う統合請求

- ほとんどのエンタープライズユースケースに十分な分離

## クラスターレベルの分離\{#cluster-level-isolation}

これは最も機動的で軽量なオプションです。

**以下に最適です：**

- 迅速な反復に焦点を当てた小規模チーム

- アクセス制御の必要性が最小限

- 基本的なワークロード分離

**機能：**

- 同じプロジェクト内の複数の [クラスター](./cluster)

- 各クラスターは、ワークロード分離のために専用のコンピューティング/ストレージリソースを持つ

- 運用と管理を容易にするための集中型 [モニタリング](./metrics-and-alerts)

## Choosing the right isolation strategy\{#choosing-the-right-isolation-strategy}

以下のフローを使用して、意思決定をガイドしてください：

1. **別々の請求または請求書が必要ですか？**
 → はい：**組織レベルの分離**を使用します

1. **環境ごとのロールベースのアクセス制御が必要ですか？**
 → はい：**プロジェクトレベルの分離**を使用します

1. **上記のいずれも該当しない場合？**
 → 簡素化のために**クラスターレベルの分離**を使用します

個別の推奨事項については、[Zilliz Cloud サポートチーム](https://support.zilliz.com/hc/en-us) にお問い合わせください。

