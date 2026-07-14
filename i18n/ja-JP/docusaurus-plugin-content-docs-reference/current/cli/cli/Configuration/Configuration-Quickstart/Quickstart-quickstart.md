---
title: "quickstart | Cloud"
slug: /cli/cli/Quickstart-quickstart
sidebar_label: "quickstart"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作では、初めてのユーザー向けにサインイン、organization の選択、cluster コンテキスト、および一般的な操作の短いメニュー（cluster の一覧表示、コンテキストの設定、collection の一覧表示、請求の表示）を案内します。stdout が TTY ではない場合、または `--non-interactive` が設定されている場合は、チートシートのみが表示されます。 | Cloud"
type: docx
token: Aio6dbDToo45XdxkSX1cp9tKnkl
sidebar_position: 1
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - quickstart
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# quickstart

この操作では、初めてのユーザー向けにサインイン、organization の選択、cluster コンテキスト、および一般的な操作の短いメニュー（cluster の一覧表示、コンテキストの設定、collection の一覧表示、請求の表示）を案内します。stdout が TTY ではない場合、または `--non-interactive` が設定されている場合は、チートシートのみが表示されます。

## Synopsis\{#synopsis}

```bash
zilliz quickstart
[--non-interactive]
[--skip-login]
```

## Options\{#options}

- **--non-interactive** (*boolean*) -

    すべてのプロンプトをスキップし、チートシートのみを表示します。CI や、環境のブートストラップ手順をスクリプト化する場合に便利です。

- **--skip-login** (*boolean*) -

    認証のブートストラップ手順をスキップします。認証情報がすでに設定されている場合（たとえば、`zilliz login` または環境から提供される API key によって設定済みの場合）に使用します。

## Example\{#example}

```bash
# Interactive guided onboarding
zilliz quickstart

# Print the cheatsheet only
zilliz quickstart --non-interactive
```
