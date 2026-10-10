---
title: "リリースノート（2023年12月11日） | Cloud"
slug: /release-notes-240
sidebar_label: "2023年12月11日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のサービスが Azure で利用できるようになりました。まずは米国東部リージョンから提供を開始します。さらに、非構造化データをベクトル埋め込みに変換して取り込みと検索を可能にする Zilliz Cloud Pipelines（Beta）を導入します。今回のリリースでは、クラスター内の RBAC と認証情報管理も改善され、ユーザー管理用に 3 つの事前定義ロール（admin、read-write、read-only）が提供されます。その他の更新には、エラーメッセージの内容の強化や、より信頼性の高いサービスに向けた安定性の向上が含まれます。 | Cloud"
type: origin
token: A5lpwIZcZiTLqakdt6rcCmPcnEe
sidebar_position: 28
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年12月11日）

Zilliz Cloud のサービスが Azure で利用できるようになりました。まずは米国東部リージョンから提供を開始します。さらに、非構造化データをベクトル埋め込みに変換して取り込みと検索を可能にする Zilliz Cloud Pipelines（Beta）を導入します。今回のリリースでは、クラスター内の RBAC と認証情報管理も改善され、ユーザー管理用に 3 つの事前定義ロール（admin、read-write、read-only）が提供されます。その他の更新には、エラーメッセージの内容の強化や、より信頼性の高いサービスに向けた安定性の向上が含まれます。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.2.x** および **Milvus 2.3.x (Beta)** と互換性があります。

## Azure 上の Zilliz Cloud\{#zilliz-cloud-on-azure}

当社の提供範囲が大きく拡大したことをお知らせします。Zilliz Cloud のサービスが Azure で利用できるようになりました。まずは米国東部リージョンから提供を開始します。これは重要なマイルストーンであり、当社のプラットフォームが AWS、GCP、Azure という 3 大パブリッククラウドとシームレスに統合され、複数の環境で一貫した統一的なユーザー体験を実現できるようになりました。Azure 米国東部以外のリージョンへのデプロイがビジネス要件として必要な場合は、さらなるサポートについて[お問い合わせ](https://support.zilliz.com/hc/en-us)ください。

## Pipelines\{#pipelines}

本日は、Zilliz Cloud の新機能である Zilliz Cloud Pipelines（Beta）を発表します。Pipelines は、非構造化データをシームレスにベクトル埋め込みへ変換し、Zilliz Cloud に取り込んで保存および検索できるようにすることで、その可能性を引き出します。このソリューションは、埋め込み、取り込み、保存、検索といったプロセスを統合してデータワークフローを簡素化し、最先端の[検索拡張生成（RAG）](https://zilliz.com/use-cases/llm-retrieval-augmented-generation)のような最新の検索アプリケーションを構築する際に複数のスタックの統合に苦労する開発者の負担を軽減します。

Zilliz Cloud Pipelines は、Ingestion、Search、Deletion という 3 つの特定のパイプラインで構成されています。

- **Ingestion pipeline** は、非構造化データを処理して検索可能なベクトル埋め込みに変換し、保存および検索のために Zilliz ベクトル データベース に取り込む中心的な役割を担います。

- **Search pipelines** は、クエリ文字列をベクトル埋め込みに変換して Zilliz Cloud に送信し、最も類似する上位 K 件のベクトルを取得することで、セマンティック検索を可能にします。

- **Deletion Pipeline** を使用すると、指定したドキュメント内のすべてのチャンクを Zilliz Cloud コレクションから削除でき、自身のデータを完全に制御するとともに、Zilliz コレクションのストレージ容量を解放できます。

## クラスター内の RBAC と認証情報管理\{#rbac-and-credential-management-in-your-clusters}

今回のリリースでは、各クラスター内で RBAC（Role-Based Access Control）と認証情報を管理するための機能が強化されました。この合理化されたアプローチにより、ユーザーはクラスターユーザーを効率的に管理できます。これらの機能にアクセスするには、'クラスター' セクションに移動し、'your_cluster' を選択してから 'Users' タブに進みます。今回のリリースには、ユーザー管理を簡素化する 3 つの事前定義ロール（'admin'、'read-write'、'read-only'）が含まれており、それぞれ異なるアクセスレベルと制御ニーズに合わせて調整されています。これらの新機能の利用に関するより詳細な情報とガイダンスについては、Access Control Explained を参照してください。

## 新しいクラスター操作 API エンドポイント\{#new-cluster-manipulation-api-endpoints}

今回のリリースでは、クラスターの作成、変更、削除を行うための新しい RESTful API エンドポイントのセットと、プロジェクトを一覧表示するための別の API エンドポイントも導入しました。詳細については、[リファレンスドキュメント](/reference/restful/cluster-operations) を参照してください。

## 機能強化\{#enhancements}

今回のリリースには、一連の機能強化も含まれています。

- 一部のエラーメッセージの内容を改善しました。

- 安定性の強化：既知の問題に対処し、サービスの信頼性をさらに高めました。
