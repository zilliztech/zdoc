---
title: "bind-card | Cloud"
slug: /cli/cli/Billing-bindcard
sidebar_label: "bind-card"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、クレジットカードをアカウントに紐付けます。 | Cloud"
type: docx
token: G453dm4ZWo1e0Ux55b3czXwnnId
sidebar_position: 1
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - bind-card
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# bind-card

この操作は、クレジットカードをアカウントに紐付けます。

## Description\{#description}

Zilliz Cloud はクレジットカードによる支払いに対応しており、このコマンドを使用してクレジットカードを Zilliz Cloud アカウントに紐付けることができます。

このコマンドを実行する前に、十分な権限があることを確認してください。**Organization Owner** または **Billing Admin** のいずれかである必要があります。 

オプションを指定せずにこのコマンドを実行すると、一連の対話型プロンプトが表示されます。

## Synopsis\{#synopsis}

```bash
zilliz billing bind-card 
--card-number <value>
--exp-month <value>
--exp-year <value>
--cvc <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--card-number** (*string*) -

    **[REQUIRED]**

    クレジットカード番号を指定します。 

    通常、値は `4242 4242 4242 4242` のような 16 桁の文字列です。

- **--exp-month** (*integer*) -

    **[REQUIRED]**

    有効期限の月を指定します。値の範囲は `1` から `12` です。

- **--exp-year** (*integer*) -

    **[REQUIRED]**

    有効期限の年を指定します。たとえば `2026` です。

- **--cvc** (*string*) -

    **[REQUIRED]**

    カード確認コードを指定します。 

    通常、値は `345` のような 3 桁の文字列です。

- **--output, -o** (*string*) -

    出力形式を指定します。指定可能な値は次のとおりです。

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    output が `table` または `csv` に設定されている場合に、ヘッダー行を省略するかどうかを指定します。

- **--query, -q** (*string*) -

    出力をフィルタリングするための JMESPath 式を指定します。

## Example\{#example}

```bash
zilliz billing bind-card --card-number 4242424242424242 --exp-month 12 --exp-year 2026 --cvc 123
```
