---
title: "Gemini CLI 扩展 | Cloud"
slug: /zilliz-gemini-extension
sidebar_label: "Gemini CLI 扩展"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "面向 Gemini CLI 的 Zilliz Cloud 扩展是一个自然语言接口，可将 Zilliz Cloud 操作直接带入你的 IDE。无需记忆 CLI 命令或切换到 Web 控制台，只需用日常语言描述你想要的操作，插件会负责处理。 | Cloud"
type: origin
token: ZTvzw9d1QiNqeKk7XumcO01Anpc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Gemini CLI 扩展

面向 Gemini CLI 的 Zilliz Cloud 扩展是一个自然语言接口，可将 Zilliz Cloud 操作直接带入你的 IDE。无需记忆 CLI 命令或切换到 Web 控制台，只需用日常语言描述你想要的操作，插件会负责处理。

## 它能做什么\{#}

- 将自然语言请求转换为 `zilliz-cli` 命令

- 覆盖所有主要 Zilliz Cloud 操作：clusters、databases、collections、partitions、indexes、vectors、imports、backups、users/roles、monitoring、projects 和 billing

- 在调用时嵌入实时 `--help` 输出，使助手始终具备最新的 flag 信息

- 在执行任何破坏性操作前要求用户明确确认

## 前提条件\{#}

- 你已安装 Gemini CLI。

## 设置步骤\{#}

```bash
gemini extensions install https://github.com/zilliztech/gemini-cli-extension
```

或者，你可以先将 [this repo](https://github.com/zilliztech/gemini-cli-extension.git) 克隆到本地，然后运行以下命令：

```bash
gemini extensions link /path/to/gemini-cli-extension
```

## 下一步\{#}

Zilliz Claude Code Plugin 和 Zilliz Gemini CLI Extension 底层都共享 Zilliz CLI。你可以阅读 Zilliz Claude Code Plugin Capabilities 和 Zilliz Claude Code Plugin Examples 来学习如何编写提示词。