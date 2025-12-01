---
title: "環境分離 | BYOC"
slug: /environment-isolation
sidebar_label: "環境分離"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "企業アプリケーションの開発および展開において、適切な環境分離とアクセス制御は不可欠です。Zilliz Cloud は、組織、プロジェクト、クラスターの階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務要件に基づいて最も適切な戦略を選択するのに役立ちます。 | BYOC"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 3
keywords:
  - zilliz
  - vector database
  - cloud
  - milvus
  - multi-tenancy
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database

---

import Admonition from '@theme/Admonition';


# 環境分離

企業アプリケーションの開発および展開において、適切な環境分離とアクセス制御は不可欠です。Zilliz Cloud は、**組織**、**プロジェクト**、**クラスター**の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務要件に基づいて最も適切な戦略を選択するのに役立ちます。

## プロジェクトレベルの分離\{#project-level-isolation}

このオプションは、請求分離が不要なほとんどのエンタープライズグレードの本番展開に推奨されます。

**最適なケース：**

- 中程度の分離を伴うユーザー[ロール](./project-users#project-roles)の管理

**利点：**

- [プロジェクト](./projects)レベルでのきめ細かいユーザーアクセス制御

- 環境ごとの使用状況追跡付きの統合請求

- ほとんどのエンタープライズユースケースに十分な分離

## クラスターレベルの分離\{#cluster-level-isolation}

これは最も敏捷性があり、軽量なオプションです。

**最適なケース：**

- 高速な反復に焦点を当てた小規模チーム

- 最小限のアクセス制御要件

- 基本的なワークロード分離

**機能：**

- 同じプロジェクト下の複数の[クラスター](./cluster)

- 各クラスターにはワークロード分離のための専用コンピュート/ストレージリソース

- 操作と管理を容易にするための集中型[監視](./metrics-and-alerts)

## 適切な分離戦略の選択\{#choosing-the-right-isolation-strategy}

以下のフローを使用して、判断をガイドしてください：

1. **個別の請求またはインボイスが必要ですか？**
 → はい：**組織レベルの分離**を使用

1. **環境ごとにロールベースのアクセス制御が必要ですか？**
 → はい：**プロジェクトレベルの分離**を使用

1. **上記のいずれも該当しない？**
 → シンプルにするために**クラスターレベルの分離**を使用

カスタマイズされた推奨事項については、[Zilliz Cloud サポートチーム](https://support.zilliz.com/hc/en-us)にご連絡ください。
