---
title: "リリースノート（2025年3月27日） | Cloud"
slug: /release-notes-2140
sidebar_label: "2025年3月27日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、PRIVATE PREVIEW の2つの新機能として、BYOC-I という新しい BYOC デプロイメントオプションと、データプレーン監査ログ機能を導入します。前者は、クロスアカウントの IAM 認可をまったく必要とせず、完全なデータ主権を確保するように設計されています。後者は、データプレーンで実行されるアクションの詳細ログを提供することで、データセキュリティの強化を目的としています。これらの機能の提供開始に加え、Zilliz Cloud はクレジット戦略も改定しました。 | Cloud"
type: origin
token: FSUqwEEIii9k2sklkcLcIFJJnbf
sidebar_position: 17
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年3月27日）

このリリースでは、**PRIVATE PREVIEW** の2つの新機能として、BYOC-I という新しい BYOC デプロイメントオプションと、データプレーン監査ログ機能を導入します。前者は、クロスアカウントの IAM 認可をまったく必要とせず、完全なデータ主権を確保するように設計されています。後者は、データプレーンで実行されるアクションの詳細ログを提供することで、データセキュリティの強化を目的としています。これらの機能の提供開始に加え、Zilliz Cloud はクレジット戦略も改定しました。

## Milvus との互換性\{#milvus-compatibility}

このリリースは **Milvus v2.4.x** と互換性があります。

クラスターを **Public Preview** にアップグレードする場合は、アップグレード後に **Milvus 2.5.x** の機能を利用できます。**Public Preview** の機能の詳細については、Zilliz Cloud コンソールの **クラスター Details** ページで **Try Preview Features** をクリックしてください。

![Koy0bfMhuoaJ2ZxtVJfcUSl9n6d](https://zdoc-images.s3.us-west-2.amazonaws.com/koy0bfmhuoaj2zxtvjfcusl9n6d.png "Koy0bfMhuoaJ2ZxtVJfcUSl9n6d")

## BYOC-I：完全なデータ主権と強化されたプロジェクト管理機能を提供する新しいデプロイメントオプション\{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

BYOC-I の追加により、Zilliz BYOC は、標準の **BYOC** と **BYOC-I** の2つのデプロイメントオプションを提供するようになりました。

クロスアカウント認可が必要な標準の BYOC とは異なり、BYOC-I では、顧客管理の VPC にデプロイされたエージェントを、Zilliz の VPC にあるコントロールパネルと顧客管理の VPC にあるデータプレーンとの間の単一の接点として使用します。

Zilliz BYOC は、金融、医療、資源、教育、eコマースなど、厳格なコンプライアンス要件に直面する業界全体でデータガバナンスとコンプライアンスをサポートしています。より厳格な規制措置を必要とする企業や組織にとって、BYOC-I は完全なデータ主権を実現するための理想的なデプロイメントオプションです。

このリリースでは、**Suspend** 機能と **Resume** 機能を追加することで、標準の BYOC デプロイメントオプションを使用してデプロイされたプロジェクトの管理も改善されています。データプレーンを一時停止して、EKS クラスターに関連付けられた EC2 インスタンスを解放し、インフラストラクチャのコストを削減できます。また、任意のタイミングでデータプレーンを復元できます。

このリリースで、Zilliz BYOC が一般提供になりました。価格の確認またはこの機能のリクエストをご希望の場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

Zilliz BYOC デプロイメントオプションの詳細については、[BYOC の概要](/docs/byoc/byoc-intro) を参照してください。デプロイ手順と強化されたプロジェクト管理機能については、[AWS への BYOC のデプロイ](/docs/byoc/deploy-byoc-aws) および [AWS への BYOC-I のデプロイ](/docs/byoc/deploy-byoc-i-aws) を参照してください。

## データプレーン監査ログ：監査向けの包括的なアクションログでデータ操作を保護する\{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

監査ログ記録により、管理者は Zilliz Cloud クラスター上のユーザー主導の操作と API 呼び出しを監視および追跡できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、さまざまなデータ操作など、**データプレーン**のアクティビティの包括的な記録を提供します。また、セキュリティ監査、コンプライアンスレビュー、問題解決のために、データがどのようにアクセスおよび管理されているかについての洞察と可視性を提供します。

この機能を有効にすると、Zilliz Cloud は監査ログを指定したオブジェクトストレージバケットにストリーミングします。その後、Snowflake などのサードパーティのデータウェアハウスサービスを使用して監査分析を行い、クラスターの規制コンプライアンス、データセキュリティ、運用監視を強化できます。

この機能は現在 **PRIVATE PREVIEW** です。価格の確認またはこの機能のリクエストをご希望の場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

クラスターで監査ログを有効にする手順の詳細については、[監査ログ](./audit-logs) を参照してください。Snowflake などのサードパーティのデータウェアハウスサービスを使用して、収集した監査ログからさらに深い洞察を得る方法については、[Automating Snowpipe for Amazon S3](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3) を参照してください。

Zilliz Cloud は、コレクション、データベース、エンティティ（Search、HybridSearch、Insert、Upsert、Delete）、インデックス、パーティション、エイリアスに関連する70種類を超えるアクションとイベントのログ記録をサポートするようになりました。今後リリースされるバージョンには、さらに多くのイベントが含まれる予定です。対象となるアクションとイベントの詳細については、[Audit Log Reference](./audit-logs-ref) を参照してください。

## その他の機能強化\{#other-enhancements}

このリリース以降、Zilliz Cloud はクレジット戦略を調整しました。新しいクレジット戦略の詳細については、[Credits](./credits) を参照してください。
