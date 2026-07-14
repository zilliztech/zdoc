---
title: "リリースノート（2025年3月27日） | Cloud"
slug: /release-notes-2140
sidebar_label: "2025年3月27日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリリースでは、PRIVATE PREVIEW の2つの新機能として、BYOC-I と呼ばれる新しい BYOC デプロイオプションと、データプレーン監査ログ機能が導入されます。前者はクロスアカウント IAM 認可なしで完全なデータ主権を確保するよう設計されており、後者はデータプレーン上で実行されたアクションの詳細なログを提供することでデータセキュリティの強化を目的としています。これらの機能の提供開始に加えて、Zilliz Cloud はクレジット戦略も改定しました。 | Cloud"
type: origin
token: FSUqwEEIii9k2sklkcLcIFJJnbf
sidebar_position: 15
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年3月27日）

このリリースでは、**PRIVATE PREVIEW** の2つの新機能として、BYOC-I と呼ばれる新しい BYOC デプロイオプションと、データプレーン監査ログ機能が導入されます。前者はクロスアカウント IAM 認可なしで完全なデータ主権を確保するよう設計されており、後者はデータプレーン上で実行されたアクションの詳細なログを提供することでデータセキュリティの強化を目的としています。これらの機能の提供開始に加えて、Zilliz Cloud はクレジット戦略も改定しました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus v2.4.x** と互換性があります。

クラスターを **Public Preview** にアップグレードしたい場合は、アップグレード後に **Milvus 2.5.x** の機能を利用できます。詳細については、Zilliz Cloud コンソールの **Cluster Details** ページで **Try Preview Features** をクリックすると、**Public Preview** の機能を確認できます。

![Koy0bfMhuoaJ2ZxtVJfcUSl9n6d](https://zdoc-images.s3.us-west-2.amazonaws.com/koy0bfmhuoaj2zxtvjfcusl9n6d.png "Koy0bfMhuoaJ2ZxtVJfcUSl9n6d")

## BYOC-I：強化されたプロジェクト管理機能により完全なデータ主権を実現する新しいデプロイオプション\{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

BYOC-I の追加により、Zilliz BYOC は現在、標準の **BYOC** と **BYOC-I** という2つのデプロイオプションを提供しています。 

クロスアカウント認可を必要とする標準 BYOC とは異なり、BYOC-I では、Zilliz の VPC 内のコントロールパネルと、顧客管理 VPC 内のデータプレーンとの間の単一の接点として、顧客管理 VPC にデプロイされたエージェントを使用します。

Zilliz BYOC は、金融、医療、資源、教育、e コマースなど、厳格なコンプライアンス要件に直面する業界全体で、データガバナンスとコンプライアンスをサポートします。より厳格な規制措置を必要とする企業や組織にとって、BYOC-I は完全なデータ主権を実現するための理想的なデプロイオプションです。

このリリースでは、標準 BYOC デプロイオプションを使用してデプロイされたプロジェクトの管理も改善され、**Suspend** および **Resume** 機能が追加されました。データプレーンを一時停止し、EKS クラスターに関連付けられた EC2 インスタンスを解放してインフラコストを削減し、必要に応じていつでもデータプレーンを復元できます。

このリリースで、Zilliz BYOC は一般提供となりました。価格について知りたい場合、またはこの機能をリクエストしたい場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。 

Zilliz BYOC のデプロイオプションの詳細については、[BYOC Overview](/docs/byoc/byoc-intro) を参照してください。デプロイ手順と強化されたプロジェクト管理機能については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) および [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws) を参照してください。 

## データプレーン監査ログ：監査のための包括的なアクションログでデータ運用を保護\{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

監査ログにより、管理者は Zilliz Cloud クラスター上のユーザー主導の操作や API 呼び出しを監視および追跡できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、さまざまなデータ操作など、**Data Plane** のアクティビティの包括的な記録を提供します。また、セキュリティ監査、コンプライアンスレビュー、問題解決のために、データへのアクセス方法や管理方法に関する洞察と可視性も提供します。

この機能を有効にすると、Zilliz Cloud は監査ログを指定したオブジェクトストレージバケットにストリーミングします。その後、Snowflake のようなサードパーティのデータウェアハウスサービスを監査分析に使用でき、クラスターにおける規制コンプライアンス、データセキュリティ、運用監視を強化できます。

この機能は現在 **PRIVATE PREVIEW** です。価格について知りたい場合、またはこの機能をリクエストしたい場合は、[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

クラスターで監査ログを有効にする手順の詳細については、[Audit Logging](./audit-logs) を参照してください。Snowflake などのサードパーティのデータウェアハウスサービスを使用して収集された監査ログへの理解をさらに深めるには、[Automating Snowpipe for Amazon S3](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3) を参照してください。 

Zilliz Cloud は現在、Collections、Databases、Entities（Search、HybridSearch、Insert、Upsert、Delete）、Indexes、Partitions、Aliases に関連する70種類を超えるアクションおよびイベントのログ取得をサポートしています。今後のリリースでは、さらに多くのイベントが追加される予定です。適用可能なアクションおよびイベントの詳細については、[Audit Log Reference](./audit-logs-ref) を参照してください。

## その他の機能強化\{#other-enhancements}

このリリース以降、Zilliz Cloud はクレジット戦略を調整しました。新しいクレジット戦略の詳細については、[Try Zilliz Cloud For Free](./free-trials) を参照してください。

