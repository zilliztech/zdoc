---
title: "リリースノート（2023年8月16日） | Cloud"
slug: /release-notes-210
sidebar_label: "2023年8月16日"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のローンチを発表できることを嬉しく思います。今回のリリースには、リージョンサポートの拡張や、移行と Serverless インスタンス管理などの使いやすさを向上させる機能を含む、さまざまな機能強化と新機能が含まれています。さらに、Bulk-insert と Dedicated クラスターのサポートにより、RESTful API も強化されました。 | Cloud"
type: origin
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 31
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年8月16日）

Zilliz Cloud のローンチを発表できることを嬉しく思います。今回のリリースには、リージョンサポートの拡張や、移行と Serverless インスタンス管理などの使いやすさを向上させる機能を含む、さまざまな機能強化と新機能が含まれています。さらに、Bulk-insert と Dedicated クラスターのサポートにより、RESTful API も強化されました。

## Milvus 互換性\{#milvus-compatibility}

このリリースは **Milvus 2.1.x** と互換性があります。

## リージョンサポートの拡張\{#expanded-regional-support}

Zilliz Cloud は、シンガポールのパブリッククラウドリージョン、具体的には AWS の **ap-southeast-1** および GCP の **asia-southeast-1** にサービスを拡大しました。これにより、東南アジアのユーザーはより広い提供範囲とより優れたパフォーマンスを利用できます。

サポートされているすべてのパブリッククラウドリージョンについては、[Cloud Providers & Regions](./cloud-providers-and-regions) を参照してください。

## 使いやすさを向上させる機能\{#enhanced-usability-features}

- 移行サポート:

    Serverless インスタンスから Dedicated クラスターへのコレクションのシームレスな移行をサポートするようになりました。これにより、スケーリングと運用においてより高い柔軟性が得られます。

- Serverless インスタンス管理:

    Serverless インスタンスを削除できるようになり、ユーザーはリソース割り当てをより適切に制御できるようになりました。

    スケーリングと運用の柔軟性をさらに高めるため、Serverless インスタンスから Dedicated クラスターへのコレクションのシームレスな移行もサポートするようになりました。

詳細については、[Manage Cluster](./manage-cluster) を参照してください。

## RESTful API の強化\{#restful-api-enhancements}

- Bulk Insert

    データ取り込みプロセスを効率化するために、大量データのインポート向けに特別に設計された新しい RESTful API を導入しました。この機能により、データアップロードにかかる時間と複雑さを大幅に削減することを目指しています。詳細については、[API reference](/reference/restful/import-operations) を参照してください。

- Dedicated クラスターアクセス

    ユーザーにより広い制御性と柔軟性を提供するため、Dedicated クラスターに RESTful API 経由でアクセスおよび管理できるようになり、統合や自動化がより簡単になりました。詳細については、[API reference](/reference/restful/cloud-meta) を参照してください。

