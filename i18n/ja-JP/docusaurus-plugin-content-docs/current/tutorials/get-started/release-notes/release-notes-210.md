---
title: "リリースノート（2023 年 8 月 16 日） | Cloud"
slug: /release-notes-210
sidebar_key: release-notes-210
sidebar_label: "2023 年 8 月 16 日"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のローンチを発表できることを嬉しく思います。このリリースには、リージョンサポートの拡大や、移行およびサーバーレスインスタンス管理などの使いやすさの向上など、さまざまな機能強化が含まれています。さらに、RESTful API において、バルク挿入と専用クラスターのサポートを強化しました。 | Cloud"
type: origin
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 28
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年8月16日）

Zilliz Cloud の正式リリースをお知らせします。今回のリリースでは、リージョンサポートの拡大や移行・サーバーレスインスタンス管理などのユーザビリティ向上機能を含むさまざまな強化と新機能が導入されています。さらに、RESTful API にも Bulk-insert 機能および Dedicated Cluster サポートが追加されました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.1.x** と互換性があります。

## リージョンサポートの拡大\{#expanded-regional-support}

Zilliz Cloud はサービス提供リージョンをシンガポールに拡大し、AWS の **ap-southeast-1** および GCP の **asia-southeast-1** のパブリッククラウドリージョンを新たにサポートしました。これにより、東南アジアのお客様に対してより広範なリーチと優れたパフォーマンスを提供できます。

サポートされているすべてのパブリッククラウドリージョンについては、[クラウドプロバイダーs & Regions](./cloud-providers-and-regions) を参照してください。

## ユーザビリティ向上機能\{#enhanced-usability-features}

- 移行サポート:

    サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートしました。これにより、スケーリングや運用面での柔軟性が向上します。

- サーバーレスインスタンス管理:

    サーバーレスインスタンスを削除できるようになったことで、ユーザーはリソース割り当てをより細かく制御できるようになります。

    スケーリングおよび運用の柔軟性を高めるため、サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートしました。

詳細については、[Manage Cluster](./manage-cluster) を参照してください。

## RESTful API の強化\{#restful-api-enhancements}

- Bulk Insert

    データ取り込みプロセスを効率化するため、バルクデータインポート専用の新しい RESTful API を導入しました。この機能により、データアップロードにかかる時間と複雑さを大幅に削減することを目指しています。詳細については、[API リファレンス](/reference/restful/import-operations) を参照してください。

- 専用クラスターへのアクセス

    ユーザーがより広範な制御と柔軟性を得られるように、専用クラスターを RESTful API 経由でアクセス・管理できるようになりました。これにより、統合や自動化がより簡単になります。詳細については、[API リファレンス](/reference/restful/cloud-meta) を参照してください。

