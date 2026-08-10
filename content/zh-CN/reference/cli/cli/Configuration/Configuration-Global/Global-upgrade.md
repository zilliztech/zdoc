---
title: "upgrade | Cloud"
slug: /cli/cli/Global-upgrade
sidebar_label: "upgrade"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会通过检查 GitHub 上的最新版本，并调用适用于主机平台的官方安装脚本，来自我更新 CLI。 | Cloud"
type: docx
token: ZCnedaDvloSUhwxvycSc4gwhnbf
sidebar_position: 3
keywords: 
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - Pinecone 与 Milvus 对比
  - zilliz
  - zilliz cloud
  - cloud
  - upgrade
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# upgrade

此操作会通过检查 GitHub 上的最新版本，并调用适用于主机平台的官方安装脚本，来自我更新 CLI。

## 说明\{#description}

检查最新的 Zilliz CLI 版本，并在有可用升级时运行官方安装程序。使用 `--check` 可在不安装的情况下查看是否有可用更新。

## 概述\{#synopsis}

```bash
zilliz upgrade
[--check]
[--yes]
[--force]
```

## 选项\{#options}

- **--check** (*boolean*) -

    仅报告是否有较新版本可用。不会运行安装程序。

- **--yes** (*boolean*) -

    跳过确认提示。

- **--force** (*boolean*) -

    即使当前已是最新版本，也会重新运行安装程序。

## 示例\{#example}

```bash
# Check for updates without installing
zilliz upgrade --check

# Upgrade with confirmation prompt
zilliz upgrade

# Upgrade without prompt
zilliz upgrade --yes

# Force re-install
zilliz upgrade --force --yes
```
