---
title: "Elasticsearch から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Elasticsearch"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Elasticsearch から移行する際に、Zilliz Cloud がデータ型マッピング、collection の命名規則、および考慮事項をどのように扱うかを説明します。 | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Elasticsearch から Zilliz Cloud への移行

このトピックでは、[Elasticsearch](https://www.elastic.co/elasticsearch) から移行する際に、Zilliz Cloud がデータ型マッピング、collection の命名規則、および考慮事項をどのように扱うかを説明します。

## 前提条件\{#prerequisites}

Elasticsearch から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Elasticsearch の要件\{#elasticsearch-requirements}

| Requirement | Details |
| --- | --- |
| バージョン互換性 | Elasticsearch 7.x 以降 |
| ネットワークアクセス | ソース cluster はパブリックインターネットからアクセス可能である必要があります |
| API アクセス | 適切な認証情報を持つ有効な cluster endpoint または cloud ID |
| vector フィールド要件 | 各ソース index には少なくとも 1 つの dense vector フィールドが含まれている必要があります |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| Requirement | Details |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| cluster 容量 | 十分なストレージおよびコンピュートリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用してください） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud IPs](./zilliz-cloud-ips) を追加してください |

## データ型マッピング\{#data-type-mapping}

Elasticsearch のデータ型が Zilliz Cloud にどのようにマッピングされるかを理解することは、移行計画において重要です。

| **Elasticsearch フィールド型** | **Zilliz Cloud フィールド型** | **説明** |
| --- | --- | --- |
| Primary key | Primary key | 自動的にマッピングされます。新しい ID を生成するには Auto ID を有効にします（元の値は破棄されます）。 |
| dense_vector | FLOAT_VECTOR | vector の次元は変更されません。メトリックタイプとして **L2** または **IP** を指定します。 |
| text, string, keyword, ip, date, timestamp | VARCHAR | 最大長を設定します（1 ～ 65,535 バイト）。制限を超える文字列は移行エラーを引き起こす可能性があります。 |
| long | INT64 | - |
| integer | INT32 | - |
| short | INT16 | - |
| byte | INT8 | - |
| double | DOUBLE | - |
| float | FLOAT | - |
| boolean | BOOL | - |
| object | JSON | - |
| arrays | ARRAY | - |

## Elasticsearch 固有の処理ルール\{#elasticsearch-specific-handling-rules}

### Collection の命名規則\{#collection-naming-rules}

Elasticsearch の index 名は、以下の点を考慮して Zilliz Cloud に移行されます。

| Scenario | Impact | Solution |
| --- | --- | --- |
| デフォルトの命名 | collection 名はソース index 名と完全に一致します | 名前は OpenSearch からそのまま保持されます |
| 特殊文字 | ハイフン (-) またはドット (.) を含む index 名はエラーの原因となり、ジョブを送信できなくなります | index 名を手動で変更し、アンダースコアまたはその他の有効な文字を使用してください |
| 命名の競合 | 同じ名前の collection がすでに存在する場合、ジョブを送信できません | 既存の collection を削除するか、別の database を選択するか、移行設定時に名前を変更してください |

### 移行時の考慮事項\{#migration-considerations}

以下の機能は、Elasticsearch の移行では **サポートされていません**。

| Limitation | Impact | Alternative |
| --- | --- | --- |
| 動的フィールドから固定フィールドへの変換 | 既存の動的フィールドを固定型に変換することはできません | フィールドは元の動的な性質を維持します |
| フィールドの追加 | 移行中に新しいフィールドを追加することはできません | 既存の Elasticsearch フィールドのみが移行されます |
| Sparse vector | 現在のリリースではサポートされていません | dense vector の代替を検討するか、ロードマップについてサポートにお問い合わせください |
