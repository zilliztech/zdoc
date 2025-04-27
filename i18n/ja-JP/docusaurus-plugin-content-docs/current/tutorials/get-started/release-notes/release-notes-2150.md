---
title: "リリースノート（2025年4月24日） | Cloud"
slug: /release-notes-2150
sidebar_label: "リリースノート（2025年4月24日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのプライベートプレビューで、Zero-Downtime Migrationが利用可能になったことをお知らせできることを嬉しく思っています!クラスタをアップグレードする必要がある場合や、キャパシティ最適化されたコンピュートユニット(CU)から別のオプションに切り替える必要がある場合でも、サービスの中断なしにデータを簡単に移行できます。さらに、Zilliz BYOCは、BYOCプロジェクトのインスタンス設定を構成し、クラスタのAWS PrivateLinkを有効にするためのいくつかの改良を導入しました。 | Cloud"
type: origin
token: WXCgwGfXriSJrIkYPrdcPYLnn4g
sidebar_position: 0
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年4月24日）

Zilliz Cloudの**プライベートプレビュー**で、Zero-Downtime Migrationが利用可能になったことをお知らせできることを嬉しく思っています!クラスタをアップグレードする必要がある場合や、キャパシティ最適化されたコンピュートユニット(CU)から別のオプションに切り替える必要がある場合でも、サービスの中断なしにデータを簡単に移行できます。さらに、Zilliz BYOCは、BYOCプロジェクトのインスタンス設定を構成し、クラスタのAWS PrivateLinkを有効にするためのいくつかの改良を導入しました。

## 最小限のサービス中断でシームレスなデータ移行{#seamless-data-migration-with-minimal-service-interruption}

以前のリリースでは、クラスタ間でデータを移行するには、厳密な可用性要件を持つ企業にとって障害となる慎重に計画されたダウンタイムが必要でした。Zilliz Cloudは、ゼロダウンタイム移行により、この複雑さを排除し、滑らかで完全に管理された移行体験を提供します。

この機能は、バックアップツールと変更データキャプチャ(CDC)の2つのコンポーネントを組み合わせたデュアルスタック戦略を使用しています。バックアップツールはソースクラスタの一貫したスナップショットをキャプチャし、CDCはターゲットクラスタへの新しい書き込みを実際立って追跡および複製します。

Zilliz Cloudのネイティブマイグレーションフローは以下を保証します:

- 履歴データとリアルタイム更新の一貫性

- イベントの正しい順序付けと堅牢なフォールトトレランス

- 書き込みの競合、競合状態、スキーマの不一致に対する保護

- 移行過程を通じて、ソースクラスタとターゲットクラスタ間の状態遷移がスムーズに行われます。

Zilliz Cloudコンソールの**プライベートプレビュー**で、ゼロダウンタイム移行が利用可能になりました。最初の移行を開始するにはログインしてください。ダウンタイムは必要ありません。詳細な操作手順と制限については、「[ゼロダウンタイム移行](./zero-downtime-migration)」を参照してください。

## BYOCはインスタンス設定とAWS PrivateLinkサポートで強化されました{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

Zilliz BYOCプロジェクトでは、**Search Services**、**Other Database Components**、**Core Support Services**などの複数のグループにサービスが整理されています。このリリースでは、プロジェクト作成時に各サービスグループのインスタンスタイプと数量を定義できるようになりました。

構成を簡素化するために、Zilliz BYOCは4つの事前定義されたプロジェクトサイズ(**小**、**中**、**大**、**X-大**)を提供しているため、ワークロード要件に最適なオプションを選択できます。

このリリースでは、VPCからZilliz Cloud Control Planeへの安全でプライベートな接続のために**AWS PrivateLink**を有効または無効にする機能も導入されています。PrivateLinkはデフォルトオンになっていることに注意してください。

設定手順の詳細については、「[BYOCをAWSにデプロイする](/ja-JP/docs/byoc/deploy-byoc-aws)」と「[BYOC-IをAWSにデプロイする](/ja-JP/docs/byoc/deploy-byoc-i-aws)」を参照してください。

## JSONフィールド内での細かいフィルタリング{#fine-granular-filtering-within-a-json-field}

以前は、JSONフィールドはインデックス化されておらず、すべてのフィルタークエリは各エンティティのJSONフィールド全体をスキャンする必要がありました。このリリースでは、JSONフィールド内の特定のパスに反転インデックスを作成してクエリを高速化できるようになりました。

JSONフィールドをインデックス化するには、インデックスタイプを**INVERTED**に設定し、最適化したいJSONパスを指定し、その値を適切なデータ型にキャストします。メタデータフィルタリング中、Zilliz Cloudは各JSONフィールド値内の指定されたパスのみをスキャンし、解析時間を大幅に短縮し、フィルタリングのパフォーマンスを向上させます。

JSONフィールドをインデックス化する方法とその考慮事項の詳細については、[JSONフィールドのインデックス化](./use-json-fields#set-index-params)を参照してください。

## その他の機能強化{#other-enhancements}

クラスタのレプリカ数を変更するための新しいRESTful APIエンドポイントを追加しました。詳細については、「[クラスタレプリカの変更](/ja-JP/reference/restful/modify-cluster-replica-v2)」を参照してください。