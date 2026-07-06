---
title: "リリースノート（2022年12月5日） | Cloud"
slug: /release-notes-009
sidebar_key: release-notes-009
sidebar_label: "2022年12月5日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の大幅なアップデートの一般提供を発表いたします。このリリースでは、Zilliz Cloud サービスの新しいコンソール、新しいクラウドリージョンのサポート、およびプライベートリンクによる安全なクラスターアクセスが導入されました。 | Cloud"
type: origin
token: QZXVwFVH3i1p08kal8vcAmmxnie
sidebar_position: 36
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート (2022年12月5日)

Zilliz Cloud の大幅なアップデートの一般提供を発表いたします。本リリースでは、Zilliz Cloud サービスの新しいコンソールの導入、新しいクラウドリージョンのサポート、およびプライベートリンクによる安全なクラスターアクセスが可能になりました。

- Zilliz Cloud サービスの新しい UI

    本リリースにて、Zilliz Cloud の新しい UI を発表いたします。ブランドニューな UI におけるツリーベースのナビゲーション構造により、より直感的なガイダンスを提供します。すべての機能は5つのカテゴリーに整理されています：

    これらすべての機能は、Zilliz Cloud で90日間の無料トライアルとしてご利用いただけます。[今すぐお試しください！](https://cloud.zilliz.com/)

- AWS リージョン **US-East-2** のサポート

    Zilliz Cloud が新しい AWS リージョン **US-East-2** でのサービスデプロイメントをサポートすることを発表いたします。現在サポートされているリージョンは AWS **US-West-2** および **US-East-2** です。

- プライベートリンク

    プライベートリンクは、アプリケーションからデータベースへのプライベート接続を提供します。プライベートリンクソリューションは、Zilliz Cloud サービスへのプライベートでより安全かつ効率的な接続のニーズに応えます。

    プライベートリンクを使用したデータベース接続を設定するには、VPC エンドポイントを Zilliz Cloud に登録してプライベートリンクを作成し、そのリンクをエンドポイントの DNS名 にマッピングする必要があります。

    詳細については、[プライベートリンクの設定](./setup-a-private-link) を参照してください。

- 大容量ファイルからのデータインポート

    Zilliz Cloud が大容量ファイルからのデータインポートをサポートすることを発表いたします。最大512 MBのファイルからコレクションにデータを一括挿入できます。ファイルは S3 バケットまたはローカルディスクに配置できます。

    詳細については、[データインポート](./data-import) を参照してください。