---
title: "リリースノート（2025年1月27日） | Cloud"
slug: /release-notes-2130
sidebar_label: "2025年1月27日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は現在、Public Preview で Milvus 2.5 をサポートしており、セマンティック検索を補完する全文検索を導入しています。効率的な保存と検索のために BM25 メトリックとスパースベクトルを使用することで、この機能によりユーザーは変換なしで直接テキストをクエリできます。このアップデートでは、Private Link により BYOC デプロイメントも強化され、セキュリティの向上、コンプライアンス対応の容易化、ネットワーク設定の簡素化が実現されています。さらに、AWS CloudFormation による自動デプロイもサポートされ、大規模な小容量ファイルのインポート処理が最適化されて、より高速なデータ取り込みが可能になりました。 | Cloud"
type: origin
token: LRRVwYzxKioMiMk7cf6czQuhn7d
sidebar_position: 16
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年1月27日）

Zilliz Cloud は現在、**Public Preview** で Milvus 2.5 をサポートしており、セマンティック検索を補完する全文検索を導入しています。効率的な保存と検索のために BM25 メトリックとスパースベクトルを使用することで、この機能によりユーザーは変換なしで直接テキストをクエリできます。このアップデートでは、Private Link により BYOC デプロイメントも強化され、セキュリティの向上、コンプライアンス対応の容易化、ネットワーク設定の簡素化が実現されています。さらに、AWS CloudFormation による自動デプロイもサポートされ、大規模な小容量ファイルのインポート処理が最適化されて、より高速なデータ取り込みが可能になりました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus v2.4.x** と互換性があります。

クラスターを **Public Preview** にアップグレードしたい場合、アップグレード後に **Milvus 2.5.x** の機能を利用できます。Zilliz Cloud コンソールの **Cluster Details** ページで **Try Preview Features** をクリックすると、**Public Preview** の機能の詳細を確認できます。

![KkqKbUfwwomTRBxKSwTcVjv0nLf](https://zdoc-images.s3.us-west-2.amazonaws.com/kkqkbufwwomtrbxkswtcvjv0nlf.png "KkqKbUfwwomTRBxKSwTcVjv0nLf")

## Zilliz Cloud が Public Preview で Milvus 2.5 をサポートし、全文検索を導入\{#zilliz-cloud-now-supports-milvus-25-in-public-preview-introducing-full-text-search}

Zilliz Cloud は現在、**Public Preview** として提供される Milvus 2.5 と互換性があります。このアップデートでは、主要な新機能である **全文検索**（語彙検索またはキーワード検索とも呼ばれます）が導入されます。検索に不慣れな場合、全文検索では、Google で検索するのと同じように、ドキュメント内の特定の単語やフレーズを探してドキュメントを見つけることができます。これは、単に完全一致する単語を照合するのではなく意味の理解に重点を置く、既存の **セマンティック検索** 機能を補完するものです。

この実装では、ドキュメント類似性のために **業界標準の BM25** メトリックを使用し、**スパースベクトル** をベースとしているため、効率的な保存と検索が可能です。簡単に言うと、スパースベクトルはほとんどの値がゼロになる形でテキストを表現します。大きなスプレッドシートの中で、いくつかのセルにだけ数値が入り、残りは空である状態を想像してください。この効率性は、ベクトルを検索の基盤とする Milvus の中核思想に沿ったものです。

このアプローチの大きな利点は、**事前に手動でスパースベクトルに変換する必要なく、直接テキストを挿入してクエリできることです。** これにより、Zilliz Cloud は非構造化データ処理の完全なサポートにさらに一歩近づきます。

詳細については、[全文検索](./full-text-search) を参照してください。

## BYOC - セキュリティ強化とデプロイの簡素化\{#byoc-enhanced-security-and-simplified-deployment}

このリリースにより、**Zilliz Cloud は現在、Private Link を介したデータプレーンとコントロールプレーン間の通信をサポート**し、BYOC デプロイメントに対して **より強力なセキュリティとより容易なコンプライアンス対応** を提供します。

- **より強力なセキュリティ**: Private Link により、コントロールプレーン（Zilliz Cloud でホスト）とデータプレーン（お客様の VPC にデプロイ）間のすべての通信が **プライベートネットワーク内** にとどまり、パブリックインターネットを完全に経由しません。これにより、**サイバー脅威への露出が低減** され、**データ傍受のリスクが排除** されます。

- **より容易なコンプライアンス対応**: 多くの企業では、規制基準を満たすために **厳格なデータレジデンシーとネットワーク分離** が求められます。Private Link を使用することで、**機密データがプライベート環境の外に出ない** ことを保証でき、**GDPR、HIPAA、その他のセキュリティフレームワーク** への準拠が容易になります。

- **ネットワーク設定の簡素化**: Private Link により、**複雑なファイアウォールルール、VPN、またはパブリックエンドポイント** が不要になり、運用負荷が軽減され、BYOC デプロイメントが **よりシンプルで管理しやすく** なります。

さらに、**Zilliz Cloud BYOC は現在、AWS CloudFormation による自動デプロイをサポート**しており、データプレーンのセットアップと管理がさらに容易になりました。

詳細については、[AWS への BYOC デプロイ](/docs/byoc/deploy-byoc-aws) を参照してください。

## 機能強化\{#enhancements}

**大規模な小容量ファイルのインポートのサポート**: 多数の小さなファイルを含むインポート処理が改善され、より高速で効率的なデータ取り込みが可能になりました。
