---
title: "環境の分離 | BYOC"
slug: /environment-isolation
sidebar_label: "環境の分離"
beta: FALSE
notebook: FALSE
description: "適切な環境の分離とアクセス制御は、エンタープライズアプリケーションの開発と展開において不可欠です。Zilliz Cloudは、組織、プロジェクト、クラスターの階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務要件に基づいて最適な戦略を選択するのに役立ちます。 | BYOC"
type: origin
token: JBaYwQ4Vui1coNkBQPacbhuZnKX
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - multi-tenancy
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection

---

import Admonition from '@theme/Admonition';


# 環境の分離

適切な環境の分離とアクセス制御は、エンタープライズアプリケーションの開発と展開において不可欠です。Zilliz Cloudは、**組織**、**プロジェクト**、**クラスター**の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務要件に基づいて最適な戦略を選択するのに役立ちます。

## 組織レベルの分離{#organization-level-isolation}

組織レベルの分離は最も安全なオプションです。

**最適な用途:**

- 別々の請求アカウント(例:複数の異なるAWSサブスクリプションアカウント)

- インボイスとコスト管理を独立して行う

- 環境間の厳格なユーザーアクセス境界

**実装する方法:**

- 各環境(本番、開発、テストなど)に対して独自の[組織](./organizations)を作成してください

- 各組織は独自の[支払い方法](/ja-JP/docs/payment-billing)にリンクできます

- デフォルトでは、Zilliz Cloudは1つの組織のみをサポートしています。複数の組織が必要な場合は、[サポートポータル](https://support.zilliz.com/hc/en-us)からリクエストを送信してください。

## プロジェクトレベルの分離{#project-level-isolation}

このオプションは、請求の分離が必須ではない、ほとんどのエンタープライズグレードの本番環境で推奨されます。

**最適な用途:**

- 単一の支払い方法で環境間で共有される請求

- リソースの[使用状況](/ja-JP/docs/analyze-cost)を環境別に追跡する

- 適度な分離でユーザー[ロール](./project-users#project-roles)を管理する

**メリット:**

- プロジェクトレベルでの細かいユーザーアクセス制御

- 環境ごとの使用状況の追跡による統合請求

- ほとんどのエンタープライズユースケースに十分な分離

## クラスタレベルの分離{#cluster-level-isolation}

これは最もアジャイルで軽量なオプションです。

**最適な用途:**

- 迅速な反復に焦点を当てた小規模チーム

- 最小限のアクセス制御ニーズ

- 基本的なワークロードの分離

**特徴:**

- 同じ[プロジェクト](./cluster)内の複数のクラスター

- 各クラスターには、ワークロードの分離のための専用のコンピューティング/ストレージリソースがあります

- 一元化された[モニタリング](./metrics-and-alerts)により、操作と管理が容易になります

## 適切な孤立戦略の選択{#choose-the-right-isolation-strategy}

以下のフローを使用して決定を導いてください。

1. **別途請求書や請求書が必要ですか?**

    →はい:**組織レベルの分離**を使用してください

1. **環境ごとに役割ベースのアクセス制御が必要ですか?**

    →はい:**プロジェクトレベルの分離**を使用してください

1. **上記のどちらでもないですか?**

    →単純化のために**クラスタレベルの分離**を使用する

カスタマイズされた推奨事項については、[Zilliz Cloudサポートチーム](https://zilliz.com/contact-sales)にお問い合わせください。