---
title: "リリースノート（2023年8月16日） | Cloud"
slug: /release-notes-210
sidebar_label: "リリースノート（2023年8月16日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのローンチを発表できることを嬉しく思います。このリリースには、拡張されたリージョンサポートや移行、サーバーレスインスタンス管理などの拡張されたユーザビリティ機能を含む、さまざまな強化と機能が含まれています。さらに、RESTful APIをBulk-sertおよびDedicated Clusterサポートで強化しました。 | Cloud"
type: origin
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 19
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年8月16日）

Zilliz Cloudのローンチを発表できることを嬉しく思います。このリリースには、拡張されたリージョンサポートや移行、サーバーレスインスタンス管理などの拡張されたユーザビリティ機能を含む、さまざまな強化と機能が含まれています。さらに、RESTful APIをBulk-sertおよびDedicated Clusterサポートで強化しました。

## Milvusの互換性{#milvus-compatibility}

このリリースは**Milvus 2.1. x**と互換性があります。

## 地域サポートの拡大{#expanded-regional-support}

Zilliz Cloudは、シンガポールのパブリッククラウドリージョン、具体的にはAWSの**ap-東南-1**とGCPの**asia-southeast-1**を含めてサービスを拡大しました。この拡大により、東南アジアのユーザーはより広い範囲にアクセスし、パフォーマンスが向上します。

サポートされているすべてのパブリッククラウドリージョンについては、[クラウドプロバイダー&地域](./cloud-providers-and-regions)を参照してください。

## 使いやすさの向上{#enhanced-usability-features}

- 移行サポート:

    サーバーレスインスタンスから専用クラスターへのコレクションの滑らかな移行をサポートするようになりました。これにより、スケーリングと操作の柔軟性が向上します。

- サーバーレスインスタンス管理:

    サーバーレスインスタンスを削除する機能により、ユーザーはリソース割り当てをよりよく制御できます。

    スケーリングと操作の柔軟性を高めるために、サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートするようになりました。

詳細については、[クラスタ管理](./manage-cluster)を参照してください。

## RESTful APIの強化{#restful-api-enhancements}

- バルクインサート

    データの取り込み過程を効率化するために、バルクデータのインポートに特化した新しいRESTful APIを導入しました。この機能は、データアップロードの時間と複雑さを大幅に削減することを目的としています。詳細については、[APIリファレンス](/reference/restful/import-operations)を参照してください。

- クラスタへの専用アクセス

    ユーザーにより広範な制御と柔軟性を提供するために、RESTful APIを介して専用クラスターにアクセスして管理できるようになり、統合と自動化がより簡単になりました。詳細については、[APIリファレンス](/reference/restful/cloud-meta)を参照してください。

