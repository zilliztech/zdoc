---
title: "リリースノート（2022年12月5日） | Cloud"
slug: /release-notes-009
sidebar_label: "2022年12月5日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の大規模アップデートの一般提供開始をお知らせします。このリリースでは、Zilliz Cloud サービス向けの新しいコンソールが導入され、新しいクラウドリージョンがサポートされ、プライベートリンクによる安全なクラスターアクセスが可能になりました。 | Cloud"
type: origin
token: QZXVwFVH3i1p08kal8vcAmmxnie
sidebar_position: 38
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2022年12月5日）

Zilliz Cloud の大規模アップデートの一般提供開始をお知らせします。このリリースでは、Zilliz Cloud サービス向けの新しいコンソールが導入され、新しいクラウドリージョンがサポートされ、プライベートリンクによる安全なクラスターアクセスが可能になりました。

- Zilliz Cloud サービス向けの新しい UI

    このリリースでは、Zilliz Cloud の新しい UI を導入できることを嬉しく思います。まったく新しい UI のツリーベースのナビゲーション構造により、より直感的なガイダンスが得られます。すべての機能は 5 つのカテゴリに整理されています。

    これらの機能はすべて、現在 Zilliz Cloud の 90 日間無料トライアルで利用できます。[今すぐ試す！](https://cloud.zilliz.com/)

- AWS リージョン **US-East-2** をサポート

    Zilliz Cloud が新しい AWS リージョン **US-East-2** でのサービスデプロイをサポートするようになったことをお知らせします。現在、サポートされているリージョンは AWS **US-West-2** と **US-East-2** です。

- プライベートリンク

    プライベートリンクは、アプリケーションからデータベースへのプライベート接続を提供します。プライベートリンクソリューションは、Zilliz Cloud サービスへのプライベートで、より安全かつ効率的な接続のニーズに対応します。

    プライベートリンクを使用してデータベース接続を設定するには、VPC エンドポイントを Zilliz Cloud に登録してプライベートリンクを作成し、そのリンクをエンドポイントの DNS 名にマッピングする必要があります。

    詳細については、[PrivateLink (AWS) を設定する](./setup-a-private-link-aws) を参照してください。

- 大容量ファイルからのデータインポート

    Zilliz Cloud が大容量ファイルからのデータインポートをサポートするようになったことをお知らせします。最大 512 MB のファイルからコレクションにデータを一括挿入できます。ファイルは S3 バケットまたはローカルディスクのいずれかに配置できます。

    詳細については、[データインポート ハンズオン](./data-import-zero-to-hero) を参照してください。
