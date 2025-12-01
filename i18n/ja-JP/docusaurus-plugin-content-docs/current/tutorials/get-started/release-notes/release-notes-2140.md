---
title: "リリースノート (2025年3月27日) | Cloud"
slug: /release-notes-2140
sidebar_label: "リリースノート (2025年3月27日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、PRIVATE PREVIEWで2つの新機能を導入します：BYOC-Iと呼ばれる新しいBYOC展開オプションおよびデータプレーン監査ログ機能です。前者はクロスアカウントIAM承認なしに完全なデータ主権を確保するように設計されており、後者はデータプレーンで実行されたアクションの詳細ログを提供してデータセキュリティを強化することを目的としています。これらの機能のローンチに加えて、Zilliz Cloudはクレジット戦略も改訂しました。 | Cloud"
type: origin
token: FSUqwEEIii9k2sklkcLcIFJJnbf
sidebar_position: 7
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search

---

import Admonition from '@theme/Admonition';


# リリースノート (2025年3月27日)

このリリースでは、**PRIVATE PREVIEW**で2つの新機能を導入します：BYOC-Iと呼ばれる新しいBYOC展開オプションおよびデータプレーン監査ログ機能です。前者はクロスアカウントIAM承認なしに完全なデータ主権を確保するように設計されており、後者はデータプレーンで実行されたアクションの詳細ログを提供してデータセキュリティを強化することを目的としています。これらの機能のローンチに加えて、Zilliz Cloudはクレジット戦略も改訂しました。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus v2.4.x**と互換性があります。

クラスターを**パブリックプレビュー**にアップグレードする場合は、**Milvus 2.5.x**機能はアップグレード後に利用可能になります。Zilliz Cloudコンソールの**クラスタ詳細**ページで**プレビューフィーチャーを試す**をクリックすると、**パブリックプレビュー**の機能の詳細を確認できます。

![Koy0bfMhuoaJ2ZxtVJfcUSl9n6d](/img/Koy0bfMhuoaJ2ZxtVJfcUSl9n6d.png)

## BYOC-I：完全なデータ主権を提供する新展開オプションおよび強化されたプロジェクト管理機能\{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

BYOC-Iの追加により、Zilliz BYOCは標準**BYOC**および**BYOC-I**の2つの展開オプションを提供するようになりました。

クロスアカウント承認を必要とする標準BYOCとは異なり、BYOC-Iは、ZillizのVPC内のコントロールパネルと顧客管理VPC内のデータプレーンの間の単一連絡ポイントとして、顧客管理VPCに展開されたエージェントを使用します。

Zilliz BYOCは、金融、医療、リソース、教育、およびEコマースなど、厳しいコンプライアンス要件に直面する業界全体でのデータガバナンスとコンプライアンスをサポートします。より厳しい規制措置を必要とする企業および組織にとって、BYOC-Iは完全なデータ主権を達成するための理想的な展開オプションです。

このリリースでは、標準BYOC展開オプションを使用して展開されたプロジェクトの管理を、**一時停止**および**再開**機能を追加することで改善します。データプレーンを一時停止し、EKSクラスターに関連付けられたEC2インスタンスを解放してインフラストラクチャコストを削減し、必要に応じてデータプレーンを復元できます。

このリリースでは、Zilliz BYOCは一般提供となります。[お問い合わせください](https://support.zilliz.com/hc/en-us)して価格に関する情報を得るか、ご興味がある場合はこの機能をリクエストしてください。

Zilliz BYOC展開オプションの詳細については、[BYOC概要](/docs/byoc/byoc-intro)を参照してください。展開手順および強化されたプロジェクト管理機能については、[AWSへのBYOC展開](/docs/byoc/deploy-byoc-aws)および[AWSへのBYOC-I展開](/docs/byoc/deploy-byoc-i-aws)を参照してください。

## データプレーン監査ログ：監査用の包括的なアクションログでデータ操作を保護\{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

監査ログにより、管理者はZilliz Cloudクラスターでのユーザー主導の操作およびAPI呼び出しを監視および追跡できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、およびさまざまなデータ操作などの**データプレーン**アクティビティの包括的な記録を提供します。また、セキュリティ監査、コンプライアンスレビュー、および問題解決のために、データへのアクセス方法および管理方法に関する洞察と可視性を提供します。

この機能を有効にすると、Zilliz Cloudは監査ログを指定されたオブジェクトストレージバケットにストリーミングします。その後、Snowflakeなどのサードパーティデータウェアハウスサービスを使用して監査分析を実施し、クラスターでの規制コンプライアンス、データセキュリティ、および運用監視を強化できます。

この機能は現在**PRIVATE PREVIEW**です。[お問い合わせください](https://support.zilliz.com/hc/en-us)して価格に関する情報を得るか、ご興味がある場合はこの機能をリクエストしてください。

クラスターでの監査ログの有効化手順の詳細については、[監査ログ](./audit-logs)を参照してください。Snowflakeなどのサードパーティデータウェアハウスサービスを使用して収集された監査ログの詳細な洞察を得るには、[Amazon S3用Snowpipeの自動化](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3)を参照してください。

Zilliz Cloudは、コレクション、データベース、エンティティ（検索、ハイブリッド検索、挿入、アップサート、削除）、インデックス、パーティション、およびエイリアスに関する70種類以上のアクションおよびイベントのログをサポートするようになりました。より多くのイベントは今後のリリースで含まれる予定です。適用可能なアクションおよびイベントの詳細については、[監査ログリファレンス](./audit-logs-ref)を参照してください。

## その他の機能強化\{#other-enhancements}

このリリース以来、Zilliz Cloudはクレジット戦略を調整しました。新しいクレジット戦略の詳細については、[Zilliz Cloudを無料で試す](./free-trials)を参照してください。