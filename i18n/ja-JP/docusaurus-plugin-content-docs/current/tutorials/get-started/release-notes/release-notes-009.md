---
title: "リリースノート (2022年12月5日) | Cloud"
slug: /release-notes-009
sidebar_label: "リリースノート (2022年12月5日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudの重要なアップデートの一般提供を発表できることを嬉しく思います。このリリースでは、Zilliz Cloudサービスの新しいコンソールを導入し、新しいクラウドリージョンをサポートし、プライベートリンクを通じた安全なクラスターアクセスを可能にします。 | Cloud"
type: origin
token: QZXVwFVH3i1p08kal8vcAmmxnie
sidebar_position: 29
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search

---

import Admonition from '@theme/Admonition';


# リリースノート (2022年12月5日)

Zilliz Cloudの重要なアップデートの一般提供を発表できることを嬉しく思います。このリリースでは、Zilliz Cloudサービスの新しいコンソールを導入し、新しいクラウドリージョンをサポートし、プライベートリンクを通じた安全なクラスターアクセスを可能にします。

- Zilliz Cloudサービスの新しいUI

    このリリースに伴い、Zilliz Cloudの新しいUIをご紹介できることを嬉しく思います。ブランド新UIのツリーベースのナビゲーション構造は、はるかに直感的なガイダンスを提供します。すべての機能は5つのカテゴリに整理されています：

    これらのすべての機能は現在、Zilliz Cloudで90日間の無料トライアルとして利用可能です。[いますぐ試してみましょう！](https://cloud.zilliz.com/)

- AWSリージョン **US-East-2** をサポート

    Zilliz Cloudが新しいAWSリージョン**US-East-2**でのサービスデプロイメントをサポートすることを発表できることを嬉しく思います。現在、サポートされているリージョンはAWS **US-West-2** および **US-East-2** です。

- プライベートリンク

    プライベートリンクは、アプリケーションからデータベースへのプライベート接続を提供します。プライベートリンクソリューションは、Zilliz Cloudサービスへのプライベートで、より安全で、より効率的な接続のニーズに対応します。

    プライベートリンクでデータベース接続を設定するには、VPCエンドポイントをZilliz Cloudに登録してプライベートリンクを作成し、エンドポイントのDNS名にリンクをマッピングする必要があります。

    詳細については、[プライベートリンクの設定](./setup-a-private-link)を参照してください。

- 大きなファイルからのデータインポート

    Zilliz Cloudが大きなファイルからのデータインポートをサポートすることを発表できることを嬉しく思います。最大512MBのファイルからコレクションにデータを一括挿入できます。ファイルはS3バケットまたはローカルディスクに配置できます。

    詳細については、[データインポート](./data-import)を参照してください。