---
title: "オフライン移行 | BYOC"
slug: /offline-migration
sidebar_label: "オフライン移行"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Offline Migration は、ソース Zilliz Cloud cluster からターゲット Zilliz Cloud cluster へ既存のすべてのデータを転送します。この方法は、同一 organization 内および異なる organization 間の移行の両方をサポートします。計画メンテナンス時や小規模なデータベース移行など、一時的な書き込み中断を許容できるシナリオに最適です。 | BYOC"
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# オフライン移行

Offline Migration は、ソース Zilliz Cloud cluster からターゲット Zilliz Cloud cluster へ既存のすべてのデータを転送します。この方法は、同一 organization 内および異なる organization 間の移行の両方をサポートします。計画メンテナンス時や小規模なデータベース移行など、一時的な書き込み中断を許容できるシナリオに最適です。

<Admonition type="info" icon="📘" title="注意">

カットオーバー中にアプリケーションがソース cluster への書き込みを継続すると、ターゲット cluster で新しい entity を取りこぼす可能性があります。特に、移行ジョブの完了後に挿入された entity は見落とされる可能性があります。ターゲットデータの完全性を保つには、カットオーバーウィンドウを設定し、ソース cluster への書き込みを一時停止し、移行ジョブの完了を待ち、ターゲット cluster を検証してから、ターゲット cluster のみに対する書き込みを再開してください。

</Admonition>

## 移行機能\{#migration-capabilities}

### 移行範囲のオプション\{#migration-scope-options}

| 移行タイプ | 説明 | ユースケース |
| --- | --- | --- |
| 同一 project 内 | 同じ Zilliz Cloud project 内の既存 cluster 間で移行 | Cluster のアップグレード、パフォーマンス最適化、データ統合 |
| project または organization をまたぐ | 異なる Zilliz Cloud project または organization にある既存 cluster 間で移行 | 企業合併、部門移管、マルチテナントのシナリオ |

### 直接データ転送\{#direct-data-transfer}

オフライン移行は、以下の特性を持つ Zilliz Cloud cluster 間の直接データレプリケーションを実行します。

- **Schema の保持**: ソース schema は変更されずにターゲット cluster に転送されます

- **フィールド変更なし**: 移行中にフィールド名の変更、データ型の変更、フィールド属性の変更はできません

- **自動 indexing**: ターゲット cluster の vector フィールドに対して AUTOINDEX が自動的に作成されます

- **1 回限りのデータコピー**: Offline Migration は移行ジョブ中にソース cluster からデータをコピーします。移行ジョブ完了後の新しい書き込みについて、ターゲット cluster との同期は維持されません。

## 前提条件\{#prerequisites}

オフライン移行を開始する前に、次の要件を満たしていることを確認してください。

### 一般要件\{#general-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザー権限 | Organization Owner または Project Admin ロール |
| ソース cluster へのアクセス | ソース cluster はパブリックインターネットからアクセス可能である必要があります |
| ターゲット cluster の容量 | ソースデータを収容するのに十分な CU サイズ（[CU calculator](https://zilliz.com/pricing#calculator) を使用） |

### project または organization をまたぐ移行の要件\{#cross-project-or-organization-migration-requirements}

| 要件 | 詳細 |
| --- | --- |
| 接続認証情報 | ソース cluster のパブリック endpoint、API key、または cluster のユーザー名とパスワード |
| ネットワークアクセス | ターゲット organization からソース cluster に接続できること |

### カットオーバーの計画\{#plan-the-cutover}

オフライン移行を開始する前に、アプリケーションがソース cluster への書き込みを一時的に停止できるカットオーバーウィンドウを選択してください。データの取りこぼしを避けるために、次のプロセスを使用します。

1. 最終的な移行および検証ウィンドウの前に、ソース cluster への書き込みを一時停止します。

1. 移行ジョブを実行し、ジョブステータスが **Successful** に変わるまで待ちます。

1. ターゲット cluster のデータを検証します。たとえば、entity 数の確認や、最近挿入された entity のサンプリングを行います。

1. アプリケーションの読み取り先と書き込み先をターゲット cluster に切り替えます。

1. ターゲット cluster に対してのみ書き込みを再開します。

移行データが完全であることを確認するまでは、ソース cluster を利用可能な状態にしておいてください。

## はじめに\{#getting-started}

以下のデモでは、オフライン移行の完全なプロセスを順を追って説明します。

<Supademo id="cmb91ow5v0me4sn1rzlbzqi8x" title=""  />

<Admonition type="info" icon="📘" title="注意">

移行された collection は、すぐには検索またはクエリ操作に使用できません。検索およびクエリ機能を有効にするには、Zilliz Cloud で collection を手動で load する必要があります。詳細については、[Load & Release](./load-release-collections) を参照してください。

</Admonition>

