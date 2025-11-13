---
title: "リリースノート (2023年8月16日) | Cloud"
slug: /release-notes-210
sidebar_label: "リリースノート (2023年8月16日)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudのローンチを発表できることを嬉しく思います。このリリースには、地域対応の拡大および移行やサーバーレスインスタンス管理などの使いやすさの向上など、さまざまな機能強化と機能が含まれています。さらに、バルクインサートおよび専用クラスターサポートでRESTful APIを強化しました。 | Cloud"
type: origin
token: Ti5uwysf0iZhuyk4xvjcFmsSnhG
sidebar_position: 23
keywords:
  - zilliz
  - vector database
  - cloud
  - release notes
  - natural language processing
  - AI chatbots
  - cosine distance
  - what is a vector database

---

import Admonition from '@theme/Admonition';


# リリースノート (2023年8月16日)

Zilliz Cloudのローンチを発表できることを嬉しく思います。このリリースには、地域対応の拡大および移行やサーバーレスインスタンス管理などの使いやすさの向上など、さまざまな機能強化と機能が含まれています。さらに、バルクインサートおよび専用クラスターサポートでRESTful APIを強化しました。

## Milvus互換性\{#milvus-compatibility}

このリリースは**Milvus 2.1.x**と互換性があります。

## 地域対応の拡大\{#expanded-regional-support}

Zilliz Cloudは、AWSの**ap-southeast-1**およびGCPの**asia-southeast-1**を含む、シンガポールのパブリッククラウドリージョンにサービスを拡大しました。この拡大により、東南アジアのユーザーがより広範な対応と優れたパフォーマンスを得られます。

サポートされているすべてのパブリッククラウドリージョンについては、[クラウドプロバイダーおよびリージョン](./cloud-providers-and-regions)を参照してください。

## 使いやすさの向上\{#enhanced-usability-features}

- 移行サポート：

    サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートするようになりました。これにより、スケーリングと運用の柔軟性が高まります。

- サーバーレスインスタンス管理：

    サーバーレスインスタンスを削除する機能により、ユーザーがリソース割り当てをより適切に制御できるようになります。

    スケーリングと運用の柔軟性を高めるために、サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートするようになりました。

詳細については、[クラスター管理](./manage-cluster)を参照してください。

## RESTful API機能強化\{#restful-api-enhancements}

- バルクインサート

    データインジェストプロセスを合理化するために、バルクデータインポート用に特別に設計された新しいRESTful APIを導入しました。この機能は、データアップロードの時間と複雑さを大幅に削減することを目的としています。詳細については、[APIリファレンス](/reference/restful/import-operations)を参照してください。

- 専用クラスターアクセス

    ユーザーにより広い制御と柔軟性を提供するために、専用クラスターにRESTful API経由でアクセスおよび管理できるようになり、統合と自動化がより簡単になりました。詳細については、[APIリファレンス](/reference/restful/cloud-meta)を参照してください。