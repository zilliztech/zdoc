---
title: "リリースノート（2023 年 12 月 11 日） | Cloud"
slug: /release-notes-240
sidebar_key: release-notes-240
sidebar_label: "2023 年 12 月 11 日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud サービスが Azure で利用可能になりました。まずは East US リージョンから開始します。さらに、非構造化データをベクトル埋め込みに変換して取り込みや検索に活用できる Zilliz Cloud Pipelines（ベータ版）を導入しました。このリリースでは、クラスター内での RBAC と認証情報管理も強化され、ユーザー管理用に 3 つの事前定義ロール（admin、read-write、read-only）が用意されています。その他にも、エラーメッセージの内容の充実や、より信頼性の高いサービスを実現するための安定性向上などの更新が含まれています。 | Cloud"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 24
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

Zilliz Cloud サービスが Azure 上で利用可能となりました。まずは East US リージョンから提供を開始します。また、非構造化データをベクトル埋め込みに変換し、取り込みおよび検索を行うための **Zilliz Cloud Pipelines**（Beta）を導入しました。さらに、クラスター内での RBAC および資格情報管理機能が強化され、ユーザー管理用に事前定義された 3 つのロール（admin、read-write、read-only）が追加されました。その他のアップデートとして、エラーメッセージの内容改善やサービスの信頼性向上のための安定性改善も含まれています。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Zilliz Cloud on Azure\{#zilliz-cloud-on-azure}

本日、Zilliz Cloud サービスが Azure 上で利用可能になったことをお知らせします。まずは East US リージョンから提供を開始します。これにより、当社プラットフォームは AWS、GCP、Azure の主要なパブリッククラウド 3 社すべてとシームレスに統合され、複数環境間で一貫性のある統一されたユーザーエクスペリエンスを実現するという重要なマイルストーンを達成しました。Azure East US 以外のリージョンへの展開をご希望の場合は、[お問い合わせください](https://support.zilliz.com/hc/en-us)。

## パイプライン\{#pipelines}

本日、Zilliz Cloud に新たな機能として **Zilliz Cloud Pipelines**（Beta）を導入しました。このパイプラインは、非構造化データをベクトル埋め込みに変換し、Zilliz Cloud に取り込んで保存・検索できるようにすることで、非構造化データの可能性を引き出すことを目的としています。このソリューションにより、埋め込み、取り込み、保存、検索といったプロセスが統合され、最新の[検索拡張生成（Retrieval Augmented Generation: RAG）](https://zilliz.com/use-cases/llm-retrieval-augmented-generation)のようなモダンな検索アプリケーションを構築する際に、複数のスタックを統合する手間から開発者を解放します。

Zilliz Cloud Pipelines には、以下の 3 種類のパイプラインが含まれます：**取り込みパイプライン**（取り込みパイプライン）、**Search pipeline**（検索パイプライン）、**削除パイプライン**（削除パイプライン）。

- **取り込みパイプライン**（取り込みパイプライン）は、非構造化データを処理して検索可能なベクトル埋め込みに変換し、Zilliz Vector データベース に取り込んで保存・検索を行います。

- **Search pipelines**（検索パイプライン）は、クエリ文字列をベクトル埋め込みに変換し、Zilliz Cloud に送信して最も類似度の高い上位 K 件のベクトルを取得することで、セマンティック検索を実現します。

- **削除パイプライン**（削除パイプライン）を使用すると、指定したドキュメントに含まれるすべてのチャンクを Zilliz Cloud コレクションから削除できます。これにより、ユーザー自身のデータを完全に制御でき、コレクションのストレージ容量を解放できます。

## クラスター内の RBAC および資格情報管理\{#rbac-and-credential-management-in-your-clusters}

今回のリリースでは、各クラスター内での RBAC（ロール-Based Access Control：ロールベースアクセス制御）および資格情報管理機能が強化されました。この機能により、ユーザーはクラスター内のユーザー管理を効率的に行えるようになります。「Clusters」（クラスター）セクションに移動し、「your_cluster」を選択した後、「Users」（ユーザー）タブに進むことで、これらの機能を利用できます。今回のリリースでは、ユーザー管理を簡素化するために、事前定義された 3 つのロール（「admin」、「read-write」、「read-only」）が導入されました。これらはそれぞれ異なるレベルのアクセス権限と制御ニーズに対応しています。これらの新機能の詳細および使用方法については、[ドキュメント](./access-control)をご参照ください。

## 新しいクラスター操作 API エンドポイント\{#new-cluster-manipulation-api-endpoints}

今回のリリースでは、クラスターの作成・変更・削除を行うための一連の新しい RESTful API エンドポイントと、プロジェクトを一覧表示するための別の API エンドポイントも導入しました。詳細については、[リファレンスドキュメント](/reference/restful/cluster-operations)をご確認ください。

## 機能強化\{#enhancements}

今回のリリースには、以下の機能強化も含まれています：

- 一部のエラーメッセージの内容を改善しました。

- 安定性の向上：既知の問題を修正し、サービスの信頼性をさらに高めました。

