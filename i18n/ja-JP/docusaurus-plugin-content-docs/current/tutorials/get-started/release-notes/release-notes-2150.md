---
title: "リリースノート（2025年4月24日） | Cloud"
slug: /release-notes-2150
sidebar_key: release-notes-2150
sidebar_label: "2025年4月24日"
beta: FALSE
notebook: FALSE
description: "Zilliz BYOC において、BYOC プロジェクトのインスタンス設定の構成やクラスターへの AWS PrivateLink の有効化など、いくつかの機能強化が導入されました。 | Cloud"
type: origin
token: JPNiwF6rPiNe0pkx460cr321nTc
sidebar_position: 13
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年4月24日）

Zilliz BYOC において、いくつかの機能強化が導入されたことをお知らせいたします。BYOC プロジェクトのインスタンス設定の構成、およびクラスターに対する AWS プライベートLink の有効化が可能になりました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus v2.5.x** と互換性があります。

- このリリース以降に作成されたすべての Zilliz Cloud クラスターは、Milvus v2.5.x と互換性があります。

- このリリースより前に作成されたクラスターについては、以下の図に示す黄色の四角ボタンをクリックして、Milvus v2.5.x の機能を試す必要がある場合があります。

現在、すべての Milvus v2.5.x の機能は **PUBLIC PREVIEW** の状態です。

![GeJSbANVto14OtxFg6zcPFAYnZz](https://zdoc-images.s3.us-west-2.amazonaws.com/gejsbanvto14otxfg6zcpfaynzz.png "GeJSbANVto14OtxFg6zcPFAYnZz")

## BYOC の機能強化：インスタンス設定と AWS プライベートLink サポート\{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

Zilliz BYOC プロジェクトでは、サービスがいくつかのグループに分類されています。これには **Search Services**、**Other データベース Components**、**コアサポートサービス** が含まれます。このリリースより、プロジェクト作成時に各サービスグループのインスタンスタイプと数量を定義できるようになりました。

構成を簡素化するため、Zilliz BYOC では 4 つの定義済みプロジェクトサイズ—**小**、**中**、**大**、**X-大**—を提供しており、ワークロード要件に最も適したオプションを選択できます。

このリリースでは、VPC から Zilliz Cloud コントロールプレーン への安全でプライベートな接続のために **AWS プライベートLink** を有効化または無効化する機能も導入されました。なお、プライベートLink はデフォルトで有効になっています。

構成手順の詳細については、[Deploy BYOC on AWS](/docs/byoc/deploy-byoc-aws) および [Deploy BYOC-I on AWS](/docs/byoc/deploy-byoc-i-aws) を参照してください。

## JSON フィールド内の細粒度フィルタリング\{#fine-granular-filtering-within-a-json-field}

これまで、JSON フィールドにはインデックスが作成されておらず、すべてのフィルタークエリで各エンティティの JSON フィールド全体をスキャンする必要がありました。このリリースより、JSON フィールド内の特定のパスに対して転置インデックスを作成し、クエリを高速化できるようになりました。
JSON フィールドにインデックスを作成するには、インデックスタイプを **INVERTED** に設定し、最適化したい JSONパス を指定し、その値を適切なデータ型にキャストします。メタデータフィルタリング時、Zilliz Cloud は各 JSON フィールド値内の指定されたパスのみをスキャンするため、解析時間が大幅に短縮され、フィルタリング性能が向上します。

JSON フィールドのインデックス作成方法とその考慮事項の詳細については、[Index a JSON field](./use-json-fields) を参照してください。

## その他の機能強化\{#other-enhancements}

クラスターのレプリカ数を変更するための新しい RESTful API エンドポイントが追加されました。詳細については、[Modify Cluster Replica](/reference/restful/modify-cluster-replica-v2) を参照してください。

