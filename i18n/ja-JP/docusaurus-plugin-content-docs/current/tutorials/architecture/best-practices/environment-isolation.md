---
title: "Environment Isolation | Cloud"
slug: /environment-isolation
sidebar_label: "Environment Isolation"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発とデプロイに不可欠です。Zilliz Cloud は、Organizations、Projects、Clusters の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務の要件に基づいて最適な戦略を選択するのに役立ちます。| Cloud"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Environment Isolation

適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発とデプロイに不可欠です。Zilliz Cloud は、**Organizations**、**Projects**、**Clusters** の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務の要件に基づいて最適な戦略を選択するのに役立ちます。

## Organization レベルの分離\{#organization-level-isolation}

Organization レベルの分離は、最も安全なオプションです。

**最適な用途:**

- 個別の請求アカウント（例: 複数の異なる AWS サブスクリプションアカウント）

- 独立した請求書とコスト管理

- 環境間での厳格なユーザーアクセス境界

**実装方法:**

- 各環境（例: 本番、開発、テスト）ごとに個別の [organization](./organization-settings) を作成します

- 各 organization は一意の[支払い方法](/docs/payment-billing)にリンクできます

- デフォルトでは、Zilliz Cloud でサポートされる organization は 1 つのみです。複数の organization が必要な場合は、[Support Portal](https://support.zilliz.com/hc/en-us) でリクエストを送信してください。

## Project レベルの分離\{#project-level-isolation}

このオプションは、請求の分離が要件ではない、ほとんどのエンタープライズグレードの本番デプロイに推奨されます。

**最適な用途:**

- 単一の支払い方法の下で環境間の請求を共有する場合

- 環境ごとのリソース[使用量](/docs/analyze-cost)の追跡

- 中程度の分離でユーザー[roles](./project-users#invite-a-user-to-a-project)を管理する場合

**利点:**

- [project](./manage-projects) レベルでのきめ細かなユーザーアクセス制御

- 環境ごとの使用量追跡を備えた統合請求

- ほとんどのエンタープライズユースケースに十分な分離

## Cluster レベルの分離\{#cluster-level-isolation}

これは最もアジャイルで軽量なオプションです。

**最適な用途:**

- 迅速なイテレーションに重点を置く小規模チーム

- 最小限のアクセス制御ニーズ

- 基本的なワークロード分離

**機能:**

- 同じ project 配下の複数の [clusters](./manage-cluster)

- 各 cluster は、ワークロード分離のために専用のコンピューティング/ストレージリソースを持ちます

- 運用と管理を容易にする一元化された[監視](./metrics-alerts-reference)

## 適切な分離戦略の選択\{#choosing-the-right-isolation-strategy}

以下のフローを使用して判断してください。

1. **個別の請求または請求書が必要ですか？**
 → はい: **Organization レベルの分離**を使用します

1. **環境ごとのロールベースのアクセス制御が必要ですか？**
 → はい: **Project レベルの分離**を使用します

1. **上記のいずれにも該当しませんか？**
 → シンプルにするために **Cluster レベルの分離**を使用します

個別の推奨事項については、[Zilliz Cloud Support Team](https://support.zilliz.com/hc/en-us) までお問い合わせください。
