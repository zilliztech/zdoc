---
title: "version | Cloud"
slug: /cli/cli/Global-version
sidebar_label: "version"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "此操作显示已安装的 Zilliz CLI 版本。 | Cloud"
type: docx
token: MzJHdc3iSoGlKsx4D6TcoY5anOf
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - version
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# version

此操作显示已安装的 Zilliz CLI 版本。

## 描述\{#description}

显示已安装的 Zilliz CLI 版本。该示例还展示了如何使用全局输出选项请求 JSON 输出。

## 概要\{#synopsis}

```bash
zilliz version
```

## 选项\{#options}

此命令没有特定于命令的选项。

## 示例\{#example}

```bash
zilliz version

# Example output
# zilliz 1.4.2

# The output format is a global CLI option. To get JSON output:
zilliz version -o json

# Example output
# {
#   "version": "1.4.2"
# }

# If a newer CLI is available, upgrade guidance is written to stderr:
# Tips: A new version of zilliz (1.4.2) is available. Run `zilliz upgrade` to update.
```

## Shell 自动补全\{#shell-completion}

Shell 自动补全会在首次运行时自动配置，并在每次升级后再次配置。CLI 会检测已安装的 shell，例如 Bash、Zsh、Fish、Elvish 和 PowerShell，为 `zilliz` 和 `zz` 注册补全，并迁移由已移除的 `completion install` 命令创建的配置。
