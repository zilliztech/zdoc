---
title: "リリースノート（2023年8月16日） | Cloud"
slug: /release-notes-210
sidebar_label: "リリースノート（2023年8月16日）"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudのローンチを発表できることを嬉しく思います。このリリースには、拡張されたリージョンサポートや移行、サーバーレスインスタンス管理などの拡張されたユーザビリティ機能を含む、さまざまな強化と機能が含まれています。さらに、RESTful APIをBulk-sertおよびDedicated Clusterサポートで強化しました。 | Cloud"
type: origin
token: Ek0fwJOE0iIKKbkna9fcfp4InGf
sidebar_position: 16
keywords: 
  - zilliz
  - vector database
  - cloud
  - release notes
  - NLP
  - Neural Network
  - Deep Learning
  - Knowledge base

---

import Admonition from '@theme/Admonition';


# リリースノート（2023年8月16日）

Zilliz Cloudのローンチを発表できることを嬉しく思います。このリリースには、拡張されたリージョンサポートや移行、サーバーレスインスタンス管理などの拡張されたユーザビリティ機能を含む、さまざまな強化と機能が含まれています。さらに、RESTful APIをBulk-sertおよびDedicated Clusterサポートで強化しました。

## Milvusの互換性{#milvus-compatibility}{#milvusmilvus-compatibility}

このリリースは**Milvus 2.1. x**と互換性があります。

## 地域サポートの拡大{#expanded-regional-support}{#expanded-regional-support}

Zilliz Cloudは、シンガポールのパブリッククラウドリージョン、具体的には**ap-南東-1**のAWSと**asia-南東-1**のGCPを含めてサービスを拡大しました。この拡大により、東南アジアのユーザーはより広い範囲でより良いパフォーマンスを得ることができます。

サポートされているすべてのパブリッククラウドリージョンについては、「[クラウドプロバイダー&地域](./cloud-providers-and-regions)」を参照してください。

## 使いやすさの向上{#enhanced-usability-features}{#enhanced-usability-features}

- 移行サポート:

    サーバーレスインスタンスから専用クラスターへのコレクションの滑らかな移行をサポートするようになりました。これにより、スケーリングと操作の柔軟性が向上します。

- サーバーレスインスタンス管理:

    サーバーレスインスタンスを削除する機能により、ユーザーはリソース割り当てをよりよく制御できます。

    スケーリングと操作の柔軟性を高めるために、サーバーレスインスタンスから専用クラスターへのコレクションのシームレスな移行をサポートするようになりました。

詳細は、[クラスタ管理](./manage-cluster)を参照してください。

## RESTfulAPIの強化{#restful-api-enhancements}{#restfulapirestful-api-enhancements}

- バルクインサート

    データ取り込みプロセスを効率化するために、バルクデータインポート用に特別に設計された新しいRESTfulAPIを導入しました。この機能は、データアップロードの時間と複雑さを大幅に削減することを目的としています。詳細については、[APIリファレンス](/reference/restful/import-operations)を参照してください。

- クラスタへの専用アクセス

    ユーザーにより広範な制御と柔軟性を提供するために、RESTfulAPIを介して専用クラスターにアクセスして管理できるようになり、統合と自動化がより簡単になりました。詳細については、[APIリファレンス](/reference/restful/cloud-meta)を参照してください。

