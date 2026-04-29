---
title: "リリースノート（2025 年 4 月 24 日） | Cloud"
slug: /release-notes-2150
sidebar_key: release-notes-2150
sidebar_label: "2025 年 4 月 24 日"
beta: FALSE
notebook: FALSE
description: "Zilliz BYOC にいくつかの機能強化が導入され、BYOC プロジェクトのインスタンス設定を構成できるようになり、クラスターで AWS PrivateLink を有効にできるようになりました。| Cloud"
type: origin
token: JPNiwF6rPiNe0pkx460cr321nTc
sidebar_position: 11
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート (2025 年 4 月 24 日)

Zilliz BYOC にいくつかの機能強化が導入され、BYOC プロジェクトのインスタンス設定を構成できるようになり、クラスターで AWS プライベートLink を有効にできるようになったことをお知らせできることを嬉しく思います。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus v2.5.x** と互換性があります。

- このリリース後に作成されたすべての Zilliz Cloud クラスターは、Milvus v2.5.x と互換性があります。

- このリリース前に作成されたクラスターについては、以下の図に示す黄色い四角のボタンをクリックして、Milvus v2.5.x の機能を試す必要がある場合があります。

現在、すべての Milvus v2.5.x 機能は **PUBLIC PREVIEW** です。

![GeJSbANVto14OtxFg6zcPFAYnZz](https://zdoc-images.s3.us-west-2.amazonaws.com/gejsbanvto14otxfg6zcpfaynzz.png "GeJSbANVto14OtxFg6zcPFAYnZz")

## インスタンス設定と AWS プライベートLink サポートにより強化された BYOC\{#byoc-enhanced-with-instance-settings-and-aws-privatelink-support}

Zilliz BYOC プロジェクトでは、サービスは **Search Services**、**Other データベース Components**、**コアサポートサービス** など、いくつかのグループに整理されています。このリリースにより、プロジェクト作成時に各サービスグループのインスタンスタイプと数を定義できるようになりました。

設定を簡素化するため、Zilliz BYOC では **小**、**中**、**大**、**X-大** の 4 つの事前定義されたプロジェクトサイズを提供しており、ワークロード要件に最も適したオプションを選択できます。

また、このリリースでは、VPC から Zilliz Cloud コントロールプレーン への安全でプライベートな接続を実現するための **AWS プライベートLink** の有効化または無効化が可能になりました。プライベートLink はデフォルトで有効になっています。

設定手順の詳細については、[AWS での BYOC のデプロイ](/docs/byoc/deploy-byoc-aws) および [AWS での BYOC-I のデプロイ](/docs/byoc/deploy-byoc-i-aws) を参照してください。

## JSON フィールド内の細粒度フィルタリング\{#fine-granular-filtering-within-a-json-field}

以前は、JSON フィールドにはインデックスが張られておらず、すべてのフィルタクエリで各エンティティの JSON フィールド全体をスキャンする必要がありました。このリリースにより、JSON フィールド内の特定のパスに対して転置インデックスを作成し、クエリを高速化できるようになりました。
JSON フィールドにインデックスを作成するには、インデックスタイプを **INVERTED** に設定し、最適化する JSON パスを指定して、その値を適切なデータ型にキャストします。メタデータフィルタリング中、Zilliz Cloud は各 JSON フィールド値内で指定されたパスのみをスキャンするため、解析時間が大幅に短縮され、フィルタリングパフォーマンスが向上します。

JSON フィールドにインデックスを作成する方法とその考慮事項の詳細については、[JSON フィールドにインデックスを作成する](./use-json-fields) を参照してください。

## その他の機能強化\{#other-enhancements}

クラスターのレプリカ数を変更するための新しい RESTful API エンドポイントが追加されました。詳細については、[クラスターレプリカの変更](/reference/restful/modify-cluster-replica-v2) を参照してください。

