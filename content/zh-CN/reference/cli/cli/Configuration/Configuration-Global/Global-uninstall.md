---
title: "uninstall | Cloud"
slug: /cli/cli/Global-uninstall
sidebar_label: "uninstall"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会移除 CLI 二进制文件和 `zz` 别名。 | Cloud"
type: docx
token: LeH5d568MolZfhxAwoZcmjWTnGc
sidebar_position: 2
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - uninstall
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# uninstall

此操作会移除 CLI 二进制文件和 `zz` 别名。

## 说明\{#description}

移除已安装的 Zilliz CLI 二进制文件和 `zz` 别名。如果你还希望删除本地 Zilliz CLI 配置目录，请使用 `--purge`。

## 概要\{#synopsis}

```bash
zilliz uninstall
[--purge]
[--yes]
```

## 选项\{#options}

- **--purge** (*boolean*) -

    同时移除 `~/.zilliz/`（凭据、配置）。

- **--yes** (*boolean*) -

    跳过确认提示。

## 示例\{#example}

```bash
# Uninstall with confirmation
zilliz uninstall

# You can also use the zz alias
zz uninstall

# Uninstall without confirmation
zilliz uninstall --yes

# Uninstall and remove all config
zilliz uninstall --purge --yes
```
