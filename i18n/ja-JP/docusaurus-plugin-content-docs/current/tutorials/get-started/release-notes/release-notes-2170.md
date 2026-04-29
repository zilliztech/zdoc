---
title: "リリースノート（2025 年 6 月 9 日） | Cloud"
slug: /release-notes-2170
sidebar_key: release-notes-2170
sidebar_label: "2025 年 6 月 9 日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud の複数の機能において、より洗練された直感的なユーザーエクスペリエンスを実現しました。再設計された移行コンソールから、ポリシーベースのアラート機能、改善された mmap 制御まで、ワークフローをより高速で柔軟かつ管理しやすくすることに注力しました。新しい AI アシスタント機能や GCP における BYOC のサポートにより、インフラストラクチャの管理、環境の監視、サポートの要否にかかわらず、プラットフォームの能力と使いやすさがさらに拡張されました。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 10
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年6月9日）

今回のリリースでは、Zilliz Cloudの複数の機能において、より洗練され直感的なユーザーエクスペリエンスを提供します。移行コンソールの刷新からポリシーに基づくアラート、mmap制御の強化まで、ワークフローをより迅速かつ柔軟に、そして管理しやすくすることに注力しました。新たなAIアシスタント機能やGCP上でのBYOCサポートにより、インフラストラクチャの管理、環境の監視、サポートの利用など、あらゆるシーンでプラットフォームのパワーと使いやすさがさらに拡張されています。

## Milvus 互換性\{#milvus-compatibility}

本リリース以降に作成されたすべてのZilliz Cloudクラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **一般提供** されています。

## 移行体験を向上させるための洗練されたユーザーインターフェースとベストプラクティスドキュメント\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **新しいコンソールUI：** クリーンで直感的なGUIにより、データソースを素早く特定し、適切な移行方法を選択できます。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](https://zdoc-images.s3.us-west-2.amazonaws.com/m3k4bsnieoqbkexpdapcd6j7nvb.png "M3K4bSnIeoqBKExPdaPcd6j7nVb")

    Zilliz Cloudは、Zilliz Cloudクラスター間、Milvusインスタンス、および複数の外部ソースからの移行をサポートしています。利用可能なデータソースの詳細については、[移行](./migrations) を参照してください。

- **高度なコレクションおよび設定ツール：** 改善されたデータ型サポート、dynamicフィールドからfixedフィールドへの変換機能、フィールドおよびシャード設定を直感的に操作できるコントロールにより、複雑なコレクションやフィールドマッピングも自信を持って処理できます。これらすべてが、レスポンシブでユーザーフレンドリーなインターフェース内で実現されています。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](https://zdoc-images.s3.us-west-2.amazonaws.com/o3aebuicjonyfsxlrbucdp5snob.png "O3AebUiCjonYFSxLrbucDp5SnOb")

    外部ソースからの移行に関する一般的な手順については、[External Migration 基本](./external-migration-basics) を参照してください。また、特定の外部ソース（[Pinecone](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[Tencent Cloud](./migrate-from-tencent-cloud)、[OpenSearch](./migrate-from-opensearch)）における要件や一般的な問題対応ルールについても学べます。

## より細かく柔軟な監視を実現するポリシーに基づくアラート\{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムのアップグレードにより、より細かく柔軟な監視が可能な **アラートポリシー**（アラートポリシー）が導入されました。

- **ポリシーに基づくアラート：** 特定のクラスターを対象に、精密な監視が可能になりました。

- **ポリシーのクローン：** 既存のポリシーをワンクリックで複製し、設定時間を短縮できます。

- **OpenAPIサポート：** プログラムによるアクセスでアラート管理を自動化できます。

- **シームレスな移行：** すべての従来のアラートは、中断なく新しいフレームワークに移行されています。

ポリシーに基づくアラートの詳細については、[Manage プロジェクトアラート](./manage-project-alerts) およびRESTful APIリファレンスページ（[アラートルールの作成](/reference/restful/create-alert-rule-v2)、[更新](/reference/restful/update-alert-rule-v2)、[一覧表示](/reference/restful/list-alert-rules-v2)、[削除](/reference/restful/delete-alert-rule-v2)）をご参照ください。

## mmap設定に対するUIサポート\{#ui-support-for-mmap-settings}

Zilliz Cloudは、CUタイプおよびプランに基づき[クラスターレベルのデフォルト設定](./use-mmap#global-mmap-strategy)に従います。本リリースより、**mmap設定**をグラフィカルユーザーインターフェース（GUI）から直接、コレクションレベルおよびフィールドレベルで管理できるようになりました。

- **コレクションレベルの設定：** 必要に応じて、生データに対してmmap設定を簡単に適用できます。

- **フィールドレベルの制御：** 特定のフィールドの生データおよびインデックスデータに対して、mmap設定を有効化、無効化、または削除できます。

![JspDbBt12o4ra2x353ycjG1Mn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/jspdbbt12o4ra2x353ycjg1mn7b.png "JspDbBt12o4ra2x353ycjG1Mn7b")

## BYOCがGCPで利用可能に\{#byoc-now-available-on-gcp}

Zilliz Cloudの **Bring Your Own Cloud (BYOC)** が **Google Cloud Platform (GCP)** をサポートしました。

- **データプレーンのデプロイ：** 自身のGCP環境でZilliz Cloud データプレーンを実行し、データとセキュリティを完全にコントロールできます。

- **柔軟なセットアップオプション：** Terraformプロバイダーを使用してIaCによる自動化を行うか、ネットワーキング、認証ルール、プロジェクトの設定手順に沿って手動で構成できます。

詳細については、手動ガイド用の [Deploy BYOC on GCP](/docs/byoc/deploy-byoc-gcp) およびIaC自動化用の [Terraform Provider](/docs/byoc/terraform-provider) を参照してください。

## 洗練されたAIアシスタンスでZillizサポートへ直接つながる\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

今回のリリースでは、Zilliz Cloud AIアシスタンスのビジュアルデザインを強化し、より直感的で快適なユーザーエクスペリエンスを実現するとともに、以下の2つの新しいスマート機能を導入しました。

- **サポートへのエスカレーション：** ユーザーが人的サポートを求めるリクエストを自動検出し、迅速に適切な担当者へルーティングします。

- **営業シグナルの検出：** 購入意図や営業関連のヒントを識別し、タイムリーなフォローアップを可能にします。

![OQTSbop2WoTH2px3o5tcbDmmnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/oqtsbop2woth2px3o5tcbdmmnyf.png "OQTSbop2WoTH2px3o5tcbDmmnYf")

## その他の改善点\{#other-improvements}

- アラート設定およびアラート履歴の表示を改善。
- **招待登録**および**パスワード回復**のワークフローを合理化。

