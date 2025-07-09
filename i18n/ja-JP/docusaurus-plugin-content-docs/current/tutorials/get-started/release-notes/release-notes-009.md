---
title: "リリースノート（2022年12月5日） | Cloud"
slug: /release-notes-009
sidebar_label: "リリースノート（2022年12月5日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudの重要なアップデートの一般提供を発表できることを嬉しく思います。このリリースでは、Zilliz Cloudサービス用の新しいコンソールが導入され、新しいクラウドリージョンがサポートされ、プライベートリンクを介して安全なクラスターアクセスが可能になります。 | Cloud"
type: origin
token: QZXVwFVH3i1p08kal8vcAmmxnie
sidebar_position: 25
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


# リリースノート（2022年12月5日）

Zilliz Cloudの重要なアップデートの一般提供を発表できることを嬉しく思います。このリリースでは、Zilliz Cloudサービス用の新しいコンソールが導入され、新しいクラウドリージョンがサポートされ、プライベートリンクを介して安全なクラスターアクセスが可能になります。

- Zilliz Cloudサービスの新しいUI

    今回のリリースでは、Zilliz Cloudの新しいUIをご紹介できることを嬉しく思います。新しいUIのツリーベースのナビゲーション構造により、より直感的なガイダンスを提供します。すべての機能は5つのカテゴリに分類されています。

    Zilliz Cloudでは、これらの機能を90日間の無料トライアルでご利用いただけます。[今すぐ試す!](https://cloud.zilliz.com/)

- AWSリージョン**US-East-2**に対応しています。

    私たちは、Zilliz Cloudが新しいAWSリージョン**US-East-2**でサービス展開をサポートすることを発表できることを喜んでいます。現在、サポートされているリージョンはAWS**US-West-2**と**US-East-2**です。

- プライベートリンク

    プライベートリンクは、アプリケーションからデータベースへのプライベート接続を提供します。プライベートリンクソリューションは、Zilliz Cloudサービスへのプライベートでより安全かつ効率的な接続のニーズに応えます。

    プライベートリンクを使用してデータベース接続を設定するには、Zilliz CloudにVPCエンドポイントを登録してプライベートリンクを作成し、そのリンクをエンドポイントのDNS名にマッピングする必要があります。 

    詳細については、[プライベートリンクを設定する](./setup-a-private-link)を参照してください。

- 大きなファイルからのデータインポート

    Zilliz Cloudが大きなファイルからのデータインポートをサポートすることをお知らせいたします。最大512 MBのファイルからデータを一括でコレクションに挿入できます。ファイルはS 3バケットまたはローカルディスクに配置できます。

    詳細については、[データインポート](./data-import)を参照してください。