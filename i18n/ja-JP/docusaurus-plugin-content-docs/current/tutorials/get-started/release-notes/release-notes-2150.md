---
title: "リリースノート（2025年4月24日） | Cloud"
slug: /release-notes-2150
sidebar_label: "2025年4月24日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz BYOC に複数の機能強化が導入され、BYOC プロジェクトのインスタンス設定を構成し、クラスターに対して AWS PrivateLink を有効化できるようになったことを嬉しくお知らせします。 | Cloud"
type: origin
token: JPNiwF6rPiNe0pkx460cr321nTc
sidebar_position: 14
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2025年4月24日）

Zilliz BYOC に複数の機能強化が導入され、BYOC プロジェクトのインスタンス設定を構成し、クラスターに対して AWS PrivateLink を有効化できるようになったことを嬉しくお知らせします。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus v2.5.x** と互換性があります。

- このリリース以降に作成されたすべての Zilliz Cloud クラスターは、Milvus v2.5.x と互換性があります。

- このリリース以前に作成されたクラスターについては、Milvus v2.5.x の機能を試すために、以下の図に示す黄色い四角のボタンをクリックする必要がある場合があります。

現在、Milvus v2.5.x のすべての機能は引き続き **PUBLIC PREVIEW** 段階です。

![GeJSbANVto14OtxFg6zcPFAYnZz](https://zdoc-images.s3.us-west-2.amazonaws.com/gejsbanvto14otxfg6zcpfaynzz.png "GeJSbANVto14OtxFg6zcPFAYnZz")

## インスタンス設定と AWS PrivateLink サポートで強化された BYOC\{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

Zilliz BYOC プロジェクトでは、サービスは **Search Services**、**Other Database Components**、**Core Support Services** などの複数のグループに整理されています。このリリースでは、プロジェクト作成時に各サービスグループのインスタンスタイプと数量を定義できるようになりました。

構成を簡素化するために、Zilliz BYOC では 4 つの事前定義済みプロジェクトサイズ—**Small**、**Medium**、**Large**、**X-Large**—が提供されており、ワークロード要件に最適なオプションを選択できます。

このリリースでは、VPC から Zilliz Cloud Control Plane への安全でプライベートな接続のために、**AWS PrivateLink** を有効または無効にする機能も導入されています。なお、PrivateLink はデフォルトで有効になっています。

構成手順の詳細については、[AWS で BYOC をデプロイ](/docs/byoc/deploy-byoc-aws) および [AWS で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-aws) を参照してください。

## JSON フィールド内のきめ細かなフィルタリング\{#fine-granular-filtering-within-a-json-field}

これまで、JSON フィールドにはインデックスが作成されておらず、すべてのフィルタークエリでは各エンティティ内の JSON フィールド全体をスキャンする必要がありました。このリリースでは、クエリを高速化するために、JSON フィールド内の特定のパスに転置インデックスを作成できるようになりました。
JSON フィールドにインデックスを付与するには、インデックスタイプを **INVERTED** に設定し、最適化したい JSON パスを指定し、その値を適切なデータ型にキャストします。メタデータフィルタリング時には、Zilliz Cloud は各 JSON フィールド値内の指定されたパスのみをスキャンするため、解析時間が大幅に短縮され、フィルタリング性能が向上します。

JSON フィールドへのインデックス作成方法とその考慮事項の詳細については、[JSON Indexing](./json-indexing) を参照してください。

## その他の機能強化\{#other-enhancements}

クラスターのレプリカ数を変更するための新しい RESTful API エンドポイントが追加されました。詳細については、[クラスターのレプリカ変更](/reference/restful/modify-cluster-replica-v2) を参照してください。

