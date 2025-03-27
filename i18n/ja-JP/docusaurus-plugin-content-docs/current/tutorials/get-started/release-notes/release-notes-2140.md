---
title: "リリースノート（2025年3月27日） | Cloud"
slug: /release-notes-2140
sidebar_label: "リリースノート（2025年3月27日）"
beta: FALSE
notebook: FALSE
description: "このリリースでは、PRIVATE PREVIEWに2つの新機能が導入されました。新しいBYOC展開オプションであるBYOC-Iと、データプレーン監査ログ機能です。前者は、クロスアカウントIAM認可なしで完全なデータ主権を確保するために設計されています。一方、後者は、データプレーンで実行されたアクションの詳細なログを提供することにより、データセキュリティを強化することを目的としています。これらの機能を導入するだけでなく、Zilliz Cloudはクレジット戦略も改訂しました。 | Cloud"
type: origin
token: XxJSwcAMqin6dfkVBIbcVjGLnyg
sidebar_position: 0
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年3月27日）

このリリースでは、**PRIVATE PREVIEW**に2つの新機能が導入されました。新しいBYOC展開オプションであるBYOC-Iと、データプレーン監査ログ機能です。前者は、クロスアカウントIAM認可なしで完全なデータ主権を確保するために設計されています。一方、後者は、データプレーンで実行されたアクションの詳細なログを提供することにより、データセキュリティを強化することを目的としています。これらの機能を導入するだけでなく、Zilliz Cloudはクレジット戦略も改訂しました。

## Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus v 2.4. x**と互換性があります。

クラスターを**パブリックプレビュー**にアップグレードしたい場合は、アップグレード後に**Milvus 2.5. x**の機能を利用できます。

![CyYAbqi1doKYpzxzJNccXm4Ynmf](/img/ja-JP/CyYAbqi1doKYpzxzJNccXm4Ynmf.png)

## BYOC-I:強化されたプロジェクト管理機能を備えた完全なデータ主権を提供する新しいデプロイメントオプション{#byoc-i-a-new-deployment-option-that-provides-complete-data-sovereignty-with-enhanced-project-management-capabilities}

BYOC-Iの追加により、Zilliz BYOCは現在、標準の**BYOC**と**BYOC-I**の2つの展開オプションを提供しています。 

クロスアカウント認証を必要とする標準のBYOCとは異なり、BYOC-Iは、ZillizのVPCのコントロールパネルと顧客管理VPCのデータプレーンの間の単一の接点として、顧客管理VPCに展開されたエージェントを使用します。

Zilliz BYOCは、金融、医療、資源、教育、電子商取引など、厳格なコンプライアンス要件に直面する業界全体でデータガバナンスとコンプライアンスをサポートしています。より厳格な規制措置が必要な企業や組織にとって、BYOC-Iは完全なデータ主権を実現するための理想的な展開オプションです。

このリリースでは、**Suspend**および**Resume**機能を追加することで、標準のBYOC展開オプションを使用して展開されたプロジェクトの管理も改善されています。データプレーンを一時停止し、EKSクラスターに関連付けられたEC 2インスタンスを解放して、インフラストラクチャコストを削減し、必要に応じてデータプレーンを復元することができます。

今回のリリースでは、**Zilliz BYOC**の**一般提供**を開始しました。価格については[お問い合わせください](https://support.zilliz.com/hc/en-us)。また、ご興味のある方はこの機能をリクエストしてください。  

Zilliz BYOCのデプロイオプションの詳細については、「[BYOCの概要](/docs/byoc/byoc-intro)」を参照してください。デプロイ手順と強化されたプロジェクト管理機能については、「[AWSでBYOCをデプロイする](/docs/byoc/deploy-byoc-aws)」と「[AWSでBYOC-Iをデプロイする](/docs/byoc/deploy-byoc-i-aws)」を参照してください。 

## データプレーンの監査ログ:監査のための包括的なアクションログでデータ操作を保護{#data-plane-audit-logs-protect-your-data-operations-with-comprehensive-action-logs-for-auditing}

監査ログにより、管理者はZilliz Cloudクラスター上のユーザー主導の操作やAPI呼び出しを監視および追跡できます。この機能により、ベクトル検索、クエリ実行、インデックス管理、およびさまざまなデータ操作操作などの**Data Plane**アクティビティの包括的な記録が提供されます。また、セキュリティ監査、コンプライアンスレビュー、および問題解決のためにデータがどのようにアクセスおよび管理されているかについての洞察と可視性も提供されます。

この機能を有効にすると、Zilliz Cloudは監査ログを指定されたオブジェクトストレージバケットにストリーミングします。その後、Snowflakeなどのサードパーティのデータウェアハウスサービスを使用して、監査分析を行い、規制遵守、データセキュリティ、データベースの運用モニタリングを強化できます。

この機能は現在**PRIVATE PREVIEW**中です。価格について学ぶか、興味がある場合はこの機能をリクエストしてください。

クラスタで監査ログを有効にする手順の詳細については、「[監査ロギング](./audit-logs)」を参照してください。Snowflakeなどのサードパーティのデータウェアハウスサービスを使用して収集された監査ログについてより深い洞察を得るには、「[Amazon S 3のSnowpipeの自動化](https://docs.snowflake.com/en/user-guide/data-load-snowpipe-auto-s3)」を参照してください。 

Zilliz Cloudは、コレクション、データベース、エンティティ(検索、ハイブリッド検索、挿入、更新、削除)、インデックス、パーティション、エイリアスに関連する70種類以上のアクションとイベントのログをサポートしています。今後のリリースには、より多くのイベントが含まれる予定です。適用可能なアクションとイベントの詳細については、「[監査ログの参照](./audit-logs-ref)」を参照してください。

## その他の機能強化{#other-enhancements}

このリリース以降、Zilliz Cloudはクレジット戦略を調整しました。新しいクレジット戦略の詳細については、「[Zilliz Cloudを無料で試す](./free-trials)」を参照してください。