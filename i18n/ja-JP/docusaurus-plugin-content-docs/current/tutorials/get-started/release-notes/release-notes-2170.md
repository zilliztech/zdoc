---
title: "リリースノート（2025年6月9日） | Cloud"
slug: /release-notes-2170
sidebar_key: release-notes-2170
sidebar_label: "2025年6月9日"
beta: FALSE
notebook: FALSE
description: "このリリースでは、Zilliz Cloud の複数の機能において、より洗練され直感的なユーザー体験を提供します。再設計された移行コンソール、ポリシーベースのアラート、改善された mmap コントロールなど、ワークフローをより高速で柔軟かつ管理しやすくすることに焦点を当てています。新しい AI アシスタント機能と GCP 上の BYOC サポートにより、インフラストラクチャの管理、環境の監視、サポートの取得など、あらゆる場面でプラットフォームの機能性と使いやすさがさらに拡張されます。 | Cloud"
type: origin
token: DF8HwUTD6iScNQkVzs8cZTr8n8b
sidebar_position: 12
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年6月9日）

このリリースでは、Zilliz Cloud の複数の機能において、より洗練され直感的なユーザー体験を提供します。再設計された移行コンソールから、ポリシーベースのアラート、改善された mmap コントロールまで、ワークフローをより高速で柔軟かつ管理しやすくすることに焦点を当てています。新しい AI アシスタント機能と GCP 上の BYOC サポートにより、インフラストラクチャの管理、環境の監視、サポートの取得など、あらゆる場面でプラットフォームの機能と使いやすさがさらに拡張されます。

## Milvus 互換性\{#milvus-compatibility}

このリリース以降に作成されたすべての Zilliz Cloud クラスターは **Milvus v2.5.x** と互換性があり、Milvus v2.5.x のすべての機能が **一般提供** となります。

## 洗練されたユーザーインターフェースとベストプラクティスドキュメントによる移行体験の改善\{#refined-user-interface-and-best-practice-docs-improving-the-migration-experience}

- **新しいコンソールユーザーインターフェース:** クリーンで直感的な GUI で、データソースを素早く特定し、適切な移行方法を選択できます。

    ![M3K4bSnIeoqBKExPdaPcd6j7nVb](https://zdoc-images.s3.us-west-2.amazonaws.com/m3k4bsnieoqbkexpdapcd6j7nvb.png "M3K4bSnIeoqBKExPdaPcd6j7nVb")

    Zilliz Cloud は、Zilliz Cloud クラスター間、Milvus インスタンスから、および複数の外部ソースからの移行をサポートしています。可能なデータソースの詳細については、[移行](./migrations) を参照してください。

- **高度なコレクションおよび設定ツール:** 改善されたデータ型サポート、動的フィールドから固定フィールドへの変換、およびフィールドとシャードの設定を直感的にコントロールできる機能により、複雑なコレクションおよびフィールドマッピングを確実に処理できます — すべてレスポンシブでユーザーフレンドリーなインターフェース内で実現します。

    ![O3AebUiCjonYFSxLrbucDp5SnOb](https://zdoc-images.s3.us-west-2.amazonaws.com/o3aebuicjonyfsxlrbucdp5snob.png "O3AebUiCjonYFSxLrbucDp5SnOb")

    外部ソースからの移行の一般的な手順については、[外部移行の基本](./external-migration-basics) を参照し、特定の外部ソースの要件と一般的な問題処理ルールについては、[Pinecone](./migrate-from-pinecone)、[Qdrant](./migrate-from-qdrant)、[Elasticsearch](./migrate-from-elasticsearch)、[PostgreSQL](./migrate-from-pgvector)、[Tencent Cloud](./migrate-from-tencent-cloud)、および [OpenSearch](./migrate-from-opensearch) を参照してください。

## きめ細かく柔軟な監視のためのポリシーベースアラート\{#policy-based-alerts-for-granular-and-flexible-monitoring}

このアラートシステムのアップグレードにより、よりきめ細かく柔軟な監視を実現する **アラートポリシー** が導入されました。

- **ポリシーベースアラート:** 特定のクラスターを対象にした精度の高い監視が可能になりました。

- **ポリシーのクローン:** 既存のポリシーをワンクリックで複製し、時間を節約できます。

- **OpenAPI サポート:** プログラマティックなアクセスによりアラート管理を自動化できます。

- **シームレスな移行:** すべての従来のアラートが中断なく新しいフレームワークに移行されました。

ポリシーベースアラートの詳細については、[プロジェクトアラートの管理](./manage-project-alerts) および RESTful API リファレンスページの [作成](/reference/restful/create-alert-rule-v2)、[更新](/reference/restful/update-alert-rule-v2)、[一覧表示](/reference/restful/list-alert-rules-v2)、および [削除](/reference/restful/delete-alert-rule-v2) を参照してください。

## mmap 設定の UI サポート\{#ui-support-for-mmap-settings}

Zilliz Cloud は、CU タイプとプランに基づく [クラスターレベルのデフォルト](./use-mmap#global-mmap-strategy) に従います。このリリース以降、コレクションレベルおよびフィールドレベルでグラフィカルユーザーインターフェース（GUI）から **mmap 設定** を直接管理できます。

- **コレクションレベルの設定:** 必要に応じて、mmap 設定を生データに簡単に適用できます。

- **フィールドレベルのコントロール:** 特定のフィールドの生データおよびインデックスデータに対して、mmap 設定の有効化、無効化、または削除が可能です。

![JspDbBt12o4ra2x353ycjG1Mn7b](https://zdoc-images.s3.us-west-2.amazonaws.com/jspdbbt12o4ra2x353ycjg1mn7b.png "JspDbBt12o4ra2x353ycjG1Mn7b")

## GCP での BYOC 利用開始\{#byoc-now-available-on-gcp}

Zilliz Cloud **Bring Your Own Cloud (BYOC)** が **Google Cloud Platform (GCP)** をサポートするようになりました。

- **データプレーンのデプロイメント:** 独自の GCP 環境で Zilliz Cloud データプレーンを実行し、データとセキュリティを完全にコントロールできます。

- **柔軟なセットアップオプション:** IaC 自動化には Terraform プロバイダーを使用するか、ネットワーク、認証ルール、およびプロジェクトの設定についてステップバイステップのマニュアルガイドに従うことができます。

詳細については、マニュアルガイドは [GCP への BYOC デプロイ](/docs/byoc/deploy-byoc-gcp)、IaC 自動化は [Terraform Provider](/docs/byoc/terraform-provider) を参照してください。

## 洗練された AI アシスタンスにより Zilliz サポートへの直接接続が可能に\{#well-designed-ai-assistance-connects-you-directly-to-zilliz-supports}

このリリースでは、Zilliz Cloud AI アシスタンスのビジュアルデザインを強化し、より直感的で快適なユーザー体験を実現するとともに、2 つの新しいスマート機能を導入しました：

- **サポートへのエスカレーション:** 人間によるサポートのリクエストを自動的に検出し、迅速にルーティングします。

- **セールスシグナルの検出:** 購入意向やセールス関連の手がかりを特定し、タイムリーなフォローアップを可能にします。

![OQTSbop2WoTH2px3o5tcbDmmnYf](https://zdoc-images.s3.us-west-2.amazonaws.com/oqtsbop2woth2px3o5tcbdmmnyf.png "OQTSbop2WoTH2px3o5tcbDmmnYf")

## その他の改善\{#other-improvements}

- アラート設定およびアラート履歴の表示を改善しました。

- **招待登録** および **パスワード回復** のワークフローを効率化しました。

