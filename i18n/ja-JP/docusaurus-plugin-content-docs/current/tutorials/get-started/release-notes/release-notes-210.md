---
title: "リリースノート（2023年8月16日） | Cloud"
slug: /release-notes-210
sidebar_key: release-notes-210
sidebar_label: "2023年8月16日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のローンチを発表できることを嬉しく思います。このリリースには、拡張されたリージョンサポートや、移行やサーバーレスインスタンス管理などの使いやすさを向上させる機能を含む、さまざまな機能強化と新機能が含まれています。また、RESTful API に Bulk-insert と Dedicated Cluster サポートを追加しました。 | Cloud"
type: origin
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 30
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年8月16日）

Zilliz Cloud のローンチを発表できることを嬉しく思います。このリリースには、拡張されたリージョンサポートや、移行やサーバーレスインスタンス管理などの使いやすさの向上を含む、さまざまな機能強化と新機能が含まれています。さらに、RESTful API にも Bulk-insert と専用クラスターのサポートを強化しました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.1.x** と互換性があります。

## 拡張されたリージョンサポート\{#expanded-regional-support}

Zilliz Cloud は、シンガポールのパブリッククラウドリージョンへのサービス拡張を行いました。具体的には、AWS の **ap-southeast-1** と GCP の **asia-southeast-1** です。この拡張により、東南アジアのユーザーはより広いリーチと優れたパフォーマンスを享受できます。

サポートされているすべてのパブリッククラウドリージョンについては、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions) を参照してください。

## 使いやすさの向上\{#enhanced-usability-features}

- 移行サポート:

    サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートするようになりました。これにより、スケーリングと運用においてより大きな柔軟性が提供されます。

- サーバーレスインスタンス管理:

    サーバーレスインスタンスを削除できる機能により、ユーザーはリソース配分をより適切に制御できるようになりました。

    スケーリングと運用においてより大きな柔軟性を提供するため、サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートするようになりました。

詳細については、[クラスターの管理](./manage-cluster) を参照してください。

## RESTful API の強化\{#restful-api-enhancements}

- Bulk Insert

    データ取り込みプロセスを効率化するため、バルクデータインポート専用に設計された新しい RESTful API を導入しました。この機能は、データアップロードの時間と複雑さを大幅に削減することを目的としています。詳細については、[API リファレンス](/reference/restful/import-operations) を参照してください。

- 専用クラスターアクセス

    ユーザーにより広範な制御と柔軟性を提供するため、専用クラスターに RESTful API でアクセスして管理できるようになり、統合と自動化がより簡単になりました。詳細については、[API リファレンス](/reference/restful/cloud-meta) を参照してください。

