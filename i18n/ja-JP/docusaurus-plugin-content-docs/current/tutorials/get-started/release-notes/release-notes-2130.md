---
title: "リリースノート (2025年1月27日) | Cloud"
slug: /release-notes-2130
sidebar_label: "リリースノート (2025年1月27日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは現在パブリックプレビューでMilvus 2.5をサポートし、セマンティック検索を補完するための全文検索を導入します。効率的な保存および検索のためBM25メトリックおよびスパースベクトルを使用し、この機能によりユーザーは変換なしに直接テキストをクエリできます。アップデートでは、Private LinkによるBYOC展開も強化され、セキュリティの向上、コンプライアンスの容易化、ネットワーク構成の簡略化が実現します。さらに、AWS CloudFormationによる自動展開がサポートされ、大規模な小ファイルインポートの処理が最適化され、より高速なデータ取り込みが実現します。 | Cloud"
type: origin
token: LRRVwYzxKioMiMk7cf6czQuhn7d
sidebar_position: 8
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';


# リリースノート (2025年1月27日)

Zilliz Cloudは現在**パブリックプレビュー**でMilvus 2.5をサポートし、セマンティック検索を補完するための全文検索を導入します。効率的な保存および検索のためBM25メトリックおよびスパースベクトルを使用し、この機能によりユーザーは変換なしに直接テキストをクエリできます。アップデートでは、Private LinkによるBYOC展開も強化され、セキュリティの向上、コンプライアンスの容易化、ネットワーク構成の簡略化が実現します。さらに、AWS CloudFormationによる自動展開がサポートされ、大規模な小ファイルインポートの処理が最適化され、より高速なデータ取り込みが実現します。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus v2.4.x**と互換性があります。

クラスターを**パブリックプレビュー**にアップグレードする場合は、**Milvus 2.5.x**機能はアップグレード後に利用可能になります。Zilliz Cloudコンソールの**クラスタ詳細**ページで**プレビューフィーチャーを試す**をクリックすると、**パブリックプレビュー**の機能の詳細を確認できます。

![KkqKbUfwwomTRBxKSwTcVjv0nLf](/img/KkqKbUfwwomTRBxKSwTcVjv0nLf.png)

## Zilliz Cloudは現在パブリックプレビューでMilvus 2.5をサポートし、全文検索を導入\{#zilliz-cloud-now-supports-milvus-25-in-public-preview-introducing-full-text-search}

Zilliz Cloudは現在、**パブリックプレビュー**としてMilvus 2.5に対応しています。このアップデートでは、**全文検索**とも呼ばれる新しい主要機能を導入します。検索に初めて触れる方のために説明すると、全文検索ではドキュメント内のある単語や語句を検索してドキュメントを見つけることができます（Google検索のようなものです）。これは正確な単語の一致だけでなく意味を理解することに焦点を当てる既存の**セマンティック検索**機能を補完します。

私たちの実装では、ドキュメント類似性に**業界標準のBM25**メトリックを使用し、**スパースベクトル**に基づいており、効率的な保存および検索を実現します。簡単に言えば、スパースベクトルは、すべての値の大部分がゼロである方法でテキストを表現します。多数のセルのうち数個にしか数値が入っていない巨大なスプレッドシートを想像してください。この効率性は、ベクトルが検索の基盤となるMilvusのコア哲学に合致しています。

私たちのアプローチの主な利点の1つは、**事前に手動でスパースベクトルに変換することなく、直接テキストを挿入およびクエリできることです。** これにより、Zilliz Cloudは非構造化データ処理の完全サポートにより一歩近づきました。

詳細については、[全文検索](./full-text-search)を参照してください。

## BYOC - セキュリティ強化と展開の簡略化\{#byoc-enhanced-security-and-simplified-deployment}

このリリースにより、**Zilliz CloudはPrivate Link経由のデータプレーン-コントロールプレーン通信をサポートするようになり**、BYOC展開の**セキュリティ強化とコンプライアンスの容易化**を実現します。

- **セキュリティ強化**：Private Linkは、コントロールプレーン（Zilliz Cloudでホスト）とデータプレーン（VPCに展開）間のすべての通信が**プライベートネットワーク内に留まり**、パブリックインターネットを完全に回避することを保証します。これにより、**サイバー脅威への露出が軽減**され、**データ傍受のリスクが排除**されます。

- **コンプライアンスの容易化**：多くの企業では、規制基準を満たすために**厳格なデータ所在およびネットワーク分離**が必要です。Private Linkにより、**機密データがプライベート環境から決して出ることなく**、**GDPR、HIPAA、およびその他のセキュリティフレームワークに準拠**しやすくなります。

- **ネットワーク構成の簡略化**：Private Linkは、**複雑なファイアウォールルール、VPN、またはパブリックエンドポイント**の必要性を排除し、運用オーバーヘッドを削減し、BYOC展開を**よりスムーズで管理しやすく**します。

さらに、**Zilliz Cloud BYOCはAWS CloudFormationによる自動展開をサポート**するようになり、データプレーンのセットアップと管理がさらに容易になりました。

詳細については、[AWSへのBYOC展開](/docs/byoc/deploy-byoc-aws)を参照してください。

## 機能強化\{#enhancements}

**大規模な小ファイルインポートのサポート**：多数の小ファイルを含むインポート処理を改善し、より高速で効率的なデータ取り込みを保証します。