---
title: "環境分離 | Cloud"
slug: /environment-isolation
sidebar_label: "環境分離"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発とデプロイにおいて不可欠です。Zilliz Cloud は、**Organizations**、**Projects**、**クラスター** の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務の要件に基づいて最適な戦略を選択するのに役立ちます。 | Cloud"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 環境分離

適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発とデプロイにおいて不可欠です。Zilliz Cloud は、**Organizations**、**Projects**、**クラスター** の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務の要件に基づいて最適な戦略を選択するのに役立ちます。

## Organization レベルの分離\{#organization-level-isolation}

Organization レベルの分離は、最もセキュリティ強度が高いオプションです。

**推奨ユースケース:**

- 請求アカウントを分離したい場合（例: 複数の異なる AWS サブスクリプションアカウント）

- 請求書とコスト管理を独立させたい場合

- 環境間でユーザーアクセス権限を厳密に分離したい場合

**実装方法:**

- 環境ごとに個別の [organization](./organization-settings) を作成します（例: 本番、開発、テスト）。

- 各 organization に固有の [支払い方法](/docs/payment-billing) を紐付けられます。

- デフォルトでは、Zilliz Cloud で作成できる organization は 1 つのみです。複数の organization が必要な場合は、[Support Portal](https://support.zilliz.com/hc/en-us) からリクエストを送信してください。

## Project レベルの分離\{#project-level-isolation}

請求の分離が不要な、ほとんどのエンタープライズ向け本番デプロイメントに推奨されるオプションです。

**推奨ユースケース:**

- 単一の支払い方法で複数環境の請求を一元管理したい場合

- 環境ごとにリソース [使用量](/docs/analyze-cost) を追跡したい場合

- 適度な分離を保ちつつユーザー [ロール](./manage-platform-roles#manage-project-roles) を管理したい場合

**メリット:**

- [プロジェクト](./manage-projects) レベルでのきめ細かいユーザーアクセス制御が可能

- 環境ごとの使用量を追跡しつつ請求を一元化できる

- ほとんどのエンタープライズユースケースに十分な分離レベルを確保できる

## クラスターレベルの分離\{#cluster-level-isolation}

最もアジャイルで軽量なオプションです。

**推奨ユースケース:**

- 迅速なイテレーションを重視する小規模チーム

- 最小限のアクセス制御で十分な場合

- 基本的なワークロード分離を行いたい場合

**特徴:**

- 同一プロジェクト内に複数の [クラスター](./manage-cluster) を配置可能

- 各クラスターは専用のコンピュート/storage リソースを持ち、ワークロードを分離

- 一元化された [モニタリング](./metrics-alerts-reference) により運用管理が容易

## 適切な分離戦略の選択\{#choosing-the-right-isolation-strategy}

以下のフローチャートを参考に、最適な戦略を選択してください。

1. **請求や請求書を分離する必要がありますか？**
 → はい: **Organization レベルの分離** を採用

1. **環境ごとにロールベースのアクセス制御が必要ですか？**
 → はい: **Project レベルの分離** を採用

1. **上記のいずれにも該当しない場合**
 → シンプルな **クラスターレベルの分離** を採用

個別のアドバイスが必要な場合は、[Zilliz Cloud Support Team](https://support.zilliz.com/hc/en-us) までお問い合わせください。

