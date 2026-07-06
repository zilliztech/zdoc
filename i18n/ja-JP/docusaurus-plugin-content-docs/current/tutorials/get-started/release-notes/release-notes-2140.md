---
title: "リリースノート（2025年3月27日） | Cloud"
slug: /release-notes-2140
sidebar_key: release-notes-2140
sidebar_label: "2025年3月27日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、PRIVATE PREVIEW で2つの新機能が導入されました。1つは BYOC-I と呼ばれる新しい BYOC デプロイメントオプションで、クロスアカウントの IAM 認可なしに完全なデータ主権を確保するように設計されています。もう1つはデータプレーン監査ログ機能で、データプレーンで実行されたアクションの詳細なログを提供することでデータセキュリティを強化することを目的としています。これらの機能のローンチに加えて、Zilliz Cloud はクレジット戦略も見直しました。 | Cloud"
type: origin
token: FSUqwEEIii9k2sklkcLcIFJJnbf
sidebar_position: 14
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年3月27日）

このリリースでは、**PRIVATE PREVIEW** で2つの新機能が導入されています。新しいBYOCデプロイメントオプションであるBYOC-Iと、データプレーンの監査ログ機能です。前者はクロスアカウントIAM認可なしで完全なデータ主権を確保するために設計されており、後者はデータプレーン上で実行されたアクションの詳細なログを提供することでデータセキュリティを強化することを目的としています。これらの機能のローンチに加えて、Zilliz Cloud はクレジット戦略も見直しました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus v2.4.x** と互換性があります。

クラスターを **パブリックプレビュー** にアップグレードする場合は、アップグレード後に **Milvus 2.5.x** の機能が利用可能になります。Zilliz Cloud コンソールの **クラスターの詳細** ページで **プレビュー機能を試す** をクリックすると、**パブリックプレビュー** の機能の詳細を確認できます。

![Koy0bfMhuoaJ2ZxtVJfcUSl9n6d](https://zdoc-images.s3.us-west-2.amazonaws.com/koy0bfmhuoaj2zxtvjfcusl9n6d.png "Koy0bfMhuoaJ2ZxtVJfcUSl9n6d")

## BYOC-I: 完全なデータ主権と強化されたプロジェクト管理機能を提供する新しいデプロイメントオプション\{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

BYOC-I の追加により、Zilliz BYOC は標準の **BYOC** と **BYOC-I** という2つのデプロイメントオプションを提供するようになりました。

クロスアカウント認可を必要とする標準のBYOCとは異なり、BYOC-I は、顧客管理のVPCにデプロイされたエージェントを、ZillizのVPC内のコントロールパネルと顧客管理のVPC内のデータプレーン間の単一の接続点として使用します。

Zilliz BYOC は、金融、医療、資源、教育、eコマースなど、厳格なコンプライアンス要件に直面する業界全体でデータガバナンスとコンプライアンスをサポートします。より厳格な規制措置を必要とする企業や組織にとって、BYOC-I は完全なデータ主権を達成するための理想的なデプロイメントオプションです。

このリリースでは、標準のBYOCデプロイメントオプションを使用してデプロイされたプロジェクトの管理も強化され、**一時停止** と **再開** の機能が追加されました。データプレーンを一時停止し、EKSクラスターに関連付けられたEC2インスタンスを解放してインフラコストを削減し、必要に応じてデータプレーンを復元することができます。

このリリースで、Zilliz BYOC は一般提供（GA）となりました。価格についての詳細や、この機能のリクエストについては [お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

Zilliz BYOC デプロイメントオプションの詳細については、[BYOC 概要](/docs/byoc/byoc-intro) を参照してください。デプロイ手順と強化されたプロジェクト管理機能については、[AWS 上に BYOC をデプロイ](/docs/byoc/deploy-byoc-aws) および [AWS 上に BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-aws) を参照してください。

## データプレーン監査ログ: 包括的なアクションログでデータ運用を保護し監査を実施\{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

監査ログにより、管理者はZilliz Cloud クラスター上のユーザー主導の操作やAPIコールを監視および追跡できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、およびさまざまなデータ操作などの **データプレーン** アクティビティの包括的な記録を提供します。また、セキュリティ監査、コンプライアンスレビュー、および問題解決のために、データへのアクセスおよび管理方法についての洞察と可視性も提供します。

この機能を有効にすると、Zilliz Cloud は監査ログを指定されたオブジェクトストレージバケットにストリーミングします。その後、Snowflakeなどのサードパーティのデータウェアハウスサービスを使用して監査分析を行うことができ、クラスターの規制コンプライアンス、データセキュリティ、および運用監視を強化できます。

この機能は現在 **PRIVATE PREVIEW** です。価格についての詳細や、この機能のリクエストについては [お問い合わせ](https://support.zilliz.com/hc/en-us) ください。

クラスターで監査ログを有効にする手順の詳細については、[監査ログ](./audit-logs) を参照してください。Snowflakeなどのサードパーティのデータウェアハウスサービスを使用して収集された監査ログをより深く分析するには、[Amazon S3 用の Snowpipe の自動化](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3) を参照してください。

Zilliz Cloud は現在、コレクション、データベース、エンティティ（Search、HybridSearch、Insert、Upsert、Delete）、インデックス、パーティション、およびエイリアスに関連する70種類以上のアクションおよびイベントのログ記録をサポートしています。将来のリリースではさらに多くのイベントが含まれる予定です。適用可能なアクションおよびイベントの詳細については、[監査ログリファレンス](./audit-logs-ref) を参照してください。

## その他の機能強化\{#other-enhancements}

このリリース以降、Zilliz Cloud はクレジット戦略を調整しました。新しいクレジット戦略の詳細については、[Zilliz Cloud を無料で試す](./free-trials) を参照してください。

