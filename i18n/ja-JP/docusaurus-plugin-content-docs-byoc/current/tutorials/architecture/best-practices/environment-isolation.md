---
title: "環境分離 | BYOC"
slug: /environment-isolation
sidebar_label: "環境分離"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発およびデプロイにおいて不可欠です。Zilliz Cloud は、組織、プロジェクト、クラスターの階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務要件に基づいて最適な戦略を選択するのに役立ちます。 | BYOC"
type: origin
token: LQwnwNY73iCd8Hkj55ZczQTOn6g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 環境分離

適切な環境分離とアクセス制御は、エンタープライズアプリケーションの開発およびデプロイにおいて不可欠です。Zilliz Cloud は、**組織**、**プロジェクト**、**クラスター**の階層構造を通じて柔軟な分離を提供します。このガイドは、運用、セキュリティ、財務要件に基づいて最適な戦略を選択するのに役立ちます。

## プロジェクトレベルの分離\{#project-level-isolation}

このオプションは、請求の分離が要件ではない、ほとんどのエンタープライズグレードの本番デプロイメントに推奨されます。

**最適なケース:**

- 中程度の分離でユーザーの[ロール](./project-users#invite-a-user-to-a-project)を管理する場合

**利点:**

- [プロジェクト](./manage-projects) レベルでのきめ細かなユーザーアクセス制御

- 環境ごとの使用状況追跡を伴う請求の一元化

- ほとんどのエンタープライズユースケースに十分な分離

## クラスターレベルの分離\{#cluster-level-isolation}

これは最も俊敏で軽量なオプションです。

**最適なケース:**

- 迅速な反復に注力する小規模チーム

- 最小限のアクセス制御ニーズ

- 基本的なワークロード分離

**機能:**

- 同じプロジェクト配下の複数の[クラスター](./manage-cluster)

- 各クラスターは、ワークロード分離のための専用のコンピュート/ストレージリソースを持つ

- より簡単な運用と管理のための一元化された[モニタリング](./metrics-alerts-reference)

## 適切な分離戦略の選択\{#choosing-the-right-isolation-strategy}

以下のフローを参考に意思決定してください。

1. **請求または請求書を分ける必要がありますか？**
 → はい: **組織レベルの分離**を使用

1. **環境ごとにロールベースのアクセス制御が必要ですか？**
 → はい: **プロジェクトレベルの分離**を使用

1. **上記のどちらでもありませんか？**
 → シンプルさのために**クラスターレベルの分離**を使用

個別の推奨事項については、[Zilliz Cloud Support Team](https://support.zilliz.com/hc/en-us) までお問い合わせください。

