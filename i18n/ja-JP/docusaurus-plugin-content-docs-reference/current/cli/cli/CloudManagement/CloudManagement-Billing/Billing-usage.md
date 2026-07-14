---
title: "usage | Cloud"
slug: /cli/cli/Billing-usage
sidebar_label: "usage"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定した時間範囲内の使用コストを照会します。 | Cloud"
type: docx
token: FpDzdA1nSo6sOHxYxAhcTPCLn5d
sidebar_position: 4
keywords: 
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
  - マルチモーダルRAG
  - zilliz
  - zilliz cloud
  - cloud
  - usage
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# usage

この操作は、指定した時間範囲内の使用コストを照会します。

## Description\{#description}

Zilliz Cloud は、組織に関する詳細な使用情報を提供し、さまざまなディメンションにわたるコスト分析を可能にします。請求書にアクセスするには、**Organization Owner** または **Billing Admin** 権限のいずれかが必要です。

## Synopsis\{#synopsis}

```bash
zilliz billing usage
[--last <value>]
[--month <value>]
[--start <value>]
[--end <value>]
[--output <value>]
```

## Options\{#options}

- **--last** (*string*) -

    相対的な時間範囲を示します。

    日には `d`、月には `m` を使用します。直近 7 日間の使用統計を取得するには、このオプションを `7d` に設定します。

- **--month** (*string*) -

    月単位で照会するための式を示します。たとえば、`2026-01`、`last`、`this` などを使用できます

- **--start** (*string*) -

    時間範囲の開始日を `YYYY-MM-DD` 形式または有効な `ISO-8601` タイムスタンプで指定します。

- **--end** (*string*) -

    時間範囲の終了日を `YYYY-MM-DD` 形式または有効な `ISO-8601` タイムスタンプで指定します。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz billing usage --last 7d
```
