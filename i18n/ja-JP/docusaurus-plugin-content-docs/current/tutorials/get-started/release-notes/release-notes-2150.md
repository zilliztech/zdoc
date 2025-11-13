---
title: "リリースノート (2025年4月24日) | Cloud"
slug: /release-notes-2150
sidebar_label: "リリースノート (2025年4月24日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz CloudのPrivate Previewでゼロダウンタイム移行が可能になったことを嬉しく思います！クラスターのアップグレードや、容量最適化コンピュートユニット（CU）から別のオプションへの切り替えなど、展開の変更が必要な場合でも、サービスの中断なしに簡単にデータを移行できます。さらに、Zilliz BYOCはいくつかの機能強化を導入し、BYOCプロジェクトのインスタンス設定を構成し、クラスターのAWS PrivateLinkを有効にできるようになりました。 | Cloud"
type: origin
token: JPNiwF6rPiNe0pkx460cr321nTc
sidebar_position: 6
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm

---

import Admonition from '@theme/Admonition';


# リリースノート (2025年4月24日)

Zilliz Cloudの**Private Preview**でゼロダウンタイム移行が可能になったことを嬉しく思います！クラスターのアップグレードや、容量最適化コンピュートユニット（CU）から別のオプションへの切り替えなど、展開の変更が必要な場合でも、サービスの中断なしに簡単にデータを移行できます。さらに、Zilliz BYOCはいくつかの機能強化を導入し、BYOCプロジェクトのインスタンス設定を構成し、クラスターのAWS PrivateLinkを有効にできるようになりました。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus v2.5.x**と互換性があります。

- このリリース後に作成されたすべてのZilliz CloudクラスターはMilvus v2.5.xと互換性があります。

- このリリース前に作成されたクラスターについては、Milvus v2.5.xの機能と機能を試すために、次の図に示すように黄色枠のボタンをクリックする必要がある場合があります。

現在、すべてのMilvus v2.5.x機能は**PUBLIC PREVIEW**中です。

![GeJSbANVto14OtxFg6zcPFAYnZz](/img/GeJSbANVto14OtxFg6zcPFAYnZz.png)

## 最小限のサービス中断によるシームレスなデータ移行\{#seamless-data-migration-with-minimal-service-interruption}

以前のリリースでは、クラスター間でのデータ移行には、厳格な可用性要件を持つビジネスにとって障害となる、慎重に計画されたダウンタイムが必要でした。ゼロダウンタイム移行により、Zilliz Cloudはこの複雑さを排除し、シームレスな完全管理型移行エクスペリエンスを提供します。

この機能は、バックアップツールと変更データ取得（CDC）の2つのコンポーネントを組み合わせたデュアルスタック戦略を使用します。バックアップツールはソースクラスターの整合性のあるスナップショットを取得し、CDCはリアルタイムで新しい書き込みをターゲットクラスターに継続的に追跡およびレプリケートします。

Zilliz Cloudのネイティブ移行フローは以下を保証します：

- 履歴データとリアルタイム更新間の整合性、

- 正しいイベント順序付けと堅牢な障害耐性、

- 書き込み競合、競合状態、およびスキーマ不一致に対する保護、および

- 移行プロセス全体でのソースクラスターとターゲットクラスター間のスムーズな状態遷移。

ゼロダウンタイム移行は現在Zilliz Cloudコンソールの**Private Preview**で利用可能です。ログインして最初の移行を開始してください。ダウンタイムは必要ありません。詳細な操作手順および制限については、[ゼロダウンタイム移行](./zero-downtime-migration)を参照してください。

## インスタンス設定およびAWS PrivateLinkサポートで強化されたBYOC\{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

Zilliz BYOCプロジェクトでは、サービスは**検索サービス**、**その他のデータベースコンポーネント**、および**コアサポートサービス**などの複数のグループに整理されています。このリリースでは、プロジェクト作成時に各サービスグループのインスタンスタイプおよび数量を定義できるようになりました。

構成を簡素化するために、Zilliz BYOCは**Small**、**Medium**、**Large**、および**X-Large**の4つの事前定義プロジェクトサイズを提供するため、ワークロード要件に最も適したオプションを選択できます。

このリリースでは、VPCからZilliz Cloudコントロールプレーンへの安全でプライベートな接続のための**AWS PrivateLink**を有効または無効にする機能も導入されました。PrivateLinkはデフォルトで有効になっていることに注意してください。

構成手順の詳細については、[AWSへのBYOC展開](/docs/byoc/deploy-byoc-aws)および[AWSへのBYOC-I展開](/docs/byoc/deploy-byoc-i-aws)を参照してください。

## JSONフィールド内の細かなフィルタリング\{#fine-granular-filtering-within-a-json-field}

以前は、JSONフィールドはインデックス化されておらず、すべてのフィルタクエリは各エンティティのJSONフィールド全体をスキャンする必要がありました。このリリースでは、JSONフィールド内の特定のパスに逆インデックスを作成してクエリを高速化できるようになりました。
JSONフィールドをインデックス化するには、インデックスタイプを**INVERTED**に設定し、最適化したいJSONパスを指定し、その値を適切なデータ型にキャストします。メタデータフィルタリング中、Zilliz Cloudは各JSONフィールド値内の指定されたパスのみをスキャンするため、解析時間の大幅な短縮とフィルタリングパフォーマンスの向上が実現します。

JSONフィールドのインデックス化方法および考慮事項の詳細については、[JSONフィールドのインデックス化](./use-json-fields)を参照してください。

## その他の機能強化\{#other-enhancements}

クラスターのレプリカ数を変更するための新しいRESTful APIエンドポイントを追加しました。詳細については、[クラスターレプリカの変更](/reference/restful/modify-cluster-replica-v2)を参照してください。