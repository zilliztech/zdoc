---
title: "リリースノート（2025 年 3 月 27 日） | Cloud"
slug: /release-notes-2140
sidebar_key: release-notes-2140
sidebar_label: "2025 年 3 月 27 日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、プライベートプレビューとして 2 つの新機能、BYOC-I と呼ばれる新しい BYOC デプロイメントオプションとデータプレーン監査ログ機能を導入しました。前者はクロスアカウント IAM 認証を一切必要とせずに完全なデータ主権を確保するように設計されており、後者はデータプレーン上で実行されたアクションの詳細なログを提供することでデータセキュリティを強化することを目的としています。これらの機能のローンチに加えて、Zilliz Cloud はクレジット戦略も改訂しました。 | Cloud"
type: origin
token: FSUqwEEIii9k2sklkcLcIFJJnbf
sidebar_position: 12
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年3月27日）

今回のリリースでは、**PRIVATE PREVIEW**として2つの新機能を導入しました。1つはBYOC-Iと呼ばれる新しいBYOCデプロイメントオプション、もう1つはデータプレーンの監査ログ機能です。前者はクロスアカウントIAM認可を一切使用せずに完全なデータ主権を確保することを目的としており、後者はデータプレーン上で実行された操作の詳細なログを提供することでデータセキュリティを強化することを目的としています。これらの新機能のリリースに加え、Zilliz Cloudはクレジット戦略も見直しました。

## Milvus Compatibility\{#milvus-compatibility}

このリリースは **Milvus v2.4.x** と互換性があります。

クラスターを **パブリックプレビュー** にアップグレードしたい場合は、アップグレード後に **Milvus 2.5.x** の機能を利用できます。Zilliz Cloudコンソールの **クラスターの詳細** ページで **プレビュー機能を試す** をクリックすると、**パブリックプレビュー** の機能についてさらに詳しく確認できます。

![Koy0bfMhuoaJ2ZxtVJfcUSl9n6d](https://zdoc-images.s3.us-west-2.amazonaws.com/koy0bfmhuoaj2zxtvjfcusl9n6d.png "Koy0bfMhuoaJ2ZxtVJfcUSl9n6d")

## BYOC-I: 完全なデータ主権と強化されたプロジェクト管理機能を提供する新しいデプロイメントオプション\{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

BYOC-Iが追加されたことで、Zilliz BYOCには標準の **BYOC** と **BYOC-I** の2つのデプロイメントオプションが用意されるようになりました。

標準BYOCがクロスアカウント認可を必要とするのに対し、BYOC-Iは顧客が管理するVPC内にエージェントをデプロイし、ZillizのVPC内のコントロールパネルと顧客が管理するVPC内のデータプレーンとの間の単一接点として機能します。

Zilliz BYOCは、金融、医療、資源、教育、eコマースなど、厳しいコンプライアンス要件を課される業界におけるデータガバナンスおよびコンプライアンスをサポートします。より厳格な規制対応を求める企業や組織にとって、BYOC-Iは完全なデータ主権を実現する理想的なデプロイメントオプションです。

今回のリリースでは、標準BYOCデプロイメントオプションを使用してデプロイされたプロジェクトの管理機能も改善され、**一時停止**（一時停止）および **Resume**（再開）機能が追加されました。データプレーンを一時停止し、EKSクラスターに関連付けられたEC2インスタンスを解放することでインフラストラクチャコストを削減し、必要なタイミングでデータプレーンを復元できます。

今回のリリースにより、Zilliz BYOCは一般提供（GA）となりました。価格に関する詳細や機能のご利用をご希望の場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

Zilliz BYOCデプロイメントオプションの詳細については、[BYOC Overview](/docs/byoc/byoc-intro) を参照してください。デプロイ手順および強化されたプロジェクト管理機能については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) および [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws) を参照してください。

## データプレーン 監査ログ: 監査用の包括的なアクションログでデータ運用を保護\{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

監査ログ機能により、管理者はZilliz Cloudクラスター上でユーザーが実行した操作やAPI呼び出しを監視・追跡できます。この機能は、ベクトル検索、クエリ実行、インデックス管理、さまざまなデータ操作など、**データプレーン** の活動に関する包括的な記録を提供します。これにより、セキュリティ監査、コンプライアンスレビュー、問題解決のためにデータがどのようにアクセス・管理されているかを把握できます。

この機能を有効化すると、Zilliz Cloudは監査ログを指定されたオブジェクトストレージバケットにストリーミングします。その後、Snowflakeなどのサードパーティデータウェアハウスサービスを使用して監査分析を行い、クラスターにおける規制コンプライアンス、データセキュリティ、運用監視を強化できます。

この機能は現在 **PRIVATE PREVIEW** です。価格に関する詳細や機能のご利用をご希望の場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

クラスターで監査ログを有効化する手順の詳細については、[監査ログging](./audit-logs) を参照してください。Snowflakeなどのサードパーティデータウェアハウスサービスを使用して収集された監査ログをさらに深く分析する方法については、[Automating Snowpipe for Amazon S3](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3) を参照してください。

Zilliz Cloudは現在、コレクション、データベース、エンティティ（Search、HybridSearch、Insert、Upsert、Delete）、インデックス、パーティション、エイリアスに関連する70種類以上のアクションおよびイベントのログをサポートしています。今後のリリースではさらに多くのイベントが追加される予定です。適用可能なアクションおよびイベントの詳細については、[監査ログ Reference](./audit-logs-ref) を参照してください。

## その他の機能強化\{#other-enhancements}

今回のリリースから、Zilliz Cloudはクレジット戦略を調整しました。新しいクレジット戦略の詳細については、[Try Zilliz Cloud For Free](./free-trials) を参照してください。

