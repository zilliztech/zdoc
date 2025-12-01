---
title: "環境分離 | Cloud"
slug: /environment-isolation
sidebar_label: "環境分離"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発およびデプロイにおいて不可欠です。Zilliz Cloudは、組織、プロジェクト、クラスターの階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、および財務要件に基づいて最も適切な戦略を選択するのに役立ちます。 | Cloud"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - milvus
  - multi-tenancy
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search

---

import Admonition from '@theme/Admonition';


# 環境分離

適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発およびデプロイにおいて不可欠です。Zilliz Cloudは、**組織**、**プロジェクト**、および**クラスター**の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、および財務要件に基づいて最も適切な戦略を選択するのに役立ちます。

## 組織レベルの分離\{#organization-level-isolation}

組織レベルの分離は最も安全なオプションです。

**最適なケース：**

- 別々の請求アカウント（例：複数の異なるAWSサブスクリプションアカウント）

- 独立した請求書とコスト管理

- 環境間で厳格なユーザー アクセス境界

**実装方法：**

- 各環境（例：本番、開発、テスト）に対して別々の[組織](./organizations)を作成する

- 各組織を固有の[支払い方法](/docs/payment-billing)に関連付けることができる

- デフォルトでは、Zilliz Cloudは単一の組織のみをサポートしています。複数の組織が必要な場合は、[サポートポータル](https://support.zilliz.com/hc/en-us)でリクエストを送信してください。

## プロジェクトレベルの分離\{#project-level-isolation}

請求分離が不要な場合、このオプションはほとんどのエンタープライズグレードの本番デプロイに推奨されます。

**最適なケース：**

- 単一の支払い方法の下で環境全体の共有請求

- 環境ごとのリソース[使用状況](/docs/analyze-cost)の追跡

- 中程度の分離を伴うユーザー[ロール](./project-users#project-roles)の管理

**利点：**

- [プロジェクト](./projects)レベルでのきめ細かいユーザー アクセス制御

- 環境ごとの使用状況追跡を伴う一元化された請求

- ほとんどのエンタープライズユースケースに十分な分離

## クラスターレベルの分離\{#cluster-level-isolation}

これは最も機敏で軽量なオプションです。

**最適なケース：**

- 迅速な反復に焦点を当てた小規模チーム

- 最小限のアクセス制御の必要性

- 基本的なワークロード分離

**特徴：**

- 同じプロジェクト下の複数の[クラスター](./cluster)

- 各クラスターにはワークロード分離のための専用のコンピュート/ストレージリソースがある

- より簡単な運用と管理のための統合された[監視](./metrics-and-alerts)

## 適切な分離戦略の選択\{#choosing-the-right-isolation-strategy}

以下のフローを使用して決定をガイドしてください：

1. **別々の請求または請求書が必要ですか？**
 → はい：**組織レベルの分離**を使用

1. **環境ごとにロールベースのアクセス制御が必要ですか？**
 → はい：**プロジェクトレベルの分離**を使用

1. **上記のいずれも該当しない場合？**
 → シンプルにするために**クラスターレベルの分離**を使用

カスタマイズされた推奨事項については、[Zilliz Cloudサポートチーム](https://support.zilliz.com/hc/en-us)にお問い合わせください。