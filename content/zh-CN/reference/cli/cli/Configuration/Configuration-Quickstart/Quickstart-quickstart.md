---
title: "quickstart | Cloud"
slug: /cli/cli/Quickstart-quickstart
sidebar_label: "quickstart"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会引导首次使用的用户完成登录、组织选择、集群上下文设置，以及一个包含常见操作的简短菜单（列出集群、设置上下文、列出集合、查看计费）。当 stdout 不是 TTY 或设置了 `--non-interactive` 时，仅会打印速查表。 | Cloud"
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

此操作会引导首次使用的用户完成登录、组织选择、集群上下文设置，以及一个包含常见操作的简短菜单（列出集群、设置上下文、列出集合、查看计费）。当 stdout 不是 TTY 或设置了 `--non-interactive` 时，仅会打印速查表。

## 概要\{#synopsis}

```bash
zilliz quickstart
[--non-interactive]
[--skip-login]
```

## 选项\{#options}

- **--non-interactive** (*boolean*) -

    跳过所有提示，仅打印速查表。适用于 CI 或为环境引导步骤编写脚本时使用。

- **--skip-login** (*boolean*) -

    跳过身份验证引导步骤。当凭据已配置时使用（例如通过 `zilliz login`，或使用环境提供的 API key）。

## 示例\{#example}

```bash
# Interactive guided onboarding
zilliz quickstart

# Print the cheatsheet only
zilliz quickstart --non-interactive
```
