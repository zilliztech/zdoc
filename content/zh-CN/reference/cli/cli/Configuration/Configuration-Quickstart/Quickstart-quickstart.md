---
title: "quickstart | Cloud"
slug: /cli/cli/Quickstart-quickstart
sidebar_label: "quickstart"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会引导首次使用的用户完成登录、组织选择、集群上下文设置，以及一个简短的常用操作菜单（列出集群、设置上下文、列出 Collection、查看计费）。当 stdout 不是 TTY，或设置了 `--non-interactive` 时，仅会打印速查表。 | Cloud"
type: docx
token: Aio6dbDToo45XdxkSX1cp9tKnkl
sidebar_position: 1
keywords: 
  - 私有 llms
  - nn 搜索
  - llm 评测
  - 稀疏与稠密
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

此操作会引导首次使用的用户完成登录、组织选择、集群上下文设置，以及一个简短的常用操作菜单（列出集群、设置上下文、列出 Collection、查看计费）。当 stdout 不是 TTY，或设置了 `--non-interactive` 时，仅会打印速查表。

## 概述\{#synopsis}

```bash
zilliz quickstart
[--non-interactive]
[--skip-login]
```

## 选项\{#options}

- **--non-interactive** (*boolean*) -

    跳过所有提示，仅打印速查表。适用于 CI，或用于编写环境初始化步骤的脚本。

- **--skip-login** (*boolean*) -

    跳过身份验证初始化步骤。当凭证已配置时使用此选项（例如，通过 `zilliz login` 或环境提供的 API 密钥）。

## 示例\{#example}

```bash
# Interactive guided onboarding
zilliz quickstart

# Print the cheatsheet only
zilliz quickstart --non-interactive
```
